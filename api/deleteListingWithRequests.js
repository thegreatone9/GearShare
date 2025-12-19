import {endpointWrapper} from "./util/transaction.js";
import {ACTIVITY} from "../src/components/util/Util.js";

export default async function deleteListingWithRequests(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({error: 'Method not allowed'});
    }

    const deleteListingWithRequestsQuery = async (req, tx) => {
        const {userId, listingId, activeStatus} = req.query;

        await tx.query(
            `DELETE
             FROM requests
             WHERE listing_id = $1
               AND status = $2;`,
            [listingId, activeStatus]
        );

        await tx.query(
            `DELETE
             FROM listings
             WHERE id = $1`,
            [listingId]
        );

        await tx.query(
            `INSERT INTO activity_log (created_at, user_id, type, message)
             VALUES (NOW(), $1, $2, $3)`,
            [userId, ACTIVITY.DELETE_LISTING, `User Deleted Listing: ${listingId}`],
        );
    };

    await endpointWrapper(req, res, deleteListingWithRequestsQuery);
}