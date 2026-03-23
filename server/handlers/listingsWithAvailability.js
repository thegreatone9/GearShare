import {endpointWrapper} from "../util/transaction.js";
import {isPartiallyAvailable} from "../util/util.js";

export default async function listingsWithAvailability(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({error: 'Method not allowed'});
    }

    const listingsWithAvailabilityQuery = async (req, tx) => {
        const { ownerId, status, available } = req.query;

        let queryText = `SELECT * FROM listings_with_availability`;
        const queryParams = [];
        const conditions = [];

        if (ownerId) {
            queryParams.push(ownerId);
            conditions.push(`owner_id = $${queryParams.length}`);
        }

        if (status) {
            queryParams.push(status);
            conditions.push(`status = $${queryParams.length}`);
        }

        if (conditions.length > 0) {
            queryText += ` WHERE ` + conditions.join(' AND ');
        }

        const result = await tx.query(queryText, queryParams);

        const processedResult = result.rows.map(row => {
            const isAvailable = isPartiallyAvailable(
                row.overall_available_range,
                row.unavailable_ranges
            );

            return {
                ...row,
                available: isAvailable
            };
        });

        return processedResult.filter(row => {
            if (available === undefined) {
                return true;
            }

            const targetAvailability = available === 'true';

            return row.available === targetAvailability;
        });
    };

    await endpointWrapper(req, res, listingsWithAvailabilityQuery);
}