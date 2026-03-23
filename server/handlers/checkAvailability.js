import {endpointWrapper} from "../util/transaction.js";
import {isPartiallyAvailable} from "../util/util.js";

/**
 * Checks if an item is available for a borrower to request
 */
export default async function checkAvailability(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const checkAvailabilityQuery = async (req, tx) => {
        const {listingId, borrowerId} = req.query;

        // Validate required fields
        if (!listingId || !borrowerId) {
            throw new Error('Missing required fields: listingId, borrowerId');
        }

        // 1. Check if borrower is trying to request their own listing
        const ownerCheck = await tx.query(
            `SELECT 1
             FROM listings
             WHERE id = $1
               AND owner_id = $2`,
            [listingId, borrowerId]
        );

        if (ownerCheck.rows.length > 0) {
            // Borrower owns this listing - not available
            return {available: false, reason: 'Cannot request your own listing'};
        }

        // 2. Check if item is available
        const availabilityResult = await tx.query(
            `SELECT *
             FROM listings_with_availability
             WHERE id = $1`,
            [listingId]
        );

        // If listing not found, return false
        if (availabilityResult.rows.length === 0) {
            return {available: false, reason: 'Listing not found'};
        }

        const available = isPartiallyAvailable(
            availabilityResult.rows[0].overall_available_range,
            availabilityResult.rows[0].unavailable_ranges
        );

        return {
            available,
            reason: available ? null : 'Item is currently unavailable'
        };
    };

    await endpointWrapper(req, res, checkAvailabilityQuery);
}