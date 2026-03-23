-- Seed data for SQLite dev server
-- Column names normalized to match the DDL

INSERT INTO accounts (id, email, password, name)
VALUES (1, 'tom@gearshare.com', 'password', 'Tom Hanks'),
       (2, 'jane@gearshare.com', 'password', 'Jane Doe');

INSERT INTO listings (id, owner_id, title, description, price, daily_rate, unit, time_unit, location, rating,
                      replacement_value, image_url, status, category, condition)
VALUES (1, 2, 'Cordless Drill Set', 'A high-quality cordless drill with multiple bits and a carrying case.', 15, 15,
        'day', 'day', 'Downtown LA', 4.8, 150,
        'https://placehold.co/300x200/4F46E5/FFFFFF?text=Drill', 'ACTIVE', 'Tools', 'Like New'),
       (2, 1, 'DJI Mavic Mini Drone', 'Compact drone with 4K camera, perfect for aerial photography.', 35, 35, 'day',
        'day', 'Santa Monica', 4.5, 800,
        'https://placehold.co/300x200/10B981/FFFFFF?text=Drone', 'ACTIVE', 'Electronics', 'Good'),
       (3, 2, 'Professional Steam Iron', 'Industrial-grade steam iron, heats up in 30 seconds.', 5, 5, 'day', 'day',
        'Venice Beach', 4.9, 60,
        'https://placehold.co/300x200/F97316/FFFFFF?text=Iron', 'ACTIVE', 'Home & Garden', 'Excellent'),
       (4, 1, 'Fender Acoustic Guitar', 'Full-size acoustic guitar with carrying bag and spare strings.', 100, 100,
        'day', 'day', 'Culver City', 5.0, 450,
        'https://placehold.co/300x200/EC4899/FFFFFF?text=Guitar', 'ACTIVE', 'Music', 'Like New'),
       (5, 2, 'Keyboard', 'Mechanical keyboard with RGB backlighting.', 20, 20, 'day', 'day', 'Montana City', 5.0, 20,
        'https://placehold.co/300x200/EC4899/FFFFFF?text=Keyboard', 'ACTIVE', 'Electronics', 'Good'),
       (6, 1, 'Camera', 'DSLR camera with 50mm lens kit.', 500, 500, 'day', 'day', 'Vermont', 5.0, 450,
        'https://placehold.co/300x200/EC4899/FFFFFF?text=Camera', 'ACTIVE', 'Electronics', 'Excellent'),
       (7, 2, 'Skateboard', 'Professional skateboard with custom deck.', 50, 50, 'day', 'day', 'Jericho', 5.0, 30,
        'https://placehold.co/300x200/EC4899/FFFFFF?text=Skateboard', 'ACTIVE', 'Sports', 'Good');

-- Insert availability dates for listings
INSERT INTO listings_available_dates (listing_id, unavailable_ranges, overall_available_range)
VALUES (1, '[]', '{"from": "2025-09-01", "to": "2026-12-31"}'),
       (2, '[]', '{"from": "2025-09-01", "to": "2026-12-31"}'),
       (3, '[]', '{"from": "2025-09-01", "to": "2026-12-31"}'),
       (4, '[]', '{"from": "2025-09-01", "to": "2026-12-31"}'),
       (5, '[]', '{"from": "2025-09-01", "to": "2026-12-31"}'),
       (6, '[]', '{"from": "2025-09-01", "to": "2026-12-31"}'),
       (7, '[]', '{"from": "2025-09-01", "to": "2026-12-31"}');

-- Requests (fixed column names: request_date→date, rent_start_date→start_date, rent_end_date→end_date, removed deposit)
INSERT INTO requests (id, listing_id, borrower_id, lender_id, date, start_date, end_date, status, listing_snapshot)
VALUES (1, 1, 1, 2, '2025-09-09', '2025-10-09', '2025-12-15', 'completed',
        '{"title":"Cordless Drill Set","daily_rate":15,"replacement_value":150}'),
       (2, 2, 2, 1, '2025-09-09', '2025-10-09', '2025-12-15', 'completed',
        '{"title":"DJI Mavic Mini Drone","daily_rate":35,"replacement_value":800}'),
       (3, 3, 1, 2, '2025-09-09', '2025-10-09', '2025-10-15', 'completed',
        '{"title":"Professional Steam Iron","daily_rate":5,"replacement_value":60}'),
       (4, 4, 2, 1, '2025-09-09', '2025-10-09', '2025-10-15', 'completed',
        '{"title":"Fender Acoustic Guitar","daily_rate":100,"replacement_value":450}'),
       (5, 5, 1, 2, '2025-11-09', NULL, NULL, 'active',
        '{"title":"Keyboard","daily_rate":20,"replacement_value":20}');

INSERT INTO rentals (id, request_id, status, return_date, dispute_id)
VALUES (1, 1, 'active', NULL, NULL),
       (2, 2, 'active', NULL, NULL),
       (3, 3, 'completed', '2025-10-17', NULL),
       (4, 4, 'completed', '2025-10-16', NULL),
       (5, 4, 'completed', '2025-10-14', NULL);

INSERT INTO disputes (id, rental_id, start_date, end_date, status)
VALUES (1, 3, '2025-10-15', NULL, 'active'),
       (2, 4, '2025-10-15', NULL, 'pendingDepositReturn'),
       (3, 5, '2025-10-14', '2025-10-15', 'completed');

UPDATE rentals SET dispute_id = 1 WHERE id = 3;
UPDATE rentals SET dispute_id = 2 WHERE id = 4;
UPDATE rentals SET dispute_id = 3 WHERE id = 5;

-- Activity log seed
INSERT INTO activity_log (user_id, type, message)
VALUES (1, 'REQUEST_CREATED', 'You requested to borrow Cordless Drill Set'),
       (2, 'REQUEST_RECEIVED', 'Tom Hanks requested to borrow your Cordless Drill Set'),
       (1, 'REQUEST_CREATED', 'You requested to borrow Professional Steam Iron'),
       (2, 'RENTAL_CONFIRMED', 'You confirmed rental of Cordless Drill Set to Tom Hanks');
