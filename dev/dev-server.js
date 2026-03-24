/**
 * Local Development Server
 *
 * Express server that:
 * 1. Initializes SQLite in-memory database
 * 2. Exposes generic /api/db/:table CRUD routes for localService.js
 * 3. Mounts existing business-logic API routes (confirmRental, requestItem, etc.)
 */

import express from 'express';
import {initializeDatabase, getDb, resetDatabase} from './db.js';

// Import existing API handlers
import listingsWithAvailability from '../server/handlers/listingsWithAvailability.js';
import checkAvailability from '../server/handlers/checkAvailability.js';
import confirmRental from '../server/handlers/confirmRental.js';
import declineRentalRequest from '../server/handlers/declineRentalRequest.js';
import deleteListingWithRequests from '../server/handlers/deleteListingWithRequests.js';
import requestItem from '../server/handlers/requestItem.js';
import payDamages from '../server/handlers/payDamages.js';
import resolveDispute from '../server/handlers/resolveDispute.js';
import transactions from '../server/handlers/transactions.js';
import returnItemCreateDispute from '../server/handlers/returnItemCreateDispute.js';
import upsertListing from '../server/handlers/upsertListing.js';
import purchaseItem from '../server/handlers/purchaseItem.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

// ============================================================
// Initialize database
// ============================================================
initializeDatabase();

// ============================================================
// Generic CRUD Routes for /api/db/:table
// Used by localService.js to perform database operations
// ============================================================

/**
 * Parse query string filters into SQL WHERE clauses.
 * Supports:
 *   eq.column=value     → column = ?
 *   in.column=a,b,c     → column IN (?, ?, ?)
 *   ilike.column=%term% → column LIKE ? (case-insensitive via COLLATE NOCASE)
 *   or=col1.op.val,col2.op.val → (col1 op ? OR col2 op ?)
 *   order=column.desc   → ORDER BY column DESC
 *   limit=N             → LIMIT N
 *   single=true         → return single object instead of array
 *   select=col1,col2    → SELECT col1, col2
 */
function buildQuery(table, queryParams) {
    const select = queryParams.select || '*';
    const conditions = [];
    const params = [];
    let orderBy = '';
    let limit = '';

    for (const [key, value] of Object.entries(queryParams)) {
        if (key === 'select' || key === 'single' || key === 'maybeSingle') continue;

        if (key.startsWith('eq.')) {
            const col = key.slice(3);
            conditions.push(`${col} = ?`);
            params.push(value);

        } else if (key.startsWith('in.')) {
            const col = key.slice(3);
            const values = value.split(',');
            const placeholders = values.map(() => '?').join(', ');
            conditions.push(`${col} IN (${placeholders})`);
            params.push(...values);

        } else if (key.startsWith('ilike.')) {
            const col = key.slice(6);
            conditions.push(`${col} LIKE ? COLLATE NOCASE`);
            params.push(value);

        } else if (key === 'or') {
            // Parse: col1.ilike.%val1%,col2.ilike.%val2%  OR  col1.eq.val1,col2.eq.val2
            const orParts = parseOrClause(value);
            if (orParts.conditions.length > 0) {
                conditions.push(`(${orParts.conditions.join(' OR ')})`);
                params.push(...orParts.params);
            }

        } else if (key === 'order') {
            // value: "column.desc" or "column.asc"
            const parts = value.split('.');
            const col = parts[0];
            const dir = (parts[1] || 'asc').toUpperCase();
            orderBy = ` ORDER BY ${col} ${dir}`;

        } else if (key === 'limit') {
            limit = ` LIMIT ${parseInt(value)}`;
        }
    }

    const whereClause = conditions.length > 0 ? ` WHERE ${conditions.join(' AND ')}` : '';
    const sql = `SELECT ${select} FROM ${table}${whereClause}${orderBy}${limit}`;

    return {sql, params};
}

/**
 * Parse OR filter clause like: "client_id.eq.5,merchant_id.eq.5"
 * or "title.ilike.%drill%,description.ilike.%drill%"
 */
