import {endpointWrapper} from "./util/transaction.js";
import {isPartiallyAvailable} from "./util/util.js";

export default async function listingsWithAvailability(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({error: 'Method not allowed'});
    }

    const listingsWithAvailabilityQuery = async (req, tx) => {
        const {ownerId} = req.query;

        const result = await tx.query(`SELECT *
                                       FROM listings_with_availability
                                       ${ownerId && `WHERE owner_id = ${ownerId}`}`);

        return result.rows.map(row => {
            const isAvailable = isPartiallyAvailable(
                row.overall_available_range,
                row.unavailable_ranges
            );

            return {
                ...row,
                available: isAvailable
            };
        });
    };

    await endpointWrapper(req, res, listingsWithAvailabilityQuery);
}