import {endpointWrapper} from "./util/transaction.js";

/**
 * Updates listing status by removing the date range from unavailable_ranges
 * @param {number} rentalId - The rental ID
 * @param {Object} tx - Database transaction object
 */
async function updateListingStatus(rentalId, tx) {
    // 1. Get listing_id and request dates
    const requestResult = await tx.query(
        `SELECT req.listing_id,
                req.start_date,
                req.end_date
         FROM rentals rent
                  JOIN requests req ON rent.request_id = req.id
         WHERE rent.id = $1`,
        [rentalId]
    );

    if (requestResult.rows.length === 0) {
        throw new Error(`Rental with id ${rentalId} not found`);
    }

    const {listing_id, start_date, end_date} = requestResult.rows[0];

    // 2. Get current unavailable_ranges
    const rangesResult = await tx.query(
        `SELECT unavailable_ranges
         FROM listings_available_dates
         WHERE listing_id = $1`,
        [listing_id]
    );

    if (rangesResult.rows.length === 0) {
        throw new Error(`Listing ${listing_id} not found in listings_available_dates`);
    }

    // 3. Parse and filter the ranges in JavaScript
    let unavailableRanges = rangesResult.rows[0].unavailable_ranges || [];

    // Filter out the matching date range
    const filteredRanges = unavailableRanges.filter(range => {
        // Format dates as strings for comparison
        const rangeFrom = range.from;
        const rangeTo = range.to;
        const targetFrom = start_date.toISOString().split('T')[0];
        const targetTo = end_date.toISOString().split('T')[0];

        // Keep ranges that don't match the target range
        return !(rangeFrom === targetFrom && rangeTo === targetTo);
    });

    // 4. Update with the filtered ranges
    await tx.query(
        `UPDATE listings_available_dates
         SET unavailable_ranges = $2
         WHERE listing_id = $1`,
        [listing_id, JSON.stringify(filteredRanges)]
    );
}

/**
 * Updates rental status
 * @param {number} rentalId - The rental ID
 * @param {string} rentalStatus - New status for the rental
 * @param {Object} tx - Database transaction object
 */
async function updateRentalStatus(rentalId, rentalStatus, tx) {
    await tx.query(
        `UPDATE rentals
         SET status = $2
         WHERE id = $1`,
        [rentalId, rentalStatus]
    );
}

/**
 * Resolves a dispute and updates associated listing and rental
 */
export default async function resolveDispute(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const resolveDisputeQuery = async (req, tx) => {
        const {disputeId, rentalId, rentalStatus, disputeStatus} = req.body;

        // Validate required fields
        if (!disputeId || !rentalId || !rentalStatus || !disputeStatus) {
            throw new Error('Missing required fields: disputeId, rentalId, rentalStatus, disputeStatus');
        }

        // Step 1: Update dispute
        const disputeResult = await tx.query(
            `UPDATE disputes
             SET status   = $2, end_date = NOW()
             WHERE id = $1 RETURNING *`,
            [disputeId, disputeStatus]
        );

        if (disputeResult.rows.length === 0) {
            throw new Error(`Dispute with id ${disputeId} not found`);
        }

        const updatedDispute = disputeResult.rows[0];

        // Step 2: Update listing status
        await updateListingStatus(rentalId, tx);

        // Step 3: Update rental status
        await updateRentalStatus(rentalId, rentalStatus, tx);

        // Return the updated dispute
        return updatedDispute;
    };

    await endpointWrapper(req, res, resolveDisputeQuery);
}