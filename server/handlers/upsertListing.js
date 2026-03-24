import {endpointWrapper} from "../util/transaction.js";
import {ACTIVITY} from "../../src/utils/constants.js";

/**
 * Builds SQL SET clause for UPDATE with non-null values only
 * @param {Object} data - The listing data object
 * @param {Object} currentData - Current listing data (for fallback)
 * @returns {Object} - Object with setClauses array and values array
 */
function buildUpdateClauses(data, currentData) {
    const fields = [
        'title', 'description', 'location', 'category',
        'condition', 'daily_rate', 'replacement_value', 'time_unit', 'status', 'image_url'
    ];

    const updates = {};

    fields.forEach(field => {
        // Use new value if provided, otherwise keep current value
        updates[field] = data[field] !== undefined && data[field] !== null
            ? data[field]
            : currentData[field];
    });

    return updates;
}

/**
 * Upserts a listing with availability information
 */
export default async function upsertListing(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const upsertListingQuery = async (req, tx) => {
        const {
            ownerId,
            listingId,
            listingData,
            overallAvailableRange,
            unavailableRanges = []
        } = req.body;

        // Validate required fields
        if (!ownerId || !listingData || !overallAvailableRange) {
            throw new Error('Missing required fields: ownerId, listingData, overallAvailableRange');
        }

        let updatedListing;
        let finalListingId;

        // Determine if this is INSERT or UPDATE
        if (!listingId) {
            // *** INSERT NEW LISTING ***
            const insertResult = await tx.query(
                `INSERT INTO listings (owner_id, title, description, location, category,
                                       condition, daily_rate, replacement_value, time_unit, status, image_url)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
                [
                    ownerId,
                    listingData.title,
                    listingData.description,
                    listingData.location,
                    listingData.category,
                    listingData.condition,
                    listingData.daily_rate,
                    listingData.replacement_value,
                    listingData.time_unit,
                    listingData.status,
                    typeof listingData.image_url === 'object' ? JSON.stringify(listingData.image_url) : listingData.image_url
                ]
            );

            updatedListing = insertResult.rows[0];
            finalListingId = updatedListing.id;

            // Insert initial availability
            await tx.query(
                `INSERT INTO listings_available_dates (listing_id, unavailable_ranges, overall_available_range)
                 VALUES ($1, $2, $3)`,
                [
                    finalListingId,
                    JSON.stringify(unavailableRanges),
                    JSON.stringify(overallAvailableRange)
                ]
            );

        } else {
            // *** UPDATE EXISTING LISTING ***

            // Check ownership for security
            const ownershipCheck = await tx.query(
                `SELECT owner_id
                 FROM listings
                 WHERE id = $1`,
                [listingId]
            );

            if (ownershipCheck.rows.length === 0) {
                throw new Error(`Listing with ID ${listingId} not found.`);
            }

            const existingOwnerId = ownershipCheck.rows[0].owner_id;

            if (existingOwnerId !== ownerId) {
                throw new Error(`Unauthorized: User is not the owner of listing ${listingId}.`);
            }

            // Get current listing data
            const currentListing = await tx.query(
                `SELECT *
                 FROM listings
                 WHERE id = $1`,
                [listingId]
            );

            const currentData = currentListing.rows[0];

            // Build update values using JavaScript
            const updates = buildUpdateClauses(listingData, currentData);

            // Update the listings table
            const updateResult = await tx.query(
                `UPDATE listings
                 SET title             = $2,
                     description       = $3,
                     location          = $4,
                     category          = $5,
                     condition         = $6,
                     daily_rate        = $7,
                     replacement_value = $8,
                     time_unit         = $9,
                     status            = $10,
                     image_url         = $11
                 WHERE id = $1 RETURNING *`,
                [
                    listingId,
                    updates.title,
                    updates.description,
                    updates.location,
                    updates.category,
                    updates.condition,
                    updates.daily_rate,
                    updates.replacement_value,
                    updates.time_unit,
                    updates.status,
                    typeof updates.image_url === 'object' ? JSON.stringify(updates.image_url) : updates.image_url
                ]
            );

            updatedListing = updateResult.rows[0];
            finalListingId = updatedListing.id;

            // Check if availability record exists
            const availabilityCheck = await tx.query(
                `SELECT listing_id
                 FROM listings_available_dates
                 WHERE listing_id = $1`,
                [finalListingId]
            );

            if (availabilityCheck.rows.length > 0) {
                // Update existing availability record
                // Only update fields that are provided
                const availabilityUpdates = {
                    unavailableRanges: unavailableRanges || null,
                    overallAvailableRange: overallAvailableRange || null
                };

                // Get current availability data
                const currentAvailability = await tx.query(
                    `SELECT unavailable_ranges, overall_available_range
                     FROM listings_available_dates
                     WHERE listing_id = $1`,
                    [finalListingId]
                );

                const currentAvailabilityData = currentAvailability.rows[0];

                // Use new values if provided, otherwise keep current
                const finalUnavailableRanges = availabilityUpdates.unavailableRanges !== null
                    ? availabilityUpdates.unavailableRanges
                    : currentAvailabilityData.unavailable_ranges;

                const finalOverallRange = availabilityUpdates.overallAvailableRange !== null
                    ? availabilityUpdates.overallAvailableRange
                    : currentAvailabilityData.overall_available_range;

                await tx.query(
                    `UPDATE listings_available_dates
                     SET unavailable_ranges      = $2,
                         overall_available_range = $3
                     WHERE listing_id = $1`,
                    [
                        finalListingId,
                        JSON.stringify(finalUnavailableRanges),
                        JSON.stringify(finalOverallRange)
                    ]
                );
            } else {
                // Insert new availability record if it didn't exist
                await tx.query(
                    `INSERT INTO listings_available_dates (listing_id, unavailable_ranges, overall_available_range)
                     VALUES ($1, $2, $3)`,
                    [
                        finalListingId,
                        JSON.stringify(unavailableRanges),
                        JSON.stringify(overallAvailableRange)
                    ]
                );
            }

            //log activity
            await tx.query(
                `INSERT INTO activity_log (created_at, user_id, type, message) VALUES (NOW(), $1, '${ACTIVITY.UPSERT_ITEM}', $2)`,
                [ownerId, `You (User ID: #${ownerId}) upserted the item: #${listingId}`],
            );
        }

        return updatedListing;
    };

    await endpointWrapper(req, res, upsertListingQuery);
}