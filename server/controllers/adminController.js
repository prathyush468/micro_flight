const { pool } = require('../config/database');
const Booking = require('../models/Booking');
const User = require('../models/User');
const Airport = require('../models/Airport');
const { sendSuccess, sendError } = require('../utils/responseHelper');

/**
 * Get Comprehensive Admin Dashboard Statistics and KPIs
 */
const getDashboardStats = async (req, res) => {
  try {
    // 1. Metric Counts
    const [[flightsCount]] = await pool.execute('SELECT COUNT(*) AS total_flights FROM flights');
    const [[usersCount]] = await pool.execute('SELECT COUNT(*) AS total_passengers FROM users WHERE role = "passenger"');
    const [[bookingsCount]] = await pool.execute('SELECT COUNT(*) AS total_bookings FROM bookings');
    const [[confirmedCount]] = await pool.execute('SELECT COUNT(*) AS confirmed_bookings FROM bookings WHERE booking_status = "confirmed"');
    const [[cancelledCount]] = await pool.execute('SELECT COUNT(*) AS cancelled_bookings FROM bookings WHERE booking_status = "cancelled"');
    const [[revenueResult]] = await pool.execute(
      'SELECT COALESCE(SUM(total_amount), 0) AS total_revenue FROM bookings WHERE booking_status = "confirmed"'
    );
    const [[refundResult]] = await pool.execute(
      'SELECT COALESCE(SUM(refund_amount), 0) AS total_refunded FROM cancellations'
    );

    // 2. Recent Bookings (Latest 5)
    const [recentBookings] = await pool.execute(
      `SELECT 
        b.booking_id,
        b.pnr,
        b.booking_date,
        b.total_amount,
        b.booking_status,
        u.full_name AS customer_name,
        f.flight_number,
        orig.airport_code AS origin,
        dest.airport_code AS destination
      FROM bookings b
      JOIN users u ON b.user_id = u.user_id
      JOIN flights f ON b.flight_id = f.flight_id
      JOIN airports orig ON f.origin_airport_id = orig.airport_id
      JOIN airports dest ON f.destination_airport_id = dest.airport_id
      ORDER BY b.booking_date DESC
      LIMIT 5`
    );

    // 3. Airline Revenue Breakdown
    const [airlineRevenue] = await pool.execute('SELECT * FROM vw_revenue_summary');

    // 4. Flight Status Distribution
    const [statusDistribution] = await pool.execute(
      'SELECT status, COUNT(*) AS count FROM flights GROUP BY status'
    );

    // 5. Popular Routes
    const [popularRoutes] = await pool.execute(
      `SELECT 
        CONCAT(orig.city, ' (', orig.airport_code, ') → ', dest.city, ' (', dest.airport_code, ')') AS route,
        COUNT(b.booking_id) AS bookings_count,
        COALESCE(SUM(b.total_amount), 0) AS revenue
      FROM bookings b
      JOIN flights f ON b.flight_id = f.flight_id
      JOIN airports orig ON f.origin_airport_id = orig.airport_id
      JOIN airports dest ON f.destination_airport_id = dest.airport_id
      WHERE b.booking_status = 'confirmed'
      GROUP BY f.origin_airport_id, f.destination_airport_id, route
      ORDER BY bookings_count DESC
      LIMIT 5`
    );

    return sendSuccess(
      res,
      {
        metrics: {
          totalFlights: flightsCount.total_flights,
          totalPassengers: usersCount.total_passengers,
          totalBookings: bookingsCount.total_bookings,
          confirmedBookings: confirmedCount.confirmed_bookings,
          cancelledBookings: cancelledCount.cancelled_bookings,
          totalRevenue: Number(revenueResult.total_revenue),
          totalRefunded: Number(refundResult.total_refunded)
        },
        recentBookings,
        airlineRevenue,
        statusDistribution,
        popularRoutes
      },
      'Dashboard metrics retrieved successfully'
    );
  } catch (error) {
    console.error('[AdminController.getDashboardStats] Error:', error);
    return sendError(res, 'Failed to compile dashboard statistics', 500);
  }
};

/**
 * Get all Bookings with filters for Admin
 */
const getAllBookings = async (req, res) => {
  try {
    const { search, status } = req.query;
    const bookings = await Booking.findAllAdmin({ search, status });
    return sendSuccess(res, bookings, 'All bookings retrieved successfully');
  } catch (error) {
    console.error('[AdminController.getAllBookings] Error:', error);
    return sendError(res, 'Failed to fetch bookings', 500);
  }
};

/**
 * Get all Registered Users for Admin
 */
const getAllUsers = async (req, res) => {
  try {
    const users = await User.getAllUsers();
    return sendSuccess(res, users, 'Users retrieved successfully');
  } catch (error) {
    console.error('[AdminController.getAllUsers] Error:', error);
    return sendError(res, 'Failed to fetch user directory', 500);
  }
};

/**
 * Create a new Airport (Admin)
 */
const createAirport = async (req, res) => {
  try {
    const { airportCode, airportName, city, country } = req.body;

    if (!airportCode || !airportName || !city) {
      return sendError(res, 'Airport code, name, and city are required', 400);
    }

    const existing = await Airport.findByCode(airportCode);
    if (existing) {
      return sendError(res, `Airport with code ${airportCode.toUpperCase()} already exists`, 409);
    }

    const newAirport = await Airport.create({ airportCode, airportName, city, country });
    return sendSuccess(res, newAirport, 'Airport created successfully', 201);
  } catch (error) {
    console.error('[AdminController.createAirport] Error:', error);
    return sendError(res, 'Failed to create airport', 500);
  }
};

/**
 * Update an Airport (Admin)
 */
const updateAirport = async (req, res) => {
  try {
    const { id } = req.params;
    const { airportCode, airportName, city, country, isActive } = req.body;

    const existing = await Airport.findById(id);
    if (!existing) {
      return sendError(res, 'Airport not found', 404);
    }

    await Airport.update(id, {
      airportCode: airportCode || existing.airport_code,
      airportName: airportName || existing.airport_name,
      city: city || existing.city,
      country: country || existing.country,
      isActive: isActive !== undefined ? isActive : existing.is_active
    });

    const updated = await Airport.findById(id);
    return sendSuccess(res, updated, 'Airport updated successfully');
  } catch (error) {
    console.error('[AdminController.updateAirport] Error:', error);
    return sendError(res, 'Failed to update airport', 500);
  }
};

module.exports = {
  getDashboardStats,
  getAllBookings,
  getAllUsers,
  createAirport,
  updateAirport
};
