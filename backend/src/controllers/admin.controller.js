const bcrypt = require('bcryptjs');
const { query } = require('../config/db');
const ApiError = require('../utils/apiError');
const asyncHandler = require('../utils/asyncHandler');
const { normalizePagination, buildSort, addIlikeFilter } = require('../utils/queryHelpers');

const userFields = 'id, name, email, address, role, created_at, updated_at';

const ensureStoreOwner = async (ownerId) => {
  if (!ownerId) {
    return;
  }

  const result = await query('SELECT id FROM users WHERE id = $1 AND role = $2', [ownerId, 'STORE_OWNER']);
  if (result.rowCount === 0) {
    throw new ApiError(400, 'ownerId must belong to a store owner user');
  }
};

const dashboard = asyncHandler(async (_req, res) => {
  const result = await query(`
    SELECT
      (SELECT COUNT(*)::int FROM users) AS total_users,
      (SELECT COUNT(*)::int FROM stores) AS total_stores,
      (SELECT COUNT(*)::int FROM ratings) AS total_ratings
  `);

  res.json({ dashboard: result.rows[0] });
});

const createUser = asyncHandler(async (req, res) => {
  const { name, email, address, password, role } = req.body;
  const passwordHash = await bcrypt.hash(password, Number(process.env.BCRYPT_SALT_ROUNDS) || 10);

  const result = await query(
    `INSERT INTO users (name, email, address, password_hash, role)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING ${userFields}`,
    [name, email, address, passwordHash, role]
  );

  res.status(201).json({ user: result.rows[0] });
});

