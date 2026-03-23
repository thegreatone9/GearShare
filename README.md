# GearShare

A peer-to-peer gear rental marketplace where users can list equipment they own, browse available items in their community, and manage the full rental lifecycle — from requesting an item, to confirming a rental, returning it, and resolving any damage disputes.

---

## Business Overview

GearShare solves the problem of expensive equipment sitting idle. Instead of buying a **$500 drill** you'll use once, you borrow one from a neighbor for **$15/day**.

### User Roles

| Role | What they do |
|------|-------------|
| **Borrower** | Browse marketplace, request items, pay rental fees + security deposit |
| **Lender** | List items with pricing/availability, accept or decline requests, manage inventory |
| **Admin** | Resolve damage disputes between borrowers and lenders |

### Rental Lifecycle

```
Borrower requests item → Lender reviews → Accept or Decline
                                              ↓
                                     Rental period begins
                                              ↓
                                     Borrower returns item
                                              ↓
                               Lender inspects returned item
                              ↙                            ↘
                       No damage                      Damage found
                          ↓                                ↓
                    Settle & release               File claim (keep deposit)
                    deposit to borrower                    ↓
                          ↓                        Borrower submits evidence
                      COMPLETED                            ↓
                                                  Admin reviews & judges
                                                           ↓
                                                       COMPLETED
```

### Payment Flow

- **Security Deposit** — Held in escrow when the borrower requests an item
- **Rental Fee** — Paid to the lender when the item is returned
- **Deposit Return** — Full or partial refund to borrower after lender inspection
- **Damage Overage** — Extra charge to borrower if damages exceed the deposit

---

## Technical Architecture

### Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, React Router, Tailwind CSS 4 |
| **Backend (Production)** | Vercel Serverless Functions, Supabase (PostgreSQL) |
| **Backend (Local Dev)** | Express server, SQLite (via better-sqlite3) |
| **Service Layer** | Strategy pattern — `service.js` routes to Supabase or local implementation |

### Project Structure

```
GearShare/
├── api/index.js                  ← Vercel serverless entry point
├── server/
│   ├── handlers/                 ← Business logic (confirmRental, requestItem, etc.)
│   └── util/                     ← Transaction wrapper, SQL helpers
├── db/                           ← Production SQL (PostgreSQL DDL, seed, stored procs)
├── dev/                          ← Local dev server + SQLite
│   ├── dev-server.js             ← Express server with CRUD routes + SQL console
│   ├── db.js                     ← pg-compatible SQLite adapter
│   ├── sqlite-ddl.sql            ← SQLite schema
│   ├── seed.sql                  ← Sample data
│   └── gearshare.db              ← Persistent SQLite database (gitignored)
├── src/
│   ├── services/                 ← Data access layer (strategy pattern)
│   │   ├── service.js            ← Router: picks Supabase or local implementation
│   │   ├── supabaseService.js    ← Production: Supabase SDK calls
│   │   └── localService.js       ← Development: fetch() to local Express server
│   ├── utils/                    ← Shared utilities (constants, auth, date, etc.)
│   ├── components/               ← React UI components (by feature)
│   ├── App.jsx
│   └── main.jsx
├── .env                          ← Public defaults (committed)
├── .env.local                    ← Secrets (gitignored)
├── .env.example                  ← Template for new developers
├── package.json
└── vite.config.js
```

### Service Layer (Strategy Pattern)

Frontend components never call Supabase or fetch directly. They import from `service.js`, which dynamically selects the implementation based on `VITE_USE_LOCAL_DB`:

```
Components → service.js → supabaseService.js  (production)
                        → localService.js      (local dev, talks to Express/SQLite)
```

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm**

### Installation

```bash
git clone <repo-url>
cd GearShare
npm install
```

### Environment Setup

Copy the example env file and fill in your Supabase credentials:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your Supabase API key and database URL. See `.env.example` for all available variables.

---

## Running the Project

### Local Development (SQLite — no Supabase needed)

```bash
npm run dev:local
```

This starts:
- **Express API server** on `http://localhost:5000` with an in-memory SQLite database
- **Vite dev server** on `http://localhost:5174` with hot reload

On the first run, the SQLite database file (`dev/gearshare.db`) is automatically created and seeded with sample data. On subsequent runs, the existing database is loaded  — **your changes persist across restarts**.

#### Resetting the Database

To wipe the database and re-seed from scratch:

```bash
npm run dev:reset
```

Or use the **⚠ Reset DB** button in the SQL Console (see below).

### Production Mode (Supabase)

```bash
npm run dev
```

This starts:
- **Vercel dev server** on `http://localhost:5000` (proxies to serverless functions)
- **Vite dev server** on `http://localhost:5173` with hot reload

Requires valid Supabase credentials in `.env.local`.

### Production Build

```bash
npm run build      # Build for production
npm run preview    # Preview the production build locally
```

Deployed to **Vercel** — the `vercel.json` config routes `/api/*` to serverless functions and everything else to the SPA.

---

## SQLite Browser Console

When running in local mode (`npm run dev:local`), a built-in SQL console is available at:

**http://localhost:5000/console**

### Features

- **Table sidebar** — Click any table name to instantly query it
- **SQL editor** — Run SELECT, INSERT, UPDATE, DELETE, or PRAGMA queries
- **Results table** — Displays columns, rows, NULL values, and JSON objects
- **Query history** — Recent queries saved in the sidebar for re-use
- **⌘+Enter** shortcut to execute queries
- **⚠ Reset DB** button to re-initialize the database from `seed.sql`

### Data Persistence

The SQLite database is stored in `dev/gearshare.db` (gitignored). This means:

| Action | Effect on Data |
|--------|---------------|
| Restart the dev server | ✅ Data preserved |
| Modify data via the app or console | ✅ Data preserved |
| Run `npm run dev:reset` | ❌ Data wiped, re-seeded from `seed.sql` |
| Click **⚠ Reset DB** in the console | ❌ Data wiped, re-seeded from `seed.sql` |
| Delete `dev/gearshare.db` manually | ❌ Auto-recreated on next startup |

### Sample Login Credentials (Local Mode)

| Email | Password | Role |
|-------|----------|------|
| `tom@gearshare.com` | `password` | Lender (owns listings) |
| `jane@gearshare.com` | `password` | Borrower |

---

## npm Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start with Supabase (production backend) |
| `npm run dev:local` | Start with SQLite (no external dependencies) |
| `npm run dev:reset` | Start with SQLite, reset database to seed state |
| `npm run build` | Build production bundle |
| `npm run preview` | Preview the production build |

---

## Dispute Resolution Flow

After an item is returned, the lender inspects it and decides on the security deposit:

1. **Pending Deposit Return** — Lender reviews the returned item
2. **Settle** — No damage found. Deposit is refunded to the borrower. Status → `COMPLETED`
3. **File Claim** — Damage found. Lender retains the deposit and submits evidence
4. **Submit Evidence** — Borrower uploads counter-evidence defending their deposit
5. **Admin Judgment** — Admin reviews both sides and enforces a final decision (refund, deduction, or additional charge). Status → `COMPLETED`