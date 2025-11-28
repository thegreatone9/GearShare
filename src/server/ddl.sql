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
    id              SERIAL PRIMARY KEY,
    listing_id      INT REFERENCES listings (id) NOT NULL,
    borrower_id     INT REFERENCES accounts (id) NOT NULL,
    lender_id       INT REFERENCES accounts (id) NOT NULL,
    request_date    DATE,
    rent_start_date DATE,
    rent_end_date   DATE,
    status          TEXT,
    deposit         NUMERIC
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