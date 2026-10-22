# System Architecture & Technical Design
## SkyBook — Flight Reservation System

---

## 1. High-Level 3-Tier System Architecture

SkyBook is organized into three distinct tiers ensuring separation of concerns:
1. **Presentation Tier (React Frontend)**: Manages client state, handles user events, executes form validation, and renders UI components.
2. **Application Tier (Node.js & Express MVC Backend)**: Enforces business logic, performs server authorization, authorizes JWT sessions, and coordinates ACID transactions.
3. **Data Tier (MySQL 8.0 Relational Database)**: Persists relational records, enforces referential integrity, supports row-level locking, and calculates aggregations via views.

```mermaid
flowchart TD
    subgraph Client ["Tier 1: Presentation Layer (React.js)"]
        UI["React Functional Components & Router"]
        CTX["AuthContext (JWT Session & State)"]
        SVC["Service Modules (flightService, bookingService, api.js)"]
        UI <--> CTX
        UI <--> SVC
    end

    subgraph Server ["Tier 2: Application Layer (Express.js MVC)"]
        RTR["Express REST Routes (/api/*)"]
        MW["Middleware (verifyToken, requireAdmin, errorHandler)"]
        CTRL["Controllers (authController, flightController, bookingController)"]
        MDL["Models & Transactions (Flight, Booking, User, Airport)"]
        
        RTR --> MW --> CTRL --> MDL
    end

    subgraph Database ["Tier 3: Persistence Layer (MySQL 8.0)"]
        POOL["Connection Pool (mysql2/promise)"]
        SCHEMA["Relational Schema (users, airports, flights, bookings, etc.)"]
        VIEWS["Relational Views (vw_active_flights, vw_revenue_summary)"]
        
        POOL --> SCHEMA
        POOL --> VIEWS
    end

    SVC -- "JSON over HTTP/REST" --> RTR
    MDL -- "Parameterized SQL (ACID Transactions)" --> POOL
```

---

## 2. Model-View-Controller (MVC) Pattern Implementation

The backend adopts the Model-View-Controller pattern tailored for REST APIs:
- **Model**: Encapsulates database queries, transaction management (`beginTransaction`, `commit`, `rollback`), row locking (`FOR UPDATE`), and data normalization.
- **Controller**: Orchestrates incoming HTTP requests, validates business rules, calls Model methods, and formats responses via standard helpers (`sendSuccess`, `sendError`).
- **View**: For a headless API, the view layer consists of formatted, standardized JSON payloads with status codes, error arrays, and timestamp metadata.

```mermaid
flowchart LR
    Client["Client Request"] --> Controller["Express Controller"]
    Controller --> Model["Data Model"]
    Model --> DB[("MySQL Database")]
    DB --> Model
    Model --> Controller
    Controller --> View["JSON Response (Standardized)"]
    View --> Client
```

---

## 3. Sequence Diagrams

### 3.1 Sequence Diagram: Flight Search Flow

```mermaid
sequenceDiagram
    autonumber
    actor User as Passenger / Guest
    participant UI as React SearchForm
    participant API as Express /api/flights
    participant DB as MySQL Database

    User->>UI: Select Origin (COK), Destination (BLR), Date, Pax (2)
    UI->>UI: Validate Origin != Destination
    UI->>API: GET /api/flights?origin=COK&destination=BLR&date=...&passengers=2
    API->>API: Validate input query parameters
    API->>DB: SELECT * FROM flights f JOIN airports ... WHERE status='scheduled' AND available_seats >= 2
    DB-->>API: Return matching flight rows
    API-->>UI: Return HTTP 200 { success: true, data: [FlightCard, ...] }
    UI->>User: Render Flight Cards with timings, fares, and available seats
```

---

### 3.2 Sequence Diagram: ACID Seat Reservation & Simulated Payment Flow

