-- ==========================================================
-- SKYBOOK: FLIGHT RESERVATION SYSTEM
-- RDBMS Lab - Database Schema Script (MySQL 8.0)
-- Fully Normalized (1NF, 2NF, 3NF) with Constraints, Indexes, & Views
-- ==========================================================

CREATE DATABASE IF NOT EXISTS skybook_db
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE skybook_db;

-- Drop dependent tables in reverse order if they exist
DROP VIEW IF EXISTS vw_revenue_summary;
DROP VIEW IF EXISTS vw_booking_details;
DROP VIEW IF EXISTS vw_active_flights;

DROP TABLE IF EXISTS cancellations;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS passengers;
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS flights;
DROP TABLE IF EXISTS airports;
DROP TABLE IF EXISTS users;

-- ----------------------------------------------------------
-- 1. USERS TABLE
-- Stores credentials and user profiles for Passenger and Admin roles
-- ----------------------------------------------------------
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    phone VARCHAR(25) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('passenger', 'admin') NOT NULL DEFAULT 'passenger',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_users_email (email),
    INDEX idx_users_role (role)
) ENGINE=InnoDB;

-- ----------------------------------------------------------
-- 2. AIRPORTS TABLE
-- Stores standard IATA airport codes, names, cities, and countries
-- ----------------------------------------------------------
CREATE TABLE airports (
    airport_id INT AUTO_INCREMENT PRIMARY KEY,
    airport_code VARCHAR(10) NOT NULL UNIQUE,
    airport_name VARCHAR(150) NOT NULL,
    city VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL DEFAULT 'India',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_airports_code (airport_code),
    INDEX idx_airports_city (city)
) ENGINE=InnoDB;

