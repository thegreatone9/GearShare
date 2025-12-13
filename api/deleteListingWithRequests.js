import {endpointWrapper} from "./util/transaction.js";

const HOTTEST_LIST_SIZE = 8;

export default async function deleteListingWithRequests(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({error: 'Method not allowed'});
    }

    const deleteListingWithRequestsQuery = async (req, tx) => {
        const {listingId, activeStatus} = req.query;

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
    };

    await endpointWrapper(req, res, deleteListingWithRequestsQuery);
}