function parseOrClause(orString) {
    const conditions = [];
    const params = [];

    // Split on commas, but be careful with values that contain commas
    // Simple approach: split by comma and process each part
    const parts = orString.split(',');
    for (const part of parts) {
        // Format: column.operator.value
        const dotIdx = part.indexOf('.');
        if (dotIdx === -1) continue;
        const col = part.substring(0, dotIdx);
        const rest = part.substring(dotIdx + 1);

        const opIdx = rest.indexOf('.');
        if (opIdx === -1) continue;
        const op = rest.substring(0, opIdx);
        const val = rest.substring(opIdx + 1);

        if (op === 'eq') {
            conditions.push(`${col} = ?`);
            params.push(val);
        } else if (op === 'ilike') {
            conditions.push(`${col} LIKE ? COLLATE NOCASE`);
            params.push(val);
        }
    }

    return {conditions, params};
}

/**
 * JSON column detection — parse TEXT back to JSON objects for JSONB-like columns
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

// --- GET /api/db/:table — Select ---
app.get('/api/db/:table', (req, res) => {
    try {
        const db = getDb();
        const {sql, params} = buildQuery(req.params.table, req.query);
        const stmt = db.prepare(sql);
        let rows = stmt.all(...params).map(parseJsonColumns);

        if (req.query.single === 'true') {
            if (rows.length === 0) {
                return res.status(404).json(null);
            }
            return res.json(rows[0]);
        }

        res.json(rows);
    } catch (err) {
        console.error('[DB GET Error]', err.message);
        res.status(500).send(err.message);
    }
});

// --- POST /api/db/:table — Insert ---
app.post('/api/db/:table', (req, res) => {
    try {
        const db = getDb();
        const table = req.params.table;
        const data = req.body;
        const columns = Object.keys(data);
        const values = Object.values(data);
        const placeholders = columns.map(() => '?').join(', ');

        const sql = `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`;
        const stmt = db.prepare(sql);
        const info = stmt.run(...values);

        // Fetch the inserted row
        const inserted = db.prepare(`SELECT * FROM ${table} WHERE rowid = ?`).get(info.lastInsertRowid);
        const parsed = parseJsonColumns(inserted);

        if (req.query.single === 'true') {
            return res.json(parsed);
        }

        res.json(parsed);
    } catch (err) {
        console.error('[DB POST Error]', err.message);
        res.status(500).send(err.message);
    }
});

// --- PATCH /api/db/:table — Update ---
app.patch('/api/db/:table', (req, res) => {
    try {
        const db = getDb();
        const table = req.params.table;
        const data = req.body;

        // Build SET clause
        const setCols = Object.keys(data);
        const setValues = Object.values(data).map(v =>
            typeof v === 'object' ? JSON.stringify(v) : v
        );
        const setClause = setCols.map(col => `${col} = ?`).join(', ');

        // Build WHERE from eq. params
        const conditions = [];
        const whereParams = [];
        for (const [key, value] of Object.entries(req.query)) {
            if (key.startsWith('eq.')) {
                const col = key.slice(3);
                conditions.push(`${col} = ?`);
                whereParams.push(value);
            }
        }

        const whereClause = conditions.length > 0 ? ` WHERE ${conditions.join(' AND ')}` : '';
        const sql = `UPDATE ${table} SET ${setClause}${whereClause}`;

        const stmt = db.prepare(sql);
        stmt.run(...setValues, ...whereParams);

        // Return updated rows
        const selectSql = `SELECT * FROM ${table}${whereClause}`;
        const rows = db.prepare(selectSql).all(...whereParams).map(parseJsonColumns);

        if (req.query.single === 'true') {
            return res.json(rows[0] || null);
        }

        res.json(rows);
    } catch (err) {
        console.error('[DB PATCH Error]', err.message);
        res.status(500).send(err.message);
    }
});

// --- DELETE /api/db/:table ---
app.delete('/api/db/:table', (req, res) => {
    try {
        const db = getDb();
        const table = req.params.table;

        const conditions = [];
        const params = [];
        for (const [key, value] of Object.entries(req.query)) {
            if (key.startsWith('eq.')) {
                const col = key.slice(3);
                conditions.push(`${col} = ?`);
                params.push(value);
            }
        }

        const whereClause = conditions.length > 0 ? ` WHERE ${conditions.join(' AND ')}` : '';
        const sql = `DELETE FROM ${table}${whereClause}`;

        const stmt = db.prepare(sql);
        const info = stmt.run(...params);

        res.json({deleted: info.changes});
    } catch (err) {
        console.error('[DB DELETE Error]', err.message);
        res.status(500).send(err.message);
    }
});

// ============================================================
// Mount existing business-logic API routes
// These use endpointWrapper which goes through transaction.js
// ============================================================

function wrapHandler(handler) {
    return (req, res) => {
        if (!req.query) req.query = {};
        const originalUrl = req.originalUrl || req.url;
        req.url = originalUrl;
        return handler(req, res);
    };
}

app.all('/api/checkAvailability', wrapHandler(checkAvailability));
app.all('/api/confirmRental', wrapHandler(confirmRental));
app.all('/api/declineRentalRequest', wrapHandler(declineRentalRequest));
app.all('/api/deleteListingWithRequests', wrapHandler(deleteListingWithRequests));
app.all('/api/listingsWithAvailability', wrapHandler(listingsWithAvailability));
app.all('/api/payDamages', wrapHandler(payDamages));
app.all('/api/requestItem', wrapHandler(requestItem));
app.all('/api/resolveDispute', wrapHandler(resolveDispute));
app.all('/api/returnItemCreateDispute', wrapHandler(returnItemCreateDispute));
app.all('/api/transactions', wrapHandler(transactions));
app.all('/api/upsertListing', wrapHandler(upsertListing));
app.all('/api/purchaseItem', wrapHandler(purchaseItem));

// ============================================================
// SQLite Browser Console
// ============================================================

// POST /api/reset-db — Reset database to seed state
app.post('/api/reset-db', (req, res) => {
    try {
        resetDatabase();
        res.json({success: true, message: 'Database reset and re-seeded'});
    } catch (err) {
        res.status(500).json({error: err.message});
    }
});

// POST /api/sql — Execute arbitrary SQL
app.post('/api/sql', (req, res) => {
    try {
        const db = getDb();
        const {sql} = req.body;

        if (!sql || !sql.trim()) {
            return res.status(400).json({error: 'No SQL provided'});
        }

        const trimmed = sql.trim();
        const isSelect = /^\s*(SELECT|PRAGMA|EXPLAIN)/i.test(trimmed);

        if (isSelect) {
            const stmt = db.prepare(trimmed);
            const rows = stmt.all();
            res.json({rows, changes: 0, type: 'query'});
        } else {
            const stmt = db.prepare(trimmed);
            const info = stmt.run();
            // For INSERT/UPDATE/DELETE, try to return affected info
            res.json({rows: [], changes: info.changes, lastInsertRowid: info.lastInsertRowid, type: 'execute'});
        }
    } catch (err) {
        res.status(400).json({error: err.message});
    }
});

// GET /console — SQLite Browser Console UI
app.get('/console', (req, res) => {
    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>SQLite Console — GearShare Dev</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', monospace; background: #0d1117; color: #c9d1d9; height: 100vh; display: flex; flex-direction: column; }
  header { background: #161b22; border-bottom: 1px solid #30363d; padding: 12px 20px; display: flex; align-items: center; justify-content: space-between; }
  header h1 { font-size: 16px; color: #58a6ff; font-weight: 600; }
  header .badge { background: #238636; color: #fff; padding: 2px 8px; border-radius: 12px; font-size: 11px; }
  .container { display: flex; flex: 1; overflow: hidden; }
  .sidebar { width: 220px; background: #161b22; border-right: 1px solid #30363d; overflow-y: auto; padding: 12px; flex-shrink: 0; }
  .sidebar h3 { font-size: 11px; text-transform: uppercase; color: #8b949e; margin-bottom: 8px; letter-spacing: 1px; }
  .sidebar .table-name { padding: 5px 8px; cursor: pointer; border-radius: 4px; font-size: 13px; color: #c9d1d9; }
  .sidebar .table-name:hover { background: #21262d; color: #58a6ff; }
  .main { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
  .editor-area { padding: 12px; border-bottom: 1px solid #30363d; }
  textarea { width: 100%; height: 120px; background: #0d1117; color: #c9d1d9; border: 1px solid #30363d; border-radius: 6px; padding: 12px; font-family: inherit; font-size: 14px; resize: vertical; outline: none; }
  textarea:focus { border-color: #58a6ff; }
  .toolbar { display: flex; gap: 8px; margin-top: 8px; align-items: center; }
  button { background: #238636; color: #fff; border: none; padding: 6px 16px; border-radius: 6px; cursor: pointer; font-size: 13px; font-family: inherit; }
  button:hover { background: #2ea043; }
  button.secondary { background: #21262d; color: #c9d1d9; border: 1px solid #30363d; }
  button.secondary:hover { background: #30363d; }
  .hint { color: #8b949e; font-size: 12px; margin-left: auto; }
  .results { flex: 1; overflow: auto; padding: 12px; }
  .status { padding: 6px 12px; background: #161b22; border-top: 1px solid #30363d; font-size: 12px; color: #8b949e; display: flex; justify-content: space-between; }
  .status .error { color: #f85149; }
  .status .success { color: #3fb950; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  th { background: #161b22; color: #58a6ff; text-align: left; padding: 8px 10px; border-bottom: 2px solid #30363d; position: sticky; top: 0; }
  td { padding: 6px 10px; border-bottom: 1px solid #21262d; max-width: 300px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  tr:hover td { background: #161b22; }
  .empty { color: #8b949e; text-align: center; padding: 40px; font-size: 14px; }
  .history { margin-top: 12px; }
  .history-item { padding: 4px 8px; cursor: pointer; border-radius: 4px; font-size: 12px; color: #8b949e; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .history-item:hover { background: #21262d; color: #c9d1d9; }
</style>
</head>
<body>
<header>
  <h1>⚡ SQLite Console</h1>
  <span class="badge">in-memory</span>
</header>
<div class="container">
  <div class="sidebar">
    <h3>Tables</h3>
    <div id="tables"></div>
    <div class="history" id="historySection" style="display:none">
      <h3 style="margin-top:16px">History</h3>
      <div id="history"></div>
    </div>
  </div>
  <div class="main">
    <div class="editor-area">
      <textarea id="sql" placeholder="SELECT * FROM listings LIMIT 10;" spellcheck="false"></textarea>
      <div class="toolbar">
        <button onclick="runQuery()">▶ Run</button>
        <button class="secondary" onclick="clearResults()">Clear</button>
        <button class="secondary" onclick="resetDb()" style="background:#da3633;color:#fff;border:none">⚠ Reset DB</button>
        <span class="hint">⌘+Enter to run</span>
      </div>
    </div>
    <div class="results" id="results">
      <div class="empty">Run a query to see results</div>
    </div>
    <div class="status" id="status">
      <span>Ready</span>
      <span id="timing"></span>
    </div>
  </div>
</div>
<script>
const sqlEl = document.getElementById('sql');
const resultsEl = document.getElementById('results');
const statusEl = document.getElementById('status');
const timingEl = document.getElementById('timing');
const tablesEl = document.getElementById('tables');
const historyEl = document.getElementById('history');
const historySec = document.getElementById('historySection');
const queryHistory = [];

sqlEl.addEventListener('keydown', e => {
  if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') { e.preventDefault(); runQuery(); }
});

async function runQuery() {
  const sql = sqlEl.value.trim();
  if (!sql) return;
  const start = performance.now();
  try {
    const res = await fetch('/api/sql', {
      method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({sql})
    });
    const data = await res.json();
    const elapsed = (performance.now() - start).toFixed(1);
    if (data.error) {
      statusEl.innerHTML = '<span class="error">Error: ' + esc(data.error) + '</span>';
      timingEl.textContent = elapsed + 'ms';
      return;
    }
    addHistory(sql);
    if (data.type === 'query' && data.rows.length > 0) {
      renderTable(data.rows);
      statusEl.innerHTML = '<span class="success">' + data.rows.length + ' row(s)</span>';
    } else if (data.type === 'execute') {
      resultsEl.innerHTML = '<div class="empty">' + data.changes + ' row(s) affected' + (data.lastInsertRowid ? ' — last ID: ' + data.lastInsertRowid : '') + '</div>';
      statusEl.innerHTML = '<span class="success">OK — ' + data.changes + ' change(s)</span>';
    } else {
      resultsEl.innerHTML = '<div class="empty">No rows returned</div>';
      statusEl.innerHTML = '<span class="success">OK — 0 rows</span>';
    }
    timingEl.textContent = elapsed + 'ms';
  } catch(e) {
    statusEl.innerHTML = '<span class="error">Network error: ' + e.message + '</span>';
  }
}

function renderTable(rows) {
  const cols = Object.keys(rows[0]);
  let html = '<table><tr>' + cols.map(c => '<th>' + esc(c) + '</th>').join('') + '</tr>';
  for (const row of rows) {
    html += '<tr>' + cols.map(c => {
      let v = row[c];
      if (v === null) return '<td style="color:#8b949e">NULL</td>';
      if (typeof v === 'object') v = JSON.stringify(v);
      return '<td title="' + esc(String(v)) + '">' + esc(String(v)) + '</td>';
    }).join('') + '</tr>';
  }
  html += '</table>';
  resultsEl.innerHTML = html;
}

function clearResults() {
  resultsEl.innerHTML = '<div class="empty">Run a query to see results</div>';
  statusEl.innerHTML = '<span>Ready</span>'; timingEl.textContent = '';
}

function addHistory(sql) {
  if (queryHistory[0] === sql) return;
  queryHistory.unshift(sql);
  if (queryHistory.length > 20) queryHistory.pop();
  historySec.style.display = 'block';
  historyEl.innerHTML = queryHistory.map(q => '<div class="history-item" onclick="loadHistory(this)" title="' + esc(q) + '">' + esc(q.substring(0,40)) + '</div>').join('');
}
function loadHistory(el) { sqlEl.value = el.title; }

async function resetDb() {
  if (!confirm('Reset the database? This will delete all data and re-seed from seed.sql.')) return;
  try {
    const res = await fetch('/api/reset-db', {method:'POST'});
    const data = await res.json();
    if (data.success) {
      statusEl.innerHTML = '<span class="success">Database reset successfully. Reload the page.</span>';
      setTimeout(() => location.reload(), 500);
    } else {
      statusEl.innerHTML = '<span class="error">Reset failed: ' + esc(data.error) + '</span>';
    }
  } catch(e) { statusEl.innerHTML = '<span class="error">Reset error: ' + e.message + '</span>'; }
}

function esc(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

// Load table list
(async () => {
  try {
    const res = await fetch('/api/sql', {
      method: 'POST', headers: {'Content-Type':'application/json'},
      body: JSON.stringify({sql: "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name"})
    });
    const data = await res.json();
    tablesEl.innerHTML = data.rows.map(r =>
      '<div class="table-name" onclick="sqlEl.value=\\'SELECT * FROM ' + r.name + ' LIMIT 50;\\'; runQuery()">' + r.name + '</div>'
    ).join('');
  } catch(e) { tablesEl.innerHTML = '<div class="empty">Error loading tables</div>'; }
})();
</script>
</body>
</html>`);
});

// ============================================================
// Start Server
// ============================================================

app.listen(PORT, () => {
    console.log(`\n🚀 GearShare Dev Server running at http://localhost:${PORT}`);
    console.log(`   📦 SQLite in-memory database ready`);
    console.log(`   🔗 API routes mounted at /api/*`);
    console.log(`   🗄️  Generic CRUD at /api/db/:table`);
    console.log(`   🖥️  SQL Console at http://localhost:${PORT}/console\n`);
});

