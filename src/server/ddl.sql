-- Table for Accounts
CREATE TABLE accounts
(
    id       SERIAL PRIMARY KEY,
    email    TEXT UNIQUE NOT NULL,
    password TEXT        NOT NULL,
    name     TEXT
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
    price             NUMERIC                      NOT NULL,
    unit              TEXT,
    rating            NUMERIC,
    replacement_value NUMERIC,
    image_url         TEXT,
    status            TEXT
);

-- Table for Requests
CREATE TABLE requests
(
    id               SERIAL PRIMARY KEY,
    listing_id       INT REFERENCES listings (id) NOT NULL,
    borrower_id      INT REFERENCES accounts (id) NOT NULL,
    lender_id        INT REFERENCES accounts (id) NOT NULL,
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
    id         SERIAL PRIMARY KEY,
    rental_id  INT REFERENCES rentals (id) NOT NULL,
    start_date DATE                        NOT NULL,
    end_date   DATE,
    status     TEXT                        NOT NULL
);

ALTER TABLE rentals
    ADD CONSTRAINT fk_dispute FOREIGN KEY (dispute_id) REFERENCES disputes (id);

CREATE TABLE listings_available_dates
(
    -- Foreign key to the listings table
    listing_id              INT REFERENCES listings (id) ON DELETE CASCADE NOT NULL UNIQUE,

    -- Column to hold a JSONB array of unavailable date ranges
    -- Example: '[{"from": "2023-11-16", "to": "2023-11-17"}, {"from": "2023-12-01", "to": "2023-12-05"}]'
    unavailable_ranges      JSONB DEFAULT '[]'::jsonb NOT NULL,

    -- Column to hold a JSONB object for the overall available date range
    -- Example: '{"from": "2023-11-01", "to": "2024-01-31"}'
    overall_available_range JSONB DEFAULT '{}'::jsonb NOT NULL
);

create table payment_intents
(
    id          SERIAL PRIMARY KEY,
    created_at  timestamp default now()      not null,
    updated_at  timestamp default now(),
    request_id  int references requests (id) not null,
    rental_id   int references rentals (id),
    payer_id    int references accounts (id) not null,
    payee_id    int references accounts (id) not null,
    amount      decimal(10, 2)               not null check (amount > 0),
    status      text                         not null,
    description text
);

create table transactions
(
    id                SERIAL PRIMARY KEY,
    created_at        timestamp default now() not null,
    payment_intent_id int references payment_intents (id),
    payer_id          int references accounts (id),
    payee_id          int references accounts (id),
    amount            decimal(10, 2)          not null check (amount > 0),
    type              text                    not null,
    description       text
);

create table activity_log
(
    id         SERIAL PRIMARY KEY,
    created_at timestamp default now() not null,
    user_id    int references accounts (id),
    type       text                    not null,
    message    text                    not null
);