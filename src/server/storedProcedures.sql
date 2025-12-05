CREATE OR REPLACE FUNCTION update_listing_status(
    p_rental_id int4
)
RETURNS void AS $$
DECLARE
v_listing_id INT;
    v_request_start_date DATE;
    v_request_end_date DATE;
    v_range_to_remove JSONB;
BEGIN
    -- 1. Derive listing_id and the associated request's start/end dates
SELECT
    r.listing_id,
    req.start_date,
    req.end_date
INTO
    v_listing_id,
    v_request_start_date,
    v_request_end_date
FROM
    rentals rent
        JOIN
    requests req ON rent.request_id = req.id
WHERE
    rent.id = p_rental_id;

-- Construct the JSON object representing the range to remove
v_range_to_remove := jsonb_build_object(
        'from', v_request_start_date::TEXT,
        'to', v_request_end_date::TEXT
    );

    -- 2. Remove the specific date range from the unavailable_ranges array
    -- We need to reconstruct the array by filtering out the matching object.
UPDATE listings_available_dates
SET
    unavailable_ranges = (
        SELECT
            jsonb_agg(elem)
        FROM
            jsonb_array_elements(unavailable_ranges) AS elem
        WHERE
            -- Keep elements where 'from' or 'to' do NOT match v_range_to_remove
            -- This assumes exact match for both 'from' and 'to' to remove.
            NOT (elem->>'from' = v_range_to_remove->>'from' AND elem->>'to' = v_range_to_remove->>'to')
    )
WHERE
    listing_id = v_listing_id;

-- If the unavailable_ranges array becomes empty, you might want to consider
-- setting it to an empty JSONB array '[]' explicitly if it's currently NULL.
-- The jsonb_agg(elem) will return NULL if no elements remain, so a COALESCE might be useful
-- to ensure it's always an array.
UPDATE listings_available_dates
SET unavailable_ranges = COALESCE(unavailable_ranges, '[]'::jsonb)
WHERE listing_id = v_listing_id; -- This ensures it's an empty array if all elements were removed
-- (though jsonb_agg already handles this by returning NULL if empty)

END;
$$ LANGUAGE plpgsql;

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
--Resolve Dispute and Update Listing
CREATE OR REPLACE FUNCTION resolve_dispute_and_update_listing(
    dispute_id int4,
    rental_id int4,
    rental_status text,
    dispute_status text
)
RETURNS disputes AS $$
DECLARE
updated_dispute disputes%ROWTYPE;
BEGIN
    -- Step 1: Update dispute
UPDATE disputes
SET status = dispute_status,
    end_date = NOW()
WHERE id = dispute_id
    RETURNING * INTO updated_dispute;

-- Step 2: Update listing via our reusable function
PERFORM update_listing_status(rental_id);

    -- Step 3: Update rentals via our reusable function
    PERFORM update_rental_status(rental_id, rental_status);

    -- Step 3: Return the updated dispute
RETURN updated_dispute;
END;
$$ LANGUAGE plpgsql;


-- Confirm Rental Acceptance
CREATE OR REPLACE FUNCTION confirm_rental_acceptance(
    request_id int4,
    r_listing_id int4,
    rental_status text,
    request_status text,
    other_request_status text,
    active_request_status text
)
RETURNS SETOF rentals -- Returns the inserted rental record on success
LANGUAGE plpgsql
AS $$
DECLARE
inserted_rental rentals;
    req_exists BOOLEAN;
    list_exists BOOLEAN;
    v_accepted_request_start_date DATE;
    v_accepted_request_end_date DATE;
    v_new_unavailable_range JSONB;
BEGIN
    --0. Check db
SELECT TRUE INTO req_exists
FROM requests
WHERE id = request_id;

IF NOT req_exists THEN
        RAISE EXCEPTION 'Request with ID % does not exist.', request_id;
END IF;

SELECT TRUE INTO list_exists
FROM listings
WHERE id = r_listing_id;

IF NOT list_exists THEN
        RAISE EXCEPTION 'Listing with ID % does not exist.', r_listing_id;
END IF;

    -- Store the accepted request's dates BEFORE updating its status
SELECT start_date, end_date
INTO v_accepted_request_start_date, v_accepted_request_end_date
FROM requests
WHERE id = request_id;

-- Construct the JSON for the new unavailable range
v_new_unavailable_range := jsonb_build_object(
        'from', v_accepted_request_start_date::TEXT,
        'to', v_accepted_request_end_date::TEXT
    );

    -- 1. Start a transaction block (Postgres uses implicit transactions within functions)
INSERT INTO rentals (request_id, status)
VALUES (request_id, rental_status)
    RETURNING * INTO inserted_rental;

-- 2. UPDATE the request status (Changed from DELETE to UPDATE status as per previous code fix)
UPDATE requests
SET status = request_status -- Use a terminal status instead of deleting
WHERE id = request_id;

