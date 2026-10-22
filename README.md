# SkyBook — Flight Reservation System
### Academic Capstone Project — MCA Integrated Semester V
**Integration of 3 Core Subjects:**
1. **Software Engineering**: MVC Architecture, Agile Sprints, Use Cases, User Stories with Given-When-Then criteria, Sequence Diagrams, RESTful APIs, Automated Integration Testing.
2. **User Interface Design Lab**: React 18 functional components, React Hooks (`useState`, `useEffect`, `useContext`), React Router, Lucide icons, Design Tokens, Responsive CSS (tested at 375px, 768px, 1024px, 1440px), Print-ready e-Tickets.
3. **RDBMS Lab**: MySQL 8.0, 1NF/2NF/3NF normalization, foreign key cascading constraints, CHECK & UNIQUE constraints, indexes, relational views, and ACID transactions with row-level locks preventing double bookings.

---

## 1. Demo Credentials for Evaluation & Viva

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **System Administrator** | `admin@skybook.com` | `Admin@123` | Full administrative dashboard, flight scheduling, status management, airport directory, system bookings |
| **Passenger (Demo 1)** | `john.doe@example.com` | `User@123` | Flight booking, simulated payments, e-ticket printing, booking cancellation with refund |
| **Passenger (Demo 2)** | `priya.sharma@example.com` | `User@123` | Standard passenger account with sample upcoming trip |

> **Convenience Feature**: Clickable demo credential pills are provided directly on the Login screen for instant one-click login during academic demonstrations.

---

## 2. Project Architecture

```
skybook/
├── client/                     # Frontend (React 18, Vite, React Router, Lucide Icons)
│   ├── public/                 # Favicon and static assets
│   ├── src/
│   │   ├── components/         # Reusable functional UI components (Navbar, FlightCard, etc.)
│   │   ├── context/            # AuthContext (JWT session, state, roles)
│   │   ├── pages/              # Passenger & public pages (Home, FlightResults, Payment, etc.)
│   │   │   └── admin/          # Admin pages (Dashboard, ManageFlights, ManageAirports, etc.)
│   │   ├── services/           # Centralized API service layer (api.js, flightService.js, etc.)
│   │   ├── styles/             # Global CSS design tokens, components, and responsive media queries
│   │   ├── App.jsx             # Client routing tree (Public, Protected, AdminProtected)
│   │   └── main.jsx            # React root mount
│   ├── index.html              # HTML5 entry with Inter font
│   ├── vite.config.js          # Vite config with API reverse proxy
│   └── package.json
├── server/                     # Backend API (Node.js, Express.js MVC, JWT, bcrypt)
│   ├── config/                 # MySQL database connection pool (mysql2/promise)
│   ├── controllers/            # Business logic handlers (auth, flights, bookings, admin)
│   ├── middleware/             # verifyToken, requireAdmin, errorHandler
│   ├── models/                 # Relational models & ACID transaction logic
│   ├── routes/                 # Express API REST routes
│   ├── tests/                  # Automated integration tests (node:test)
│   ├── utils/                  # PNR generator, response helpers
│   ├── app.js                  # Express application setup, CORS, body parsers
│   ├── server.js               # HTTP server bootstrap & diagnostic DB check
│   ├── package.json
│   └── .env.example            # Environment variables template
├── database/                   # RDBMS Lab Database Assets
│   ├── schema.sql              # MySQL schema (Tables, constraints, indexes, views)
│   ├── seed.sql                # Demonstration records (Airports, flights, bookings)
│   └── sample_queries.sql      # Syllabus SQL queries, joins, aggregates, transactions
├── docs/                       # Complete Academic Documentation
│   ├── SRS.md                  # Software Requirements Specification
│   ├── USER_STORIES.md         # 12 User stories with Given-When-Then criteria
│   ├── USE_CASES.md            # Use case specifications & Mermaid actor diagram
│   ├── ARCHITECTURE.md         # 3-tier system architecture & sequence diagrams
│   ├── TEST_CASES.md           # 17 Test cases matrix & automated test results
│   ├── API_DOCUMENTATION.md    # Complete REST API reference with JSON payloads
│   ├── GIT_WORKFLOW.md         # Feature-branch workflow & commit standards
│   ├── UI_UX_DESIGN.md         # Design tokens, typography, and color palette
│   ├── SCREEN_DESCRIPTIONS.md  # Detailed screen catalog and responsive behaviors
│   ├── USABILITY_TESTING.md    # 5-task usability testing plan and SUS evaluation
│   ├── DATABASE_DESIGN.md      # 3NF normalization report & ACID transaction rules
│   └── ER_DIAGRAM.md           # Entity-Relationship diagram with Mermaid notation
├── .gitignore
└── README.md
```

