-- ============================================================
-- GearShare Demo Seed Data
-- 4 users · 15 listings · full rental/purchase/dispute flows
-- ============================================================

-- -------------------- ACCOUNTS --------------------
INSERT INTO accounts (id, email, password, name, phone, image_url)
VALUES
    (1, 'tom@gearshare.com',   'password', 'Tom Hanks',      '555-0101', 'https://placehold.co/150/4F46E5/FFFFFF?text=TH'),
    (2, 'jane@gearshare.com',  'password', 'Jane Doe',       '555-0102', 'https://placehold.co/150/EC4899/FFFFFF?text=JD'),
    (3, 'mike@gearshare.com',  'password', 'Mike Johnson',   '555-0103', 'https://placehold.co/150/10B981/FFFFFF?text=MJ'),
    (4, 'sarah@gearshare.com', 'password', 'Sarah Williams', '555-0104', 'https://placehold.co/150/F97316/FFFFFF?text=SW'),
    -- System accounts (required for payment flows)
    (16, 'escrow@gearshare.com', 'system', 'GearShare Escrow', NULL, NULL),
    (17, 'admin@gearshare.com',  'system', 'GearShare Admin',  NULL, NULL);

-- -------------------- LISTINGS --------------------
-- User 1 (Tom) owns listings 2, 4, 6, 8, 12
-- User 2 (Jane) owns listings 1, 3, 5, 7, 9, 13
-- User 3 (Mike) owns listings 10, 14
-- User 4 (Sarah) owns listings 11, 15

INSERT INTO listings (id, owner_id, title, description, price, daily_rate, unit, time_unit, location, rating,
                      replacement_value, image_url, listing_type, status, category, condition)
