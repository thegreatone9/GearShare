import {endpointWrapper} from "./util/transaction.js";

/**
 * Checks if two date ranges overlap
 * @param {Date} start1 - Start date of first range
 * @param {Date} end1 - End date of first range
 * @param {Date} start2 - Start date of second range
 * @param {Date} end2 - End date of second range
 * @returns {boolean} - True if ranges overlap
 */
function datesOverlap(start1, end1, start2, end2) {
    return start1 <= end2 && end1 >= start2;
}

/**
 * Confirms rental acceptance and updates related records
 */
export default async function confirmRental(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const confirmRentalQuery = async (req, tx) => {
        const {
            requestId,
            listingId,
            rentalStatus,
            requestStatus,
            otherRequestStatus,
            activeRequestStatus
        } = req.body;

        // Validate required fields
        if (!requestId || !listingId || !rentalStatus || !requestStatus || !otherRequestStatus || !activeRequestStatus) {
            throw new Error('Missing required fields');
        }

        // 0. Check if request exists
        const requestCheck = await tx.query(
            `SELECT id
             FROM requests
             WHERE id = $1`,
            [requestId]
        );

        if (requestCheck.rows.length === 0) {
            throw new Error(`Request with ID ${requestId} does not exist.`);
        }

        // Check if listing exists
        const listingCheck = await tx.query(
            `SELECT id
             FROM listings
             WHERE id = $1`,
            [listingId]
        );

        if (listingCheck.rows.length === 0) {
            throw new Error(`Listing with ID ${listingId} does not exist.`);
        }

        // Get the accepted request's dates
        const requestData = await tx.query(
            `SELECT start_date, end_date
             FROM requests
             WHERE id = $1`,
            [requestId]
        );

        const {start_date: acceptedStartDate, end_date: acceptedEndDate} = requestData.rows[0];

        // 1. Insert rental record
        const rentalResult = await tx.query(
            `INSERT INTO rentals (request_id, status)
             VALUES ($1, $2) RETURNING *`,
            [requestId, rentalStatus]
        );

        const insertedRental = rentalResult.rows[0];

        // 2. Update the accepted request status
        await tx.query(
            `UPDATE requests
             SET status = $2
             WHERE id = $1`,
            [requestId, requestStatus]
        );

        // 3. Get all active requests for the same listing
        const overlappingRequests = await tx.query(
            `SELECT id, start_date, end_date
             FROM requests
             WHERE listing_id = $1
               AND id != $2
               AND status = $3`,
            [listingId, requestId, activeRequestStatus]
        );

        // Filter overlapping requests in JavaScript
        const requestsToDecline = overlappingRequests.rows.filter(request => {
            return datesOverlap(
                request.start_date,
                request.end_date,
                acceptedStartDate,
                acceptedEndDate
            );
        });

        // Decline overlapping requests
        if (requestsToDecline.length > 0) {
            const requestIdsToDecline = requestsToDecline.map(r => r.id);
            await tx.query(
                `UPDATE requests
                 SET status = $1
                 WHERE id = ANY ($2)`,
                [otherRequestStatus, requestIdsToDecline]
            );
        }

        // 4. Get current unavailable_ranges
        const rangesResult = await tx.query(
            `SELECT unavailable_ranges
             FROM listings_available_dates
             WHERE listing_id = $1`,
            [listingId]
        );

        let unavailableRanges = rangesResult.rows[0]?.unavailable_ranges || [];

        // Add the new unavailable range
        const newRange = {
            from: acceptedStartDate.toISOString().split('T')[0],
            to: acceptedEndDate.toISOString().split('T')[0]
        };

        unavailableRanges.push(newRange);

        // Update with the new ranges
        await tx.query(
            `UPDATE listings_available_dates
             SET unavailable_ranges = $2
             WHERE listing_id = $1`,
            [listingId, JSON.stringify(unavailableRanges)]
        );

        // Return the inserted rental
        return insertedRental;
    };

    await endpointWrapper(req, res, confirmRentalQuery);
}