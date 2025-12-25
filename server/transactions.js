import { endpointWrapper } from "./util/transaction.js";

export default async function transactions(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const transactionsQuery = async (req, tx) => {
        const { userId } = req.query;

        if (!userId) {
            throw new Error('Missing required query parameter: userId');
        }

        const text = `
            SELECT t.*,
                   req.id AS request_id,
                   json_build_object(
                           'title', l.title,
                           'image_url', l.image_url
                   ) AS listing
            FROM transactions t
                     JOIN payment_intents p ON p.id = t.payment_intent_id
                     JOIN requests req ON p.request_id = req.id
                     JOIN listings l ON req.listing_id = l.id
            WHERE t.payer_id = $1
               OR t.payee_id = $1
            ORDER BY t.created_at DESC
        `;

        const result = await tx.query(text, [userId]);

        return result.rows;
    };

    await endpointWrapper(req, res, transactionsQuery);
}