-- ==========================================================
-- SKYBOOK: FLIGHT RESERVATION SYSTEM
-- RDBMS Lab - Sample SQL Queries (Syllabus Demonstration)
-- ==========================================================

USE skybook_db;

-- ----------------------------------------------------------
-- 1. DISPLAY ALL ACTIVE AIRPORTS
-- ----------------------------------------------------------
SELECT 
    airport_id,
    airport_code,
    airport_name,
    city,
    country
FROM airports
WHERE is_active = TRUE
ORDER BY city ASC;

-- ----------------------------------------------------------
-- 2. DISPLAY ALL FLIGHTS WITH ORIGIN AND DESTINATION DETAILS
-- ----------------------------------------------------------
SELECT 
    f.flight_id,
    f.flight_number,
    f.airline_name,
    orig.airport_code AS origin,
    orig.city AS origin_city,
    dest.airport_code AS destination,
    dest.city AS destination_city,
    f.departure_time,
    f.arrival_time,
    f.base_fare,
    f.available_seats,
    f.status
FROM flights f
JOIN airports orig ON f.origin_airport_id = orig.airport_id
JOIN airports dest ON f.destination_airport_id = dest.airport_id
ORDER BY f.departure_time ASC;

-- ----------------------------------------------------------
-- 3. SEARCH FLIGHTS BY ORIGIN, DESTINATION, AND DATE
-- ----------------------------------------------------------
SELECT 
    f.flight_id,
    f.flight_number,
    f.airline_name,
    orig.city AS from_city,
    dest.city AS to_city,
    f.departure_time,
    f.arrival_time,
    TIMESTAMPDIFF(MINUTE, f.departure_time, f.arrival_time) AS duration_mins,
    f.base_fare,
    f.available_seats
FROM flights f
JOIN airports orig ON f.origin_airport_id = orig.airport_id
JOIN airports dest ON f.destination_airport_id = dest.airport_id
WHERE orig.airport_code = 'COK'
  AND dest.airport_code = 'BLR'
  AND DATE(f.departure_time) >= CURRENT_DATE
  AND f.status = 'scheduled'
  AND f.available_seats >= 2
ORDER BY f.base_fare ASC;

-- ----------------------------------------------------------
-- 4. FIND FLIGHTS WITH LOW SEAT AVAILABILITY (CRITICAL INVENTORY)
-- ----------------------------------------------------------
SELECT 
    flight_id,
    flight_number,
    airline_name,
    available_seats,
    total_seats,
    ROUND((available_seats / total_seats) * 100, 2) AS seat_availability_pct
FROM flights
WHERE available_seats <= 20
ORDER BY available_seats ASC;

-- ----------------------------------------------------------
-- 5. DISPLAY ALL BOOKINGS FOR A SPECIFIC PASSENGER (User ID = 2)
-- ----------------------------------------------------------
SELECT 
    b.booking_id,
    b.pnr,
    b.booking_date,
    b.passenger_count,
    b.total_amount,
    b.booking_status,
    f.flight_number,
    f.airline_name,
    orig.city AS origin,
    dest.city AS destination,
    f.departure_time
FROM bookings b
JOIN flights f ON b.flight_id = f.flight_id
JOIN airports orig ON f.origin_airport_id = orig.airport_id
JOIN airports dest ON f.destination_airport_id = dest.airport_id
WHERE b.user_id = 2
ORDER BY b.booking_date DESC;

-- ----------------------------------------------------------
-- 6. JOIN BOOKINGS WITH PASSENGERS, PAYMENTS, AND USERS
-- ----------------------------------------------------------
SELECT 
    b.pnr,
    u.full_name AS booked_by,
    u.email,
    p.full_name AS passenger_name,
    p.passenger_type,
    p.seat_number,
    f.flight_number,
    pay.payment_method,
    pay.transaction_reference,
    b.total_amount,
    b.booking_status
FROM bookings b
JOIN users u ON b.user_id = u.user_id
JOIN flights f ON b.flight_id = f.flight_id
JOIN passengers p ON b.booking_id = p.booking_id
LEFT JOIN payments pay ON b.booking_id = pay.booking_id
WHERE b.pnr = 'SKY782A';

-- ----------------------------------------------------------
-- 7. DISPLAY PAYMENT TRANSACTIONS BREAKDOWN BY STATUS & METHOD
-- ----------------------------------------------------------
SELECT 
    payment_method,
    payment_status,
    COUNT(payment_id) AS transaction_count,
    SUM(amount) AS total_processed
FROM payments
GROUP BY payment_method, payment_status;

-- ----------------------------------------------------------
-- 8. COUNT BOOKINGS AND PASSENGERS PER FLIGHT (Aggregation)
-- ----------------------------------------------------------
SELECT 
    f.flight_number,
    f.airline_name,
    COUNT(b.booking_id) AS total_bookings,
    COALESCE(SUM(b.passenger_count), 0) AS total_passengers_booked,
    f.total_seats,
    f.available_seats