VALUES
    -- RENT listings
    (1,  2, 'Cordless Drill Set',        'A high-quality cordless drill with multiple bits and a carrying case. Perfect for home improvement projects.',
         15, 15, 'day', 'day', 'Downtown LA',   4.8, 150,
         '{"url_1":"https://placehold.co/300x200/4F46E5/FFFFFF?text=Drill"}',      'RENT', 'ACTIVE', 'Household', '4'),

    (2,  1, 'DJI Mavic Mini Drone',      'Compact drone with 4K camera, perfect for aerial photography. Includes 3 batteries and carrying case.',
         35, 35, 'day', 'day', 'Santa Monica',   4.5, 800,
         '{"url_1":"https://placehold.co/300x200/10B981/FFFFFF?text=Drone"}',      'RENT', 'ACTIVE', 'Electronics', '4'),

    (3,  2, 'Professional Steam Iron',   'Industrial-grade steam iron, heats up in 30 seconds. Great for bulk ironing or tailoring work.',
         5,  5,  'day', 'day', 'Venice Beach',    4.9, 60,
         '{"url_1":"https://placehold.co/300x200/F97316/FFFFFF?text=Iron"}',       'RENT', 'ACTIVE', 'Household', '5'),

    (4,  1, 'Fender Acoustic Guitar',    'Full-size acoustic guitar with carrying bag and spare strings. Beautiful warm tone.',
         100, 100, 'day', 'day', 'Culver City',   5.0, 450,
         '{"url_1":"https://placehold.co/300x200/EC4899/FFFFFF?text=Guitar"}',     'RENT', 'ACTIVE', 'Music', '4'),

    (5,  2, 'Mechanical Keyboard',       'Cherry MX Blue mechanical keyboard with RGB backlighting. Great for gaming or coding.',
         20, 20, 'day', 'day', 'Montana City',    5.0, 120,
         '{"url_1":"https://placehold.co/300x200/7C3AED/FFFFFF?text=Keyboard"}',   'RENT', 'ACTIVE', 'Electronics', '4'),

    (6,  1, 'Canon EOS R5 Camera',       'Full-frame mirrorless camera with 45MP sensor and 8K video. Includes 50mm f/1.8 lens.',
         75, 75, 'day', 'day', 'Beverly Hills',   4.7, 3800,
         '{"url_1":"https://placehold.co/300x200/0EA5E9/FFFFFF?text=Camera"}',     'RENT', 'ACTIVE', 'Electronics', '5'),

    (7,  2, 'Pro Skateboard',            'Professional skateboard with custom deck, Bones Swiss bearings and Thunder trucks.',
         15, 15, 'day', 'day', 'Venice Beach',     4.6, 200,
         '{"url_1":"https://placehold.co/300x200/F59E0B/FFFFFF?text=Skateboard"}', 'RENT', 'ACTIVE', 'Sports', '3'),

    (10, 3, 'Camping Tent (4-Person)',   'Waterproof 4-person tent with vestibule. Easy 10-minute setup. Includes stakes and rainfly.',
         25, 25, 'day', 'day', 'Malibu',           4.8, 350,
         '{"url_1":"https://placehold.co/300x200/059669/FFFFFF?text=Tent"}',       'RENT', 'ACTIVE', 'Travel', '4'),

    (11, 4, 'Electronic Stethoscope',    'Littmann 3200 electronic stethoscope with Bluetooth. Perfect for medical students.',
         30, 30, 'day', 'day', 'Pasadena',         4.9, 400,
         '{"url_1":"https://placehold.co/300x200/6366F1/FFFFFF?text=Stethoscope"}','RENT', 'ACTIVE', 'Medical', '5'),

    (12, 1, 'Textbook: Intro to Algorithms', 'CLRS 4th Edition. Clean, no highlights. Perfect for CS courses.',
         8,  8,  'day', 'day', 'Westwood',         5.0, 90,
         '{"url_1":"https://placehold.co/300x200/8B5CF6/FFFFFF?text=Textbook"}',   'RENT', 'ACTIVE', 'Education', '4'),

    -- SELL listings
    (8,  1, 'Weber BBQ Grill',           'Premium gas grill, barely used. Comes with cover, utensils, and propane tank.',
         250, NULL, NULL, NULL, 'Pasadena',        4.7, NULL,
         '{"url_1":"https://placehold.co/300x200/DC2626/FFFFFF?text=BBQ+Grill"}',  'SELL', 'ACTIVE', 'Household', '4'),

    (9,  2, 'Nintendo Switch Bundle',    'Switch console + 3 games (Zelda, Mario Kart, Smash Bros) + Pro Controller. Original box included.',
         320, NULL, NULL, NULL, 'Hollywood',       4.6, NULL,
         '{"url_1":"https://placehold.co/300x200/7C3AED/FFFFFF?text=Switch"}',     'SELL', 'ACTIVE', 'Electronics', '4'),

    (13, 2, 'KitchenAid Stand Mixer',    'Artisan 5-quart stand mixer in Empire Red. Barely used, all attachments included.',
         180, NULL, NULL, NULL, 'Santa Monica',    4.9, NULL,
         '{"url_1":"https://placehold.co/300x200/EF4444/FFFFFF?text=Mixer"}',      'SELL', 'ACTIVE', 'Household', '5'),

    (14, 3, 'Trek Mountain Bike',        '2023 Trek Marlin 7, Size M. Well-maintained with new tires and brakes.',
         650, NULL, NULL, NULL, 'Burbank',         4.5, NULL,
         '{"url_1":"https://placehold.co/300x200/16A34A/FFFFFF?text=Bike"}',       'SELL', 'ACTIVE', 'Sports', '3'),

    (15, 4, 'Instant Pot Duo 8-Quart',   'Multi-use pressure cooker, slow cooker, rice cooker. Includes accessories.',
         55,  NULL, NULL, NULL, 'Glendale',        4.8, NULL,
         '{"url_1":"https://placehold.co/300x200/EA580C/FFFFFF?text=InstantPot"}', 'SELL', 'ACTIVE', 'Food', '4'),

    -- SERVICE listings
    (18, 3, 'Electronics Repair & Diagnostics',
         'Professional repair service for smartphones, laptops, tablets, and gaming consoles. Same-day screen replacements, battery swaps, and water damage recovery. Free diagnostics for all devices.',
         NULL, NULL, NULL, NULL, 'Downtown LA',    NULL, NULL,
         '{"url_1":"https://placehold.co/300x200/0EA5E9/FFFFFF?text=ElecRepair"}',  'SERVICE', 'ACTIVE', 'Electronics', NULL),

    (19, 4, 'Custom Tailoring & Alterations',
         'Expert tailoring services including hemming, resizing, zipper replacements, and custom fittings. Specializing in formal wear, denim, and leather alterations. Walk-ins welcome, 3-5 day turnaround.',
         NULL, NULL, NULL, NULL, 'Beverly Hills',  NULL, NULL,
         '{"url_1":"https://placehold.co/300x200/EC4899/FFFFFF?text=Tailoring"}',   'SERVICE', 'ACTIVE', 'Household', NULL),

    (20, 1, 'Document Printing & Binding',
         'High-quality printing services: color/B&W, large format posters, thesis binding, business cards, and flyer printing. Bulk discounts available. USB and email submissions accepted.',
         NULL, NULL, NULL, NULL, 'Westwood',       NULL, NULL,
         '{"url_1":"https://placehold.co/300x200/8B5CF6/FFFFFF?text=Printing"}',    'SERVICE', 'ACTIVE', 'Education', NULL),

    (21, 2, 'Bike Tune-Up & Repair',
         'Full bicycle servicing: brake adjustments, gear tuning, chain replacement, wheel truing, and flat tire repair. Quick 1-2 day turnaround. All bike types welcome — road, mountain, BMX.',
         NULL, NULL, NULL, NULL, 'Venice Beach',   NULL, NULL,
         '{"url_1":"https://placehold.co/300x200/16A34A/FFFFFF?text=BikeRepair"}',  'SERVICE', 'ACTIVE', 'Sports', NULL);


