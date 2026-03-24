import {endpointWrapper} from "../util/transaction.js";
import {ACTIVITY, LISTING_STATUS, PAYMENT_INTENT_STATUS} from "../../src/utils/constants.js";

export default async function purchaseItem(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({error: 'Method not allowed'});
    }

    const purchaseItemQuery = async (req, tx) => {
        const {listingId, buyerId, sellerId} = req.body;

        // Validate required fields
        if (!listingId || !buyerId || !sellerId) {
            throw new Error('Missing required fields: listingId, buyerId, sellerId');
        }

        // Fetch the listing and validate it's a SELL listing
        const listingResult = await tx.query(
            `SELECT * FROM listings WHERE id = $1`,
            [listingId]
        );

        if (listingResult.rows.length === 0) {
            throw new Error(`Listing with ID ${listingId} not found.`);
        }

        const listing = listingResult.rows[0];

        if (listing.listing_type !== 'SELL') {
            throw new Error('This listing is not for sale.');
        }

        if (listing.status !== LISTING_STATUS.ACTIVE) {
            throw new Error('This listing is no longer available.');
        }

        if (listing.owner_id === buyerId) {
            throw new Error('You cannot purchase your own listing.');
        }

        const salePrice = Number(listing.price);
        const today = new Date().toISOString().split('T')[0];
        const listingJson = JSON.stringify(listing);

        // 1. Create a request record (reusing requests table)
        const requestResult = await tx.query(
            `INSERT INTO requests (listing_id, client_id, merchant_id, status, date, start_date, end_date, listing_snapshot)
             VALUES ($1, $2, $3, 'completed', $4, $4, $4, $5) RETURNING *`,
            [listingId, buyerId, sellerId, today, listingJson]
        );

        const newRequestId = requestResult.rows[0].id;

        // 2. Create a payment intent for the full sale price
        await tx.query(
            `INSERT INTO payment_intents (created_at, updated_at, request_id, payer_id, payee_id, amount, status, description)
             VALUES (NOW(), NOW(), $1, $2, $3, $4, '${PAYMENT_INTENT_STATUS.CAPTURED}', $5)`,
            [
                newRequestId,
                buyerId,
                sellerId,
                salePrice,
                `Purchase of Listing #${listingId}: ${listing.title}`
            ]
        );

        // 3. Create a transaction record
        await tx.query(
            `INSERT INTO transactions (created_at, request_id, payer_id, payee_id, amount, type, description)
             VALUES (NOW(), $1, $2, $3, $4, 'SALE', $5)`,
            [newRequestId, buyerId, sellerId, salePrice, `Sale of: ${listing.title}`]
        );

        // 4. Mark listing as SOLD
        await tx.query(
            `UPDATE listings SET status = '${LISTING_STATUS.SOLD}' WHERE id = $1`,
            [listingId]
        );

        // 5. Log activity for buyer
        await tx.query(
            `INSERT INTO activity_log (created_at, user_id, type, message)
             VALUES (NOW(), $1, '${ACTIVITY.PURCHASE_ITEM}', $2)`,
            [buyerId, `You purchased: ${listing.title} for $${salePrice}`]
        );

        // 6. Log activity for seller
        await tx.query(
            `INSERT INTO activity_log (created_at, user_id, type, message)
             VALUES (NOW(), $1, '${ACTIVITY.PURCHASE_ITEM}', $2)`,
            [sellerId, `Your item was sold: ${listing.title} for $${salePrice}`]
        );

        return newRequestId;
    };

    await endpointWrapper(req, res, purchaseItemQuery);
}