-- 3. DECLINE only other requests to the same Listing whose dates overlap
UPDATE requests
SET status = other_request_status -- Use a terminal status instead of deleting
WHERE
    listing_id = r_listing_id
  AND id != request_id
        AND status = active_request_status
        AND (
            -- Check for overlap: (start1 <= end2) AND (end1 >= start2)
            (start_date <= v_accepted_request_end_date AND end_date >= v_accepted_request_start_date)
        );

-- 4. Add accepted request dates to listings_available_dates
UPDATE listings_available_dates
SET unavailable_ranges = unavailable_ranges || v_new_unavailable_range
WHERE listing_id = r_listing_id;

-- If all steps succeed, the transaction is implicitly committed.
RETURN NEXT inserted_rental;

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

-- Create or Update Listings
CREATE
OR REPLACE FUNCTION upsert_listing_with_availability(
    p_owner_id INT,
    p_listing_id INT,
    p_listing_data JSONB,
    p_overall_available_range JSONB,
    p_unavailable_ranges JSONB DEFAULT '[]'::jsonb -- Optional, can be empty array
)
RETURNS listings -- Returns the (inserted or updated) listing object
LANGUAGE plpgsql
AS $$
DECLARE
v_listing_id INT;
    v_existing_owner_id
INT;
    v_updated_listing
listings;
BEGIN
    -- Handle INSERT or UPDATE for the 'listings' table
    IF
p_listing_id IS NULL THEN
        -- *** INSERT NEW LISTING ***
        INSERT INTO listings (
            owner_id,
            title,
            description,
            location,
            category,
            condition,
            price,
            replacement_value,
            time_unit,
            status
        )
        VALUES (
            p_owner_id,
            (p_listing_data->>'title')::TEXT,
            (p_listing_data->>'description')::TEXT,
            (p_listing_data->>'location')::TEXT,
            (p_listing_data->>'category')::TEXT,
            (p_listing_data->>'condition')::DECIMAL,
            (p_listing_data->>'price')::DECIMAL,
            (p_listing_data->>'replacement_value')::DECIMAL,
            (p_listing_data->>'time_unit')::TEXT,
            (p_listing_data->>'status')::TEXT
        )
        RETURNING * INTO v_updated_listing;

        v_listing_id
:= v_updated_listing.id;

        -- Insert initial availability for the new listing
INSERT INTO listings_available_dates (listing_id,
                                      unavailable_ranges,
                                      overall_available_range)
VALUES (v_listing_id,
        COALESCE(p_unavailable_ranges, '[]'::jsonb),
        p_overall_available_range);

ELSE
        -- *** UPDATE EXISTING LISTING ***
        -- First, check ownership for security
SELECT owner_id
INTO v_existing_owner_id
FROM listings
WHERE id = p_listing_id;

IF
NOT FOUND THEN
            RAISE EXCEPTION 'Listing with ID % not found.', p_listing_id;
END IF;

        IF
v_existing_owner_id IS DISTINCT FROM p_owner_id THEN
            RAISE EXCEPTION 'Unauthorized: User is not the owner of listing %.', p_listing_id;
END IF;

        -- Update the listings table
UPDATE listings
SET title             = COALESCE((p_listing_data ->>'title')::TEXT, title),
    description       = COALESCE((p_listing_data ->>'description')::TEXT, description),
    location          = COALESCE((p_listing_data ->>'location')::TEXT, location),
    category          = COALESCE((p_listing_data ->>'category')::TEXT, category),
    condition         = COALESCE((p_listing_data ->>'condition')::DECIMAL, condition),
    price             = COALESCE((p_listing_data ->>'price')::DECIMAL, price),
    replacement_value = COALESCE((p_listing_data ->>'replacement_value') ::DECIMAL, replacement_value),
    time_unit         = COALESCE((p_listing_data ->>'time_unit')::TEXT, time_unit),
    status            = COALESCE((p_listing_data ->>'status')::TEXT, status)
WHERE id = p_listing_id RETURNING *
INTO v_updated_listing;

v_listing_id
:= v_updated_listing.id;

        -- Update the associated availability record in the join table
UPDATE listings_available_dates
SET unavailable_ranges      = COALESCE(p_unavailable_ranges, unavailable_ranges),
    overall_available_range = COALESCE(p_overall_available_range, overall_available_range)
WHERE listing_id = v_listing_id;

-- If no availability record existed, create one (e.g., if a listing was old and didn't have one)
IF
NOT FOUND THEN
            INSERT INTO listings_available_dates (listing_id, unavailable_ranges, overall_available_range)
            VALUES (v_listing_id, COALESCE(p_unavailable_ranges, '[]'::jsonb), p_overall_available_range);
END IF;

END IF;

RETURN v_updated_listing;

EXCEPTION
    WHEN OTHERS THEN
        RAISE;
END;
$$;