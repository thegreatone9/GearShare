/**
 * SQLite Database Abstraction Layer
 *
 * Provides a pg-compatible interface so existing server handlers
 * (which use client.query(sql, params)) work without modification.
 *
 * Uses better-sqlite3 with a file-based database (dev/gearshare.db)
 * that persists across restarts. On first run or with --reset-db,
 * the database is seeded from sqlite-ddl.sql and seed.sql.
 */

import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import {fileURLToPath} from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, 'gearshare.db');

let db;

function deleteDbFiles() {
    [DB_PATH, `${DB_PATH}-wal`, `${DB_PATH}-shm`].forEach(f => {
        if (fs.existsSync(f)) fs.unlinkSync(f);
    });
}

/**
 * Seed the database with schema (DDL) and sample data.
 */
function seedDatabase() {
    const ddl = fs.readFileSync(path.join(__dirname, 'sqlite-ddl.sql'), 'utf-8');
    db.exec(ddl);

    const seed = fs.readFileSync(path.join(__dirname, 'seed.sql'), 'utf-8');
    db.exec(seed);
}

/**
 * Initialize the SQLite database from the file `dev/gearshare.db`.
 * If the file doesn't exist, creates it and seeds with DDL + sample data.
 * Pass --reset-db flag to re-initialize from scratch.
 */
export function initializeDatabase() {
    const shouldReset = process.argv.includes('--reset-db');
    const dbExists = fs.existsSync(DB_PATH);

    if (shouldReset && dbExists) {
        deleteDbFiles();
        console.log('[SQLite] Existing database deleted (--reset-db)');
    }

    db = new Database(DB_PATH, {verbose: process.env.DEBUG_SQL ? console.log : undefined});

    // Enable WAL mode and foreign keys
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');

    if (!dbExists || shouldReset) {
        seedDatabase();
        console.log('[SQLite] New database created and seeded at', DB_PATH);
    } else {
        console.log('[SQLite] Loaded existing database from', DB_PATH);
    }

    return db;
}

/**
 * Reset the database — drops all data and re-seeds from DDL + seed.sql.
 * Useful from the SQL console or programmatically.
 */
export function resetDatabase() {
    if (db) db.close();
    deleteDbFiles();

    db = new Database(DB_PATH, {verbose: process.env.DEBUG_SQL ? console.log : undefined});
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    seedDatabase();
    console.log('[SQLite] Database reset and re-seeded');
    return db;
}

/**
 * Get the raw better-sqlite3 database instance
 */
export function getDb() {
    if (!db) {
        throw new Error('Database not initialized. Call initializeDatabase() first.');
    }
    return db;
}

/**
 * Translate PostgreSQL-style SQL to SQLite-compatible SQL.
 * Handles: $1/$2 → ?, NOW() → datetime('now'), RETURNING *, ::jsonb casts, ANY($N)
 */
function translateSQL(sql, params = []) {
    let translated = sql;
    let translatedParams = [...params];

    // Replace $1, $2, $3... with ?
    // But first, handle ANY($N) pattern: column = ANY($N) → column IN (?, ?, ...)
    translated = translated.replace(/=\s*ANY\(\$(\d+)\)/gi, (match, paramIndex) => {
        const idx = parseInt(paramIndex) - 1;
        const arr = translatedParams[idx];
        if (Array.isArray(arr)) {
            const placeholders = arr.map(() => '?').join(', ');
            // Replace the array param with individual values
            translatedParams.splice(idx, 1, ...arr);
            return `IN (${placeholders})`;
        }
        return match;
    });

    // Now replace remaining $N with ?
    // We need to do this carefully since param indices may have shifted
    // Re-index: collect all $N references in order
    const dollarParams = [];
    translated = translated.replace(/\$(\d+)/g, (match, num) => {
        dollarParams.push(parseInt(num));
        return '?';
    });

    // Reorder params based on $N references (1-indexed)
    if (dollarParams.length > 0) {
        const reordered = dollarParams.map(n => translatedParams[n - 1]);
        translatedParams = reordered;
    }

    // Replace NOW() with datetime('now')
    translated = translated.replace(/NOW\(\)/gi, "datetime('now')");

    // Strip ::jsonb casts
    translated = translated.replace(/::jsonb/gi, '');

    // Strip ::text casts
    translated = translated.replace(/::text/gi, '');

    return {sql: translated, params: translatedParams};
}

/**
 * Execute a query with pg-style interface: query(sql, params)
 * Returns { rows: [...], rowCount: N }
 */