```mermaid
sequenceDiagram
    autonumber
    actor User as Passenger
    participant UI as React Payment Page
    participant Auth as Auth Middleware
    participant Ctrl as Booking Controller
    participant Model as Booking Model
    participant DB as MySQL Engine

    User->>UI: Click "Authorize & Confirm Booking"
    UI->>Ctrl: POST /api/bookings { flightId, passengers: [...], paymentMethod: "upi" }
    Ctrl->>Auth: Verify Bearer JWT Token
    Auth-->>Ctrl: User authenticated (user_id = 2)
    Ctrl->>Model: createBookingTransaction({ userId, flightId, passengers, paymentMethod })
    
    Model->>DB: START TRANSACTION
    Model->>DB: SELECT * FROM flights WHERE flight_id = ? FOR UPDATE (Acquire Row Lock)
    DB-->>Model: Return locked flight row
    
    alt Available Seats >= Passenger Count
        Model->>DB: UPDATE flights SET available_seats = available_seats - ? WHERE flight_id = ?
        Model->>DB: INSERT INTO bookings (pnr, user_id, flight_id, total_amount, ...)
        Model->>DB: INSERT INTO passengers (booking_id, full_name, seat_number, ...)
        Model->>DB: INSERT INTO payments (booking_id, amount, payment_status="success", ...)
        Model->>DB: COMMIT TRANSACTION
        DB-->>Model: Transaction Committed Successfully
        Model-->>Ctrl: Return Ticket Details (PNR, seats, totals)
        Ctrl-->>UI: HTTP 201 Created { success: true, data: Ticket }
        UI->>User: Display Confirmed e-Ticket with Boarding Pass
    else Insufficient Seats Available
        Model->>DB: ROLLBACK TRANSACTION
        Model-->>Ctrl: Throw Error ("Insufficient seats available")
        Ctrl-->>UI: HTTP 400 Bad Request { success: false, message: "Insufficient seats" }
        UI->>User: Show Allocation Error and offer alternative flights
    end
```

---

## 4. Sequence Diagram: Booking Cancellation & Inventory Release

```mermaid
sequenceDiagram
    autonumber
    actor User as Passenger
    participant UI as React MyBookings Page
    participant Ctrl as Booking Controller
    participant Model as Booking Model
    participant DB as MySQL Engine

    User->>UI: Click "Confirm Cancellation"
    UI->>Ctrl: POST /api/bookings/:id/cancel { reason: "Schedule change" }
    Ctrl->>Model: cancelBookingTransaction({ bookingId, userId, reason })
    
    Model->>DB: START TRANSACTION
    Model->>DB: SELECT * FROM bookings WHERE booking_id = ? FOR UPDATE
    DB-->>Model: Return locked booking row
    
    Model->>Model: Verify booking_status == 'confirmed' AND user owns booking
    Model->>Model: Calculate 85% refund amount
    
    Model->>DB: UPDATE bookings SET booking_status = 'cancelled' WHERE booking_id = ?
    Model->>DB: UPDATE flights SET available_seats = available_seats + ? WHERE flight_id = ?
    Model->>DB: INSERT INTO cancellations (booking_id, cancellation_reason, refund_amount, ...)
    Model->>DB: UPDATE payments SET payment_status = 'refunded' WHERE booking_id = ?
    Model->>DB: COMMIT TRANSACTION
    DB-->>Model: Transaction Committed Successfully
    
    Model-->>Ctrl: Return Cancellation Summary & Processed Refund
    Ctrl-->>UI: HTTP 200 OK { success: true, refundAmount: 5780 }
    UI->>User: Show Cancellation Success Notice and Refresh Dashboard
```

---

## 5. Data Dictionary

### Table: `users`
| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `user_id` | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier for user |
| `full_name` | VARCHAR(100) | NOT NULL | User's full legal name |
| `email` | VARCHAR(120) | NOT NULL, UNIQUE | User email address for authentication |
| `phone` | VARCHAR(25) | NOT NULL | Contact telephone number |
| `password_hash` | VARCHAR(255) | NOT NULL | Salted bcrypt hash of password |
| `role` | ENUM | NOT NULL, DEFAULT 'passenger' | Access level: `passenger` or `admin` |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Account creation timestamp |

### Table: `airports`
| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `airport_id` | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier for airport |
| `airport_code` | VARCHAR(10) | NOT NULL, UNIQUE | Standard 3-letter IATA station code |
| `airport_name` | VARCHAR(150) | NOT NULL | Official airport facility name |
| `city` | VARCHAR(100) | NOT NULL | City served by the airport |
| `country` | VARCHAR(100) | NOT NULL, DEFAULT 'India' | Country location |
| `is_active` | BOOLEAN | NOT NULL, DEFAULT TRUE | Operational flag for search |

