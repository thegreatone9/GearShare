import {endpointWrapper} from "../util/transaction.js";
import {ACTIVITY, ADMIN_ID, PAYMENT_INTENT_STATUS, TIME_UNIT, TRANSACTION_STATUS} from "../../src/utils/constants.js";
import {calculateRentalFee} from "../../src/utils/rental.js";

/**
 * Handles item return and creates a dispute
 */
export default async function returnItemCreateDispute(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const createDisputeQuery = async (req, tx) => {
        const {rentalId, disputeStatus, rentalStatus} = req.body;

        // Validate required fields
        if (!rentalId || !disputeStatus || !rentalStatus) {
            throw new Error('Missing required fields: rentalId, disputeStatus, rentalStatus');
        }

        // 1. Check if rental exists
        const rentalData = await tx.query(
            `SELECT
                 r.id, r.request_id,
                 req.borrower_id, req.lender_id, req.start_date, req.end_date,
                 req.listing_snapshot,
                 pi.id as payment_intent_id, pi.amount as total_held_amount
             FROM rentals r
                      JOIN requests req ON r.request_id = req.id
                      JOIN payment_intents pi ON pi.request_id = req.id
             WHERE r.id = $1 AND pi.status = '${PAYMENT_INTENT_STATUS.CAPTURED}'`,
            [rentalId]
        );

        if (rentalData.rows.length === 0) {
            throw new Error(`Rental ${rentalId} not found or active payment not found.`);
        }

        const currentDate = new Date();

        // 2. Create the dispute record
        const disputeResult = await tx.query(
            `INSERT INTO disputes (rental_id, start_date, status)
             VALUES ($1, $2, $3) RETURNING *`,
            [rentalId, currentDate, disputeStatus]
        );

        const rental = rentalData.rows[0];
        const listingSnapshot = rental.listing_snapshot;

        // 3. Update the rental with return date and new status
        await tx.query(
            `UPDATE rentals
             SET return_date = $2,
                 status      = $3
             WHERE id = $1`,
            [rentalId, currentDate, rentalStatus]
        );

        const pricePerUnit = listingSnapshot.daily_rate;
        const rentalFee = calculateRentalFee(TIME_UNIT.DAY, pricePerUnit, rental.start_date, rental.end_date);

        // 5. Create Transaction: Pay Rent to Lender
        // We move the Rent portion from Escrow -> Lender
        await tx.query(
            `INSERT INTO transactions (
                payment_intent_id, payer_id, payee_id, amount, type, description, created_at
            )
             VALUES ($1, $2, $3, $4, '${TRANSACTION_STATUS.RENTAL_FEE}', $5, NOW())`,
            [
                rental.payment_intent_id,
                ADMIN_ID.ESCROW,
                rental.lender_id,
                rentalFee,
                `Rental fee payout for Rental #${rentalId}`
            ]
        );

        const createdDispute = disputeResult.rows[0];

        // 6. LOGIC DECISION: Payment Intent Status
        await tx.query(
            `UPDATE payment_intents SET description = $2 WHERE id = $1`,
            [rental.payment_intent_id, `Funds Held for Dispute #${createdDispute.id}`]
        );

        // 7. Activity Log
        await tx.query(
            `INSERT INTO activity_log (created_at, user_id, type, message)
             VALUES (NOW(), $1, '${ACTIVITY.RETURN_ITEM_CREATE_DISPUTE}', $2)`,
            [rental.borrower_id, `Dispute opened for Rental #${rentalId}. Rental fee paid, deposit held.`]
        );

        // Return the created dispute
        return createdDispute;
    };

    await endpointWrapper(req, res, createDisputeQuery);
}