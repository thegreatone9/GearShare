import {endpointWrapper} from "./util/transaction.js";

export default async function marketplace(req, res) {
    await endpointWrapper(req, res, async (req, tx) => {
        const { status, available } = req.query;

        const result = await tx.query(
            `SELECT *
             FROM listings_with_availability
             WHERE status = $1 AND available = $2`,
            [status, available]
        );

        return {
            listingData: result.rows
        };
    });
}