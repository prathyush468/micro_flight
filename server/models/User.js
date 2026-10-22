const { pool } = require('../config/database');

class User {
  static async findByEmail(email) {
    const [rows] = await pool.execute(
      'SELECT user_id, full_name, email, phone, password_hash, role, created_at FROM users WHERE email = ?',
      [email.toLowerCase().trim()]
    );
    return rows[0] || null;
  }

  static async findById(userId) {
    const [rows] = await pool.execute(
      'SELECT user_id, full_name, email, phone, role, created_at FROM users WHERE user_id = ?',
      [userId]
    );
    return rows[0] || null;
  }

  static async create({ fullName, email, phone, passwordHash, role = 'passenger' }) {
    const [result] = await pool.execute(
      'INSERT INTO users (full_name, email, phone, password_hash, role) VALUES (?, ?, ?, ?, ?)',
      [fullName.trim(), email.toLowerCase().trim(), phone.trim(), passwordHash, role]
    );
    return {
      userId: result.insertId,
      fullName,
      email: email.toLowerCase().trim(),
      phone,
      role
    };
  }

  static async getAllUsers() {
    const [rows] = await pool.execute(
      `SELECT user_id, full_name, email, phone, role, created_at,
              (SELECT COUNT(*) FROM bookings b WHERE b.user_id = users.user_id) AS total_bookings
       FROM users
       ORDER BY created_at DESC`
    );
    return rows;
  }
}

module.exports = User;
