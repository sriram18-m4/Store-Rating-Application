const bcrypt = require('bcryptjs');
const { query } = require('../config/db');
const ApiError = require('../utils/apiError');
const asyncHandler = require('../utils/asyncHandler');
const { signToken } = require('../utils/token');

const publicUserFields = 'id, name, email, address, role, created_at';

const formatAuthResponse = (user) => ({
  token: signToken(user),
  user
});

const signup = asyncHandler(async (req, res) => {
  const { name, email, address, password } = req.body;
  const passwordHash = await bcrypt.hash(password, Number(process.env.BCRYPT_SALT_ROUNDS) || 10);

  const result = await query(
    `INSERT INTO users (name, email, address, password_hash, role)
     VALUES ($1, $2, $3, $4, 'USER')
     RETURNING ${publicUserFields}`,
    [name, email, address, passwordHash]
  );

  res.status(201).json(formatAuthResponse(result.rows[0]));
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await query(
    `SELECT id, name, email, address, role, password_hash, created_at
     FROM users
     WHERE email = $1`,
    [email]
  );

  if (result.rowCount === 0) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const user = result.rows[0];
  const passwordMatches = await bcrypt.compare(password, user.password_hash);

  if (!passwordMatches) {
    throw new ApiError(401, 'Invalid email or password');
  }

  delete user.password_hash;
  res.json(formatAuthResponse(user));
});

const me = asyncHandler(async (req, res) => {
  res.json({ user: req.user });
});

const updatePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const result = await query('SELECT password_hash FROM users WHERE id = $1', [req.user.id]);

  const passwordMatches = await bcrypt.compare(currentPassword, result.rows[0].password_hash);
  if (!passwordMatches) {
    throw new ApiError(400, 'Current password is incorrect');
  }

  const passwordHash = await bcrypt.hash(newPassword, Number(process.env.BCRYPT_SALT_ROUNDS) || 10);
  await query('UPDATE users SET password_hash = $1 WHERE id = $2', [passwordHash, req.user.id]);

  res.json({ message: 'Password updated successfully' });
});

module.exports = {
  signup,
  login,
  me,
  updatePassword
};
