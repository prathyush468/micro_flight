const crypto = require('crypto');

/**
 * Generate a unique 6-character PNR (Passenger Name Record)
 * Standard airline format: Alphanumeric uppercase (e.g., SK782A, SB901K)
 */
const generatePNR = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // removed confusing chars: O, 0, 1, I
  let result = 'SK'; // SkyBook prefix
  const bytes = crypto.randomBytes(4);
  for (let i = 0; i < 4; i++) {
    result += chars[bytes[i] % chars.length];
  }
  return result;
};

/**
 * Generate unique transaction reference for simulated payments
 */
const generateTxnRef = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const randomStr = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `TXN-SB-${timestamp}-${randomStr}`;
};

module.exports = {
  generatePNR,
  generateTxnRef
};
