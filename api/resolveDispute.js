import {endpointWrapper} from "./util/transaction.js";
import {ACTIVITY, ADMIN_ID, PAYMENT_INTENT_STATUS, TRANSACTION_STATUS} from "../src/components/util/Util.js";

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
             SET status = $2, end_date = NOW()
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

        const contextData = await tx.query(
            `SELECT 
                pi.id as payment_intent_id, 
                pi.amount as total_captured_amount,
                req.borrower_id
             FROM rentals r
             JOIN requests req ON r.request_id = req.id
             JOIN payment_intents pi ON pi.rental_id = req.id
             WHERE r.id = $1`,
            [rentalId]
        );

        if (contextData.rows.length === 0) {
            throw new Error(`Payment context for Rental #${rentalId} not found.`);
        }

        const {
            payment_intent_id: intentId,
            total_captured_amount: totalCaptured,
            borrower_id: borrowerId
        } = contextData.rows[0];

        // Step 4 & 5 Preparation: Calculate Refund Amount
        // The Rent was likely paid when the dispute started. We need to find what's left (The Deposit).
        const transactionHistory = await tx.query(
            `SELECT amount FROM transactions WHERE payment_intent_id = $1`,
            [intentId]
        );

        // Sum all previous payouts (e.g., Rental Fee)
        const amountAlreadyPaid = transactionHistory.rows.reduce((sum, t) => sum + Number(t.amount), 0);

        // The remaining balance is the Security Deposit
        const refundAmount = Number(totalCaptured) - amountAlreadyPaid;

        if (refundAmount > 0) {
            // Step 5: Create Transaction (Refund the Deposit)
            await tx.query(
                `INSERT INTO transactions (
                    payment_intent_id, rental_id, payer_id, payee_id, amount, type, description, created_at
                ) VALUES ($1, $2, ${ADMIN_ID.ESCROW}, $3, $4, '${TRANSACTION_STATUS.DEPOSIT_REFUND}', $5, NOW())`,
                [
                    intentId,
                    rentalId,
                    borrowerId, // Money goes back to Borrower
                    refundAmount,
                    `Full security deposit refund after dispute resolution`
                ]
            );
        }

        // Step 4: Update Payment Intents (Close the loop)
        // Mark the intent as SETTLED because the account is now empty.
        await tx.query(
            `UPDATE payment_intents 
             SET status = '${PAYMENT_INTENT_STATUS.SETTLED}', updated_at = NOW() 
             WHERE id = $1`,
            [intentId]
        );

        await tx.query(
            `INSERT INTO activity_log (created_at, user_id, type, message)
             VALUES (NOW(), $1, '${ACTIVITY.SETTLE_DISPUTE}', $2)`,
            [borrowerId, `Dispute resolved in your favor. Security deposit of $${refundAmount} refunded.`]
        );

        // Return the updated dispute
        return updatedDispute;
    };

    await endpointWrapper(req, res, resolveDisputeQuery);
}