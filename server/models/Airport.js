const { pool } = require('../config/database');

class Airport {
  static async findAll(activeOnly = true) {
    const query = activeOnly 
      ? 'SELECT * FROM airports WHERE is_active = TRUE ORDER BY city ASC'
      : 'SELECT * FROM airports ORDER BY city ASC';
    const [rows] = await pool.execute(query);
    return rows;
  }

  static async findById(airportId) {
    const [rows] = await pool.execute('SELECT * FROM airports WHERE airport_id = ?', [airportId]);
    return rows[0] || null;
  }

  static async findByCode(code) {
    const [rows] = await pool.execute('SELECT * FROM airports WHERE airport_code = ?', [code.toUpperCase().trim()]);
    return rows[0] || null;
  }

  static async create({ airportCode, airportName, city, country = 'India' }) {
    const [result] = await pool.execute(
      'INSERT INTO airports (airport_code, airport_name, city, country) VALUES (?, ?, ?, ?)',
      [airportCode.toUpperCase().trim(), airportName.trim(), city.trim(), country.trim()]
    );
    return {
      airportId: result.insertId,
      airportCode: airportCode.toUpperCase().trim(),
      airportName,
      city,
      country
    };
  }

  static async update(airportId, { airportCode, airportName, city, country, isActive }) {
    const [result] = await pool.execute(
      `UPDATE airports 
       SET airport_code = ?, airport_name = ?, city = ?, country = ?, is_active = ?
       WHERE airport_id = ?`,
      [airportCode.toUpperCase().trim(), airportName.trim(), city.trim(), country.trim(), isActive ? 1 : 0, airportId]
    );
    return result.affectedRows > 0;
  }
}

module.exports = Airport;
