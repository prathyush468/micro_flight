# User Stories & Acceptance Criteria
## SkyBook — Flight Reservation System

---

## 1. Guest User Stories

### Story US-01: Flight Search
> **As a** prospective traveller (Guest),  
> **I want to** search for scheduled flights by specifying origin airport, destination airport, and date,  
> **So that** I can view flight options and pricing before creating an account.

#### Acceptance Criteria (Given-When-Then):
```gherkin
Given a guest visits the SkyBook homepage
When the guest selects "COK" as origin, "BLR" as destination, and a valid departure date
And clicks "Search Flights"
Then the system displays all scheduled non-stop flights on that route
And displays the airline, departure/arrival timings, base fare, and available seats
```

---

### Story US-02: Route Validation Feedback
> **As a** guest,  
> **I want to** receive immediate feedback if I accidentally pick identical origin and destination airports,  
> **So that** I do not submit invalid flight search queries.

#### Acceptance Criteria:
```gherkin
Given a user is on the flight search form
When the user sets both origin and destination to "DEL"
And attempts to submit the search
Then an error message is displayed: "Origin and Destination airports must be different"
And no request is sent to the search backend
```

---

### Story US-03: Filter and Sort Flight Results
> **As a** budget-conscious passenger,  
> **I want to** filter search results by maximum price and airline carrier, and sort by lowest fare,  
> **So that** I can quickly find the most affordable flight that suits my schedule.

#### Acceptance Criteria:
```gherkin
Given a list of 10 search results on the results page
When the user drags the max price slider to ₹4,000
And selects "Price: Low to High"
Then the results immediately filter to flights priced at or below ₹4,000
And display the lowest fare first in ascending order
```

---

## 2. Passenger User Stories

### Story US-04: Passenger Account Registration
> **As a** new customer,  
> **I want to** register an account with my full name, email, phone number, and password,  
> **So that** I can securely save my reservations and review boarding passes.

#### Acceptance Criteria:
```gherkin
Given a visitor on the registration page
When they fill in valid registration fields with matching passwords (>= 6 chars)
And click "Register as Passenger"
Then an account is created in MySQL with a salted bcrypt password hash
And a JWT session token is returned
And the user is automatically logged in
```

---

### Story US-05: Dynamic Multi-Traveller Details Entry
> **As a** family traveller,  
> **I want to** enter details for multiple passengers dynamically in one booking flow,  
> **So that** all my family members are ticketed under a single PNR.

#### Acceptance Criteria:
```gherkin
Given a passenger booking a flight for 3 travellers
When the passenger details page renders
Then exactly 3 passenger form cards are generated dynamically
And each card accepts Full Name, Passenger Type (Adult/Child), Gender, and Date of Birth
And validates that all required names are at least 2 characters long
```

---

### Story US-06: Simulated Payment Checkout
> **As a** passenger,  
> **I want to** pay using simulated UPI, Card, or Net Banking,  
> **So that** I can finalize my ticket without entering real banking credentials.

#### Acceptance Criteria:
```gherkin
Given an authenticated passenger on the payment step
When the passenger selects "UPI" and enters a mock VPA
And clicks "Authorize & Confirm Booking"
Then the server processes the transaction atomically in MySQL
And decrements available seats
And records the payment with a unique reference number
And redirects the passenger to the confirmation page
```

---

### Story US-07: Electronic Boarding Pass & Printing
> **As a** ticketed traveller,  
> **I want to** view my unique 6-character PNR and print my electronic boarding pass,  
> **So that** I have physical or digital documentation for airport check-in.

#### Acceptance Criteria:
```gherkin
Given a confirmed booking with PNR "SK782A"
When the passenger navigates to the confirmation page or clicks "Print e-Ticket"
Then the browser print dialog opens with a dedicated printable ticket layout
And the navbar, footer, and buttons are automatically excluded from the printed page
```

---

### Story US-08: Passenger Booking History & Status
> **As a** frequent flyer,  
> **I want to** view my booking history organized into Upcoming, Completed, and Cancelled trips,  
> **So that** I can track my flight itineraries anytime.

#### Acceptance Criteria:
```gherkin
Given a logged-in passenger navigating to "My Bookings"
When the page loads
Then the system queries MySQL for all bookings associated with their user ID
And separates them into distinct tabs based on travel date and booking status
```

---

### Story US-09: Automated Cancellation & Seat Release
> **As a** passenger unable to travel,  
> **I want to** cancel my upcoming flight reservation and view my calculated refund,  
> **So that** seats are restored for other flyers and my refund is recorded.

#### Acceptance Criteria:
```gherkin
Given a passenger with a confirmed upcoming flight reservation of ₹6,800
When they click "Cancel" and confirm the cancellation prompt
Then the system executes an ACID transaction:
  - Updates the booking status to "cancelled"
  - Restores the passenger count back to the flight's available seats
  - Calculates an 85% refund (₹5,780)
  - Updates the payment status to "refunded"
And prevents any further cancellation attempts on the same ticket
```

---

## 3. Administrator User Stories

### Story US-10: Administrative Operational Dashboard
> **As an** airline operations manager (Administrator),  
> **I want to** view aggregate statistics for flights, passengers, confirmed bookings, and gross revenue,  
> **So that** I can monitor airline performance and load factors in real time.

#### Acceptance Criteria:
```gherkin
Given an authenticated administrator accessing "/admin"
When the dashboard mounts
Then the system queries MySQL aggregate views
And displays KPIs for total scheduled flights, passengers, total reservations, and gross confirmed revenue
And non-admin passengers attempting to visit this route are redirected to the homepage
```

---

### Story US-11: Flight Scheduling & Inventory Management
> **As an** airline administrator,  
> **I want to** add a new flight schedule with origin, destination, timings, fare, and seating capacity,  
> **So that** new travel itineraries become immediately searchable and bookable by customers.

#### Acceptance Criteria:
```gherkin
Given an administrator in the "Manage Flights" panel
When they submit a new flight schedule:
  - Flight: "6E-551"
  - Route: BLR to GOI
  - Base Fare: ₹3,100
  - Capacity: 180 seats
Then the flight record is inserted into MySQL with available_seats = 180
And it becomes immediately visible in customer flight search results
```

---

### Story US-12: Operational Flight Status Updates
> **As an** airport flight dispatcher,  
> **I want to** update a flight's status to "delayed", "departed", or "cancelled",  
> **So that** passengers see accurate operational notices on their tickets.

#### Acceptance Criteria:
```gherkin
Given an administrator inspecting scheduled flights
When they select flight "AI-502" and change its status to "delayed"
Then the flight record is updated in the database
And subsequent flight queries show the "delayed" badge
```
