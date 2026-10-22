# Software Requirements Specification (SRS)
## SkyBook — Flight Reservation System
**Academic Capstone Project — MCA Integrated Semester V**  
**Integrated Subjects:** Software Engineering | User Interface Design Lab | RDBMS Lab

---

## 1. Introduction

### 1.1 Purpose
This document provides a complete Software Requirements Specification (SRS) for **SkyBook**, an enterprise-grade full-stack airline reservation and itinerary management system. The system delivers responsive flight search, real-time inventory management, simulated multi-mode payment, automated PNR and boarding pass issuance, customer booking history, dynamic cancellations with automated refund computations, and administrative inventory controls.

### 1.2 Scope
SkyBook addresses the complexities of commercial airline operations by bridging three computer application domains:
- **Software Engineering**: Modular MVC structure, SDLC sprint planning, RESTful API architecture, role-based access control (RBAC), and automated testing.
- **User Interface Design Lab**: Component-driven React architecture, controlled inputs, accessible navigation, design token styling, and responsive multi-device design (375px to 1440px).
- **RDBMS Lab**: Fully normalized MySQL 8.0 schema (1NF, 2NF, 3NF), declarative referential constraints, indexing strategies, analytical views, and concurrent ACID transactions preventing overselling of seats.

### 1.3 Intended Audience
- MCA Evaluators and Viva Examination Committee
- Full-Stack Software Engineers and Peer Developers
- Quality Assurance and Database Engineers

---

## 2. Problem Statement
Conventional flight booking architectures frequently suffer from concurrency anomalies, including:
1. **Overselling Inventory**: Double booking the final remaining seats when multiple passengers check out simultaneously.
2. **Inconsistent Data Integrity**: Decoupled payment confirmation leading to orphaned reservations or deducted passenger funds without assigned tickets.
3. **Complex Cancellation Accounting**: Arbitrary manual cancellations without automated audit trails, transparent cancellation fees, or automatic seat restorations.
4. **Poor Responsiveness**: Cluttered interfaces that fail on mobile devices and lack clear visual hierarchy.

SkyBook resolves these challenges using row-level transactional locking (`SELECT ... FOR UPDATE`), server-side pricing single sources of truth, declarative relational constraints, and a responsive modern user interface.

---

## 3. Stakeholders & User Roles

| Role | Description | Core Capabilities |
| :--- | :--- | :--- |
| **Guest** | Unauthenticated site visitor | Search flight schedules, view seat availability, compare airline fares, view route details. |
| **Passenger** | Authenticated consumer | Reserve seats, enter traveller details, execute simulated payments, retrieve tickets, view booking history, cancel bookings with refund. |
| **Administrator** | Flight operations manager | Schedule new flights, edit flight fares/timings, update flight operational statuses, manage airport stations, inspect system bookings, view passenger lists, inspect revenue metrics. |

---

## 4. Functional Requirements

### 4.1 Module 1: User Authentication & Role-Based Authorization
- **FR-1.1**: The system shall permit new passengers to register using their full name, email, phone number, and password (minimum 6 characters).
- **FR-1.2**: The system shall enforce unique email addresses and reject duplicate accounts with HTTP 409 Conflict.
- **FR-1.3**: Passwords must be hashed using bcrypt (cost factor 10) prior to database insertion.
- **FR-1.4**: The system shall authenticate users via JWT access tokens and attach user metadata (`user_id`, `email`, `role`).
- **FR-1.5**: The system shall restrict administrative endpoints (`/api/admin/*`, `/api/flights [POST/PUT/PATCH]`) strictly to users with `role = 'admin'`.

### 4.2 Module 2: Airport Station & Flight Search Management
- **FR-2.1**: The system shall maintain an active directory of airports identified by 3-letter IATA codes (e.g., COK, BLR, DEL, BOM).
- **FR-2.2**: The system shall enable guests and passengers to query flights by specifying Origin Airport, Destination Airport, Travel Date, and Passenger Count (1 to 9).
- **FR-2.3**: The system shall reject flight queries where the Origin and Destination airports are identical.
- **FR-2.4**: The system shall support multi-parameter filtering by maximum price, specific airline carrier, and departure time range.
- **FR-2.5**: The system shall support ascending and descending sorting by base fare, departure time, and total flight duration.

### 4.3 Module 3: Seat Inventory & ACID Booking Transaction
- **FR-3.1**: The system shall dynamically generate passenger traveller input forms based on the requested passenger count.
- **FR-3.2**: Prior to booking creation, the system shall begin a database transaction and acquire a row-level lock (`FOR UPDATE`) on the flight row.
- **FR-3.3**: The system shall verify that `available_seats >= passenger_count` and that the flight departure timestamp is strictly in the future.
- **FR-3.4**: The system shall conditionally decrement `available_seats = available_seats - passenger_count`.
- **FR-3.5**: The system shall compute total fare on the server (Base Fare + 5% Aviation GST + 7% Airport Development Surcharge).
- **FR-3.6**: The system shall generate a unique 6-character uppercase alphanumeric PNR prefixed with `SK` (e.g., `SK782A`).
- **FR-3.7**: The system shall atomically commit flight updates, booking insertion, passenger record insertion, and payment record insertion upon simulated payment success.
- **FR-3.8**: If an allocation conflict or simulated gateway failure occurs, the system shall execute an automatic `ROLLBACK`, leaving zero orphan records.

