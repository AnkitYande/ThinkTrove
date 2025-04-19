/**
 * Error handling utilities for standardized API responses
 */

/**
 * Custom API error class
 */
export class ApiError extends Error {
  constructor(statusCode, message, isOperational = true, stack = '') {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/**
 * Create a bad request error (400)
 */
export const badRequest = (message = 'Bad Request') => {
  return new ApiError(400, message);
};

/**
 * Create an unauthorized error (401)
 */
export const unauthorized = (message = 'Unauthorized') => {
  return new ApiError(401, message);
};

/**
 * Create a forbidden error (403)
 */
export const forbidden = (message = 'Forbidden') => {
  return new ApiError(403, message);
};

/**
 * Create a not found error (404)
 */
export const notFound = (message = 'Resource not found') => {
  return new ApiError(404, message);
};

/**
 * Create a too many requests error (429)
 */
export const tooManyRequests = (message = 'Too many requests') => {
  return new ApiError(429, message);
};

/**
 * Create a server error (500)
 */
export const serverError = (message = 'Internal Server Error') => {
  return new ApiError(500, message, false);
};

/**
 * Create a bad gateway error (502)
 */
export const badGateway = (message = 'Bad Gateway') => {
  return new ApiError(502, message, false);
};

/**
 * Error handler middleware for Express
 */
export const errorHandler = (err, req, res, next) => {
  // Log error
  console.error(`[${new Date().toISOString()}] Error:`, {
    message: err.message,
    url: req.originalUrl,
    method: req.method,
    stack: err.stack
  });

  // Default to 500 server error
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  const isOperational = err.isOperational !== undefined ? err.isOperational : false;

  // Send JSON response
  res.status(statusCode).json({
    error: true,
    message,
    // Include stack trace in development but not in production
    ...(process.env.NODE_ENV === 'development' && !isOperational && { stack: err.stack })
  });
}; 