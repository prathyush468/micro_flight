-- ==========================================================
-- SKYBOOK: FLIGHT RESERVATION SYSTEM
-- RDBMS Lab - Database Seed Script (Sample & Demonstration Data)
-- ==========================================================

USE skybook_db;

-- ----------------------------------------------------------
-- 1. SEED AIRPORTS
-- ----------------------------------------------------------
INSERT INTO airports (airport_id, airport_code, airport_name, city, country, is_active) VALUES
(1, 'COK', 'Cochin International Airport', 'Kochi', 'India', TRUE),
(2, 'BLR', 'Kempegowda International Airport', 'Bengaluru', 'India', TRUE),
(3, 'DEL', 'Indira Gandhi International Airport', 'New Delhi', 'India', TRUE),
(4, 'BOM', 'Chhatrapati Shivaji Maharaj International Airport', 'Mumbai', 'India', TRUE),
(5, 'HYD', 'Rajiv Gandhi International Airport', 'Hyderabad', 'India', TRUE),
(6, 'MAA', 'Chennai International Airport', 'Chennai', 'India', TRUE),
(7, 'GOI', 'Dabolim Airport', 'Goa', 'India', TRUE),
(8, 'CCU', 'Netaji Subhash Chandra Bose International Airport', 'Kolkata', 'India', TRUE);

-- ----------------------------------------------------------
-- 2. SEED USERS
-- Passwords:
-- Admin: admin@skybook.com / Admin@123
-- Passengers: john.doe@example.com / User@123
--             priya.sharma@example.com / User@123
--             rahul.nair@example.com / User@123
-- ----------------------------------------------------------
INSERT INTO users (user_id, full_name, email, phone, password_hash, role) VALUES
(1, 'System Administrator', 'admin@skybook.com', '+91 9876543210', '$2a$10$bYAKR0FyLnqw0AgD5B1.UeHW/NkUhzWc6kNmcIzsM79rr2nmlBj1y', 'admin'),
(2, 'John Doe', 'john.doe@example.com', '+91 9845012345', '$2a$10$V2E981SnSaQNFxjhSonHp.5QiTY9U995sxhKrz39MvKQbiQkzayue', 'passenger'),
(3, 'Priya Sharma', 'priya.sharma@example.com', '+91 9740123456', '$2a$10$V2E981SnSaQNFxjhSonHp.5QiTY9U995sxhKrz39MvKQbiQkzayue', 'passenger'),
(4, 'Rahul Nair', 'rahul.nair@example.com', '+91 9447123456', '$2a$10$V2E981SnSaQNFxjhSonHp.5QiTY9U995sxhKrz39MvKQbiQkzayue', 'passenger');

-- ----------------------------------------------------------
-- 3. SEED FLIGHTS
-- Providing realistic routes, departure times spanning upcoming dates, varied fares & capacities
-- ----------------------------------------------------------
INSERT INTO flights (flight_id, flight_number, airline_name, origin_airport_id, destination_airport_id, departure_time, arrival_time, base_fare, total_seats, available_seats, status) VALUES
-- Kochi to Bengaluru
(1, 'AI-502', 'Air India', 1, 2, DATE_ADD(CURRENT_DATE, INTERVAL 1 DAY) + INTERVAL 7 HOUR, DATE_ADD(CURRENT_DATE, INTERVAL 1 DAY) + INTERVAL 8 HOUR + INTERVAL 15 MINUTE, 3450.00, 180, 150, 'scheduled'),
(2, '6E-412', 'IndiGo', 1, 2, DATE_ADD(CURRENT_DATE, INTERVAL 1 DAY) + INTERVAL 14 HOUR, DATE_ADD(CURRENT_DATE, INTERVAL 1 DAY) + INTERVAL 15 HOUR + INTERVAL 20 MINUTE, 2999.00, 180, 42, 'scheduled'),
(3, 'QP-1102', 'Akasa Air', 1, 2, DATE_ADD(CURRENT_DATE, INTERVAL 2 DAY) + INTERVAL 9 HOUR, DATE_ADD(CURRENT_DATE, INTERVAL 2 DAY) + INTERVAL 10 HOUR + INTERVAL 15 MINUTE, 2850.00, 189, 189, 'scheduled'),

-- Bengaluru to Delhi
(4, 'UK-812', 'Vistara', 2, 3, DATE_ADD(CURRENT_DATE, INTERVAL 1 DAY) + INTERVAL 6 HOUR, DATE_ADD(CURRENT_DATE, INTERVAL 1 DAY) + INTERVAL 8 HOUR + INTERVAL 50 MINUTE, 6800.00, 160, 85, 'scheduled'),
(5, '6E-2044', 'IndiGo', 2, 3, DATE_ADD(CURRENT_DATE, INTERVAL 1 DAY) + INTERVAL 17 HOUR, DATE_ADD(CURRENT_DATE, INTERVAL 1 DAY) + INTERVAL 19 HOUR + INTERVAL 55 MINUTE, 5999.00, 180, 12, 'scheduled'),
(6, 'AI-804', 'Air India', 2, 3, DATE_ADD(CURRENT_DATE, INTERVAL 3 DAY) + INTERVAL 10 HOUR, DATE_ADD(CURRENT_DATE, INTERVAL 3 DAY) + INTERVAL 12 HOUR + INTERVAL 45 MINUTE, 6200.00, 180, 175, 'scheduled'),

