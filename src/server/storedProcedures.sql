-- Update Listing Status
CREATE
OR REPLACE FUNCTION update_listing_status(
    rental_id int4,
    listing_status text
)
RETURNS void AS $$
BEGIN
UPDATE listings
SET status = listing_status
WHERE id = (SELECT listing_id
            FROM requests
            WHERE id = (SELECT request_id
                        FROM rentals
                        WHERE id = rental_id));
END;
$$
LANGUAGE plpgsql;

-- Update Rental Status
CREATE
OR REPLACE FUNCTION update_rental_status(
    rental_id int4,
    rental_status text
)
RETURNS void AS $$
BEGIN
UPDATE rentals
SET status = rental_status
WHERE id = rental_id;
END;
$$
LANGUAGE plpgsql;

--Resolve Dispute and Update Listing
CREATE
OR REPLACE FUNCTION resolve_dispute_and_update_listing(
    dispute_id int4,
    rental_id int4,
    rental_status text,
    dispute_status text,
    listing_status text
)
RETURNS disputes AS $$
DECLARE
updated_dispute disputes%ROWTYPE;
BEGIN
    -- Step 1: Update dispute
UPDATE disputes
SET status   = dispute_status,
    end_date = NOW()
WHERE id = dispute_id RETURNING *
INTO updated_dispute;

-- Step 2: Update listing via our reusable function
PERFORM
update_listing_status(rental_id, listing_status);

    -- Step 3: Update rentals via our reusable function
    PERFORM
update_rental_status(rental_id, rental_status);

    -- Step 3: Return the updated dispute
RETURN updated_dispute;
END;
$$;


-- Confirm Rental Acceptance
CREATE
OR REPLACE FUNCTION confirm_rental_acceptance(
    request_id int4,
    listing_id int4,
    rental_status text,
    listing_status text,
    request_status text
)
RETURNS SETOF rentals -- Returns the inserted rental record on success
LANGUAGE plpgsql
AS $$
DECLARE
inserted_rental rentals;
    req_exists
BOOLEAN;
    list_exists
BOOLEAN;
BEGIN
    --0. Check db
SELECT TRUE
INTO req_exists
FROM requests
WHERE id = request_id;

IF
NOT req_exists THEN
        RAISE EXCEPTION 'Request with ID % does not exist.', request_id;
END IF;

SELECT TRUE
INTO list_exists
FROM listings
WHERE id = listing_id;

IF
NOT list_exists THEN
        RAISE EXCEPTION 'Listing with ID % does not exist.', listing_id;
END IF;

    -- 1. Start a transaction block (Postgres uses implicit transactions within functions)
INSERT INTO rentals (request_id, status)
VALUES (request_id, rental_status) RETURNING *
INTO inserted_rental;

-- 2. UPDATE the listing status
UPDATE listings
SET status = listing_status
WHERE id = listing_id;

-- 3. UPDATE the request status (Changed from DELETE to UPDATE status as per previous code fix)
UPDATE requests
SET status = request_status -- Use a terminal status instead of deleting
WHERE id = request_id;

-- If all steps succeed, the transaction is implicitly committed.
RETURN
NEXT inserted_rental;

EXCEPTION
    WHEN OTHERS THEN
        -- If any step throws an error, the transaction will automatically rollback.
        RAISE; -- Re-raise the exception to be caught by the client
END;
$$;

--Lender Delete Listing
CREATE
OR REPLACE FUNCTION delete_listing_and_requests(
    r_listing_id int4,
    status text
)
RETURNS void AS $$
BEGIN
    -- Step 1: Delete ACTIVE requests for this listing
DELETE
FROM requests
WHERE listing_id = r_listing_id
  AND status = status;

-- Step 2: Delete the main listing record
DELETE
FROM listings
WHERE id = r_listing_id;

END;
$$
LANGUAGE plpgsql;

--Can Issue Borrow Request
CREATE
OR REPLACE FUNCTION can_request_borrow(
    r_listing_id int4,
    r_borrower_id int4,
    request_status text
)
RETURNS boolean AS $$
DECLARE
can_request_borrow boolean;
BEGIN
    -- Prevent borrower from requesting their own listing
    IF
EXISTS (
        SELECT 1
        FROM listings
        WHERE id = r_listing_id AND owner_id = r_borrower_id
    ) THEN
        RETURN false;
END IF;

    -- Check if an active request already exists
SELECT EXISTS(SELECT 1
              FROM requests
              WHERE listing_id = r_listing_id
                AND borrower_id = r_borrower_id
                AND status = request_status)
INTO can_request_borrow;

RETURN NOT can_request_borrow;
END;
$$
LANGUAGE plpgsql;

-- Return Dispute
CREATE
OR REPLACE FUNCTION handle_item_return_create_dispute(
    rental_id int4,           -- Input: ID of the rental to update
    dispute_status TEXT,     -- Input: Status for the new dispute record
    rental_status TEXT       -- Input: Status for the updated rental record
)
RETURNS SETOF disputes
LANGUAGE plpgsql
AS $$
DECLARE
v_dispute_id int4; -- Assuming dispute IDs are UUIDs (common for Supabase)
    v_rental_exists
BOOLEAN;
BEGIN
    -- Optional: Verify rental_id exists before proceeding (good practice for safety)
SELECT TRUE
INTO v_rental_exists
FROM rentals
WHERE id = rental_id;

IF
NOT FOUND THEN
        RAISE EXCEPTION 'Rental with ID % does not exist.', rental_id;
END IF;

    -- A. INSERT the new dispute record first
INSERT INTO disputes (rental_id, start_date, status)
VALUES (rental_id, NOW(), dispute_status) RETURNING id
INTO v_dispute_id;
-- Capture the newly generated dispute ID

-- B. Update the rental status with the new dispute_id
UPDATE rentals
SET return_date = NOW(),
    status      = rental_status,
    dispute_id  = v_dispute_id
WHERE id = rental_id;

-- Return the newly created dispute record
RETURN QUERY SELECT * FROM disputes WHERE id = v_dispute_id;

EXCEPTION
    WHEN OTHERS THEN
        -- If any error occurs, the transaction will automatically rollback all changes.
        RAISE; -- Re-raise the exception to be caught by the client.
END;
$$;