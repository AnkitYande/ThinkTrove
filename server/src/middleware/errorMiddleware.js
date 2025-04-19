/**
 * Error handling middleware registration
 */
import { errorHandler } from '../utils/errors.js';

/**
 * Register error handling middleware with the Express app
 * @param {Object} app - Express application instance
 */
export const registerErrorHandlers = (app) => {
  // This middleware should be registered last
  app.use(errorHandler);
  
  // Handle 404 errors for routes that don't exist
  app.use('*', (req, res) => {
    res.status(404).json({
      error: true,
      message: `Route not found: ${req.originalUrl}`
    });
  });
}; 