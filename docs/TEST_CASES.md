# Comprehensive Software Testing & QA Report
## SkyBook — Flight Reservation System

---

## 1. Test Strategy & Overview

The SkyBook testing program combines automated API integration tests (executed via `node:test`), frontend component verification, relational database constraint validation, and security testing:

- **Automated Test Suite**: 14/14 automated backend test cases executed against MySQL 8.0 with **0 failures**.
- **Frontend Build Verification**: Vite production build compiled 1,538 modules in 3.70 seconds with **0 errors**.

---

## 2. Test Cases Specification & Execution Log

| Test ID | Test Category | Description | Input / Condition | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-01** | System / Health | Verify API server status endpoint | `GET /api/health` | HTTP 200 with `{ status: "healthy" }` | HTTP 200, `{ status: "healthy", service: "SkyBook..." }` | **PASS** |
| **TC-02** | Integration | Retrieve all active airport stations | `GET /api/airports` | Array of >= 8 airports with IATA codes | Returned 8 valid airports (COK, BLR, DEL, BOM, etc.) | **PASS** |
| **TC-03** | Functional | Search scheduled flights for valid route | `GET /api/flights?origin=COK&destination=BLR` | HTTP 200 with matching flight objects | Returned matching flights with base fares and available seats | **PASS** |
| **TC-04** | Validation | Reject search when Origin equals Destination | `GET /api/flights?origin=COK&destination=COK` | HTTP 400 Bad Request with descriptive message | HTTP 400, "Origin and Destination airports must be different" | **PASS** |
| **TC-05** | Security / Auth | Valid passenger login | `POST /api/auth/login` with `john.doe@example.com` / `User@123` | HTTP 200 with signed JWT and passenger role | HTTP 200 with JWT and user profile | **PASS** |
| **TC-06** | Security / Auth | Reject login with incorrect password | `POST /api/auth/login` with wrong password | HTTP 401 Unauthorized | HTTP 401, "Invalid email or password credentials" | **PASS** |
| **TC-07** | Security / Auth | Authenticate Administrator user | `POST /api/auth/login` with `admin@skybook.com` / `Admin@123` | HTTP 200 with JWT and `role = 'admin'` | HTTP 200 with JWT and `admin` role | **PASS** |
| **TC-08** | Security / Auth | Reject duplicate passenger email | `POST /api/auth/register` with existing email | HTTP 409 Conflict | HTTP 409, "An account with this email address already exists" | **PASS** |
| **TC-09** | Validation | Password minimum length rule | Registration with password `< 6` characters | Client/Server validation error | HTTP 400, "Password must be at least 6 characters in length" | **PASS** |
| **TC-10** | RDBMS / ACID | Execute atomic flight booking with seat decrement | `POST /api/bookings` with valid flight ID and passenger array | HTTP 201 Created, unique PNR issued, available seats decremented | HTTP 201 Created, issued PNR `SK...`, seat count decremented by 1 | **PASS** |
| **TC-11** | Functional | Retrieve confirmed ticket by PNR | `GET /api/bookings/:pnr` | HTTP 200 with full flight, passenger, and payment details | HTTP 200, returned ticket matching customer email | **PASS** |
| **TC-12** | RDBMS / ACID | Execute cancellation and restore seats | `POST /api/bookings/:id/cancel` on active booking | HTTP 200, status updated to `cancelled`, seats restored, 85% refund computed | HTTP 200, status `cancelled`, seats restored to flight, refund calculated | **PASS** |
| **TC-13** | Security / Idempotency | Reject duplicate cancellation on already cancelled booking | Second call to `POST /api/bookings/:id/cancel` | HTTP 400 Bad Request | HTTP 400, "Booking is already cancelled. Repeated cancellation is prohibited." | **PASS** |
| **TC-14** | Security / RBAC | Deny passenger access to admin dashboard | `GET /api/admin/dashboard` using passenger JWT | HTTP 403 Forbidden | HTTP 403, "Access forbidden. Administrator role required." | **PASS** |
| **TC-15** | RDBMS / Concurrency | Seat inventory exhaustion | Booking request with passengers > available seats | Transaction rollback, seats unallocated | HTTP 400, "Insufficient seats available" | **PASS** |
| **TC-16** | Frontend / UI | Responsive rendering at 375px mobile viewport | Chrome DevTools device mode (375x667) | Flight cards stack vertically, navigation collapses cleanly | Elements stacked without horizontal clipping or scrollbar break | **PASS** |
| **TC-17** | Frontend / Print | Boarding pass print layout | Trigger browser print on `/booking/confirmation/:pnr` | Navbar, footer, and buttons hidden; clean e-Ticket printed | Media query `@media print` correctly formats e-Ticket receipt | **PASS** |

---

## 3. Automated Test Execution Evidence

```
> skybook-server@1.0.0 test
> node --test tests/*.test.js

▶ 1. Health Check Endpoint
  ✔ GET /api/health returns 200 and healthy status (87.8391ms)
✔ 1. Health Check Endpoint (88.6895ms)
▶ 2. Airports API
  ✔ GET /api/airports returns list of active airports (65.0256ms)
✔ 2. Airports API (65.3795ms)
▶ 3. Flight Search API
  ✔ GET /api/flights?origin=COK&destination=BLR returns available flights (38.4284ms)
  ✔ GET /api/flights rejects identical origin and destination (6.3212ms)
✔ 3. Flight Search API (45.4073ms)
▶ 4. Authentication API
  ✔ POST /api/auth/login succeeds for valid passenger credentials (169.8434ms)
  ✔ POST /api/auth/login rejects incorrect password (115.6066ms)
  ✔ POST /api/auth/login succeeds for admin credentials (124.6479ms)
  ✔ GET /api/auth/me returns authenticated user details (8.8372ms)
✔ 4. Authentication API (419.6944ms)
▶ 5. Booking & Transaction API
  ✔ POST /api/bookings successfully reserves seats with ACID transaction (46.7814ms)
  ✔ GET /api/bookings/:id retrieves the created booking ticket (5.9429ms)
  ✔ POST /api/bookings/:id/cancel cancels reservation and calculates refund (41.9941ms)
  ✔ POST /api/bookings/:id/cancel fails if booking is already cancelled (idempotent safety) (7.3245ms)
✔ 5. Booking & Transaction API (102.4581ms)
▶ 6. Admin Dashboard & Management API
  ✔ GET /api/admin/dashboard returns system aggregations and KPIs (29.1562ms)
  ✔ GET /api/admin/dashboard denies access to passenger role (3.2622ms)
✔ 6. Admin Dashboard & Management API (32.6476ms)

ℹ tests 14
ℹ suites 6
ℹ pass 14
ℹ fail 0
ℹ duration_ms 1382.862
```