### Table: `flights`
| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `flight_id` | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier for scheduled flight |
| `flight_number` | VARCHAR(20) | NOT NULL | Airline flight designation (e.g., AI-502) |
| `airline_name` | VARCHAR(100) | NOT NULL | Operating airline carrier name |
| `origin_airport_id` | INT | NOT NULL, FK &rarr; `airports` | Origin airport foreign key |
| `destination_airport_id`| INT | NOT NULL, FK &rarr; `airports` | Destination airport foreign key |
| `departure_time` | DATETIME | NOT NULL | Scheduled local departure time |
| `arrival_time` | DATETIME | NOT NULL | Scheduled local arrival time |
| `base_fare` | DECIMAL(10,2)| NOT NULL, CHECK (> 0) | Base ticket fare per passenger |
| `total_seats` | INT | NOT NULL, CHECK (> 0) | Total aircraft cabin seat capacity |
| `available_seats` | INT | NOT NULL, CHECK (>= 0 AND <= total_seats) | Real-time unreserved seat count |
| `status` | ENUM | NOT NULL, DEFAULT 'scheduled' | `scheduled`, `delayed`, `departed`, `arrived`, `cancelled`, `inactive` |

### Table: `bookings`
| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `booking_id` | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier for booking |
| `pnr` | VARCHAR(10) | NOT NULL, UNIQUE | 6-character booking reference code |
| `user_id` | INT | NOT NULL, FK &rarr; `users` | Reserving passenger foreign key |
| `flight_id` | INT | NOT NULL, FK &rarr; `flights` | Reserved flight foreign key |
| `booking_date` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Date and time booking was generated |
| `passenger_count` | INT | NOT NULL, CHECK (> 0 AND <= 9) | Number of travellers on reservation |
| `total_amount` | DECIMAL(10,2)| NOT NULL, CHECK (>= 0) | Gross total amount paid (including taxes) |
| `booking_status` | ENUM | NOT NULL, DEFAULT 'pending' | Current status: `pending`, `confirmed`, `cancelled` |
| `trip_type` | ENUM | DEFAULT 'one-way' | `one-way` or `round-trip` |

### Table: `passengers`
| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `passenger_id` | INT | PRIMARY KEY, AUTO_INCREMENT | Unique passenger seat record |
| `booking_id` | INT | NOT NULL, FK &rarr; `bookings` | Parent booking reference (CASCADE DELETE) |
| `full_name` | VARCHAR(100) | NOT NULL | Passenger traveller name |
| `date_of_birth` | DATE | NULL | Date of birth for age verification |
| `passenger_type` | ENUM | NOT NULL, DEFAULT 'adult' | Category: `adult` or `child` |
| `seat_number` | VARCHAR(10) | NULL | Allocated seat (e.g., 12A, 14F) |
| `gender` | ENUM | NULL | Gender designation |

### Table: `payments`
| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `payment_id` | INT | PRIMARY KEY, AUTO_INCREMENT | Unique payment record ID |
| `booking_id` | INT | NOT NULL, FK &rarr; `bookings` | Associated booking foreign key |
| `amount` | DECIMAL(10,2)| NOT NULL, CHECK (>= 0) | Processed transaction amount |
| `payment_method` | ENUM | NOT NULL | Selected channel: `card`, `upi`, `netbanking` |
| `payment_status` | ENUM | NOT NULL | Transaction outcome: `success`, `failed`, `refunded` |
| `transaction_reference` | VARCHAR(100)| NOT NULL, UNIQUE | Audit transaction tracking string |
| `payment_date` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Payment settlement timestamp |

### Table: `cancellations`
| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `cancellation_id` | INT | PRIMARY KEY, AUTO_INCREMENT | Unique cancellation record |
| `booking_id` | INT | NOT NULL, UNIQUE, FK &rarr; `bookings` | Cancelled booking ID (1-to-1) |
| `cancellation_date` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Cancellation timestamp |
| `cancellation_reason` | VARCHAR(255)| NOT NULL | Reason provided for audit |
| `refund_status` | ENUM | NOT NULL, DEFAULT 'processed'| Refund state: `pending`, `processed`, `ineligible` |
| `refund_amount` | DECIMAL(10,2)| NOT NULL, DEFAULT 0.00 | Calculated refund sum returned to customer |
