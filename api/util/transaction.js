import {Pool} from "pg";
import dotenv from 'dotenv';

dotenv.config();

// Create a shared connection pool for serverless functions
const pool = new Pool({
    connectionString: process.env.SUPABASE_DB_URL
});

export async function transactionWrapper(fn) {
    let client;

    try {
        client = await pool.connect();

        await client.query("BEGIN");

        const result = await fn(client);

        await client.query("COMMIT");

        return result;

    } catch (err) {
        console.log('There was an error acquiring a connection:', err);

        client && await client.query("ROLLBACK");

        throw err;

    } finally {
        client && client.release();
    }
}

export async function endpointWrapper(req, res, fn) {
    try {
        const result = await transactionWrapper(async (tx) => {
            return await fn(req, tx);
        });

        res.status(200).json(result);

    } catch (err) {
        const errorBody = err instanceof Error ? {message: err.message} : err;
        res.status(500).json({error: errorBody});
    }
}