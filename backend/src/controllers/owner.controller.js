const { query } = require('../config/db');
const ApiError = require('../utils/apiError');
const asyncHandler = require('../utils/asyncHandler');
const { normalizePagination, buildSort } = require('../utils/queryHelpers');

const dashboard = asyncHandler(async (req, res) => {
  const result = await query(
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
    [req.user.id]
  );

  res.json({ stores: result.rows });
});

const listRatings = asyncHandler(async (req, res) => {
  const { page, limit, offset } = normalizePagination(req.query);
  const params = [req.user.id];
  const conditions = ['s.owner_id = $1'];

  if (req.query.storeId) {
    params.push(req.query.storeId);
    conditions.push(`s.id = $${params.length}`);
  }

  const sortClause = buildSort(req.query.sortBy, req.query.sortOrder, {
    user_name: 'u.name',
    user_email: 'u.email',
    rating: 'r.rating',
    created_at: 'r.created_at'
  }, 'created_at');

  const whereClause = `WHERE ${conditions.join(' AND ')}`;
  const ownershipResult = await query(
    `SELECT COUNT(*)::int AS total
     FROM ratings r
     JOIN stores s ON s.id = r.store_id
     ${whereClause}`,
    params
  );

  if (req.query.storeId && ownershipResult.rows[0].total === 0) {
    const storeResult = await query(
      'SELECT id FROM stores WHERE id = $1 AND owner_id = $2',
      [req.query.storeId, req.user.id]
    );

    if (storeResult.rowCount === 0) {
      throw new ApiError(404, 'Store not found for this owner');
    }
  }

  params.push(limit, offset);
  const ratingsResult = await query(
    `SELECT
       r.id,
       r.rating,
       r.created_at,
       r.updated_at,
       s.id AS store_id,
       s.name AS store_name,
       u.id AS user_id,
       u.name AS user_name,
       u.email AS user_email,
       u.address AS user_address
     FROM ratings r
     JOIN stores s ON s.id = r.store_id
     JOIN users u ON u.id = r.user_id
     ${whereClause}
     ORDER BY ${sortClause}
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );

  res.json({
    ratings: ratingsResult.rows,
    pagination: {
      page,
      limit,
      total: ownershipResult.rows[0].total
    }
  });
});

module.exports = {
  dashboard,
  listRatings
};