-- Mumbai to Kochi
(7, '6E-354', 'IndiGo', 4, 1, DATE_ADD(CURRENT_DATE, INTERVAL 1 DAY) + INTERVAL 11 HOUR, DATE_ADD(CURRENT_DATE, INTERVAL 1 DAY) + INTERVAL 13 HOUR + INTERVAL 10 MINUTE, 4500.00, 180, 95, 'scheduled'),
(8, 'SG-198', 'SpiceJet', 4, 1, DATE_ADD(CURRENT_DATE, INTERVAL 2 DAY) + INTERVAL 19 HOUR, DATE_ADD(CURRENT_DATE, INTERVAL 2 DAY) + INTERVAL 21 HOUR + INTERVAL 15 MINUTE, 3999.00, 189, 140, 'scheduled'),

-- Delhi to Mumbai
(9, 'UK-955', 'Vistara', 3, 4, DATE_ADD(CURRENT_DATE, INTERVAL 1 DAY) + INTERVAL 8 HOUR, DATE_ADD(CURRENT_DATE, INTERVAL 1 DAY) + INTERVAL 10 HOUR + INTERVAL 15 MINUTE, 5200.00, 164, 45, 'scheduled'),
(10, 'AI-665', 'Air India', 3, 4, DATE_ADD(CURRENT_DATE, INTERVAL 1 DAY) + INTERVAL 18 HOUR, DATE_ADD(CURRENT_DATE, INTERVAL 1 DAY) + INTERVAL 20 HOUR + INTERVAL 20 MINUTE, 4800.00, 180, 110, 'scheduled'),

-- Bengaluru to Goa
(11, '6E-551', 'IndiGo', 2, 7, DATE_ADD(CURRENT_DATE, INTERVAL 2 DAY) + INTERVAL 12 HOUR, DATE_ADD(CURRENT_DATE, INTERVAL 2 DAY) + INTERVAL 13 HOUR + INTERVAL 15 MINUTE, 3100.00, 180, 60, 'scheduled'),
(12, 'QP-1334', 'Akasa Air', 2, 7, DATE_ADD(CURRENT_DATE, INTERVAL 3 DAY) + INTERVAL 16 HOUR, DATE_ADD(CURRENT_DATE, INTERVAL 3 DAY) + INTERVAL 17 HOUR + INTERVAL 20 MINUTE, 2750.00, 189, 180, 'scheduled'),

-- Hyderabad to Chennai
(13, '6E-728', 'IndiGo', 5, 6, DATE_ADD(CURRENT_DATE, INTERVAL 1 DAY) + INTERVAL 15 HOUR, DATE_ADD(CURRENT_DATE, INTERVAL 1 DAY) + INTERVAL 16 HOUR + INTERVAL 10 MINUTE, 3250.00, 180, 130, 'scheduled'),

-- Kolkata to Delhi
(14, 'AI-701', 'Air India', 8, 3, DATE_ADD(CURRENT_DATE, INTERVAL 2 DAY) + INTERVAL 10 HOUR, DATE_ADD(CURRENT_DATE, INTERVAL 2 DAY) + INTERVAL 12 HOUR + INTERVAL 30 MINUTE, 4900.00, 180, 80, 'scheduled'),

-- Return leg: Bengaluru to Kochi (for round-trip demonstration)
(15, '6E-413', 'IndiGo', 2, 1, DATE_ADD(CURRENT_DATE, INTERVAL 4 DAY) + INTERVAL 16 HOUR, DATE_ADD(CURRENT_DATE, INTERVAL 4 DAY) + INTERVAL 17 HOUR + INTERVAL 20 MINUTE, 3199.00, 180, 160, 'scheduled'),
(16, 'AI-503', 'Air India', 2, 1, DATE_ADD(CURRENT_DATE, INTERVAL 5 DAY) + INTERVAL 9 HOUR, DATE_ADD(CURRENT_DATE, INTERVAL 5 DAY) + INTERVAL 10 HOUR + INTERVAL 15 MINUTE, 3600.00, 180, 170, 'scheduled'),

