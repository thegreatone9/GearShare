INSERT INTO accounts (id, email, password, name)
VALUES (1, 'tom@gearshare.com', 'password', 'Tom Hanks'),
       (2, 'jane@gearshare.com', 'password', 'Jane Doe');

INSERT INTO listings (id, owner_id, title, description, price, unit, location, rating, replacement_value, image_url,
                      status)
VALUES (1, 2, 'Cordless Drill Set', '', 15, 'day', 'Downtown LA', 4.8, 150,
        'https://placehold.co/300x200/4F46E5/FFFFFF?text=Drill', 'Available'),
       (2, 1, 'DJI Mavic Mini Drone', '', 35, 'day', 'Santa Monica', 4.5, 800,
        'https://placehold.co/300x200/10B981/FFFFFF?text=Drone', 'Available'),
       (3, 2, 'Professional Steam Iron', '', 5, 'day', 'Venice Beach', 4.9, 60,
        'https://placehold.co/300x200/F97316/FFFFFF?text=Iron', 'Available'),
       (4, 1, 'Fender Acoustic Guitar', '', 100, 'day', 'Culver City', 5.0, 450,
        'https://placehold.co/300x200/EC4899/FFFFFF?text=Guitar', 'Available'),
       (5, 2, 'Keyboard', '', 20, 'day', 'Montana City', 5.0, 20,
        'https://placehold.co/300x200/EC4899/FFFFFF?text=Keyboard', 'Available'),
       (6, 1, 'Camera', '', 500, 'day', 'Vermont', 5.0, 450, 'https://placehold.co/300x200/EC4899/FFFFFF?text=Camera',
        'Available'),
       (7, 2, 'Skateboard', '', 50, 'day', 'Jericho', 5.0, 30,
        'https://placehold.co/300x200/EC4899/FFFFFF?text=Skateboard', 'Available');

INSERT INTO requests (id, listing_id, client_id, merchant_id, request_date, rent_start_date, rent_end_date, status,
                      deposit)
VALUES (1, 1, 1, 2, '2025-09-09', '2025-10-09', '2025-12-15', 'completed', 500),
       (2, 2, 2, 1, '2025-09-09', '2025-10-09', '2025-12-15', 'completed', NULL),
       (3, 3, 1, 2, '2025-09-09', '2025-10-09', '2025-10-15', 'completed', 500),
       (4, 4, 2, 1, '2025-09-09', '2025-10-09', '2025-10-15', 'completed', NULL),
       (5, 5, 1, 2, '2025-11-09', NULL, NULL, 'active', NULL);

INSERT INTO rentals (id, request_id, status, return_date, dispute_id)
VALUES (1, 1, 'active', NULL, NULL),
       (2, 2, 'active', NULL, NULL),
       (3, 3, 'completed', '2025-10-17', NULL), -- Links to Dispute ID 1
       (4, 4, 'completed', '2025-10-16', NULL), -- Links to Dispute ID 2
       (5, 4, 'completed', '2025-10-14', NULL);
-- Links to Dispute ID 3

-- Insert 3 disputes, setting the id explicitly and using NULL for the rental_id initially.
INSERT INTO disputes (id, rental_id, start_date, end_date, status)
VALUES (1, 3, '2025-10-15', NULL, 'active'),
       (2, 4, '2025-10-15', NULL, 'pendingDepositReturn'),
       (3, 5, '2025-10-14', '2025-10-15', 'completed');

-- Update the rental_id in the disputes table using the new IDs.
UPDATE rentals
SET dispute_id = 1
WHERE id = 3; -- Dispute 1 linked to Rental 3
UPDATE rentals
SET dispute_id = 2
WHERE id = 4; -- Dispute 2 linked to Rental 4
UPDATE rentals
SET dispute_id = 3
WHERE id = 5; -- Dispute 3 linked to Rental 5