FROM flights f
LEFT JOIN bookings b ON f.flight_id = b.flight_id AND b.booking_status = 'confirmed'
GROUP BY f.flight_id, f.flight_number, f.airline_name, f.total_seats, f.available_seats
ORDER BY total_passengers_booked DESC;

-- ----------------------------------------------------------
-- 9. CALCULATE TOTAL REVENUE BY BOOKING STATUS
-- ----------------------------------------------------------
SELECT 
    booking_status,
    COUNT(booking_id) AS booking_count,
    SUM(total_amount) AS gross_amount
FROM bookings
GROUP BY booking_status;

-- ----------------------------------------------------------
-- 10. FIND MOST FREQUENTLY BOOKED ROUTES (Top Popular Routes)
-- ----------------------------------------------------------
SELECT 
    CONCAT(orig.city, ' (', orig.airport_code, ') -> ', dest.city, ' (', dest.airport_code, ')') AS route,
    COUNT(b.booking_id) AS total_route_bookings,
    SUM(b.total_amount) AS route_revenue
FROM bookings b
JOIN flights f ON b.flight_id = f.flight_id
JOIN airports orig ON f.origin_airport_id = orig.airport_id
JOIN airports dest ON f.destination_airport_id = dest.airport_id
WHERE b.booking_status = 'confirmed'
GROUP BY f.origin_airport_id, f.destination_airport_id, route
ORDER BY total_route_bookings DESC;

-- ----------------------------------------------------------
-- 11. UPDATE FLIGHT STATUS (ADMIN OPERATION)
-- ----------------------------------------------------------
UPDATE flights
SET status = 'delayed',
    departure_time = DATE_ADD(departure_time, INTERVAL 45 MINUTE),
    arrival_time = DATE_ADD(arrival_time, INTERVAL 45 MINUTE)
WHERE flight_id = 1;

-- ----------------------------------------------------------
-- 12. DEACTIVATE FLIGHT (ADMIN OPERATION)
-- ----------------------------------------------------------
UPDATE flights
SET status = 'inactive'
WHERE flight_id = 14;

-- ----------------------------------------------------------
-- 13. DEMONSTRATION OF ACID TRANSACTION: SEAT RESERVATION & COMMIT
-- ----------------------------------------------------------
START TRANSACTION;

-- Step A: Lock flight row to check seat availability under concurrency
SELECT flight_id, available_seats, base_fare
FROM flights
WHERE flight_id = 3 AND status = 'scheduled'
FOR UPDATE;

-- Step B: Deduct available seats conditionally
UPDATE flights
SET available_seats = available_seats - 1
WHERE flight_id = 3 AND available_seats >= 1;

-- Step C: Insert booking record
INSERT INTO bookings (pnr, user_id, flight_id, passenger_count, total_amount, booking_status, trip_type)
VALUES ('SKYDEMO1', 2, 3, 1, 2850.00, 'confirmed', 'one-way');

SET @new_booking_id = LAST_INSERT_ID();

-- Step D: Insert passenger record
INSERT INTO passengers (booking_id, full_name, date_of_birth, passenger_type, seat_number, gender)
VALUES (@new_booking_id, 'Arun Kumar', '1995-02-10', 'adult', '09C', 'male');

-- Step E: Insert payment record
INSERT INTO payments (booking_id, amount, payment_method, payment_status, transaction_reference)
VALUES (@new_booking_id, 2850.00, 'upi', 'success', 'TXN-DEMO-99988811');

-- Step F: Commit transaction permanently
COMMIT;

-- ----------------------------------------------------------
-- 14. DEMONSTRATION OF ACID TRANSACTION: ROLLBACK ON SIMULATED PAYMENT FAILURE
-- ----------------------------------------------------------
START TRANSACTION;

-- Step A: Inspect flight
SELECT available_seats FROM flights WHERE flight_id = 3 FOR UPDATE;

-- Step B: Decrement seat
UPDATE flights SET available_seats = available_seats - 1 WHERE flight_id = 3 AND available_seats >= 1;

-- Step C: Attempt payment simulation failure -> Trigger ROLLBACK
-- Any issue during execution rolls back all statements atomically:
ROLLBACK;

-- ----------------------------------------------------------
-- 15. QUERY USING RELATIONAL VIEW (vw_booking_details)
-- ----------------------------------------------------------
SELECT 
    pnr,
    user_name,
    user_email,
    flight_number,
    airline_name,
    origin_city,
    destination_city,
    departure_time,
    total_amount,
    booking_status
FROM vw_booking_details
WHERE booking_status = 'confirmed';

-- ----------------------------------------------------------
-- 16. EXPLAIN QUERY PLAN (Index Utilization Demonstration)
-- ----------------------------------------------------------
EXPLAIN SELECT * FROM flights
WHERE origin_airport_id = 1
  AND destination_airport_id = 2
  AND departure_time >= CURRENT_DATE
  AND status = 'scheduled';
