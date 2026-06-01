const jwt = require('jsonwebtoken');
const { query } = require('../config/db');
const ApiError = require('../utils/apiError');

const authenticate = async (req, _res, next) => {
  try {
    const header = req.headers.authorization || '';
    const [scheme, token] = header.split(' ');

    if (scheme !== 'Bearer' || !token) {
      throw new ApiError(401, 'Authentication token is required');
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const result = await query(
      'SELECT id, name, email, address, role, created_at FROM users WHERE id = $1',
      [payload.sub]
    );

    if (result.rowCount === 0) {
      throw new ApiError(401, 'Authenticated user no longer exists');
    }

    req.user = result.rows[0];
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return next(new ApiError(401, 'Invalid or expired authentication token'));
    }

    return next(error);
  }
};

const authorize = (...roles) => (req, _res, next) => {
  if (!roles.includes(req.user.role)) {
    return next(new ApiError(403, 'You do not have permission to access this resource'));
  }

  return next();
};

module.exports = {
  authenticate,
  authorize
};
