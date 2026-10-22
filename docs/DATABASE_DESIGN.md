# Relational Database Design & Normalization Report
## SkyBook — Flight Reservation System
**RDBMS Lab Core Specification (MySQL 8.0 / InnoDB Engine)**

---

## 1. Relational Schema & Entity Overview

SkyBook implements a normalized relational database with 7 core tables:
1. `users`: Stores user credentials, contact information, and role assignments (`passenger`, `admin`).
2. `airports`: Stores standard 3-letter IATA station codes, airport names, cities, and countries.
3. `flights`: Stores scheduled flight routes, departure/arrival timestamps, base fares, and real-time unreserved seat inventory.
4. `bookings`: Records customer reservations, unique PNR codes, passenger headcounts, total fare amounts, and overall booking statuses (`pending`, `confirmed`, `cancelled`).
5. `passengers`: Details individual travellers tied to a booking (supports multiple passengers per PNR with allocated seats).
6. `payments`: Tracks simulated financial settlements, transaction references, methods (`card`, `upi`, `netbanking`), and statuses (`success`, `failed`, `refunded`).
7. `cancellations`: Records cancellation audits, timestamps, user-supplied reasons, and computed refund amounts.

---

## 2. Normalization Process (1NF to 3NF)

### 2.1 First Normal Form (1NF)
- **Rule**: Each column must contain atomic (indivisible) values, and there must be no repeating groups.
- **Application**:
  - Rather than storing multiple traveller names in a single comma-separated string inside `bookings`, a dedicated `passengers` table was established. Each record contains atomic values (`full_name`, `date_of_birth`, `seat_number`).
  - Origin and destination airports are stored as separate atomic foreign keys (`origin_airport_id`, `destination_airport_id`).

### 2.2 Second Normal Form (2NF)
- **Rule**: The table must be in 1NF, and all non-key attributes must be fully functionally dependent on the entire primary key (no partial functional dependencies).
- **Application**:
  - All tables utilize a single synthetic surrogate primary key (`user_id`, `airport_id`, `flight_id`, `booking_id`, `passenger_id`, `payment_id`, `cancellation_id`).
  - Because each primary key consists of a single column (no composite primary keys), partial dependency is mathematically impossible, satisfying 2NF.

### 2.3 Third Normal Form (3NF)
- **Rule**: The table must be in 2NF, and no non-key attribute may depend transitively on the primary key through another non-key attribute (no transitive dependencies).
- **Application**:
  - Flight schedule records do not redundantly store airport names, cities, or countries. Instead, they reference `origin_airport_id` and `destination_airport_id`. Airport metadata is retrieved via JOINs, eliminating transitive dependencies like `flight_id -> origin_airport_id -> city`.
  - Payment and cancellation records reference `booking_id`. Customer contact details are not repeated in payments, avoiding `payment_id -> booking_id -> user_id -> email`.

---

## 3. Constraints & Integrity Enforcement

