import {endpointWrapper} from "./util/transaction.js";

/**
 * Handles item return and creates a dispute
 */
export default async function returnItemCreateDispute(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const createDisputeQuery = async (req, tx) => {
        const {rentalId, disputeStatus, rentalStatus} = req.body;

        // Validate required fields
        if (!rentalId || !disputeStatus || !rentalStatus) {
            throw new Error('Missing required fields: rentalId, disputeStatus, rentalStatus');
        }

        // 1. Check if rental exists
        const rentalCheck = await tx.query(
            `SELECT id
             FROM rentals
             WHERE id = $1`,
            [rentalId]
        );

        if (rentalCheck.rows.length === 0) {
            throw new Error(`Rental with ID ${rentalId} does not exist.`);
        }

        // 2. Create the dispute record
        const currentDate = new Date();
        const disputeResult = await tx.query(
            `INSERT INTO disputes (rental_id, start_date, status)
             VALUES ($1, $2, $3) RETURNING *`,
            [rentalId, currentDate, disputeStatus]
        );

        const createdDispute = disputeResult.rows[0];

        // 3. Update the rental with return date and new status
        await tx.query(
            `UPDATE rentals
             SET return_date = $2,
                 status      = $3
             WHERE id = $1`,
            [rentalId, currentDate, rentalStatus]
        );

        // Return the created dispute
        return createdDispute;
    };

    await endpointWrapper(req, res, createDisputeQuery);
}