-- Kochi to Delhi direct flights (including SpiceJet)
(17, 'SG-282', 'SpiceJet', 1, 3, DATE_ADD(CURRENT_DATE, INTERVAL 1 DAY) + INTERVAL 6 HOUR, DATE_ADD(CURRENT_DATE, INTERVAL 1 DAY) + INTERVAL 9 HOUR + INTERVAL 15 MINUTE, 5499.00, 189, 48, 'scheduled'),
(18, '6E-2415', 'IndiGo', 1, 3, DATE_ADD(CURRENT_DATE, INTERVAL 1 DAY) + INTERVAL 10 HOUR, DATE_ADD(CURRENT_DATE, INTERVAL 1 DAY) + INTERVAL 13 HOUR + INTERVAL 15 MINUTE, 5899.00, 180, 85, 'scheduled'),
(19, 'AI-512', 'Air India', 1, 3, DATE_ADD(CURRENT_DATE, INTERVAL 1 DAY) + INTERVAL 16 HOUR, DATE_ADD(CURRENT_DATE, INTERVAL 1 DAY) + INTERVAL 19 HOUR + INTERVAL 25 MINUTE, 6150.00, 180, 112, 'scheduled'),
(20, 'UK-882', 'Vistara', 1, 3, DATE_ADD(CURRENT_DATE, INTERVAL 1 DAY) + INTERVAL 19 HOUR, DATE_ADD(CURRENT_DATE, INTERVAL 1 DAY) + INTERVAL 22 HOUR + INTERVAL 15 MINUTE, 6700.00, 164, 25, 'scheduled'),
(21, 'SG-283', 'SpiceJet', 1, 3, DATE_ADD(CURRENT_DATE, INTERVAL 2 DAY) + INTERVAL 7 HOUR, DATE_ADD(CURRENT_DATE, INTERVAL 2 DAY) + INTERVAL 10 HOUR + INTERVAL 15 MINUTE, 5299.00, 189, 64, 'scheduled'),

-- Delhi to Kochi return flights
(22, 'SG-284', 'SpiceJet', 3, 1, DATE_ADD(CURRENT_DATE, INTERVAL 1 DAY) + INTERVAL 11 HOUR, DATE_ADD(CURRENT_DATE, INTERVAL 1 DAY) + INTERVAL 14 HOUR + INTERVAL 20 MINUTE, 5400.00, 189, 90, 'scheduled'),
(23, '6E-2416', 'IndiGo', 3, 1, DATE_ADD(CURRENT_DATE, INTERVAL 1 DAY) + INTERVAL 17 HOUR, DATE_ADD(CURRENT_DATE, INTERVAL 1 DAY) + INTERVAL 20 HOUR + INTERVAL 15 MINUTE, 5750.00, 180, 40, 'scheduled');

-- ----------------------------------------------------------
-- 4. SEED SAMPLE BOOKINGS
-- ----------------------------------------------------------
INSERT INTO bookings (booking_id, pnr, user_id, flight_id, booking_date, passenger_count, total_amount, booking_status, trip_type) VALUES
(1, 'SKY782A', 2, 1, DATE_SUB(NOW(), INTERVAL 3 DAY), 2, 6900.00, 'confirmed', 'one-way'),
(2, 'SKY914B', 3, 4, DATE_SUB(NOW(), INTERVAL 2 DAY), 1, 6800.00, 'confirmed', 'one-way'),
(3, 'SKY440C', 4, 7, DATE_SUB(NOW(), INTERVAL 5 DAY), 1, 4500.00, 'cancelled', 'one-way');

-- ----------------------------------------------------------
-- 5. SEED PASSENGERS FOR BOOKINGS
-- ----------------------------------------------------------
INSERT INTO passengers (passenger_id, booking_id, full_name, date_of_birth, passenger_type, seat_number, gender) VALUES
(1, 1, 'John Doe', '1992-05-14', 'adult', '12A', 'male'),
(2, 1, 'Jane Doe', '1994-08-22', 'adult', '12B', 'female'),
(3, 2, 'Priya Sharma', '1996-11-03', 'adult', '04F', 'female'),
(4, 3, 'Rahul Nair', '1990-03-19', 'adult', '18C', 'male');

-- ----------------------------------------------------------
-- 6. SEED PAYMENTS
-- ----------------------------------------------------------
INSERT INTO payments (payment_id, booking_id, amount, payment_method, payment_status, transaction_reference, payment_date) VALUES
(1, 1, 6900.00, 'card', 'success', 'TXN-SKY-88912301', DATE_SUB(NOW(), INTERVAL 3 DAY)),
(2, 2, 6800.00, 'upi', 'success', 'TXN-SKY-99120455', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(3, 3, 4500.00, 'netbanking', 'refunded', 'TXN-SKY-77123908', DATE_SUB(NOW(), INTERVAL 5 DAY));

-- ----------------------------------------------------------
-- 7. SEED CANCELLATIONS
-- ----------------------------------------------------------
INSERT INTO cancellations (cancellation_id, booking_id, cancellation_date, cancellation_reason, refund_status, refund_amount) VALUES
(1, 3, DATE_SUB(NOW(), INTERVAL 4 DAY), 'Change in travel itinerary', 'processed', 4050.00);