-- -------------------- AVAILABILITY (rental listings only) --------------------
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


-- ============================================================
-- REQUESTS — showcasing all statuses: active, completed, declined
-- ============================================================
INSERT INTO requests (id, listing_id, client_id, merchant_id, date, start_date, end_date, status, listing_snapshot)
VALUES
    -- RENTAL requests involving Tom(1) & Jane(2)
    (1, 1, 1, 2, '2025-09-09', '2025-10-09', '2025-12-15', 'completed',
        '{"title":"Cordless Drill Set","daily_rate":15,"replacement_value":150}'),
    (2, 2, 2, 1, '2025-09-09', '2025-10-09', '2025-12-15', 'completed',
        '{"title":"DJI Mavic Mini Drone","daily_rate":35,"replacement_value":800}'),
    (3, 3, 1, 2, '2025-09-09', '2025-10-09', '2025-10-15', 'completed',
        '{"title":"Professional Steam Iron","daily_rate":5,"replacement_value":60}'),
    (4, 4, 2, 1, '2025-09-09', '2025-10-09', '2025-10-15', 'completed',
        '{"title":"Fender Acoustic Guitar","daily_rate":100,"replacement_value":450}'),
    -- Pending request (Tom requests Jane's Keyboard)
    (5, 5, 1, 2, '2025-11-09', NULL, NULL, 'active',
        '{"title":"Mechanical Keyboard","daily_rate":20,"replacement_value":120}'),

    -- Cross-user RENTAL requests involving Mike(3) & Sarah(4)
    (6, 10, 4, 3, '2025-10-01', '2025-10-05', '2025-10-12', 'completed',
        '{"title":"Camping Tent (4-Person)","daily_rate":25,"replacement_value":350}'),
    (7, 11, 3, 4, '2025-10-15', '2025-10-20', '2025-11-05', 'completed',
        '{"title":"Electronic Stethoscope","daily_rate":30,"replacement_value":400}'),

    -- Cross-user requests: Tom rents from Mike
    (8, 10, 1, 3, '2025-11-01', '2025-11-05', '2025-11-15', 'completed',
        '{"title":"Camping Tent (4-Person)","daily_rate":25,"replacement_value":350}'),

    -- Pending request: Sarah requests Tom's camera
    (9, 6, 4, 1, '2025-11-20', NULL, NULL, 'active',
        '{"title":"Canon EOS R5 Camera","daily_rate":75,"replacement_value":3800}'),

    -- Declined request
    (10, 12, 3, 1, '2025-10-20', '2025-10-25', '2025-11-10', 'declined',
        '{"title":"Textbook: Intro to Algorithms","daily_rate":8,"replacement_value":90}'),

    -- PURCHASE requests (completed sales)
    (11, 9, 1, 2, '2025-10-20', NULL, NULL, 'completed',
        '{"title":"Nintendo Switch Bundle","price":320}'),
    (12, 15, 3, 4, '2025-11-01', NULL, NULL, 'completed',
        '{"title":"Instant Pot Duo 8-Quart","price":55}');


-- ============================================================
-- RENTALS — active, returned (disputed), and completed
-- ============================================================
INSERT INTO rentals (id, request_id, status, return_date, dispute_id)
VALUES
    -- Active rentals (currently ongoing)
    (1, 1, 'active',    NULL,          NULL),   -- Tom renting Jane's Drill
    (2, 2, 'active',    NULL,          NULL),   -- Jane renting Tom's Drone

    -- Completed rentals with disputes
    (3, 3, 'completed', '2025-10-17',  NULL),   -- Tom returned Jane's Iron → dispute #1
    (4, 4, 'completed', '2025-10-16',  NULL),   -- Jane returned Tom's Guitar → dispute #2
    (5, 4, 'completed', '2025-10-14',  NULL),   -- Jane returned Tom's Guitar (earlier rental) → dispute #3

    -- Clean completed rentals (no disputes)
    (6, 6, 'completed', '2025-10-13',  NULL),   -- Sarah returned Mike's Tent (clean)
    (7, 7, 'completed', '2025-11-06',  NULL),   -- Mike returned Sarah's Stethoscope (clean)

    -- Active rental: Tom renting Mike's Tent
    (8, 8, 'active',    NULL,          NULL);


-- ============================================================
-- DISPUTES — all statuses represented
-- ============================================================
INSERT INTO disputes (id, rental_id, start_date, end_date, status,
                      lender_claim_details, borrower_defense_details)
VALUES
    -- Dispute #1: active (pending deposit return) — Tom returned Jane's Iron
    (1, 3, '2025-10-17', NULL, 'active', NULL, NULL),

    -- Dispute #2: pendingDepositReturn — Jane returned Tom's Guitar
    (2, 4, '2025-10-16', NULL, 'pendingDepositReturn', NULL, NULL),

    -- Dispute #3: completed (settled, with full claim/defense cycle)
    (3, 5, '2025-10-14', '2025-10-20', 'completed',
        '{"description":"Guitar returned with cracked bridge and missing tuning peg. Repair estimate attached.","estimated_damage":120,"evidence_urls":["https://placehold.co/400x300/DC2626/FFFFFF?text=Damaged+Bridge"]}',
        '{"description":"The bridge crack was pre-existing. I have photos from before the rental showing the same issue.","evidence_urls":["https://placehold.co/400x300/10B981/FFFFFF?text=Pre-existing+Crack"]}');

-- Link disputes back to rentals
UPDATE rentals SET dispute_id = 1 WHERE id = 3;
UPDATE rentals SET dispute_id = 2 WHERE id = 4;
UPDATE rentals SET dispute_id = 3 WHERE id = 5;


-- ============================================================
-- PAYMENT INTENTS — financial records for rentals & purchases
-- ============================================================
INSERT INTO payment_intents (id, created_at, request_id, rental_id, payer_id, payee_id, amount, status, description)
VALUES
    -- Rental #1: Tom → Escrow for Cordless Drill (deposit + rental fee)
    (1, '2025-10-09', 1, 1, 1, 16, 1155, 'CAPTURED',
        'Security deposit ($150) + rental fee ($1005) for Cordless Drill Set rental'),

    -- Rental #2: Jane → Escrow for Drone
    (2, '2025-10-09', 2, 2, 2, 16, 3145, 'CAPTURED',
        'Security deposit ($800) + rental fee ($2345) for DJI Mavic Mini Drone rental'),

    -- Rental #3: Tom → Escrow for Steam Iron (settled — deposit returned)
    (3, '2025-10-09', 3, 3, 1, 16, 90, 'SETTLED',
        'Security deposit ($60) + rental fee ($30) for Professional Steam Iron rental'),

    -- Rental #4: Jane → Escrow for Guitar (settled with dispute)
    (4, '2025-10-09', 4, 4, 2, 16, 1050, 'SETTLED',
        'Security deposit ($450) + rental fee ($600) for Fender Acoustic Guitar rental'),

    -- Rental #5: Jane → Escrow for Guitar (second rental, partially refunded)
    (5, '2025-10-12', 4, 5, 2, 16, 950, 'PARTIALLY_REFUNDED',
        'Security deposit ($450) + rental fee ($500) for Fender Acoustic Guitar rental'),

    -- Rental #6: Sarah → Escrow for Tent (completed clean)
    (6, '2025-10-05', 6, 6, 4, 16, 525, 'SETTLED',
        'Security deposit ($350) + rental fee ($175) for Camping Tent rental'),

    -- Rental #7: Mike → Escrow for Stethoscope (completed clean)
    (7, '2025-10-20', 7, 7, 3, 16, 880, 'SETTLED',
        'Security deposit ($400) + rental fee ($480) for Electronic Stethoscope rental'),

    -- Rental #8: Tom → Escrow for Tent
    (8, '2025-11-05', 8, 8, 1, 16, 600, 'CAPTURED',
        'Security deposit ($350) + rental fee ($250) for Camping Tent rental'),

    -- Purchase: Tom buys Nintendo Switch from Jane
    (9, '2025-10-20', 11, NULL, 1, 2, 320, 'CAPTURED',
        'Purchase of Nintendo Switch Bundle'),

    -- Purchase: Mike buys Instant Pot from Sarah
    (10, '2025-11-01', 12, NULL, 3, 4, 55, 'CAPTURED',
        'Purchase of Instant Pot Duo 8-Quart');


-- ============================================================
-- TRANSACTIONS — completed financial movements
-- ============================================================
INSERT INTO transactions (id, created_at, payment_intent_id, request_id, payer_id, payee_id, amount, type, description)
VALUES
    -- Rental #3 settled: Iron deposit refunded to Tom, rent paid to Jane
    (1, '2025-10-17', 3, NULL, 16, 1,  60,  'AUTHORIZED',
        'Deposit refund for Professional Steam Iron rental'),
    (2, '2025-10-17', 3, NULL, 16, 2,  30,  'CAPTURED',
        'Rental fee payment for Professional Steam Iron'),

    -- Rental #5 (dispute #3 completed): partial damage + refund
    (3, '2025-10-20', 5, NULL, 16, 1,  120, 'RELEASED',
        'Damage fee for Fender Acoustic Guitar — cracked bridge repair'),
    (4, '2025-10-20', 5, NULL, 16, 2,  330, 'AUTHORIZED',
        'Partial deposit refund for Fender Acoustic Guitar (after damage deduction)'),

    -- Rental #6 settled: Tent deposit refunded to Sarah, rent paid to Mike
    (5, '2025-10-13', 6, NULL, 16, 4, 350, 'AUTHORIZED',
        'Deposit refund for Camping Tent rental'),
    (6, '2025-10-13', 6, NULL, 16, 3, 175, 'CAPTURED',
        'Rental fee payment for Camping Tent'),

    -- Rental #7 settled: Stethoscope deposit refunded to Mike, rent paid to Sarah
    (7, '2025-11-06', 7, NULL, 16, 3, 400, 'AUTHORIZED',
        'Deposit refund for Electronic Stethoscope rental'),
    (8, '2025-11-06', 7, NULL, 16, 4, 480, 'CAPTURED',
        'Rental fee payment for Electronic Stethoscope'),

    -- SALE: Tom purchases Nintendo Switch from Jane
    (9,  '2025-10-20', 9,  11, 1, 2, 320, 'SALE',
        'Purchase of Nintendo Switch Bundle'),

    -- SALE: Mike purchases Instant Pot from Sarah
    (10, '2025-11-01', 10, 12, 3, 4, 55,  'SALE',
        'Purchase of Instant Pot Duo 8-Quart');


-- ============================================================
-- ACTIVITY LOG — rich history for all users
-- ============================================================
INSERT INTO activity_log (user_id, type, message, created_at)
VALUES
    -- Tom's activity
    (1, 'REQUEST_ITEM',               'You requested to rent Cordless Drill Set',                    '2025-09-09 10:00:00'),
    (1, 'REQUEST_ITEM',               'You requested to rent Professional Steam Iron',               '2025-09-09 10:30:00'),
    (1, 'RETURN_ITEM_CREATE_DISPUTE',  'You returned Professional Steam Iron. Dispute opened.',       '2025-10-17 14:00:00'),
    (1, 'PURCHASE_ITEM',              'You purchased Nintendo Switch Bundle for $320',               '2025-10-20 11:00:00'),
    (1, 'REQUEST_ITEM',               'You requested to rent Mechanical Keyboard',                   '2025-11-09 09:00:00'),
    (1, 'REQUEST_ITEM',               'You requested to rent Camping Tent (4-Person)',               '2025-11-01 08:00:00'),

    -- Jane's activity
    (2, 'CONFIRM_RENTAL',             'You confirmed rental of Cordless Drill Set to Tom Hanks',     '2025-10-09 08:00:00'),
    (2, 'CONFIRM_RENTAL',             'You confirmed rental of Professional Steam Iron to Tom Hanks','2025-10-09 08:30:00'),
    (2, 'REQUEST_ITEM',               'You requested to rent DJI Mavic Mini Drone',                  '2025-09-09 11:00:00'),
    (2, 'REQUEST_ITEM',               'You requested to rent Fender Acoustic Guitar',                '2025-09-09 11:30:00'),
    (2, 'SETTLE_DISPUTE',             'You settled deposit for Professional Steam Iron rental',      '2025-10-17 15:00:00'),
    (2, 'RETURN_ITEM_CREATE_DISPUTE',  'You returned Fender Acoustic Guitar. Dispute opened.',        '2025-10-16 14:00:00'),

    -- Mike's activity
    (3, 'CONFIRM_RENTAL',             'You confirmed rental of Camping Tent to Sarah Williams',      '2025-10-05 09:00:00'),
    (3, 'REQUEST_ITEM',               'You requested to rent Electronic Stethoscope',                '2025-10-15 10:00:00'),
    (3, 'RETURN_ITEM_CREATE_DISPUTE',  'You returned Electronic Stethoscope. No issues found.',       '2025-11-06 12:00:00'),
    (3, 'PURCHASE_ITEM',              'You purchased Instant Pot Duo 8-Quart for $55',               '2025-11-01 14:00:00'),
    (3, 'CONFIRM_RENTAL',             'You confirmed rental of Camping Tent to Tom Hanks',           '2025-11-05 08:00:00'),

    -- Sarah's activity
    (4, 'REQUEST_ITEM',               'You requested to rent Camping Tent (4-Person)',               '2025-10-01 10:00:00'),
    (4, 'RETURN_ITEM_CREATE_DISPUTE',  'You returned Camping Tent. No issues found.',                 '2025-10-13 16:00:00'),
    (4, 'CONFIRM_RENTAL',             'You confirmed rental of Electronic Stethoscope to Mike Johnson','2025-10-20 09:00:00'),
    (4, 'REQUEST_ITEM',               'You requested to rent Canon EOS R5 Camera',                   '2025-11-20 10:00:00'),

    -- Decline activity
    (1, 'DECLINE_REQUEST',            'You declined Mike Johnson''s request for Textbook: Intro to Algorithms', '2025-10-21 11:00:00');

-- Mark sold listings
UPDATE listings SET status = 'SOLD' WHERE id IN (9, 15);
