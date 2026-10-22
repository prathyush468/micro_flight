const { pool } = require('../config/database');
const { generatePNR, generateTxnRef } = require('../utils/pnrGenerator');

class Booking {
  /**
   * Execute ACID Transaction: Seat reservation, booking creation, passenger recording, and payment confirmation
   */
  static async createBookingTransaction({
    userId,
    flightId,
    passengers,
    paymentMethod = 'card',
    tripType = 'one-way'
  }) {
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      const passengerCount = passengers.length;
      if (passengerCount <= 0 || passengerCount > 9) {
        throw new Error('Passenger count must be between 1 and 9');
      }

      // Step 1: Lock flight row to check seat inventory atomically under concurrency
      const [flightRows] = await connection.execute(
        `SELECT flight_id, flight_number, airline_name, base_fare, total_seats, available_seats, status, departure_time
         FROM flights 
         WHERE flight_id = ? 
         FOR UPDATE`,
        [flightId]
      );

      if (flightRows.length === 0) {
        throw new Error('Selected flight does not exist');
      }

      const flight = flightRows[0];

      if (flight.status !== 'scheduled') {
        throw new Error(`Flight ${flight.flight_number} is currently ${flight.status} and cannot be booked`);
      }

      if (new Date(flight.departure_time) <= new Date()) {
        throw new Error('Cannot book a flight that has already departed');
      }

      if (flight.available_seats < passengerCount) {
        throw new Error(
          `Insufficient seats available. Requested: ${passengerCount}, Available: ${flight.available_seats}`
        );
      }

      // Step 2: Calculate server-verified total fare
      const baseSubtotal = Number(flight.base_fare) * passengerCount;
      const taxesAndFees = Math.round(baseSubtotal * 0.12 * 100) / 100; // 12% aviation GST & airport charges
      const totalAmount = baseSubtotal + taxesAndFees;

      // Step 3: Deduct seat inventory conditionally
      const [updateFlightResult] = await connection.execute(
        `UPDATE flights 
         SET available_seats = available_seats - ? 
         WHERE flight_id = ? AND available_seats >= ?`,
        [passengerCount, flightId, passengerCount]
      );

      if (updateFlightResult.affectedRows === 0) {
        throw new Error('Seat allocation conflict occurred. Please retry.');
      }

      // Step 4: Generate unique PNR
      let pnr = generatePNR();
      // Ensure PNR uniqueness
      let [existingPnr] = await connection.execute('SELECT booking_id FROM bookings WHERE pnr = ?', [pnr]);
      while (existingPnr.length > 0) {
        pnr = generatePNR();
        [existingPnr] = await connection.execute('SELECT booking_id FROM bookings WHERE pnr = ?', [pnr]);
      }

      // Step 5: Insert Booking record (Confirmed upon simulated payment)
      const [bookingResult] = await connection.execute(
        `INSERT INTO bookings 
          (pnr, user_id, flight_id, passenger_count, total_amount, booking_status, trip_type)
         VALUES (?, ?, ?, ?, ?, 'confirmed', ?)`,
        [pnr, userId, flightId, passengerCount, totalAmount, tripType]
      );

      const bookingId = bookingResult.insertId;

      // Step 6: Insert Passenger records
      for (let i = 0; i < passengers.length; i++) {
        const p = passengers[i];
        // Assign sample seat number (e.g. row 12A, 12B, etc.)
        const seatNum = p.seatNumber || `${10 + Math.floor(i / 6)}${String.fromCharCode(65 + (i % 6))}`;
        await connection.execute(
          `INSERT INTO passengers 
            (booking_id, full_name, date_of_birth, passenger_type, seat_number, gender)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            bookingId,
            p.fullName.trim(),
            p.dateOfBirth || null,
            p.passengerType || 'adult',
            seatNum,
            p.gender || 'male'
          ]
        );
      }

      // Step 7: Insert Simulated Payment record (Successful)
      const txnRef = generateTxnRef();
      await connection.execute(
        `INSERT INTO payments 
          (booking_id, amount, payment_method, payment_status, transaction_reference)
         VALUES (?, ?, ?, 'success', ?)`,
        [bookingId, totalAmount, paymentMethod, txnRef]
      );

      // Commit the ACID transaction
      await connection.commit();

      return {
        bookingId,
        pnr,
        totalAmount,
        passengerCount,
        transactionReference: txnRef,
        flightNumber: flight.flight_number,
        airlineName: flight.airline_name
      };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Execute ACID Transaction: Booking Cancellation, Refund Calculation, and Seat Inventory Restoration
   */
  static async cancelBookingTransaction({ bookingId, userId, isAdmin = false, reason = 'Customer request' }) {
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // Step 1: Select booking with row lock
      const [bookingRows] = await connection.execute(
        `SELECT b.booking_id, b.pnr, b.user_id, b.flight_id, b.passenger_count, b.total_amount, b.booking_status,
                f.departure_time, f.flight_number
         FROM bookings b
         JOIN flights f ON b.flight_id = f.flight_id
         WHERE b.booking_id = ?
         FOR UPDATE`,
        [bookingId]
      );

      if (bookingRows.length === 0) {
        throw new Error('Booking not found');
      }

      const booking = bookingRows[0];

      // Authorization check: User must own the booking unless Admin
      if (!isAdmin && booking.user_id !== userId) {
        throw new Error('Unauthorized: You do not own this reservation');
      }

      // Prevent duplicate cancellation
      if (booking.booking_status === 'cancelled') {
        throw new Error('Booking is already cancelled. Repeated cancellation is prohibited.');
      }

      if (booking.booking_status !== 'confirmed') {
        throw new Error(`Cannot cancel booking with status: ${booking.booking_status}`);
      }

      // Check flight departure time: Cannot cancel departed flight
      const flightDeparture = new Date(booking.departure_time);
      if (flightDeparture <= new Date()) {
        throw new Error('Cannot cancel a reservation for a flight that has already departed');
      }

      // Step 2: Compute refund amount based on cancellation policy
      // 85% refund if cancelled before departure (15% standard airline cancellation charge)
      const refundRate = 0.85;
      const refundAmount = Math.round(Number(booking.total_amount) * refundRate * 100) / 100;

      // Step 3: Update booking status to cancelled
      await connection.execute(
        'UPDATE bookings SET booking_status = ? WHERE booking_id = ?',
        ['cancelled', bookingId]
      );

      // Step 4: Restore seat inventory to the flight
      await connection.execute(
        'UPDATE flights SET available_seats = available_seats + ? WHERE flight_id = ?',
        [booking.passenger_count, booking.flight_id]
      );

      // Step 5: Insert cancellation audit record
      await connection.execute(
        `INSERT INTO cancellations 
          (booking_id, cancellation_reason, refund_status, refund_amount)
         VALUES (?, ?, 'processed', ?)`,
        [bookingId, reason, refundAmount]
      );

      // Step 6: Update payment status to refunded
      await connection.execute(
        'UPDATE payments SET payment_status = ? WHERE booking_id = ?',
        ['refunded', bookingId]
      );

      await connection.commit();

      return {
        bookingId,
        pnr: booking.pnr,
        refundAmount,
        seatsReleased: booking.passenger_count,
        status: 'cancelled'
      };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Retrieve complete booking details by PNR (used for Ticket and Confirmation)
   */
  static async findByPnr(pnr) {
    const [bookingRows] = await pool.execute(
      `SELECT 
        b.booking_id,
        b.pnr,
        b.user_id,
        u.full_name AS customer_name,
        u.email AS customer_email,
        u.phone AS customer_phone,
        b.booking_date,
        b.passenger_count,
        b.total_amount,
        b.booking_status,
        b.trip_type,
        f.flight_id,
        f.flight_number,
        f.airline_name,
        orig.airport_code AS origin_code,
        orig.airport_name AS origin_name,
        orig.city AS origin_city,
        dest.airport_code AS destination_code,
        dest.airport_name AS destination_name,
        dest.city AS destination_city,
        f.departure_time,
        f.arrival_time,
        f.base_fare,
        pay.payment_id,
        pay.payment_method,
        pay.payment_status,
        pay.transaction_reference,
        pay.payment_date,
        c.cancellation_id,
        c.cancellation_date,
        c.cancellation_reason,
        c.refund_amount,
        c.refund_status
      FROM bookings b
      JOIN users u ON b.user_id = u.user_id
      JOIN flights f ON b.flight_id = f.flight_id
      JOIN airports orig ON f.origin_airport_id = orig.airport_id
      JOIN airports dest ON f.destination_airport_id = dest.airport_id
      LEFT JOIN payments pay ON b.booking_id = pay.booking_id
      LEFT JOIN cancellations c ON b.booking_id = c.booking_id
      WHERE b.pnr = ?`,
      [pnr.toUpperCase().trim()]
    );

    if (bookingRows.length === 0) return null;

    const booking = bookingRows[0];

    // Fetch passengers
    const [passengers] = await pool.execute(
      'SELECT passenger_id, full_name, date_of_birth, passenger_type, seat_number, gender FROM passengers WHERE booking_id = ?',
      [booking.booking_id]
    );

    booking.passengers = passengers;
    return booking;
  }

  /**
   * Retrieve complete booking details by ID
   */
  static async findById(bookingId) {
    const [bookingRows] = await pool.execute(
      `SELECT 
        b.booking_id,
        b.pnr,
        b.user_id,
        u.full_name AS customer_name,
        u.email AS customer_email,
        u.phone AS customer_phone,
        b.booking_date,
        b.passenger_count,
        b.total_amount,
        b.booking_status,
        b.trip_type,
        f.flight_id,
        f.flight_number,
        f.airline_name,
        orig.airport_code AS origin_code,
        orig.airport_name AS origin_name,
        orig.city AS origin_city,
        dest.airport_code AS destination_code,
        dest.airport_name AS destination_name,
        dest.city AS destination_city,
        f.departure_time,
        f.arrival_time,
        f.base_fare,
        pay.payment_id,
        pay.payment_method,
        pay.payment_status,
        pay.transaction_reference,
        pay.payment_date,
        c.cancellation_id,
        c.cancellation_date,
        c.cancellation_reason,
        c.refund_amount,
        c.refund_status
      FROM bookings b
      JOIN users u ON b.user_id = u.user_id
      JOIN flights f ON b.flight_id = f.flight_id
      JOIN airports orig ON f.origin_airport_id = orig.airport_id
      JOIN airports dest ON f.destination_airport_id = dest.airport_id
      LEFT JOIN payments pay ON b.booking_id = pay.booking_id
      LEFT JOIN cancellations c ON b.booking_id = c.booking_id
      WHERE b.booking_id = ?`,
      [bookingId]
    );

    if (bookingRows.length === 0) return null;

    const booking = bookingRows[0];
    const [passengers] = await pool.execute(
      'SELECT passenger_id, full_name, date_of_birth, passenger_type, seat_number, gender FROM passengers WHERE booking_id = ?',
      [booking.booking_id]
    );
    booking.passengers = passengers;
    return booking;
  }

  /**
   * Retrieve user bookings list
   */
  static async findByUserId(userId, statusFilter = null) {
    let sql = `
      SELECT 
        b.booking_id,
        b.pnr,
        b.booking_date,
        b.passenger_count,
        b.total_amount,
        b.booking_status,
        b.trip_type,
        f.flight_id,
        f.flight_number,
        f.airline_name,
        orig.airport_code AS origin_code,
        orig.city AS origin_city,
        dest.airport_code AS destination_code,
        dest.city AS destination_city,
        f.departure_time,
        f.arrival_time,
        c.refund_amount
      FROM bookings b
      JOIN flights f ON b.flight_id = f.flight_id
      JOIN airports orig ON f.origin_airport_id = orig.airport_id
      JOIN airports dest ON f.destination_airport_id = dest.airport_id
      LEFT JOIN cancellations c ON b.booking_id = c.booking_id
      WHERE b.user_id = ?
    `;

    const params = [userId];

    if (statusFilter) {
      sql += ' AND b.booking_status = ?';
      params.push(statusFilter);
    }

    sql += ' ORDER BY b.booking_date DESC';

    const [rows] = await pool.execute(sql, params);
    return rows;
  }

  /**
   * Retrieve all bookings for Admin with filters and pagination
   */
  static async findAllAdmin({ search = null, status = null } = {}) {
    let sql = `
      SELECT 
        b.booking_id,
        b.pnr,
        b.booking_date,
        b.passenger_count,
        b.total_amount,
        b.booking_status,
        u.full_name AS customer_name,
        u.email AS customer_email,
        f.flight_number,
        f.airline_name,
        orig.airport_code AS origin_code,
        dest.airport_code AS destination_code,
        f.departure_time,
        pay.payment_method,
        pay.payment_status
      FROM bookings b
      JOIN users u ON b.user_id = u.user_id
      JOIN flights f ON b.flight_id = f.flight_id
      JOIN airports orig ON f.origin_airport_id = orig.airport_id
      JOIN airports dest ON f.destination_airport_id = dest.airport_id
      LEFT JOIN payments pay ON b.booking_id = pay.booking_id
      WHERE 1=1
    `;

    const params = [];

    if (status) {
      sql += ' AND b.booking_status = ?';
      params.push(status);
    }

    if (search) {
      sql += ' AND (b.pnr LIKE ? OR u.full_name LIKE ? OR u.email LIKE ? OR f.flight_number LIKE ?)';
      const s = `%${search.trim()}%`;
      params.push(s, s, s, s);
    }

    sql += ' ORDER BY b.booking_date DESC';

    const [rows] = await pool.execute(sql, params);
    return rows;
  }
}

module.exports = Booking;
