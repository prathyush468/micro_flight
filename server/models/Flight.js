const { pool } = require('../config/database');

class Flight {
  static async search({
    originCode,
    destCode,
    departureDate,
    passengerCount = 1,
    airline = null,
    minPrice = null,
    maxPrice = null,
    sortBy = 'base_fare',
    sortOrder = 'ASC'
  }) {
    let sql = `
      SELECT 
        f.flight_id,
        f.flight_number,
        f.airline_name,
        f.origin_airport_id,
        orig.airport_code AS origin_code,
        orig.airport_name AS origin_name,
        orig.city AS origin_city,
        f.destination_airport_id,
        dest.airport_code AS destination_code,
        dest.airport_name AS destination_name,
        dest.city AS destination_city,
        f.departure_time,
        f.arrival_time,
        TIMESTAMPDIFF(MINUTE, f.departure_time, f.arrival_time) AS duration_minutes,
        f.base_fare,
        f.total_seats,
        f.available_seats,
        f.status
      FROM flights f
      JOIN airports orig ON f.origin_airport_id = orig.airport_id
      JOIN airports dest ON f.destination_airport_id = dest.airport_id
      WHERE f.status = 'scheduled'
        AND orig.is_active = TRUE
        AND dest.is_active = TRUE
    `;

    const params = [];

    if (originCode) {
      sql += ' AND orig.airport_code = ?';
      params.push(originCode.toUpperCase().trim());
    }

    if (destCode) {
      sql += ' AND dest.airport_code = ?';
      params.push(destCode.toUpperCase().trim());
    }

    if (departureDate) {
      sql += ' AND DATE(f.departure_time) = ?';
      params.push(departureDate);
    } else {
      // By default only show future flights
      sql += ' AND f.departure_time >= NOW()';
    }

    if (passengerCount) {
      sql += ' AND f.available_seats >= ?';
      params.push(parseInt(passengerCount, 10));
    }

    if (airline) {
      sql += ' AND f.airline_name = ?';
      params.push(airline);
    }

    if (minPrice !== null && minPrice !== undefined && minPrice !== '') {
      sql += ' AND f.base_fare >= ?';
      params.push(parseFloat(minPrice));
    }

    if (maxPrice !== null && maxPrice !== undefined && maxPrice !== '') {
      sql += ' AND f.base_fare <= ?';
      params.push(parseFloat(maxPrice));
    }

    // Sorting
    const validSortCols = {
      price: 'f.base_fare',
      base_fare: 'f.base_fare',
      departure: 'f.departure_time',
      departure_time: 'f.departure_time',
      duration: 'duration_minutes'
    };

    const sortColumn = validSortCols[sortBy] || 'f.base_fare';
    const direction = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    sql += ` ORDER BY ${sortColumn} ${direction}`;

    const [rows] = await pool.execute(sql, params);
    return rows;
  }

  static async findById(flightId) {
    const sql = `
      SELECT 
        f.flight_id,
        f.flight_number,
        f.airline_name,
        f.origin_airport_id,
        orig.airport_code AS origin_code,
        orig.airport_name AS origin_name,
        orig.city AS origin_city,
        f.destination_airport_id,
        dest.airport_code AS destination_code,
        dest.airport_name AS destination_name,
        dest.city AS destination_city,
        f.departure_time,
        f.arrival_time,
        TIMESTAMPDIFF(MINUTE, f.departure_time, f.arrival_time) AS duration_minutes,
        f.base_fare,
        f.total_seats,
        f.available_seats,
        f.status,
        f.created_at,
        f.updated_at
      FROM flights f
      JOIN airports orig ON f.origin_airport_id = orig.airport_id
      JOIN airports dest ON f.destination_airport_id = dest.airport_id
      WHERE f.flight_id = ?
    `;
    const [rows] = await pool.execute(sql, [flightId]);
    return rows[0] || null;
  }

  static async create({
    flightNumber,
    airlineName,
    originAirportId,
    destinationAirportId,
    departureTime,
    arrivalTime,
    baseFare,
    totalSeats
  }) {
    const [result] = await pool.execute(
      `INSERT INTO flights 
        (flight_number, airline_name, origin_airport_id, destination_airport_id, departure_time, arrival_time, base_fare, total_seats, available_seats, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'scheduled')`,
      [
        flightNumber.toUpperCase().trim(),
        airlineName.trim(),
        originAirportId,
        destinationAirportId,
        departureTime,
        arrivalTime,
        parseFloat(baseFare),
        parseInt(totalSeats, 10),
        parseInt(totalSeats, 10) // initially all seats available
      ]
    );
    return result.insertId;
  }

  static async update(flightId, fields) {
    const allowed = [
      'flight_number',
      'airline_name',
      'origin_airport_id',
      'destination_airport_id',
      'departure_time',
      'arrival_time',
      'base_fare',
      'total_seats',
      'available_seats',
      'status'
    ];

    const updates = [];
    const values = [];

    for (const [key, val] of Object.entries(fields)) {
      if (allowed.includes(key) && val !== undefined) {
        updates.push(`${key} = ?`);
        values.push(val);
      }
    }

    if (updates.length === 0) return false;

    values.push(flightId);
    const sql = `UPDATE flights SET ${updates.join(', ')} WHERE flight_id = ?`;
    const [result] = await pool.execute(sql, values);
    return result.affectedRows > 0;
  }

  static async updateStatus(flightId, status) {
    const [result] = await pool.execute(
      'UPDATE flights SET status = ? WHERE flight_id = ?',
      [status, flightId]
    );
    return result.affectedRows > 0;
  }

  static async findAllAdmin({ status = null, airline = null } = {}) {
    let sql = `
      SELECT 
        f.flight_id,
        f.flight_number,
        f.airline_name,
        orig.airport_code AS origin_code,
        orig.city AS origin_city,
        dest.airport_code AS destination_code,
        dest.city AS destination_city,
        f.departure_time,
        f.arrival_time,
        f.base_fare,
        f.total_seats,
        f.available_seats,
        f.status,
        (SELECT COUNT(*) FROM bookings b WHERE b.flight_id = f.flight_id AND b.booking_status = 'confirmed') AS confirmed_bookings
      FROM flights f
      JOIN airports orig ON f.origin_airport_id = orig.airport_id
      JOIN airports dest ON f.destination_airport_id = dest.airport_id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      sql += ' AND f.status = ?';
      params.push(status);
    }
    if (airline) {
      sql += ' AND f.airline_name = ?';
      params.push(airline);
    }

    sql += ' ORDER BY f.departure_time DESC';

    const [rows] = await pool.execute(sql, params);
    return rows;
  }
}

module.exports = Flight;
