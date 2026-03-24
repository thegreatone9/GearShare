-- Table for Accounts
CREATE TABLE accounts
(
    id        SERIAL PRIMARY KEY,
    email     TEXT UNIQUE NOT NULL,
    password  TEXT        NOT NULL,
    name      TEXT,
    phone     TEXT,
    image_url TEXT,
    nid_url   TEXT
);

-- Table for Listings
CREATE TABLE listings
(
    id                SERIAL PRIMARY KEY,
    owner_id          INT REFERENCES accounts (id) NOT NULL,
    title             TEXT                         NOT NULL,
    description       TEXT,
    location          TEXT,
    category          TEXT,
    condition         TEXT,
    price             NUMERIC,
    daily_rate        NUMERIC,
    unit              TEXT,
    time_unit         TEXT,
    rating            NUMERIC,
    replacement_value NUMERIC,
    image_url         TEXT,
    listing_type      TEXT DEFAULT 'RENT',
    status            TEXT
);

-- Table for Requests
CREATE TABLE requests
(
    id               SERIAL PRIMARY KEY,
    listing_id       INT REFERENCES listings (id) NOT NULL,
    client_id        INT REFERENCES accounts (id) NOT NULL,
    merchant_id      INT REFERENCES accounts (id) NOT NULL,
    date             DATE,
    start_date       DATE,
    end_date         DATE,
    status           TEXT,
    listing_snapshot JSONB
);

-- Table for Rentals
CREATE TABLE rentals
(
    id          SERIAL PRIMARY KEY,
    request_id  INT REFERENCES requests (id) NOT NULL,
    status      TEXT                         NOT NULL,
    return_date DATE,
    dispute_id  INT UNIQUE
);

-- Table for Disputes
CREATE TABLE disputes
(
    id                       SERIAL PRIMARY KEY,
    rental_id                INT REFERENCES rentals (id) NOT NULL,
    start_date               DATE                        NOT NULL,
    end_date                 DATE,
    status                   TEXT                        NOT NULL,
    lender_claim_details     TEXT,
    borrower_defense_details TEXT
);

ALTER TABLE rentals
    ADD CONSTRAINT fk_dispute FOREIGN KEY (dispute_id) REFERENCES disputes (id);

CREATE TABLE listings_available_dates
(
    listing_id              INT REFERENCES listings (id) ON DELETE CASCADE NOT NULL UNIQUE,
    unavailable_ranges      JSONB DEFAULT '[]'::jsonb NOT NULL,
    overall_available_range JSONB DEFAULT '{}'::jsonb NOT NULL
);

CREATE
OR REPLACE VIEW public.listings_with_availability AS
SELECT l.*,
       lad.overall_available_range,
       lad.unavailable_ranges
FROM listings l
         LEFT JOIN
     listings_available_dates lad ON l.id = lad.listing_id;

CREATE TABLE payment_intents
(
    id          SERIAL PRIMARY KEY,
    created_at  TIMESTAMP DEFAULT now()      NOT NULL,
    updated_at  TIMESTAMP DEFAULT now(),
    request_id  INT REFERENCES requests (id) NOT NULL,
    rental_id   INT REFERENCES rentals (id),
    payer_id    INT REFERENCES accounts (id) NOT NULL,
    payee_id    INT REFERENCES accounts (id) NOT NULL,
    amount      DECIMAL(10, 2)               NOT NULL CHECK (amount > 0),
    status      TEXT                         NOT NULL,
    description TEXT
);

CREATE TABLE transactions
(
    id                SERIAL PRIMARY KEY,
    created_at        TIMESTAMP DEFAULT now() NOT NULL,
    payment_intent_id INT REFERENCES payment_intents (id),
    request_id        INT,
    payer_id          INT REFERENCES accounts (id),
    payee_id          INT REFERENCES accounts (id),
    amount            DECIMAL(10, 2)          NOT NULL CHECK (amount > 0),
    type              TEXT                    NOT NULL,
    description       TEXT
);

CREATE TABLE activity_log
(
    id         SERIAL PRIMARY KEY,
    created_at TIMESTAMP DEFAULT now() NOT NULL,
    user_id    INT REFERENCES accounts (id),
    type       TEXT                    NOT NULL,
    message    TEXT                    NOT NULL
);