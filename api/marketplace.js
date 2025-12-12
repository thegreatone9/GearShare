import {endpointWrapper} from "./util/transaction.js";

const HOTTEST_LIST_SIZE = 8;

export default async function marketplace(req, res) {
    const marketplaceQuery = async (req, tx) => {
        const {status, available} = req.query;

        const result = await tx.query(
            `SELECT *
             FROM listings_with_availability
             WHERE status = $1
               AND available = $2
                 LIMIT ${HOTTEST_LIST_SIZE}`,
            [status, available]
        );

        return result.rows;
    };

    await endpointWrapper(req, res, marketplaceQuery);
}