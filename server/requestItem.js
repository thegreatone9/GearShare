import {endpointWrapper} from "./util/transaction.js";
import {ACTIVITY, PAYMENT_INTENT_STATUS} from "../src/components/util/Util.js";

export default async function requestItem(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({error: 'Method not allowed'});
    }

    const requestItemQuery = async (req, tx) => {
        const {listingId, borrowerId, lenderId, status, date, startDate, endDate} = req.body;

        // Validate required fields
        if (!listingId || !borrowerId || !lenderId || !status || !date || !startDate || !endDate) {
            throw new Error('Missing required fields: listingId, borrowerId, lenderId, status, date, startDate, endDate');
        }

        const listingResult = await tx.query(
            `SELECT * 
             FROM listings 
             WHERE id = $1`,
            [listingId]
        );

        if (listingResult.rows.length === 0) {
            throw new Error(`Listing with ID ${listingId} not found.`);
        }

        const listing = listingResult.rows[0];

        // Calculate Duration and Totals
        const start = new Date(startDate);
        const end = new Date(endDate);
        const dayDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        const duration = dayDiff > 0 ? dayDiff : 1; // Minimum 1 day

        const rentalFee = Number(listing.price) * duration;
        const deposit = Number(listing.replacement_value);
        const totalAuthAmount = rentalFee + deposit;

        const listingJson = JSON.stringify(listing);

        //Insert into requests table
        const requestsResult = await tx.query(
            `INSERT INTO requests (listing_id, borrower_id, lender_id, status, date, start_date, end_date, listing_snapshot)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
            [listingId, borrowerId, lenderId, status, date, startDate, endDate, listingJson]
        );

        const newRequestId = requestsResult.rows[0].id;

        //insert into payment intent table
        await tx.query(
            `INSERT INTO payment_intents (
                created_at,
                updated_at,
                request_id,
                rental_id,
                payer_id,
                payee_id,
                amount,
                status,
                description
            )
             VALUES (NOW(), NOW(), $1, null, $2, $3, $4, '${PAYMENT_INTENT_STATUS.AUTHORIZED}', $5)`,
            [
                newRequestId,
                borrowerId,
                lenderId,
                totalAuthAmount,//(Rent + Deposit)
                `Requesting Listing #${listingId} for ${duration} days`
            ]
        );

        //log activity
        await tx.query(
            `INSERT INTO activity_log (created_at, user_id, type, message) VALUES (NOW(), $1, '${ACTIVITY.REQUEST_ITEM}', $2)`,
            [borrowerId, `You (User ID: #${borrowerId}) have requested the item: #${listingId}`],
        );

        return newRequestId;
    };

    await endpointWrapper(req, res, requestItemQuery);
}