| Constraint Type | Table | Column(s) | Definition / Purpose |
| :--- | :--- | :--- | :--- |
| **PRIMARY KEY** | All tables | `*_id` | Guaranteed unique row identification with clustered index. |
| **UNIQUE** | `users` | `email` | Prohibits duplicate user registrations. |
| **UNIQUE** | `airports` | `airport_code` | Enforces unique 3-letter IATA codes. |
| **UNIQUE** | `bookings` | `pnr` | Guarantees uniqueness of 6-character PNR booking references. |
| **UNIQUE** | `payments` | `transaction_reference`| Prevents duplicate transaction logging. |
| **UNIQUE** | `cancellations`| `booking_id` | Guarantees exactly one cancellation record per booking (1-to-1). |
| **CHECK** | `flights` | `base_fare > 0` | Ensures positive flight fares. |
| **CHECK** | `flights` | `total_seats > 0` | Ensures positive aircraft seating capacity. |
| **CHECK** | `flights` | `available_seats <= total_seats` | Guarantees seat availability never exceeds total cabin capacity. |
| **CHECK** | `flights` | `arrival_time > departure_time` | Validates logical timeline of arrival after departure. |
| **CHECK** | `bookings` | `passenger_count BETWEEN 1 AND 9` | Restricts booking party size to standard limits. |
| **FOREIGN KEY** | `flights` | `origin_airport_id` | `REFERENCES airports(airport_id) ON DELETE RESTRICT ON UPDATE CASCADE` |
| **FOREIGN KEY** | `flights` | `destination_airport_id` | `REFERENCES airports(airport_id) ON DELETE RESTRICT ON UPDATE CASCADE` |
| **FOREIGN KEY** | `bookings` | `user_id` | `REFERENCES users(user_id) ON DELETE RESTRICT ON UPDATE CASCADE` |
| **FOREIGN KEY** | `bookings` | `flight_id` | `REFERENCES flights(flight_id) ON DELETE RESTRICT ON UPDATE CASCADE` |
| **FOREIGN KEY** | `passengers`| `booking_id` | `REFERENCES bookings(booking_id) ON DELETE CASCADE ON UPDATE CASCADE` |
| **FOREIGN KEY** | `payments` | `booking_id` | `REFERENCES bookings(booking_id) ON DELETE CASCADE ON UPDATE CASCADE` |

---

## 4. Indexing Strategy for High-Speed Querying

To guarantee sub-second search performance over high-volume flight listings:
1. `idx_flights_search` on `flights (origin_airport_id, destination_airport_id, departure_time, status)`: Compound index matching standard query filtering patterns.
2. `idx_bookings_user` on `bookings (user_id, booking_status)`: Rapid lookup for customer booking dashboards.
3. `idx_bookings_pnr` on `bookings (pnr)`: Hash-efficient B-Tree index for ticket retrieval by PNR.
4. `idx_airports_code` on `airports (airport_code)`: Fast station resolution.

---

## 5. ACID Transaction Safety & Concurrency Control

### 5.1 Concurrency Challenge: Double Booking
In a multi-user airline system, two users might simultaneously see 1 available seat on flight `AI-502` and both submit bookings. Without row-level locks, both could be issued confirmed tickets, overselling the aircraft.

### 5.2 Resolution via Row-Level Exclusive Locking (`SELECT ... FOR UPDATE`)
SkyBook enforces row-level exclusive locks during checkout:
```sql
START TRANSACTION;

-- Lock flight record exclusively. Any concurrent transaction waits here:
SELECT flight_id, available_seats, status 
FROM flights 
WHERE flight_id = ? 
FOR UPDATE;

-- Verify inventory and decrement conditionally:
UPDATE flights 
SET available_seats = available_seats - ? 
WHERE flight_id = ? AND available_seats >= ?;

-- Insert booking, passengers, and payment atomically:
INSERT INTO bookings (pnr, user_id, flight_id, passenger_count, total_amount, booking_status)
VALUES (?, ?, ?, ?, ?, 'confirmed');

COMMIT;
```
If `available_seats < passenger_count`, the application throws an exception and triggers `ROLLBACK`, guaranteeing zero phantom reservations.

---

## 6. Relational Views

### View 1: `vw_active_flights`
Joins `flights` with origin and destination `airports` to deliver station codes, city names, and calculated flight durations in minutes:
```sql
CREATE VIEW vw_active_flights AS
SELECT 
    f.flight_id, f.flight_number, f.airline_name,
    o.airport_code AS origin_code, o.city AS origin_city,
    d.airport_code AS destination_code, d.city AS destination_city,
    f.departure_time, f.arrival_time,
    TIMESTAMPDIFF(MINUTE, f.departure_time, f.arrival_time) AS duration_minutes,
    f.base_fare, f.available_seats, f.status
FROM flights f
JOIN airports o ON f.origin_airport_id = o.airport_id
JOIN airports d ON f.destination_airport_id = d.airport_id;
```

### View 2: `vw_revenue_summary`
Aggregates total flights, total reservations, confirmed gross revenue, and cancelled sums grouped by airline carrier:
```sql
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
```