function executeQuery(sql, params = []) {
    const {sql: translatedSql, params: translatedParams} = translateSQL(sql, params);

    const trimmed = translatedSql.trim().toUpperCase();

    if (trimmed.startsWith('SELECT') || trimmed.startsWith('WITH')) {
        const stmt = db.prepare(translatedSql);
        const rows = stmt.all(...translatedParams);
        // Parse JSON columns (stored as TEXT in SQLite)
        const parsed = rows.map(parseJsonColumns);
        return {rows: parsed, rowCount: parsed.length};
    }

    if (trimmed.startsWith('BEGIN') || trimmed.startsWith('COMMIT') || trimmed.startsWith('ROLLBACK') ||
        trimmed.startsWith('SAVEPOINT') || trimmed.startsWith('RELEASE')) {
        db.exec(translatedSql);
        return {rows: [], rowCount: 0};
    }

    // For INSERT/UPDATE/DELETE, check for RETURNING
    const returningMatch = translatedSql.match(/RETURNING\s+(.+)$/i);

    if (returningMatch) {
        // Remove RETURNING clause, execute, then SELECT
        const sqlWithoutReturning = translatedSql.replace(/\s+RETURNING\s+.+$/i, '');
        const stmt = db.prepare(sqlWithoutReturning);
        const info = stmt.run(...translatedParams);

        // Determine what to return
        const returningCols = returningMatch[1].trim();

        if (trimmed.startsWith('INSERT')) {
            const selectSql = `SELECT ${returningCols} FROM ${extractTableName(sqlWithoutReturning)} WHERE rowid = ?`;
            const row = db.prepare(selectSql).get(info.lastInsertRowid);
            return {rows: row ? [parseJsonColumns(row)] : [], rowCount: 1};
        }

        if (trimmed.startsWith('UPDATE')) {
            // For updates, re-select the affected rows using the WHERE clause
            const whereMatch = sqlWithoutReturning.match(/WHERE\s+(.+)$/i);
            if (whereMatch) {
                const selectSql = `SELECT ${returningCols} FROM ${extractTableName(sqlWithoutReturning)} WHERE ${whereMatch[1]}`;
                // Extract params used in WHERE clause
                const setParamsCount = (sqlWithoutReturning.match(/\?/g) || []).length -
                    (whereMatch[1].match(/\?/g) || []).length;
                const whereParams = translatedParams.slice(setParamsCount);
                const rows = db.prepare(selectSql).all(...whereParams);
                return {rows: rows.map(parseJsonColumns), rowCount: info.changes};
            }
        }

        return {rows: [], rowCount: info.changes};
    }

    // No RETURNING clause
    const stmt = db.prepare(translatedSql);
    const info = stmt.run(...translatedParams);
    return {rows: [], rowCount: info.changes};
}

/**
 * Extract table name from INSERT/UPDATE/DELETE SQL
 */
function extractTableName(sql) {
    const insertMatch = sql.match(/INSERT\s+INTO\s+(\w+)/i);
    if (insertMatch) return insertMatch[1];

    const updateMatch = sql.match(/UPDATE\s+(\w+)/i);
    if (updateMatch) return updateMatch[1];

    const deleteMatch = sql.match(/DELETE\s+FROM\s+(\w+)/i);
    if (deleteMatch) return deleteMatch[1];

    return null;
}

/**
 * Parse JSON string columns back into objects.
 * Checks common JSON column names.
 */
const JSON_COLUMNS = new Set([
    'unavailable_ranges', 'overall_available_range', 'listing_snapshot', 'image_url'
]);

function parseJsonColumns(row) {
    if (!row) return row;
    const parsed = {...row};
    for (const key of Object.keys(parsed)) {
        if (JSON_COLUMNS.has(key) && typeof parsed[key] === 'string') {
            try {
                parsed[key] = JSON.parse(parsed[key]);
            } catch {
                // Not valid JSON, leave as-is
            }
        }
    }
    return parsed;
}

/**
 * Create a pg Pool-compatible interface for existing server handlers.
 * Returns an object with connect() that returns a client with query() and release().
 */
export function getPool() {
    return {
        connect: async () => {
            return {
                query: async (sql, params) => {
                    return executeQuery(sql, params);
                },
                release: () => {
                    // No-op for SQLite
                }
            };
        },
        query: async (sql, params) => {
            return executeQuery(sql, params);
        }
    };
}
