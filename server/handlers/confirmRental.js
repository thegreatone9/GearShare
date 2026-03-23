import {endpointWrapper} from "../util/transaction.js";
import {ACTIVITY, ADMIN_ID, PAYMENT_INTENT_STATUS, TRANSACTION_STATUS} from "../../src/utils/constants.js";

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
            borrowerId,
            lenderId,
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
        const requestData = await tx.query(
            `SELECT *
             FROM requests
             WHERE id = $1`,
            [requestId]
        );

        if (requestData.rows.length === 0) {
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

        //5. Update Payment Intent
        const intentResult = await tx.query(
            `UPDATE payment_intents 
             SET status = '${PAYMENT_INTENT_STATUS.CAPTURED}', updated_at = NOW(), rental_id = $1
             WHERE request_id = $2 AND status = '${PAYMENT_INTENT_STATUS.AUTHORIZED}'
             RETURNING id, amount`,
            [insertedRental.id, requestId] // In your schema, requestId was used as the link in requestItem
        );

        if (intentResult.rows.length === 0) {
            throw new Error(`No authorized payment intent found for request ${requestId}.`);
        }

        const { id: intentId, amount: totalAmount } = intentResult.rows[0];

        // 6. Create Transaction Ledger Entry
        // This marks the actual financial event of money moving into escrow.
        await tx.query(
            `INSERT INTO transactions (
                payment_intent_id, 
                payer_id, 
                payee_id, 
                amount, 
                type, 
                description
            )
             VALUES ($1, $2, $3, $4, '${TRANSACTION_STATUS.SECURITY_DEPOSIT}', $5)`,
            [
                intentId,
                borrowerId,        // The Borrower is paying
                ADMIN_ID.ESCROW,   // Money is currently held by the platform
                totalAmount,
                `Security deposit and rental fee captured for Rental #${insertedRental.id}`
            ]
        );

        //7. Activity Log (Optional but recommended)
        await tx.query(
            `INSERT INTO activity_log (created_at, user_id, type, message)
             VALUES (NOW(), $1, $2, $3)`,
            [lenderId, ACTIVITY.CONFIRM_RENTAL, `Your payment for Listing #${listingId} has been captured and the rental is confirmed.`]
        );

        // Return the inserted rental
        return insertedRental;
    };

    await endpointWrapper(req, res, confirmRentalQuery);
}