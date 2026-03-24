-- ============================================================
-- GearShare Demo Seed Data (Supabase/PostgreSQL)
-- 4 users · 15 listings · full rental/purchase/dispute flows
-- ============================================================

-- -------------------- ACCOUNTS --------------------
INSERT INTO accounts (id, email, password, name)
VALUES
    (1, 'tom@gearshare.com',   'password', 'Tom Hanks'),
    (2, 'jane@gearshare.com',  'password', 'Jane Doe'),
    (3, 'mike@gearshare.com',  'password', 'Mike Johnson'),
    (4, 'sarah@gearshare.com', 'password', 'Sarah Williams');

-- -------------------- LISTINGS --------------------
INSERT INTO listings (id, owner_id, title, description, price, unit, location, rating,
                      replacement_value, image_url, listing_type, status, category)
VALUES
    (1,  2, 'Cordless Drill Set',        'A high-quality cordless drill with multiple bits and a carrying case.',
         15, 'day', 'Downtown LA',   4.8, 150,
         'https://placehold.co/300x200/4F46E5/FFFFFF?text=Drill',      'RENT', 'ACTIVE', 'Household'),

    (2,  1, 'DJI Mavic Mini Drone',      'Compact drone with 4K camera, perfect for aerial photography.',
         35, 'day', 'Santa Monica',   4.5, 800,
         'https://placehold.co/300x200/10B981/FFFFFF?text=Drone',      'RENT', 'ACTIVE', 'Electronics'),

    (3,  2, 'Professional Steam Iron',   'Industrial-grade steam iron, heats up in 30 seconds.',
         5,  'day', 'Venice Beach',    4.9, 60,
         'https://placehold.co/300x200/F97316/FFFFFF?text=Iron',       'RENT', 'ACTIVE', 'Household'),

    (4,  1, 'Fender Acoustic Guitar',    'Full-size acoustic guitar with carrying bag and spare strings.',
         100, 'day', 'Culver City',   5.0, 450,
         'https://placehold.co/300x200/EC4899/FFFFFF?text=Guitar',     'RENT', 'ACTIVE', 'Music'),

    (5,  2, 'Mechanical Keyboard',       'Cherry MX Blue mechanical keyboard with RGB backlighting.',
         20, 'day', 'Montana City',    5.0, 120,
         'https://placehold.co/300x200/7C3AED/FFFFFF?text=Keyboard',   'RENT', 'ACTIVE', 'Electronics'),

    (6,  1, 'Canon EOS R5 Camera',       'Full-frame mirrorless camera with 45MP sensor and 8K video.',
         75, 'day', 'Beverly Hills',   4.7, 3800,
         'https://placehold.co/300x200/0EA5E9/FFFFFF?text=Camera',     'RENT', 'ACTIVE', 'Electronics'),

    (7,  2, 'Pro Skateboard',            'Professional skateboard with custom deck and Bones Swiss bearings.',
         15, 'day', 'Venice Beach',     4.6, 200,
         'https://placehold.co/300x200/F59E0B/FFFFFF?text=Skateboard', 'RENT', 'ACTIVE', 'Sports'),

    (10, 3, 'Camping Tent (4-Person)',   'Waterproof 4-person tent with vestibule. Easy 10-minute setup.',
         25, 'day', 'Malibu',           4.8, 350,
         'https://placehold.co/300x200/059669/FFFFFF?text=Tent',       'RENT', 'ACTIVE', 'Travel'),

    (11, 4, 'Electronic Stethoscope',    'Littmann 3200 electronic stethoscope with Bluetooth.',
         30, 'day', 'Pasadena',         4.9, 400,
         'https://placehold.co/300x200/6366F1/FFFFFF?text=Stethoscope','RENT', 'ACTIVE', 'Medical'),

    (12, 1, 'Textbook: Intro to Algorithms', 'CLRS 4th Edition. Clean, no highlights.',
         8,  'day', 'Westwood',         5.0, 90,
         'https://placehold.co/300x200/8B5CF6/FFFFFF?text=Textbook',   'RENT', 'ACTIVE', 'Education'),

    -- SELL listings
    (8,  1, 'Weber BBQ Grill',           'Premium gas grill. Comes with cover, utensils, and propane tank.',
         250, NULL, 'Pasadena',        4.7, NULL,
         'https://placehold.co/300x200/DC2626/FFFFFF?text=BBQ+Grill',  'SELL', 'ACTIVE', 'Household'),

    (9,  2, 'Nintendo Switch Bundle',    'Switch + 3 games + Pro Controller. Original box included.',
         320, NULL, 'Hollywood',       4.6, NULL,
         'https://placehold.co/300x200/7C3AED/FFFFFF?text=Switch',     'SELL', 'ACTIVE', 'Electronics'),

    (13, 2, 'KitchenAid Stand Mixer',    'Artisan 5-quart stand mixer in Empire Red. All attachments included.',
         180, NULL, 'Santa Monica',    4.9, NULL,
         'https://placehold.co/300x200/EF4444/FFFFFF?text=Mixer',      'SELL', 'ACTIVE', 'Household'),

    (14, 3, 'Trek Mountain Bike',        '2023 Trek Marlin 7, Size M. Well-maintained.',
         650, NULL, 'Burbank',         4.5, NULL,
         'https://placehold.co/300x200/16A34A/FFFFFF?text=Bike',       'SELL', 'ACTIVE', 'Sports'),

    (15, 4, 'Instant Pot Duo 8-Quart',   'Multi-use pressure cooker, slow cooker, rice cooker.',
         55,  NULL, 'Glendale',        4.8, NULL,
         'https://placehold.co/300x200/EA580C/FFFFFF?text=InstantPot', 'SELL', 'ACTIVE', 'Food');


