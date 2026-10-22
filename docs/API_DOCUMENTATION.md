# REST API Reference & Specification
## SkyBook — Flight Reservation System

**Base API URL:** `http://localhost:5000/api`  
**Standard Content-Type:** `application/json`

---

## 1. Authentication Endpoints

### 1.1 Register Passenger
- **Route:** `POST /api/auth/register`
- **Access:** Public (Guest)
- **Request Body:**
  ```json
  {
    "fullName": "Alexander Fleming",
    "email": "alexander@example.com",
    "phone": "+91 9845012345",
    "password": "Password@123",
    "confirmPassword": "Password@123"
  }
  ```
- **Success Response (201 Created):**
  ```json
  {
    "success": true,
    "message": "Registration successful! Welcome to SkyBook.",
    "data": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user": {
        "userId": 5,
        "fullName": "Alexander Fleming",
        "email": "alexander@example.com",
        "phone": "+91 9845012345",
        "role": "passenger"
      }
    }
  }
  ```
- **Error Responses:**
  - `400 Bad Request`: Validation failure (short password, mismatched confirmation).
  - `409 Conflict`: "An account with this email address already exists".

---

### 1.2 Login User
- **Route:** `POST /api/auth/login`
- **Access:** Public
- **Request Body:**
  ```json
  {
    "email": "john.doe@example.com",
    "password": "User@123"
  }
  ```
- **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Welcome back, John Doe!",
    "data": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user": {
        "userId": 2,
        "fullName": "John Doe",
        "email": "john.doe@example.com",
        "phone": "+91 9845012345",
        "role": "passenger"
      }
    }
  }
  ```
- **Error Response (401 Unauthorized):**
  ```json
  {
    "success": false,
    "message": "Invalid email or password credentials"
  }
  ```

---

### 1.3 Get Current User Profile
- **Route:** `GET /api/auth/me`
- **Access:** Authenticated (Bearer Token required)
- **Headers:** `Authorization: Bearer <JWT_TOKEN>`
- **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "userId": 2,
      "fullName": "John Doe",
      "email": "john.doe@example.com",
      "phone": "+91 9845012345",
      "role": "passenger",
      "createdAt": "2026-10-22T13:47:28.000Z"
    }
  }
  ```

---

## 2. Airports Endpoints

### 2.1 List All Active Airports
- **Route:** `GET /api/airports`
- **Access:** Public
- **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "data": [
      {
        "airport_id": 1,
        "airport_code": "COK",
        "airport_name": "Cochin International Airport",
        "city": "Kochi",
        "country": "India"
      }
    ]
  }
  ```

---

## 3. Flight Endpoints

### 3.1 Search Scheduled Flights
- **Route:** `GET /api/flights`
- **Access:** Public
- **Query Parameters:**
  - `origin` (e.g., `COK`)
  - `destination` (e.g., `BLR`)
  - `departureDate` (e.g., `2026-10-23`)
  - `passengers` (integer, default `1`)
  - `airline` (optional string filter)
  - `maxPrice` (optional decimal filter)
  - `sortBy` (`base_fare`, `departure_time`, `duration`)
  - `sortOrder` (`ASC`, `DESC`)
- **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Found 2 available flight(s)",
    "data": [
      {
        "flight_id": 1,
        "flight_number": "AI-502",
        "airline_name": "Air India",
        "origin_code": "COK",
        "origin_city": "Kochi",
        "destination_code": "BLR",
        "destination_city": "Bengaluru",
        "departure_time": "2026-10-23T07:00:00.000Z",
        "arrival_time": "2026-10-23T08:15:00.000Z",
        "duration_minutes": 75,
        "base_fare": 3450,
        "total_seats": 180,
        "available_seats": 150,
        "status": "scheduled"
      }
    ]
  }
  ```

---

