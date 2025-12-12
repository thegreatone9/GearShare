/**
 * Helper to parse a "YYYY-MM-DD" string into a standard JS Date object.
 * We set the time to noon to avoid timezone rollover issues with midnight.
 */
function parseDate(dateStr) {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    // Setting to 12:00 PM prevents timezone shifts from changing the day
    date.setHours(12, 0, 0, 0);
    return date;
}

/**
 * Helper to add or subtract days from a Date object.
 * Returns a NEW Date object (immutable-like).
 */
function addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

/**
 * Checks if a date range is valid (start <= end).
 */
function isValidRange(range) {
    return range && range.start && range.end && range.start <= range.end;
}

/**
 * Subtracts an 'unavailable' range from an 'available' range.
 * Logic mirrors PostgreSQL 'daterange - daterange'.
 * Returns an array of resulting ranges (0, 1, or 2 ranges).
 * @param {Object} available - { start: Date, end: Date }
 * @param {Object} unavailable - { start: Date, end: Date }
 * @returns {Array} Array of { start: Date, end: Date }
 */
function subtractRange(available, unavailable) {
    // 1. If no overlap, return original available range
    if (unavailable.end < available.start || unavailable.start > available.end) {
        return [available];
    }

    // 2. If unavailable completely covers available, return nothing
    if (unavailable.start <= available.start && unavailable.end >= available.end) {
        return [];
    }

    const results = [];

    // 3. Handle split or crop
    // If unavailable starts after available starts, we keep the "left" chunk.
    // The left chunk ends 1 day BEFORE the unavailable block starts.
    if (unavailable.start > available.start) {
        results.push({
            start: available.start,
            end: addDays(unavailable.start, -1)
        });
    }

    // If unavailable ends before available ends, we keep the "right" chunk.
    // The right chunk starts 1 day AFTER the unavailable block ends.
    if (unavailable.end < available.end) {
        results.push({
            start: addDays(unavailable.end, 1),
            end: available.end
        });
    }

    return results;
}

/**
 * Main Function: isPartiallyAvailable
 * Replicates the logic of checking if any gaps remain in the target range.
 * @param {Object} targetRangeJson - { from: 'YYYY-MM-DD', to: 'YYYY-MM-DD' }
 * @param {Array} coverRangesJson - Array of { from: 'YYYY-MM-DD', to: 'YYYY-MM-DD' }
 * @returns {Boolean}
 */
export default function isPartiallyAvailable(targetRangeJson, coverRangesJson) {
    // 1. Validation and Setup
    if (!targetRangeJson || !targetRangeJson.from || !targetRangeJson.to) {
        return false;
    }

    const targetStart = parseDate(targetRangeJson.from);
    const targetEnd = parseDate(targetRangeJson.to);

    if (targetStart > targetEnd) {
        return false;
    }

    // Initialize our list of "available gaps" with the single full target range
    let remainingRanges = [{ start: targetStart, end: targetEnd }];

    // 2. Iterate through each unavailable range
    if (Array.isArray(coverRangesJson)) {
        for (const coverJson of coverRangesJson) {
            if (!coverJson.from || !coverJson.to) continue;

            const unavailable = {
                start: parseDate(coverJson.from),
                end: parseDate(coverJson.to)
            };

            // If the cover range is invalid, skip it
            if (!isValidRange(unavailable)) continue;

            // Temp array for the new set of gaps after subtraction
            let newRemainingRanges = [];

            // Attempt to subtract this unavailable range from ALL currently available gaps
            for (const currentAvailable of remainingRanges) {
                const subtracted = subtractRange(currentAvailable, unavailable);
                newRemainingRanges = newRemainingRanges.concat(subtracted);
            }

            // Update our list of gaps for the next iteration
            remainingRanges = newRemainingRanges;

            // Optimization: If no ranges are left, we can stop early
            if (remainingRanges.length === 0) {
                return false;
            }
        }
    }

    // 3. Final Check: Do we have any ranges left?
    return remainingRanges.length > 0;
}