-- -------------------- AVAILABILITY --------------------
INSERT INTO listings_available_dates (listing_id, unavailable_ranges, overall_available_range)
VALUES
    (1,  '[]', '{"from": "2025-09-01", "to": "2026-12-31"}'),
    (2,  '[]', '{"from": "2025-09-01", "to": "2026-12-31"}'),
    (3,  '[]', '{"from": "2025-09-01", "to": "2026-12-31"}'),
    (4,  '[]', '{"from": "2025-09-01", "to": "2026-12-31"}'),
    (5,  '[]', '{"from": "2025-09-01", "to": "2026-12-31"}'),
    (6,  '[]', '{"from": "2025-09-01", "to": "2026-12-31"}'),
    (7,  '[]', '{"from": "2025-09-01", "to": "2026-12-31"}'),
    (10, '[]', '{"from": "2025-09-01", "to": "2026-12-31"}'),
    (11, '[]', '{"from": "2025-09-01", "to": "2026-12-31"}'),
    (12, '[]', '{"from": "2025-09-01", "to": "2026-12-31"}');


-- -------------------- REQUESTS --------------------
INSERT INTO requests (id, listing_id, client_id, merchant_id, date, start_date, end_date, status, listing_snapshot)
VALUES
    (1,  1, 1, 2, '2025-09-09', '2025-10-09', '2025-12-15', 'completed',
         '{"title":"Cordless Drill Set","daily_rate":15,"replacement_value":150}'),
    (2,  2, 2, 1, '2025-09-09', '2025-10-09', '2025-12-15', 'completed',
         '{"title":"DJI Mavic Mini Drone","daily_rate":35,"replacement_value":800}'),
    (3,  3, 1, 2, '2025-09-09', '2025-10-09', '2025-10-15', 'completed',
         '{"title":"Professional Steam Iron","daily_rate":5,"replacement_value":60}'),
    (4,  4, 2, 1, '2025-09-09', '2025-10-09', '2025-10-15', 'completed',
         '{"title":"Fender Acoustic Guitar","daily_rate":100,"replacement_value":450}'),
    (5,  5, 1, 2, '2025-11-09', NULL, NULL, 'active',
         '{"title":"Mechanical Keyboard","daily_rate":20,"replacement_value":120}'),
    (6,  10, 4, 3, '2025-10-01', '2025-10-05', '2025-10-12', 'completed',
         '{"title":"Camping Tent (4-Person)","daily_rate":25,"replacement_value":350}'),
    (7,  11, 3, 4, '2025-10-15', '2025-10-20', '2025-11-05', 'completed',
         '{"title":"Electronic Stethoscope","daily_rate":30,"replacement_value":400}'),
    (8,  10, 1, 3, '2025-11-01', '2025-11-05', '2025-11-15', 'completed',
         '{"title":"Camping Tent (4-Person)","daily_rate":25,"replacement_value":350}'),
    (9,  6, 4, 1, '2025-11-20', NULL, NULL, 'active',
         '{"title":"Canon EOS R5 Camera","daily_rate":75,"replacement_value":3800}'),
    (10, 12, 3, 1, '2025-10-20', '2025-10-25', '2025-11-10', 'declined',
         '{"title":"Textbook: Intro to Algorithms","daily_rate":8,"replacement_value":90}'),
    (11, 9, 1, 2, '2025-10-20', NULL, NULL, 'completed',
         '{"title":"Nintendo Switch Bundle","price":320}'),
    (12, 15, 3, 4, '2025-11-01', NULL, NULL, 'completed',
         '{"title":"Instant Pot Duo 8-Quart","price":55}');


