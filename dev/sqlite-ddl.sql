-- SQLite-compatible DDL translated from src/server/ddl.sql

-- Table for Accounts
CREATE TABLE IF NOT EXISTS accounts
(
    id       INTEGER PRIMARY KEY AUTOINCREMENT,
    email    TEXT UNIQUE NOT NULL,
    password TEXT        NOT NULL,
    name     TEXT,
    phone    TEXT,
    image_url TEXT,
    nid_url   TEXT
);

-- Table for Listings
CREATE TABLE IF NOT EXISTS listings
(
    id                INTEGER PRIMARY KEY AUTOINCREMENT,
    owner_id          INTEGER REFERENCES accounts (id) NOT NULL,
    title             TEXT                              NOT NULL,
    description       TEXT,
    location          TEXT,
    category          TEXT,
    condition         TEXT,
    price             REAL,
    daily_rate        REAL,
    unit              TEXT,
    time_unit         TEXT,
    rating            REAL,
    replacement_value REAL,
    image_url         TEXT,
    status            TEXT
);

-- Table for Requests
CREATE TABLE IF NOT EXISTS requests
(
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    listing_id       INTEGER REFERENCES listings (id) NOT NULL,
    borrower_id      INTEGER REFERENCES accounts (id) NOT NULL,
    lender_id        INTEGER REFERENCES accounts (id) NOT NULL,
    date             TEXT,
    start_date       TEXT,
    end_date         TEXT,
    status           TEXT,
    listing_snapshot TEXT DEFAULT '{}'
);

-- Table for Rentals
CREATE TABLE IF NOT EXISTS rentals
(
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    request_id  INTEGER REFERENCES requests (id) NOT NULL,
    status      TEXT                              NOT NULL,
    return_date TEXT,
    dispute_id  INTEGER UNIQUE
);

-- Table for Disputes
CREATE TABLE IF NOT EXISTS disputes
(
    id                       INTEGER PRIMARY KEY AUTOINCREMENT,
    rental_id                INTEGER REFERENCES rentals (id) NOT NULL,
    start_date               TEXT NOT NULL,
    end_date                 TEXT,
    status                   TEXT NOT NULL,
    lender_claim_details     TEXT,
    borrower_defense_details TEXT
);

-- Listings Available Dates
CREATE TABLE IF NOT EXISTS listings_available_dates
(
    listing_id              INTEGER REFERENCES listings (id) ON DELETE CASCADE NOT NULL UNIQUE,
    unavailable_ranges      TEXT DEFAULT '[]' NOT NULL,
    overall_available_range TEXT DEFAULT '{}' NOT NULL
);

-- View for listings with availability
CREATE VIEW IF NOT EXISTS listings_with_availability AS
SELECT l.*,
       lad.overall_available_range,
       lad.unavailable_ranges
FROM listings l
         LEFT JOIN
     listings_available_dates lad ON l.id = lad.listing_id;

-- Payment intents
CREATE TABLE IF NOT EXISTS payment_intents
(
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    created_at  TEXT DEFAULT (datetime('now')) NOT NULL,
    updated_at  TEXT DEFAULT (datetime('now')),
    request_id  INTEGER REFERENCES requests (id) NOT NULL,
    rental_id   INTEGER REFERENCES rentals (id),
    payer_id    INTEGER REFERENCES accounts (id) NOT NULL,
    payee_id    INTEGER REFERENCES accounts (id) NOT NULL,
    amount      REAL NOT NULL CHECK (amount > 0),
    status      TEXT NOT NULL,
    description TEXT
);

-- Transactions
CREATE TABLE IF NOT EXISTS transactions
(
    id                INTEGER PRIMARY KEY AUTOINCREMENT,
    created_at        TEXT DEFAULT (datetime('now')) NOT NULL,
    payment_intent_id INTEGER REFERENCES payment_intents (id),
    request_id        INTEGER,
    payer_id          INTEGER REFERENCES accounts (id),
    payee_id          INTEGER REFERENCES accounts (id),
    amount            REAL NOT NULL CHECK (amount > 0),
    type              TEXT NOT NULL,
    description       TEXT
);

-- Activity log
CREATE TABLE IF NOT EXISTS activity_log
(
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    created_at TEXT DEFAULT (datetime('now')) NOT NULL,
    user_id    INTEGER REFERENCES accounts (id),
    type       TEXT NOT NULL,
    message    TEXT NOT NULL
);
