import {endpointWrapper} from "./util/transaction.js";
import {ACTIVITY, PAYMENT_INTENT_STATUS} from "../src/components/util/Util.js";

export default async function declineRentalRequest(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const declineQuery = async (req, tx) => {
        const { requestId, newStatus } = req.body;

        // 1. Validate Input
        if (!requestId || !newStatus) {
            throw new Error('Missing required fields: requestId, newStatus');
        }

        // 2. Update Request Status (e.g. to 'DECLINED')
        const requestUpdateResult = await tx.query(
            `UPDATE requests
             SET status = $2
             WHERE id = $1
             RETURNING borrower_id, listing_id`,
            [requestId, newStatus]
        );

        if (requestUpdateResult.rows.length === 0) {
            throw new Error(`Request with ID ${requestId} not found.`);
        }

        const { borrower_id: borrowerId, listing_id: listingId } = requestUpdateResult.rows[0];

        // 3. Cancel the Payment Intent (Release the Hold)
        // We only cancel intents that are currently AUTHORIZED.
        const intentUpdateResult = await tx.query(
            `UPDATE payment_intents
             SET status = '${PAYMENT_INTENT_STATUS.CANCELLED}', updated_at = NOW()
             WHERE rental_id = $1 AND status = '${PAYMENT_INTENT_STATUS.AUTHORIZED}'
             RETURNING id`,
            [requestId]
        );

        // Note: It's possible no intent exists if it was already cancelled or never created.
        // We log a warning but don't fail the entire decline operation.
        if (intentUpdateResult.rows.length === 0) {
            console.warn(`Warning: No 'AUTHORIZED' payment intent found to cancel for Request #${requestId}`);
        }

        // 4. Log Activity for the Borrower
        await tx.query(
            `INSERT INTO activity_log (created_at, user_id, type, message)
             VALUES (NOW(), $1, '${ACTIVITY.DECLINE_REQUEST}', $2)`,
            [
                borrowerId,
                `Your rental request for Listing #${listingId} was declined. The temporary hold on your card has been released.`
            ]
        );
    };

    await endpointWrapper(req, res, declineQuery);
}