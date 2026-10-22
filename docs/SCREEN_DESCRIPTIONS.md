# Screen Specifications & User Interface Catalog
## SkyBook — Flight Reservation System

---

## 1. Homepage (`/`)
- **Visual Structure**:
  - Sticky top **Navbar** with brand logo, links, and Auth controls.
  - Dark Navy **Hero Section** (`#0F172A`) with title *"Your Journey Begins Here"*.
  - Floating **Search Card** overlapping the hero gradient with trip-type tabs (One-way / Round-trip), Origin and Destination dropdowns with swap button, Date pickers, and Passenger count dropdown.
  - **Popular Destinations Grid**: 6 destination cards (Bengaluru, Kochi, Delhi, Mumbai, Goa, Kolkata) with gradient overlays and starting fares.
  - **Why Choose SkyBook**: 4 architectural feature cards highlighting ACID guarantees, live inventory, and instant PNR.
  - **How It Works**: 4-step progressive timeline cards.
  - **Footer** with academic MCA Semester V accreditation and quick links.
- **Interactions**:
  - Clicking "Swap" switches Origin and Destination values with instant UI re-render.
  - Submitting search validates required inputs and navigates to `/flights`.

---

## 2. Flight Results Page (`/flights`)
- **Visual Structure**:
  - Top summary bar showing current route, date, passenger count, and "Modify Search" toggle.
  - **Left Sidebar Filter Card**: Max price range slider (₹2,000 to ₹15,000), Sort-by dropdown (Price, Departure Time, Duration), and Airline radio filters.
  - **Flight Cards Stream**: List of `FlightCard` components displaying carrier avatar, flight number, non-stop tag, departure time, flight duration track with plane icon, arrival time, fare per passenger, and seat availability warning pills.
- **Interactions**:
  - Adjusting the price slider or airline filter immediately recalculates the visible flight set.
  - Clicking "Select Flight" navigates to the detailed Itinerary page (`/flights/:id`).

---

## 3. Flight Details & Itinerary Page (`/flights/:id`)
- **Visual Structure**:
  - Detailed flight header with carrier, aircraft model (Boeing 737 / Airbus A320), class (Economy).
  - Terminal-style schedule card showing departure and arrival station names, cities, and timestamps.
  - Inclusions breakdown: Cabin baggage (7kg), Check-in baggage (15kg), and Meal policies.
  - Cancellation policy explanation (85% refund if cancelled before departure).
  - Sticky **BookingSummary** card displaying base fare, 5% aviation GST, 7% airport fees, and total payable amount.
- **Interactions**:
  - Clicking "Continue to Passenger Details" proceeds to traveller registration.

---

## 4. Passenger Details Page (`/booking/passengers`)
- **Visual Structure**:
  - Generates N traveller cards matching the requested passenger count.
  - Each card provides Full Name input, Passenger Type (Adult / Child) selector, Gender dropdown, and Date of Birth picker.
  - Dynamic "Add Another Passenger" and "Remove" controls (capped at 9).
  - Side-by-side sticky booking summary.
- **Interactions**:
  - Real-time client validation checks that names are non-empty and formatted properly.
  - If user is not logged in, redirects to `/login` preserving passenger inputs in session storage.

---

## 5. Simulated Payment Page (`/booking/payment`)
- **Visual Structure**:
  - Educational callout clarifying simulated test environment.
  - 3-way payment channel toggle:
    1. **Credit / Debit Card**: Form with masked test card number, expiry, and CVV.
    2. **UPI**: VPA input with Google Pay, PhonePe, Paytm compatibility notes.
    3. **Net Banking**: Bank selection dropdown (HDFC, SBI, ICICI, Axis).
  - Prominent "Authorize & Confirm Booking" button.
- **Interactions**:
  - Dispatches `POST /api/bookings` with atomic row lock.
  - Displays spinner while acquiring lock and decrementing seats in MySQL.
  - Redirects to Confirmation on commit.

---

## 6. Booking Confirmation & e-Ticket Page (`/booking/confirmation/:pnr`)
- **Visual Structure**:
  - Success banner with green checkmark and PNR announcement.
  - Bordered, dashed boarding pass receipt:
    - Official SkyBook header and PNR box in prominent bold text.
    - Origin and destination station names, flight number, airline, travel dates.
    - Passenger table with seat allocations (e.g., 10A, 10B).
    - Payment receipt table with transaction reference, method, and amount.
    - Security and airport check-in instructions.
- **Interactions**:
  - "Print e-Ticket" invokes `window.print()` which leverages `@media print` CSS to generate a clean, border-fit PDF/paper boarding pass.

---

## 7. Passenger Dashboard (`/my-bookings`)
- **Visual Structure**:
  - Welcome greeting with passenger name.
  - Category filter tabs: All Bookings, Upcoming Trips, Completed, Cancelled.
  - Booking cards showing PNR, Flight, Route, Date, Status pill, and View Ticket button.
  - Cancellation action button on active future flights.
- **Interactions**:
  - Clicking "Cancel" opens an interactive modal calculating the 15% cancellation fee and 85% refund before confirming.
  - Confirmed cancellation updates MySQL inventory and reflects processed refund immediately.

---

## 8. Administrator Dashboard (`/admin`)
- **Visual Structure**:
  - Left navigation sidebar: Dashboard, Manage Flights, Manage Airports, All Bookings, Registered Users.
  - Top 6 KPI summary cards: Total Flights, Registered Passengers, Total Bookings, Confirmed Bookings, Cancelled Bookings, Gross Revenue.
  - Two-column data view: Recent customer bookings table and Top 5 Popular Routes.
  - Bottom table: Airline Performance & Revenue summary derived from `vw_revenue_summary`.
- **Interactions**:
  - Real-time aggregations fetched from MySQL database views.
  - Full CRUD control for flights, stations, and statuses.