---

## 3. Step-by-Step Local Setup & Execution Guide

### Prerequisites
- **Node.js**: v18.0.0 or later (installed version: `v25.8.1`)
- **MySQL Server**: 8.0 or later (running on localhost port `3306`)

---

### Step 1: Database Setup (MySQL 8.0)
1. Open MySQL Command Line Client or MySQL Workbench.
2. Run the schema creation script:
   ```powershell
   Get-Content "D:\micro project\skybook\database\schema.sql" -Raw | & "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p
   ```
3. Seed the sample demonstration data:
   ```powershell
   Get-Content "D:\micro project\skybook\database\seed.sql" -Raw | & "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p
   ```
4. Verify table row counts:
   ```sql
   USE skybook_db;
   SELECT table_name, table_rows FROM information_schema.tables WHERE table_schema = 'skybook_db';
   ```

---

### Step 2: Backend Configuration & Startup
1. Navigate to the `server` folder:
   ```powershell
   cd "D:\micro project\skybook\server"
   ```
2. Verify or update `.env` with your local MySQL password:
   ```ini
   PORT=5000
   NODE_ENV=development
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=YourPasswordHere
   DB_NAME=skybook_db
   JWT_SECRET=skybook_super_secret_jwt_key_2026_mca_semester_v_secure_token
   CLIENT_URL=http://localhost:5173
   ```
3. Run automated tests to verify API and MySQL connectivity:
   ```powershell
   npm test
   ```
   *(Expected output: 14 pass, 0 fail)*
4. Start the backend API server:
   ```powershell
   npm start
   ```
   *(Server starts at: `http://localhost:5000`)*

---

### Step 3: Frontend Startup
1. In a separate terminal, navigate to the `client` folder:
   ```powershell
   cd "D:\micro project\skybook\client"
   ```
2. Start the Vite development server:
   ```powershell
   npm run dev
   ```
3. Open your browser and navigate to:
   ```
   http://localhost:5173
   ```

---

## 4. Key Academic Viva Talking Points

1. **Software Engineering**:
   - Clean separation of UI (React functional components) and Business Logic (Express MVC).
   - Role-Based Authorization enforced on the server (`requireAdmin` middleware), preventing passengers from bypassing admin barriers.
   - Comprehensive SRS, Use Cases, User Stories, and automated integration test coverage.

2. **User Interface Design Lab**:
   - Modern airline booking styling using dark navy blue (`#0F172A`) and sky blue (`#0284C7`).
   - Clean state management using `useState`, `useEffect`, and `useContext` (`AuthContext`).
   - Dynamic traveller forms based on passenger count (1 to 9).
   - Responsive multi-device compatibility (375px to 1440px) and clean print layout (`@media print`).

3. **RDBMS Lab**:
   - Fully normalized to 3NF eliminating data redundancy.
   - Concurrency safety: Seat reservations acquire an exclusive row lock (`SELECT ... FOR UPDATE`) inside an ACID transaction to prevent overselling inventory.
   - Cancellation restores seat availability and computes refunds (85% refund policy) in a single atomic commit.
   - Pre-computed database views (`vw_active_flights`, `vw_revenue_summary`) for rapid queries.
