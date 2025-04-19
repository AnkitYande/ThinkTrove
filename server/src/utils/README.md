# Error Handling in ThinkTrove API

This document outlines the error handling approach used in the ThinkTrove API.

## Error Utilities

The `errors.js` file provides a standardized way to handle errors across the application, ensuring consistent error responses and proper error logging.

### Error Types

We use a custom `ApiError` class that extends the native JavaScript `Error` class with additional properties:

- `statusCode`: The HTTP status code to return in the response
- `isOperational`: Indicates if the error is expected (operational) or unexpected (programming error)

### Pre-defined Error Creators

For convenience, we provide several functions to create common error types:

- `badRequest(message)`: 400 Bad Request
- `unauthorized(message)`: 401 Unauthorized
- `forbidden(message)`: 403 Forbidden
- `notFound(message)`: 404 Not Found
- `tooManyRequests(message)`: 429 Too Many Requests
- `serverError(message)`: 500 Internal Server Error
- `badGateway(message)`: 502 Bad Gateway

### Error Handling Middleware

The `errorHandler` middleware function:
1. Logs detailed error information
2. Determines the appropriate HTTP status code
3. Returns a standardized JSON response
4. Includes stack traces in development mode for non-operational errors

## Using Error Handling

### In Route Handlers

```javascript
import { badRequest, notFound } from '../utils/errors.js';

// Example route handler
router.get('/:id', async (req, res, next) => {
  try {
    const item = await findById(req.params.id);
    
    if (!item) {
      // Pass the error to Express's error handling chain
      return next(notFound('Item not found'));
    }
    
    res.json(item);
  } catch (error) {
    // For unexpected errors, pass to the error handler
    next(error);
  }
});
```

### Registration

The error handling middleware is registered in the main application file after all routes:

```javascript
import { registerErrorHandlers } from './middleware/errorMiddleware.js';

// After all route registrations
registerErrorHandlers(app);
```

## Error Response Format

All error responses follow a standard JSON format:

```json
{
  "error": true,
  "message": "Error message explaining what went wrong"
}
```

In development mode, non-operational errors also include a `stack` property with the error stack trace. 