### 4.4 Module 4: Simulated Payment & Boarding Pass Issuance
- **FR-4.1**: The system shall present simulated payment channels: Credit/Debit Card, UPI Virtual Payment Address, and Net Banking.
- **FR-4.2**: The system shall generate an audit-compliant transaction reference string (`TXN-SB-[TIMESTAMP]-[RANDOM]`).
- **FR-4.3**: Upon confirmation, the system shall render a print-friendly e-Ticket boarding pass displaying PNR, booking ID, flight details, passenger names, and allocated seat numbers.

### 4.5 Module 5: Passenger Dashboard & Dynamic Cancellation
- **FR-5.1**: The system shall display the passenger's historical reservations categorized into Upcoming Trips, Completed Trips, and Cancelled Trips.
- **FR-5.2**: Passengers shall be permitted to cancel any confirmed reservation for an upcoming flight.
- **FR-5.3**: Cancellations shall execute within an ACID transaction:
  1. Acquire row lock on booking record.
  2. Verify current status is `confirmed` (prohibiting duplicate cancellations).
  3. Compute refund amount (85% refund policy; 15% cancellation charge).
  4. Restore released seats to the flight record: `available_seats = available_seats + passenger_count`.
  5. Insert cancellation audit record.
  6. Update payment status to `refunded`.
  7. Commit transaction.

### 4.6 Module 6: Administrator Operations
- **FR-6.1**: The system shall provide an administrative dashboard displaying total scheduled flights, registered passengers, confirmed bookings, cancelled bookings, gross confirmed revenue, and refunded sums.
- **FR-6.2**: Administrators shall be able to schedule new flights specifying flight number, airline, origin, destination, departure/arrival timestamps, base fare, and seat capacity.
- **FR-6.3**: Administrators shall be able to update operational statuses: `scheduled`, `delayed`, `departed`, `arrived`, `cancelled`, and `inactive`.
- **FR-6.4**: Administrators shall be able to search all customer bookings by PNR, customer name, email, or flight number.
- **FR-6.5**: Administrators shall be able to register and update airport stations.

---

## 5. Non-Functional Requirements

### 5.1 Performance
- **NFR-1**: Flight queries against indexed columns (`origin_airport_id`, `destination_airport_id`, `departure_time`, `status`) must return responses within 200 milliseconds under standard local loads.
- **NFR-2**: React frontend bundle size must remain lightweight (< 350 KB gzip) with fast client-side routing.

### 5.2 Reliability & ACID Integrity
- **NFR-3**: Seat reservations must adhere to strict Isolation levels to prevent dirty reads, non-repeatable reads, and phantom seat allocations.
- **NFR-4**: Database transactions must guarantee Atomicity: all records commit together or none at all.

### 5.3 Security
- **NFR-5**: Parameterized SQL queries via `mysql2/promise` must prevent SQL Injection vulnerabilities across all routes.
- **NFR-6**: Cross-Origin Resource Sharing (CORS) must be configured to allow trusted origins while protecting credentials.
- **NFR-7**: Real financial credentials (card CVVs, bank PINs) must never be accepted, requested, or persisted.

### 5.4 Usability & Accessibility
- **NFR-8**: Interfaces must provide responsive layouts tested across 375px (Mobile), 768px (Tablet), 1024px (Laptop), and 1440px (Desktop).
- **NFR-9**: Color contrast ratios between text and background must meet WCAG 2.1 AA standards.

---

## 6. Business Rules

| Rule ID | Statement | Enforcement Layer |
| :--- | :--- | :--- |
| **BR-1** | Origin and Destination airport stations must not be identical. | Client Form Validation + Express Controller |
| **BR-2** | Arrival timestamp must be chronologically after Departure timestamp. | Express Controller + MySQL CHECK Constraint |
| **BR-3** | Base fare and seat counts must be positive integers (> 0). | MySQL CHECK Constraint + Controller Validation |
| **BR-4** | Available seats must never exceed total seat capacity (`available_seats <= total_seats`). | MySQL CHECK Constraint + Model Transaction |
| **BR-5** | Reservations require passenger count between 1 and 9 per booking. | MySQL CHECK Constraint + Controller Validation |
| **BR-6** | Pricing calculation is strictly server-authoritative (Base + 12% GST/fees). | Express Controller |
| **BR-7** | Tickets are only generated upon simulated payment success. | Express ACID Transaction |
| **BR-8** | Cancellations restore released seats exactly once (Idempotent). | Express ACID Transaction with Row Lock |
| **BR-9** | Flight cancellation eligible refund is 85% of total gross amount paid. | Express Booking Model |
| **BR-10** | Departed flights cannot be reserved or cancelled. | Express Booking Controller |
| **BR-11** | Passengers may only access tickets belonging to their own user ID. | Express Auth Middleware & Controller |
| **BR-12** | Only administrators may create or modify flights and airports. | Express `requireAdmin` Middleware |
| **BR-13** | Inactive or cancelled flights do not appear in bookable flight searches. | MySQL Search Query (`status = 'scheduled'`) |
| **BR-14** | Deleted or cancelled bookings retain historical audit records. | MySQL Foreign Key with Audit Tables |

---

## 7. Acceptance Criteria (Sample)

```gherkin
Feature: Flight Reservation Seat Decrement
  Scenario: Successfully book available seats
    Given the flight "AI-502" has 150 available seats
    And the user is authenticated as a passenger
    When the passenger books 2 seats and confirms simulated payment
    Then the system creates a confirmed booking with a unique PNR
    And the flight's available seats are decremented to 148
    And a printable e-Ticket is made accessible

  Scenario: Attempt booking when seats are insufficient
    Given the flight "6E-2044" has only 2 available seats
    When the passenger attempts to book 4 seats
    Then the system rejects the booking with an insufficient seats error
    And the available seats remain unchanged at 2
```
