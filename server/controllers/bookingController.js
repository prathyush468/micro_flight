const Booking = require('../models/Booking');
const { sendSuccess, sendError } = require('../utils/responseHelper');

/**
 * Create a new Flight Booking with Simulated Payment and ACID Seat Reservation
 */
const createBooking = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { flightId, passengers, paymentMethod = 'card', tripType = 'one-way' } = req.body;

    if (!flightId) {
      return sendError(res, 'Flight ID is required', 400);
    }

    if (!passengers || !Array.isArray(passengers) || passengers.length === 0) {
      return sendError(res, 'At least one passenger must be provided', 400);
    }

    // Validate passenger individual details
    for (let i = 0; i < passengers.length; i++) {
      const p = passengers[i];
      if (!p.fullName || p.fullName.trim().length < 2) {
        return sendError(res, `Passenger #${i + 1} must have a valid full name`, 400);
      }
    }

    const validPaymentMethods = ['card', 'upi', 'netbanking'];
    if (!validPaymentMethods.includes(paymentMethod)) {
      return sendError(res, `Payment method must be one of: ${validPaymentMethods.join(', ')}`, 400);
    }

    // Execute atomic transaction
    const bookingResult = await Booking.createBookingTransaction({
      userId,
      flightId: parseInt(flightId, 10),
      passengers,
      paymentMethod,
      tripType
    });

    // Retrieve complete booking ticket data
    const completeTicket = await Booking.findByPnr(bookingResult.pnr);

    return sendSuccess(
      res,
      completeTicket,
      'Reservation confirmed! Simulated payment succeeded and ticket generated.',
      201
    );
  } catch (error) {
    console.error('[BookingController.createBooking] Transaction Error:', error.message);
    return sendError(res, error.message || 'Failed to complete booking reservation', 400);
  }
};

/**
 * Retrieve bookings for the authenticated user
 */
const getMyBookings = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { status } = req.query;

    const bookings = await Booking.findByUserId(userId, status);
    return sendSuccess(res, bookings, 'User bookings retrieved successfully');
  } catch (error) {
    console.error('[BookingController.getMyBookings] Error:', error);
    return sendError(res, 'Failed to fetch your bookings history', 500);
  }
};

/**
 * Get booking details by ID or PNR
 */
const getBookingDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.user_id;
    const isAdmin = req.user.role === 'admin';

    let booking = null;
    // Check if id is numeric ID or PNR
    if (/^\d+$/.test(id)) {
      booking = await Booking.findById(parseInt(id, 10));
    } else {
      booking = await Booking.findByPnr(id);
    }

    if (!booking) {
      return sendError(res, 'Booking reservation not found', 404);
    }

    // Role-based authorization: Only owner or admin can access booking details
    if (!isAdmin && booking.user_id !== userId) {
      return sendError(res, 'Access denied. You do not have permission to view this ticket.', 403);
    }

    return sendSuccess(res, booking, 'Booking details retrieved successfully');
  } catch (error) {
    console.error('[BookingController.getBookingDetails] Error:', error);
    return sendError(res, 'Failed to retrieve booking information', 500);
  }
};

/**
 * Cancel an existing reservation with refund calculation and seat inventory restoration
 */
const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.user_id;
    const isAdmin = req.user.role === 'admin';
    const { reason = 'Passenger requested cancellation' } = req.body;

    let bookingId = parseInt(id, 10);
    if (isNaN(bookingId)) {
      const found = await Booking.findByPnr(id);
      if (!found) {
        return sendError(res, 'Booking reservation not found', 404);
      }
      bookingId = found.booking_id;
    }

    const cancelResult = await Booking.cancelBookingTransaction({
      bookingId,
      userId,
      isAdmin,
      reason
    });

    const updatedBooking = await Booking.findById(bookingId);

    return sendSuccess(
      res,
      {
        ...cancelResult,
        booking: updatedBooking
      },
      `Booking ${cancelResult.pnr} cancelled successfully. Refund of ₹${cancelResult.refundAmount.toLocaleString()} has been processed.`
    );
  } catch (error) {
    console.error('[BookingController.cancelBooking] Error:', error.message);
    return sendError(res, error.message || 'Failed to cancel reservation', 400);
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getBookingDetails,
  cancelBooking
};
