import {endpointWrapper} from "./util/transaction.js";
import isPartiallyAvailable from "./util/isPartiallyAvailable.js";

export default async function listingsWithAvailability(req, res) {
    const listingsWithAvailabilityQuery = async (req, tx) => {
        const result = await tx.query(`SELECT * FROM listings_with_availability`);

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