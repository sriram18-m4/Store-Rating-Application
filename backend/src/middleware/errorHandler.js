const ApiError = require('../utils/apiError');

const notFound = (req, _res, next) => {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
};

const errorHandler = (error, _req, res, _next) => {
  const isOperationalError = error instanceof ApiError;
  let statusCode = isOperationalError ? error.statusCode : 500;
  let message = isOperationalError ? error.message : 'Internal server error';
  let details = isOperationalError ? error.details : null;

  if (error.code === '23505') {
    statusCode = 409;
    message = 'A record with the provided unique value already exists';
  }

  if (error.code === '23503') {
    statusCode = 400;
    message = 'Referenced record does not exist';
  }

  if (error.code === '22P02') {
    statusCode = 400;
    message = 'Invalid identifier format';
  }

  if (error.code === '28P01' || error.message?.includes('client password must be a string')) {
    statusCode = 503;
    message = 'Database authentication failed. Update backend/.env DATABASE_URL with your PostgreSQL username and password.';
  }

  if (error.code === '3D000') {
    statusCode = 503;
    message = 'Database does not exist. Create store_rating_app and run the schema and seed SQL scripts.';
  }

  if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
    statusCode = 503;
    message = 'Database connection failed. Confirm PostgreSQL is running and DATABASE_URL is correct.';
  }

  if (process.env.NODE_ENV !== 'production' && statusCode === 500) {
    details = 'Check the backend terminal logs for server details.';
    console.error(error);
  }

  res.status(statusCode).json({
    message,
    details
  });
};

module.exports = {
  notFound,
  errorHandler
};
