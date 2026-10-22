# Entity-Relationship (ER) Diagram
## SkyBook — Flight Reservation System

---

## 1. Complete Entity-Relationship Diagram

```mermaid
erDiagram
    USERS ||--o{ BOOKINGS : "places (1:N)"
    AIRPORTS ||--o{ FLIGHTS : "originates (1:N)"
    AIRPORTS ||--o{ FLIGHTS : "terminates (1:N)"
    FLIGHTS ||--o{ BOOKINGS : "contains (1:N)"
    BOOKINGS ||--|{ PASSENGERS : "includes (1:N)"
    BOOKINGS ||--|| PAYMENTS : "settles (1:1)"
    BOOKINGS ||--o| CANCELLATIONS : "cancels (1:0..1)"

    USERS {
        int user_id PK
        string full_name
        string email UK
        string phone
        string password_hash
        enum role "passenger, admin"
        timestamp created_at
    }

    AIRPORTS {
        int airport_id PK
        string airport_code UK
        string airport_name
        string city
        string country
        boolean is_active
    }

    FLIGHTS {
        int flight_id PK
        string flight_number
        string airline_name
        int origin_airport_id FK
        int destination_airport_id FK
        datetime departure_time
        datetime arrival_time
        decimal base_fare
        int total_seats
        int available_seats
        enum status "scheduled, delayed, departed, arrived, cancelled, inactive"
    }

    BOOKINGS {
        int booking_id PK
        string pnr UK
        int user_id FK
        int flight_id FK
        timestamp booking_date
        int passenger_count
        decimal total_amount
        enum booking_status "pending, confirmed, cancelled"
        enum trip_type "one-way, round-trip"
    }

    PASSENGERS {
        int passenger_id PK
        int booking_id FK
        string full_name
        date date_of_birth
        enum passenger_type "adult, child"
        string seat_number
        enum gender "male, female, other"
    }

    PAYMENTS {
        int payment_id PK
        int booking_id FK
        decimal amount
        enum payment_method "card, upi, netbanking"
        enum payment_status "success, failed, refunded"
        string transaction_reference UK
        timestamp payment_date
    }

    CANCELLATIONS {
        int cancellation_id PK
        int booking_id FK, UK
        timestamp cancellation_date
        string cancellation_reason
        enum refund_status "pending, processed, ineligible"
        decimal refund_amount
    }
```

---

## 2. Cardinality & Relationship Breakdown

1. **`USERS` to `BOOKINGS` (1 : N)**
   - One user can make zero, one, or multiple flight bookings over time.
   - Each booking record is owned by exactly one registered user.
   - Foreign key: `bookings.user_id -> users.user_id`.

2. **`AIRPORTS` to `FLIGHTS` (1 : N for Origin, 1 : N for Destination)**
   - One airport serves as the origin hub for zero, one, or multiple flights.
   - One airport serves as the destination terminal for zero, one, or multiple flights.
   - Foreign keys: `flights.origin_airport_id -> airports.airport_id`, `flights.destination_airport_id -> airports.airport_id`.

3. **`FLIGHTS` to `BOOKINGS` (1 : N)**
   - A single scheduled flight can receive multiple customer bookings up to its total seat capacity.
   - Each booking is assigned to one primary flight itinerary.
   - Foreign key: `bookings.flight_id -> flights.flight_id`.

4. **`BOOKINGS` to `PASSENGERS` (1 : N)**
   - A single booking with headcount $N$ contains between 1 and 9 passenger traveller records.
   - Cascading delete: Removing a booking wipes its associated passenger records.
   - Foreign key: `passengers.booking_id -> bookings.booking_id`.

5. **`BOOKINGS` to `PAYMENTS` (1 : 1)**
   - Each confirmed booking maps to exactly one payment settlement record.
   - Foreign key: `payments.booking_id -> bookings.booking_id`.

6. **`BOOKINGS` to `CANCELLATIONS` (1 : 0..1)**
   - An active booking has zero cancellation records.
   - A cancelled booking has exactly one cancellation audit record.
   - Unique Foreign key: `cancellations.booking_id -> bookings.booking_id`.
