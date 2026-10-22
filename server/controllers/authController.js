const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendSuccess, sendError } = require('../utils/responseHelper');

const generateToken = (user) => {
  const secret = process.env.JWT_SECRET || 'skybook_secret_key_default';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign(
    {
      userId: user.user_id,
      email: user.email,
      role: user.role
    },
    secret,
    { expiresIn }
  );
};

/**
 * Register a new Passenger account
 */
const register = async (req, res) => {
  try {
    const { fullName, email, phone, password, confirmPassword } = req.body;

    // Field validations
    if (!fullName || !email || !phone || !password) {
      return sendError(res, 'All fields are required', 400);
    }

    if (password.length < 6) {
      return sendError(res, 'Password must be at least 6 characters in length', 400);
    }

    if (confirmPassword && password !== confirmPassword) {
      return sendError(res, 'Password and confirmation password do not match', 400);
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return sendError(res, 'Invalid email address format', 400);
    }

    // Check for duplicate registration
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return sendError(res, 'An account with this email address already exists', 409);
    }

    // Secure password hashing
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      fullName,
      email,
      phone,
      passwordHash,
      role: 'passenger'
    });

    const token = generateToken({
      user_id: newUser.userId,
      email: newUser.email,
      role: newUser.role
    });

    return sendSuccess(
      res,
      {
        token,
        user: {
          userId: newUser.userId,
          fullName: newUser.fullName,
          email: newUser.email,
          phone: newUser.phone,
          role: newUser.role
        }
      },
      'Registration successful! Welcome to SkyBook.',
      201
    );
  } catch (error) {
    console.error('[AuthController.register] Error:', error);
    return sendError(res, 'Failed to complete registration. Please try again.', 500);
  }
};

/**
 * Login user (Passenger or Admin)
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendError(res, 'Email and password are required', 400);
    }

    const user = await User.findByEmail(email);
    if (!user) {
      return sendError(res, 'Invalid email or password credentials', 401);
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return sendError(res, 'Invalid email or password credentials', 401);
    }

    const token = generateToken(user);

    return sendSuccess(
      res,
      {
        token,
        user: {
          userId: user.user_id,
          fullName: user.full_name,
          email: user.email,
          phone: user.phone,
          role: user.role
        }
      },
      `Welcome back, ${user.full_name}!`
    );
  } catch (error) {
    console.error('[AuthController.login] Error:', error);
    return sendError(res, 'Login service encountered an error', 500);
  }
};

/**
 * Logout user
 */
const logout = async (req, res) => {
  return sendSuccess(res, null, 'Logged out successfully');
};

/**
 * Get current authenticated user profile
 */
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.user_id);
    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    return sendSuccess(res, {
      userId: user.user_id,
      fullName: user.full_name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      createdAt: user.created_at
    });
  } catch (error) {
    console.error('[AuthController.getMe] Error:', error);
    return sendError(res, 'Failed to retrieve user profile', 500);
  }
};

module.exports = {
  register,
  login,
  logout,
  getMe
};