### 3.2 Get Flight Details with Breakdown
- **Route:** `GET /api/flights/:id`
- **Access:** Public
- **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "flight_id": 1,
      "flight_number": "AI-502",
      "airline_name": "Air India",
      "base_fare": 3450,
      "fareBreakdown": {
        "baseFare": 3450,
        "aviationGst": 172.5,
        "airportFee": 241.5,
        "totalFarePerPassenger": 3864
      }
    }
  }
  ```

---

### 3.3 Create Flight (Administrator Only)
- **Route:** `POST /api/flights`
- **Access:** Administrator (`Bearer <JWT>` with role `admin`)
- **Request Body:**
  ```json
  {
    "flightNumber": "6E-551",
    "airlineName": "IndiGo",
    "originAirportId": 2,
    "destinationAirportId": 7,
    "departureTime": "2026-10-25T12:00:00",
    "arrivalTime": "2026-10-25T13:15:00",
    "baseFare": 3100,
    "totalSeats": 180
  }
  ```
- **Success Response (201 Created):**
  ```json
  {
    "success": true,
    "message": "Flight created and scheduled successfully",
    "data": { "flight_id": 17, "flight_number": "6E-551" }
  }
  ```

---

### 3.4 Update Flight Status (Administrator Only)
- **Route:** `PATCH /api/flights/:id/status`
- **Access:** Administrator
- **Request Body:** `{ "status": "delayed" }`
- **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Flight status updated to delayed"
  }
  ```

---

## 4. Bookings & Reservation Endpoints

### 4.1 Create Booking with Simulated Payment (ACID Transaction)
- **Route:** `POST /api/bookings`
- **Access:** Authenticated Passenger
- **Request Body:**
  ```json
  {
    "flightId": 1,
    "passengers": [
      {
        "fullName": "Alexander Fleming",
        "dateOfBirth": "1990-08-06",
        "passengerType": "adult",
        "gender": "male"
      }
    ],
    "paymentMethod": "upi",
    "tripType": "one-way"
  }
  ```
- **Success Response (201 Created):**
  ```json
  {
    "success": true,
    "message": "Reservation confirmed! Simulated payment succeeded and ticket generated.",
    "data": {
      "booking_id": 4,
      "pnr": "SK792A",
      "flight_number": "AI-502",
      "airline_name": "Air India",
      "booking_status": "confirmed",
      "total_amount": 3864,
      "transaction_reference": "TXN-SB-L67K8-A90",
      "passengers": [
        {
          "full_name": "Alexander Fleming",
          "passenger_type": "adult",
          "seat_number": "10A"
        }
      ]
    }
  }
  ```

---

### 4.2 Get My Bookings
- **Route:** `GET /api/bookings/my`
- **Access:** Authenticated Passenger
- **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "data": [
      {
        "booking_id": 1,
        "pnr": "SKY782A",
        "flight_number": "AI-502",
        "origin_city": "Kochi",
        "destination_city": "Bengaluru",
        "total_amount": 6900,
        "booking_status": "confirmed"
      }
    ]
  }
  ```

---

### 4.3 Get Booking Details / e-Ticket
- **Route:** `GET /api/bookings/:id` (Accepts numeric ID or 6-char PNR)
- **Access:** Owner Passenger or Administrator
- **Success Response (200 OK):** Complete booking and passenger receipt.

---

### 4.4 Cancel Booking (ACID Inventory Release & Refund)
- **Route:** `POST /api/bookings/:id/cancel`
- **Access:** Owner Passenger or Administrator
- **Request Body:**
  ```json
  {
    "reason": "Change in travel schedule"
  }
  ```
- **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Booking SK792A cancelled successfully. Refund of ₹3,284.40 has been processed.",
    "data": {
      "bookingId": 4,
      "pnr": "SK792A",
      "refundAmount": 3284.4,
      "seatsReleased": 1,
      "status": "cancelled"
    }
  }
  ```

---

## 5. Administrative Endpoints

### 5.1 Dashboard Analytics
- **Route:** `GET /api/admin/dashboard`
- **Access:** Administrator
- **Success Response (200 OK):** Aggregated metrics, recent bookings, airline revenue breakdown, and popular routes.

### 5.2 View All Customer Bookings
- **Route:** `GET /api/admin/bookings?search=SKY&status=confirmed`
- **Access:** Administrator

### 5.3 View All Registered Users
- **Route:** `GET /api/admin/users`
- **Access:** Administrator