const listUsers = asyncHandler(async (req, res) => {
  const { page, limit, offset } = normalizePagination(req.query);
  const conditions = [];
  const params = [];

  addIlikeFilter(conditions, params, 'u.name', req.query.name);
  addIlikeFilter(conditions, params, 'u.email::text', req.query.email);
  addIlikeFilter(conditions, params, 'u.address', req.query.address);

  if (req.query.role) {
    params.push(req.query.role);
    conditions.push(`u.role = $${params.length}`);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const sortClause = buildSort(req.query.sortBy, req.query.sortOrder, {
    name: 'u.name',
    email: 'u.email',
    address: 'u.address',
    role: 'u.role',
    created_at: 'u.created_at'
  }, 'created_at');

  const countResult = await query(
    `SELECT COUNT(*)::int AS total FROM users u ${whereClause}`,
    params
  );

  params.push(limit, offset);
  const usersResult = await query(
    `SELECT
       u.id,
       u.name,
       u.email,
       u.address,
       u.role,
       u.created_at,
       u.updated_at,
       COUNT(DISTINCT s.id)::int AS owned_store_count,
       COALESCE(ROUND(AVG(r.rating)::numeric, 2), 0) AS store_owner_average_rating
     FROM users u
     LEFT JOIN stores s ON s.owner_id = u.id
     LEFT JOIN ratings r ON r.store_id = s.id
     ${whereClause}
     GROUP BY u.id
     ORDER BY ${sortClause}
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );

  res.json({
    users: usersResult.rows,
    pagination: {
      page,
      limit,
      total: countResult.rows[0].total
    }
  });
});

const getUser = asyncHandler(async (req, res) => {
  const userResult = await query(
    `SELECT ${userFields} FROM users WHERE id = $1`,
    [req.params.id]
  );

  if (userResult.rowCount === 0) {
    throw new ApiError(404, 'User not found');
  }

  const ownedStoresResult = await query(
    `SELECT
       s.id,
       s.name,
       s.email,
       s.address,
       COALESCE(ROUND(AVG(r.rating)::numeric, 2), 0) AS average_rating,
       COUNT(r.id)::int AS total_ratings
     FROM stores s
     LEFT JOIN ratings r ON r.store_id = s.id
     WHERE s.owner_id = $1
     GROUP BY s.id
     ORDER BY s.name ASC`,
    [req.params.id]
  );

  const submittedRatingsResult = await query(
    `SELECT
       r.id,
       r.rating,
       r.created_at,
       r.updated_at,
       s.id AS store_id,
       s.name AS store_name,
       s.address AS store_address
     FROM ratings r
     JOIN stores s ON s.id = r.store_id
     WHERE r.user_id = $1
     ORDER BY r.updated_at DESC`,
    [req.params.id]
  );

  res.json({
    user: {
      ...userResult.rows[0],
      owned_stores: ownedStoresResult.rows,
      submitted_ratings: submittedRatingsResult.rows
    }
  });
});

const updateUser = asyncHandler(async (req, res) => {
  if (req.params.id === req.user.id && req.body.role && req.body.role !== req.user.role) {
    throw new ApiError(400, 'Administrators cannot change their own role');
  }

  const allowedFields = ['name', 'email', 'address', 'role'];
  const values = [];
  const assignments = [];

  allowedFields.forEach((field) => {
    if (Object.prototype.hasOwnProperty.call(req.body, field)) {
      values.push(req.body[field]);
      assignments.push(`${field} = $${values.length}`);
    }
  });

  if (req.body.password) {
    const passwordHash = await bcrypt.hash(req.body.password, Number(process.env.BCRYPT_SALT_ROUNDS) || 10);
    values.push(passwordHash);
    assignments.push(`password_hash = $${values.length}`);
  }

  if (assignments.length === 0) {
    throw new ApiError(400, 'At least one field is required for update');
  }

  values.push(req.params.id);
  const result = await query(
    `UPDATE users
     SET ${assignments.join(', ')}
     WHERE id = $${values.length}
     RETURNING ${userFields}`,
    values
  );

  if (result.rowCount === 0) {
    throw new ApiError(404, 'User not found');
  }

  res.json({ user: result.rows[0] });
});

const deleteUser = asyncHandler(async (req, res) => {
  if (req.params.id === req.user.id) {
    throw new ApiError(400, 'Administrators cannot delete their own account');
  }

  const result = await query('DELETE FROM users WHERE id = $1 RETURNING id', [req.params.id]);

  if (result.rowCount === 0) {
    throw new ApiError(404, 'User not found');
  }

  res.status(204).send();
});

const createStore = asyncHandler(async (req, res) => {
  const { name, email, address, ownerId = null } = req.body;
  await ensureStoreOwner(ownerId);

  const result = await query(
    `INSERT INTO stores (name, email, address, owner_id)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, email, address, owner_id, created_at, updated_at`,
    [name, email, address, ownerId]
  );

  res.status(201).json({ store: result.rows[0] });
});

const listStores = asyncHandler(async (req, res) => {
  const { page, limit, offset } = normalizePagination(req.query);
  const conditions = [];
  const params = [];

  addIlikeFilter(conditions, params, 's.name', req.query.name);
  addIlikeFilter(conditions, params, 's.email::text', req.query.email);
  addIlikeFilter(conditions, params, 's.address', req.query.address);

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const sortClause = buildSort(req.query.sortBy, req.query.sortOrder, {
    name: 's.name',
    email: 's.email',
    address: 's.address',
    rating: 'overall_rating',
    created_at: 's.created_at'
  }, 'created_at');

  const countResult = await query(
    `SELECT COUNT(*)::int AS total FROM stores s ${whereClause}`,
    params
  );

  params.push(limit, offset);
  const storesResult = await query(
    `SELECT
       s.id,
       s.name,
       s.email,
       s.address,
       s.owner_id,
       owner.name AS owner_name,
       COALESCE(ROUND(AVG(r.rating)::numeric, 2), 0) AS overall_rating,
       COUNT(r.id)::int AS rating_count,
       s.created_at,
       s.updated_at
     FROM stores s
     LEFT JOIN users owner ON owner.id = s.owner_id
     LEFT JOIN ratings r ON r.store_id = s.id
     ${whereClause}
     GROUP BY s.id, owner.id
     ORDER BY ${sortClause}
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );

  res.json({
    stores: storesResult.rows,
    pagination: {
      page,
      limit,
      total: countResult.rows[0].total
    }
  });
});

const getStore = asyncHandler(async (req, res) => {
  const storeResult = await query(
    `SELECT
       s.id,
       s.name,
       s.email,
       s.address,
       s.owner_id,
       owner.name AS owner_name,
       owner.email AS owner_email,
       COALESCE(ROUND(AVG(r.rating)::numeric, 2), 0) AS overall_rating,
       COUNT(r.id)::int AS rating_count,
       s.created_at,
       s.updated_at
     FROM stores s
     LEFT JOIN users owner ON owner.id = s.owner_id
     LEFT JOIN ratings r ON r.store_id = s.id
     WHERE s.id = $1
     GROUP BY s.id, owner.id`,
    [req.params.id]
  );

  if (storeResult.rowCount === 0) {
    throw new ApiError(404, 'Store not found');
  }

  res.json({ store: storeResult.rows[0] });
});

const updateStore = asyncHandler(async (req, res) => {
  const allowedFields = ['name', 'email', 'address'];
  const values = [];
  const assignments = [];

  allowedFields.forEach((field) => {
    if (Object.prototype.hasOwnProperty.call(req.body, field)) {
      values.push(req.body[field]);
      assignments.push(`${field} = $${values.length}`);
    }
  });

  if (Object.prototype.hasOwnProperty.call(req.body, 'ownerId')) {
    await ensureStoreOwner(req.body.ownerId);
    values.push(req.body.ownerId);
    assignments.push(`owner_id = $${values.length}`);
  }

  if (assignments.length === 0) {
    throw new ApiError(400, 'At least one field is required for update');
  }

  values.push(req.params.id);
  const result = await query(
    `UPDATE stores
     SET ${assignments.join(', ')}
     WHERE id = $${values.length}
     RETURNING id, name, email, address, owner_id, created_at, updated_at`,
    values
  );

  if (result.rowCount === 0) {
    throw new ApiError(404, 'Store not found');
  }

  res.json({ store: result.rows[0] });
});

const deleteStore = asyncHandler(async (req, res) => {
  const result = await query('DELETE FROM stores WHERE id = $1 RETURNING id', [req.params.id]);

  if (result.rowCount === 0) {
    throw new ApiError(404, 'Store not found');
  }

  res.status(204).send();
});

module.exports = {
  dashboard,
  createUser,
  listUsers,
  getUser,
  updateUser,
  deleteUser,
  createStore,
  listStores,
  getStore,
  updateStore,
  deleteStore
};
