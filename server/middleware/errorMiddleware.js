const { sendError } = require('../utils/responseHelper');

/**
 * 404 Route Not Found Handler
 */
const notFoundHandler = (req, res, next) => {
  return sendError(res, `API route not found: ${req.method} ${req.originalUrl}`, 404);
};

/**
 * Global Error Handler
 */
const errorHandler = (err, req, res, next) => {
  console.error('[GlobalErrorHandler] Exception caught:', err.stack || err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  return sendError(
    res,
    message,
    statusCode,
    process.env.NODE_ENV === 'development' ? err.stack : null
  );
};

module.exports = {
  notFoundHandler,
  errorHandler
};