-- ----------------------------------------------------------
-- 3. FLIGHTS TABLE
-- Stores scheduled flight itineraries, seating capacity, and real-time inventory
-- ----------------------------------------------------------
CREATE TABLE flights (
    flight_id INT AUTO_INCREMENT PRIMARY KEY,
    flight_number VARCHAR(20) NOT NULL,
    airline_name VARCHAR(100) NOT NULL,
    origin_airport_id INT NOT NULL,
    destination_airport_id INT NOT NULL,
    departure_time DATETIME NOT NULL,
    arrival_time DATETIME NOT NULL,
    base_fare DECIMAL(10, 2) NOT NULL,
    total_seats INT NOT NULL,
    available_seats INT NOT NULL,
    status ENUM('scheduled', 'delayed', 'departed', 'arrived', 'cancelled', 'inactive') NOT NULL DEFAULT 'scheduled',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT chk_positive_fare CHECK (base_fare > 0),
    CONSTRAINT chk_positive_seats CHECK (total_seats > 0),
    CONSTRAINT chk_available_seats_bound CHECK (available_seats >= 0 AND available_seats <= total_seats),
    CONSTRAINT chk_arrival_after_departure CHECK (arrival_time > departure_time),
    
    -- Foreign Keys
    CONSTRAINT fk_flights_origin FOREIGN KEY (origin_airport_id) 
        REFERENCES airports(airport_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_flights_dest FOREIGN KEY (destination_airport_id) 
        REFERENCES airports(airport_id) ON DELETE RESTRICT ON UPDATE CASCADE,
        
    -- Indexes for high-speed flight search
    INDEX idx_flights_search (origin_airport_id, destination_airport_id, departure_time, status),
    INDEX idx_flights_number (flight_number),
    INDEX idx_flights_status (status)
) ENGINE=InnoDB;

-- ----------------------------------------------------------
-- 4. BOOKINGS TABLE
-- Stores passenger reservations, PNR, flight reference, and overall booking state
-- ----------------------------------------------------------
CREATE TABLE bookings (
    booking_id INT AUTO_INCREMENT PRIMARY KEY,
    pnr VARCHAR(10) NOT NULL UNIQUE,
    user_id INT NOT NULL,
    flight_id INT NOT NULL,
    booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    passenger_count INT NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    booking_status ENUM('pending', 'confirmed', 'cancelled') NOT NULL DEFAULT 'pending',
    trip_type ENUM('one-way', 'round-trip') NOT NULL DEFAULT 'one-way',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT chk_passenger_count CHECK (passenger_count > 0 AND passenger_count <= 9),
    CONSTRAINT chk_total_amount CHECK (total_amount >= 0),
    
    -- Foreign Keys
    CONSTRAINT fk_bookings_user FOREIGN KEY (user_id) 
        REFERENCES users(user_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_bookings_flight FOREIGN KEY (flight_id) 
        REFERENCES flights(flight_id) ON DELETE RESTRICT ON UPDATE CASCADE,
        
    -- Indexes
    INDEX idx_bookings_user (user_id, booking_status),
    INDEX idx_bookings_pnr (pnr),
    INDEX idx_bookings_status (booking_status),
    INDEX idx_bookings_date (booking_date)
) ENGINE=InnoDB;

-- ----------------------------------------------------------
-- 5. PASSENGERS TABLE
-- Stores individual passenger details tied to a booking (Supports multiple travellers)
-- ----------------------------------------------------------
CREATE TABLE passengers (
    passenger_id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    date_of_birth DATE NULL,
    passenger_type ENUM('adult', 'child') NOT NULL DEFAULT 'adult',
    seat_number VARCHAR(10) NULL,
    gender ENUM('male', 'female', 'other') NULL,
    
    -- Foreign Key (Cascade delete when booking is wiped)
    CONSTRAINT fk_passengers_booking FOREIGN KEY (booking_id) 
        REFERENCES bookings(booking_id) ON DELETE CASCADE ON UPDATE CASCADE,
        
    INDEX idx_passengers_booking (booking_id)
) ENGINE=InnoDB;

-- ----------------------------------------------------------
-- 6. PAYMENTS TABLE
-- Stores simulated payment transactions, gateway mock references, and statuses
-- ----------------------------------------------------------
CREATE TABLE payments (
    payment_id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    payment_method ENUM('card', 'upi', 'netbanking') NOT NULL,
    payment_status ENUM('success', 'failed', 'refunded') NOT NULL,
    transaction_reference VARCHAR(100) NOT NULL UNIQUE,
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_payment_amount CHECK (amount >= 0),
    
    CONSTRAINT fk_payments_booking FOREIGN KEY (booking_id) 
        REFERENCES bookings(booking_id) ON DELETE CASCADE ON UPDATE CASCADE,
        
    INDEX idx_payments_booking (booking_id),
    INDEX idx_payments_reference (transaction_reference),
    INDEX idx_payments_status (payment_status)
) ENGINE=InnoDB;

-- ----------------------------------------------------------
-- 7. CANCELLATIONS TABLE
-- Tracks cancellation records, refund status, and audit timestamps
-- ----------------------------------------------------------
CREATE TABLE cancellations (
    cancellation_id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL UNIQUE,
    cancellation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    cancellation_reason VARCHAR(255) NOT NULL,
    refund_status ENUM('pending', 'processed', 'ineligible') NOT NULL DEFAULT 'processed',
    refund_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    
    CONSTRAINT chk_refund_amount CHECK (refund_amount >= 0),
    
    CONSTRAINT fk_cancellations_booking FOREIGN KEY (booking_id) 
        REFERENCES bookings(booking_id) ON DELETE CASCADE ON UPDATE CASCADE,
        
    INDEX idx_cancellations_booking (booking_id)
) ENGINE=InnoDB;

-- ==========================================================
-- RELATIONAL VIEWS (RDBMS Lab Concept)
-- ==========================================================

-- View 1: Active Flights with Full Airport & Duration Details
CREATE VIEW vw_active_flights AS
SELECT 
    f.flight_id,
    f.flight_number,
    f.airline_name,
    f.origin_airport_id,
    o.airport_code AS origin_code,
    o.airport_name AS origin_name,
    o.city AS origin_city,
    f.destination_airport_id,
    d.airport_code AS destination_code,
    d.airport_name AS destination_name,
    d.city AS destination_city,
    f.departure_time,
    f.arrival_time,
    TIMESTAMPDIFF(MINUTE, f.departure_time, f.arrival_time) AS duration_minutes,
    f.base_fare,
    f.total_seats,
    f.available_seats,
    f.status
FROM flights f
JOIN airports o ON f.origin_airport_id = o.airport_id
JOIN airports d ON f.destination_airport_id = d.airport_id;

-- View 2: Complete Booking Overview with User, Flight, and Payment Info
CREATE VIEW vw_booking_details AS
SELECT 
    b.booking_id,
    b.pnr,
    b.user_id,
    u.full_name AS user_name,
    u.email AS user_email,
    u.phone AS user_phone,
    b.flight_id,
    f.flight_number,
    f.airline_name,
    o.airport_code AS origin_code,
    o.city AS origin_city,
    d.airport_code AS destination_code,
    d.city AS destination_city,
    f.departure_time,
    f.arrival_time,
    b.booking_date,
    b.passenger_count,
    b.total_amount,
    b.booking_status,
    p.payment_method,
    p.payment_status,
    p.transaction_reference,
    c.cancellation_date,
    c.refund_amount
FROM bookings b
JOIN users u ON b.user_id = u.user_id
JOIN flights f ON b.flight_id = f.flight_id
JOIN airports o ON f.origin_airport_id = o.airport_id
JOIN airports d ON f.destination_airport_id = d.airport_id
LEFT JOIN payments p ON b.booking_id = p.booking_id
LEFT JOIN cancellations c ON b.booking_id = c.booking_id;

-- View 3: Airline Performance and Revenue Summary
CREATE VIEW vw_revenue_summary AS
SELECT 
    f.airline_name,
    COUNT(DISTINCT f.flight_id) AS total_flights,
    COUNT(DISTINCT b.booking_id) AS total_bookings,
    SUM(CASE WHEN b.booking_status = 'confirmed' THEN b.total_amount ELSE 0 END) AS confirmed_revenue,
    SUM(CASE WHEN b.booking_status = 'cancelled' THEN b.total_amount ELSE 0 END) AS cancelled_revenue
FROM flights f
LEFT JOIN bookings b ON f.flight_id = b.flight_id
GROUP BY f.airline_name;