-- -------------------- RENTALS --------------------
INSERT INTO rentals (id, request_id, status, return_date, dispute_id)
VALUES
    (1, 1, 'active',    NULL,          NULL),
    (2, 2, 'active',    NULL,          NULL),
    (3, 3, 'completed', '2025-10-17',  NULL),
    (4, 4, 'completed', '2025-10-16',  NULL),
    (5, 4, 'completed', '2025-10-14',  NULL),
    (6, 6, 'completed', '2025-10-13',  NULL),
    (7, 7, 'completed', '2025-11-06',  NULL),
    (8, 8, 'active',    NULL,          NULL);


-- -------------------- DISPUTES --------------------
INSERT INTO disputes (id, rental_id, start_date, end_date, status)
VALUES
    (1, 3, '2025-10-17', NULL,          'active'),
    (2, 4, '2025-10-16', NULL,          'pendingDepositReturn'),
    (3, 5, '2025-10-14', '2025-10-20', 'completed');

UPDATE rentals SET dispute_id = 1 WHERE id = 3;
UPDATE rentals SET dispute_id = 2 WHERE id = 4;
UPDATE rentals SET dispute_id = 3 WHERE id = 5;


-- -------------------- PAYMENT INTENTS --------------------
INSERT INTO payment_intents (id, created_at, request_id, rental_id, payer_id, payee_id, amount, status, description)
VALUES
    (1,  '2025-10-09', 1, 1, 1, 16, 1155, 'CAPTURED',            'Security deposit + rental fee for Cordless Drill Set'),
    (2,  '2025-10-09', 2, 2, 2, 16, 3145, 'CAPTURED',            'Security deposit + rental fee for DJI Mavic Mini Drone'),
    (3,  '2025-10-09', 3, 3, 1, 16, 90,   'SETTLED',             'Security deposit + rental fee for Professional Steam Iron'),
    (4,  '2025-10-09', 4, 4, 2, 16, 1050, 'SETTLED',             'Security deposit + rental fee for Fender Acoustic Guitar'),
    (5,  '2025-10-12', 4, 5, 2, 16, 950,  'PARTIALLY_REFUNDED',  'Security deposit + rental fee for Fender Acoustic Guitar'),
    (6,  '2025-10-05', 6, 6, 4, 16, 525,  'SETTLED',             'Security deposit + rental fee for Camping Tent'),
    (7,  '2025-10-20', 7, 7, 3, 16, 880,  'SETTLED',             'Security deposit + rental fee for Electronic Stethoscope'),
    (8,  '2025-11-05', 8, 8, 1, 16, 600,  'CAPTURED',            'Security deposit + rental fee for Camping Tent'),
    (9,  '2025-10-20', 11, NULL, 1, 2, 320, 'CAPTURED',           'Purchase of Nintendo Switch Bundle'),
    (10, '2025-11-01', 12, NULL, 3, 4, 55,  'CAPTURED',           'Purchase of Instant Pot Duo 8-Quart');


