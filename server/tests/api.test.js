const { test, describe, before, after } = require('node:test');
const assert = require('node:assert');
const app = require('../app');
const { pool } = require('../config/database');

let server;
let baseUrl;
let passengerToken = '';
let adminToken = '';
let testBookingPnr = '';
let testBookingId = null;

before(async () => {
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://localhost:${port}`;
      resolve();
    });
  });
});

after(async () => {
  if (server) {
    server.close();
  }
  await pool.end();
});

describe('1. Health Check Endpoint', () => {
  test('GET /api/health returns 200 and healthy status', async () => {
    const res = await fetch(`${baseUrl}/api/health`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.status, 'healthy');
    assert.strictEqual(data.service, 'SkyBook Flight Reservation API');
  });
});

describe('2. Airports API', () => {
  test('GET /api/airports returns list of active airports', async () => {
    const res = await fetch(`${baseUrl}/api/airports`);
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.ok(Array.isArray(body.data));
    assert.ok(body.data.length >= 8);
    
    // Check required fields
    const first = body.data[0];
    assert.ok(first.airport_code);
    assert.ok(first.airport_name);
    assert.ok(first.city);
  });
});

describe('3. Flight Search API', () => {
  test('GET /api/flights?origin=COK&destination=BLR returns available flights', async () => {
    const res = await fetch(`${baseUrl}/api/flights?origin=COK&destination=BLR`);
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.ok(Array.isArray(body.data));
    assert.ok(body.data.length >= 1);
    
    const flight = body.data[0];
    assert.strictEqual(flight.origin_code, 'COK');
    assert.strictEqual(flight.destination_code, 'BLR');
    assert.ok(flight.base_fare > 0);
    assert.ok(flight.available_seats > 0);
  });

  test('GET /api/flights rejects identical origin and destination', async () => {
    const res = await fetch(`${baseUrl}/api/flights?origin=COK&destination=COK`);
    assert.strictEqual(res.status, 400);
    const body = await res.json();
    assert.strictEqual(body.success, false);
    assert.match(body.message, /Origin and Destination airports must be different/i);
  });
});

describe('4. Authentication API', () => {
  test('POST /api/auth/login succeeds for valid passenger credentials', async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'john.doe@example.com',
        password: 'User@123'
      })
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.ok(body.data.token);
    assert.strictEqual(body.data.user.role, 'passenger');
    passengerToken = body.data.token;
  });

  test('POST /api/auth/login rejects incorrect password', async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'john.doe@example.com',
        password: 'WrongPassword999'
      })
    });
    assert.strictEqual(res.status, 401);
    const body = await res.json();
    assert.strictEqual(body.success, false);
  });

  test('POST /api/auth/login succeeds for admin credentials', async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@skybook.com',
        password: 'Admin@123'
      })
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.ok(body.data.token);
    assert.strictEqual(body.data.user.role, 'admin');
    adminToken = body.data.token;
  });

  test('GET /api/auth/me returns authenticated user details', async () => {
    const res = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${passengerToken}` }
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.data.email, 'john.doe@example.com');
  });
});

describe('5. Booking & Transaction API', () => {
  test('POST /api/bookings successfully reserves seats with ACID transaction', async () => {
    const res = await fetch(`${baseUrl}/api/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${passengerToken}`
      },
      body: JSON.stringify({
        flightId: 1,
        passengers: [
          {
            fullName: 'Alexander Fleming',
            dateOfBirth: '1990-08-06',
            passengerType: 'adult',
            gender: 'male'
          }
        ],
        paymentMethod: 'upi',
        tripType: 'one-way'
      })
    });

    assert.strictEqual(res.status, 201);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.ok(body.data.pnr);
    assert.strictEqual(body.data.booking_status, 'confirmed');
    assert.strictEqual(body.data.passengers.length, 1);
    assert.strictEqual(body.data.passengers[0].full_name, 'Alexander Fleming');
    
    testBookingPnr = body.data.pnr;
    testBookingId = body.data.booking_id;
  });

  test('GET /api/bookings/:id retrieves the created booking ticket', async () => {
    const res = await fetch(`${baseUrl}/api/bookings/${testBookingPnr}`, {
      headers: { Authorization: `Bearer ${passengerToken}` }
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.data.pnr, testBookingPnr);
    assert.strictEqual(body.data.customer_email, 'john.doe@example.com');
  });

  test('POST /api/bookings/:id/cancel cancels reservation and calculates refund', async () => {
    const res = await fetch(`${baseUrl}/api/bookings/${testBookingId}/cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${passengerToken}`
      },
      body: JSON.stringify({ reason: 'Personal schedule change' })
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.data.status, 'cancelled');
    assert.ok(body.data.refundAmount > 0);
  });

  test('POST /api/bookings/:id/cancel fails if booking is already cancelled (idempotent safety)', async () => {
    const res = await fetch(`${baseUrl}/api/bookings/${testBookingId}/cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${passengerToken}`
      },
      body: JSON.stringify({ reason: 'Duplicate attempt' })
    });
    assert.strictEqual(res.status, 400);
    const body = await res.json();
    assert.strictEqual(body.success, false);
    assert.match(body.message, /already cancelled/i);
  });
});

describe('6. Admin Dashboard & Management API', () => {
  test('GET /api/admin/dashboard returns system aggregations and KPIs', async () => {
    const res = await fetch(`${baseUrl}/api/admin/dashboard`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.ok(body.data.metrics);
    assert.ok(body.data.metrics.totalFlights >= 16);
    assert.ok(body.data.metrics.totalPassengers >= 3);
    assert.ok(body.data.metrics.totalRevenue > 0);
    assert.ok(Array.isArray(body.data.recentBookings));
  });

  test('GET /api/admin/dashboard denies access to passenger role', async () => {
    const res = await fetch(`${baseUrl}/api/admin/dashboard`, {
      headers: { Authorization: `Bearer ${passengerToken}` }
    });
    assert.strictEqual(res.status, 403);
    const body = await res.json();
    assert.strictEqual(body.success, false);
  });
});
