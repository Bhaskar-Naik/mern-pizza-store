// backend/middleware/errorHandler.js

const errorHandler = (err, req, res, next) => {

  // Default error values
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;

  // ─────────────────────────────
  // Mongoose Bad ObjectId Error
  // ─────────────────────────────
  if (err.name === 'CastError') {
    message = `Resource not found with id of ${err.value}`;
    statusCode = 404;
  }

  // ─────────────────────────────
  // Mongoose Duplicate Key Error
  // ─────────────────────────────
  if (err.code === 11000) {
    message = 'Duplicate field value entered';
    statusCode = 400;
  }

  // ─────────────────────────────
  // Mongoose Validation Error
  // ─────────────────────────────
  if (err.name === 'ValidationError') {
    message = Object.values(err.errors)
      .map(val => val.message)
      .join(', ');
    statusCode = 400;
  }

  // ─────────────────────────────
  // Send Error Response
  // ─────────────────────────────
  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
};

module.exports = errorHandler;
