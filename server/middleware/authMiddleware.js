const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');
const { sendError } = require('../utils/responseHelper');

/**
 * Middleware: Verify JWT access token and attach authenticated user to request
 */
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 'Authorization token missing or malformed', 401);
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET || 'skybook_secret_key_default';

    let decoded;
    try {
      decoded = jwt.verify(token, secret);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return sendError(res, 'Session token expired. Please login again.', 401);
      }
      return sendError(res, 'Invalid authorization token', 401);
    }

    // Verify user still exists in database
    const [rows] = await pool.execute(
      'SELECT user_id, full_name, email, phone, role FROM users WHERE user_id = ?',
      [decoded.userId]
    );

    if (rows.length === 0) {
      return sendError(res, 'User associated with this token no longer exists', 401);
    }

    req.user = rows[0];
    next();
  } catch (error) {
    console.error('[AuthMiddleware] Error:', error);
    return sendError(res, 'Internal authentication error', 500);
  }
};

/**
 * Middleware: Enforce Administrator role
 */
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return sendError(res, 'Access forbidden. Administrator role required.', 403);
  }
  next();
};

/**
 * Middleware: Optional authentication (attaches user if token is present, proceeds anyway if not)
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const secret = process.env.JWT_SECRET || 'skybook_secret_key_default';
      const decoded = jwt.verify(token, secret);
      const [rows] = await pool.execute(
        'SELECT user_id, full_name, email, phone, role FROM users WHERE user_id = ?',
        [decoded.userId]
      );
      if (rows.length > 0) {
        req.user = rows[0];
      }
    }
  } catch (e) {
    // Ignore invalid tokens for optional endpoints
  }
  next();
};

module.exports = {
  verifyToken,
  requireAdmin,
  optionalAuth
};