-- -------------------- TRANSACTIONS --------------------
INSERT INTO transactions (id, created_at, payment_intent_id, payer_id, payee_id, amount, type, description)
VALUES
    (1,  '2025-10-17', 3,  16, 1,  60,  'AUTHORIZED', 'Deposit refund for Professional Steam Iron rental'),
    (2,  '2025-10-17', 3,  16, 2,  30,  'CAPTURED',   'Rental fee payment for Professional Steam Iron'),
    (3,  '2025-10-20', 5,  16, 1,  120, 'RELEASED',   'Damage fee for Fender Acoustic Guitar'),
    (4,  '2025-10-20', 5,  16, 2,  330, 'AUTHORIZED', 'Partial deposit refund for Fender Acoustic Guitar'),
    (5,  '2025-10-13', 6,  16, 4,  350, 'AUTHORIZED', 'Deposit refund for Camping Tent rental'),
    (6,  '2025-10-13', 6,  16, 3,  175, 'CAPTURED',   'Rental fee payment for Camping Tent'),
    (7,  '2025-11-06', 7,  16, 3,  400, 'AUTHORIZED', 'Deposit refund for Electronic Stethoscope rental'),
    (8,  '2025-11-06', 7,  16, 4,  480, 'CAPTURED',   'Rental fee payment for Electronic Stethoscope'),
    (9,  '2025-10-20', 9,  1,  2,  320, 'SALE',       'Purchase of Nintendo Switch Bundle'),
    (10, '2025-11-01', 10, 3,  4,  55,  'SALE',       'Purchase of Instant Pot Duo 8-Quart');


-- -------------------- ACTIVITY LOG --------------------
INSERT INTO activity_log (user_id, type, message)
VALUES
    (1, 'REQUEST_ITEM',               'You requested to rent Cordless Drill Set'),
    (1, 'REQUEST_ITEM',               'You requested to rent Professional Steam Iron'),
    (1, 'RETURN_ITEM_CREATE_DISPUTE',  'You returned Professional Steam Iron. Dispute opened.'),
    (1, 'PURCHASE_ITEM',              'You purchased Nintendo Switch Bundle for $320'),
    (1, 'REQUEST_ITEM',               'You requested to rent Mechanical Keyboard'),
    (1, 'REQUEST_ITEM',               'You requested to rent Camping Tent (4-Person)'),
    (2, 'CONFIRM_RENTAL',             'You confirmed rental of Cordless Drill Set to Tom Hanks'),
    (2, 'CONFIRM_RENTAL',             'You confirmed rental of Professional Steam Iron to Tom Hanks'),
    (2, 'REQUEST_ITEM',               'You requested to rent DJI Mavic Mini Drone'),
    (2, 'REQUEST_ITEM',               'You requested to rent Fender Acoustic Guitar'),
    (2, 'SETTLE_DISPUTE',             'You settled deposit for Professional Steam Iron rental'),
    (2, 'RETURN_ITEM_CREATE_DISPUTE',  'You returned Fender Acoustic Guitar. Dispute opened.'),
    (3, 'CONFIRM_RENTAL',             'You confirmed rental of Camping Tent to Sarah Williams'),
    (3, 'REQUEST_ITEM',               'You requested to rent Electronic Stethoscope'),
    (3, 'RETURN_ITEM_CREATE_DISPUTE',  'You returned Electronic Stethoscope. No issues found.'),
    (3, 'PURCHASE_ITEM',              'You purchased Instant Pot Duo 8-Quart for $55'),
    (3, 'CONFIRM_RENTAL',             'You confirmed rental of Camping Tent to Tom Hanks'),
    (4, 'REQUEST_ITEM',               'You requested to rent Camping Tent (4-Person)'),
    (4, 'RETURN_ITEM_CREATE_DISPUTE',  'You returned Camping Tent. No issues found.'),
    (4, 'CONFIRM_RENTAL',             'You confirmed rental of Electronic Stethoscope to Mike Johnson'),
    (4, 'REQUEST_ITEM',               'You requested to rent Canon EOS R5 Camera'),
    (1, 'DECLINE_REQUEST',            'You declined Mike Johnson''s request for Textbook: Intro to Algorithms');

-- Mark sold listings
UPDATE listings SET status = 'SOLD' WHERE id IN (9, 15);