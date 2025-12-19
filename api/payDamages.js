import {endpointWrapper} from "./util/transaction.js";
import {ACTIVITY, ADMIN_ID, PAYMENT_INTENT_STATUS, TRANSACTION_STATUS} from "../src/components/util/Util.js";

/**
 * Resolves a dispute by paying damages to the lender.
 * Handles cases where damages exceed the held security deposit.
 */
export default async function payDamages(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const payDamagesQuery = async (req, tx) => {
        const { disputeId, damageAmount, disputeResolutionStatus } = req.body;

        // 1. Validate Input
        if (!disputeId || damageAmount === undefined || !disputeResolutionStatus) {
            throw new Error('Missing required fields');
        }

        // 2. Fetch Context (Dispute, Rental, Payment, Actors)
        const contextData = await tx.query(
            `SELECT
                 d.id, d.rental_id,
                 r.request_id,
                 pi.id as payment_intent_id, pi.amount as total_captured_amount,
                 req.borrower_id, req.lender_id
             FROM disputes d
                      JOIN rentals r ON d.rental_id = r.id
                      JOIN requests req ON r.request_id = req.id
                      JOIN payment_intents pi ON pi.rental_id = req.id
             WHERE d.id = $1`,
            [disputeId]
        );

        if (contextData.rows.length === 0) {
            throw new Error(`Dispute #${disputeId} context not found.`);
        }

        const {
            rental_id: rentalId,
            payment_intent_id: intentId,
            total_captured_amount: totalCaptured,
            borrower_id: borrowerId,
            lender_id: lenderId
        } = contextData.rows[0];

        // 3. Calculate Available Escrow Funds
        // We check what has already been paid out (e.g. Rent) to find the remaining Security Deposit.
        const transactionHistory = await tx.query(
            `SELECT amount FROM transactions WHERE payment_intent_id = $1 AND type = '${TRANSACTION_STATUS.RENTAL_FEE}'`,
            [intentId]
        );
        const totalAlreadyPaid = transactionHistory.rows.reduce((sum, t) => sum + Number(t.amount), 0);
        const remainingBalance = Number(totalCaptured) - totalAlreadyPaid;

        const totalDamage = Number(damageAmount);

        // --- CORE LOGIC SPLIT ---

        if (totalDamage <= remainingBalance) {
            // SCENARIO A: Deposit covers the damage
            // 1. Pay damage from Escrow
            if (totalDamage > 0) {
                await tx.query(
                    `INSERT INTO transactions (created_at, payment_intent_id, rental_id, payer_id, payee_id, amount, type, description)
                     VALUES (NOW(), $1, $2, ${ADMIN_ID.ESCROW}, $3, $4, '${TRANSACTION_STATUS.DAMAGE_FEE}', $5)`,
                    [intentId, rentalId, lenderId, totalDamage, `Damage compensation (Covered by Deposit)`]
                );
            }

            // 2. Refund the rest to Borrower
            const refundAmount = remainingBalance - totalDamage;
            if (refundAmount > 0) {
                await tx.query(
                    `INSERT INTO transactions (created_at, payment_intent_id, rental_id, payer_id, payee_id, amount, type, description)
                     VALUES (NOW(), $1, $2, ${ADMIN_ID.ESCROW}, $3, $4, '${TRANSACTION_STATUS.DEPOSIT_REFUND}', $5)`,
                    [intentId, rentalId, borrowerId, refundAmount, `Security deposit refund (Partial)`]
                );
            }
        } else {
            // SCENARIO B: Damage exceeds Deposit (Overage)
            const overageAmount = totalDamage - remainingBalance;

            // 1. Drain the Escrow (Pay full deposit to Lender)
            if (remainingBalance > 0) {
                await tx.query(
                    `INSERT INTO transactions (created_at, payment_intent_id, rental_id, payer_id, payee_id, amount, type, description)
                     VALUES (NOW(), $1, $2, ${ADMIN_ID.ESCROW}, $3, $4, '${TRANSACTION_STATUS.DAMAGE_FEE}', $5)`,
                    [intentId, rentalId, lenderId, remainingBalance, `Damage compensation (Max Deposit)`]
                );
            }

            // 2. Charge the Overage (Borrower pays Lender directly for the excess)
            // Note: In a real Stripe app, this would trigger a new charge on the saved card.
            // Here, we log the obligation.
            await tx.query(
                `INSERT INTO transactions (created_at, payment_intent_id, rental_id, payer_id, payee_id, amount, type, description)
                 VALUES (NOW(), $1, $2, $3, $4, $5, '${TRANSACTION_STATUS.DAMAGE_OVERAGE}', $6)`,
                [
                    intentId,
                    rentalId,
                    borrowerId, // Payer is explicitly the Borrower now, not Escrow
                    lenderId,
                    overageAmount,
                    `Excess damage liability (Amount exceeding deposit)`
                ]
            );
        }

        // 4. Close the Payment Intent (Escrow is now empty in both scenarios)
        await tx.query(
            `UPDATE payment_intents SET status = '${PAYMENT_INTENT_STATUS.SETTLED}', updated_at = NOW() WHERE id = $1`,
            [intentId]
        );

        // 5. Update Dispute Status
        const updatedDispute = await tx.query(
            `UPDATE disputes SET status = $2, end_date = NOW() WHERE id = $1 RETURNING *`,
            [disputeId, disputeResolutionStatus]
        );

        // 6. Log Activity
        const logMessage = totalDamage > remainingBalance
            ? `Dispute resolved. Deposit seized. You owe an additional $${totalDamage - remainingBalance} for damages.`
            : `Dispute resolved. $${totalDamage} deducted from deposit.`;

        await tx.query(
            `INSERT INTO activity_log (created_at, user_id, type, message) VALUES (NOW(), $1, '${ACTIVITY.PAY_DAMAGES}', $2)`,
            [borrowerId, logMessage]
        );

        return updatedDispute.rows[0];
    };

    await endpointWrapper(req, res, payDamagesQuery);
}