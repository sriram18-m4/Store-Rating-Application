const { query } = require('../config/db');
const ApiError = require('../utils/apiError');
const asyncHandler = require('../utils/asyncHandler');
const { normalizePagination, buildSort, addIlikeFilter } = require('../utils/queryHelpers');

const listStores = asyncHandler(async (req, res) => {
  const { page, limit, offset } = normalizePagination(req.query);
  const filterParams = [];
  const conditions = [];

  if (req.query.search) {
    filterParams.push(`%${req.query.search}%`);
    conditions.push(`(s.name ILIKE $${filterParams.length} OR s.address ILIKE $${filterParams.length})`);
  }

  addIlikeFilter(conditions, filterParams, 's.name', req.query.name);
  addIlikeFilter(conditions, filterParams, 's.address', req.query.address);

  const countWhereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const dataConditions = conditions.map((condition) =>
    condition.replace(/\$(\d+)/g, (_match, index) => `$${Number(index) + 1}`)
  );
  const dataWhereClause = dataConditions.length ? `WHERE ${dataConditions.join(' AND ')}` : '';
  const sortClause = buildSort(req.query.sortBy, req.query.sortOrder, {
    name: 's.name',
    address: 's.address',
    overall_rating: 'overall_rating',
    submitted_rating: 'submitted_rating'
  }, 'name');

  const countResult = await query(
    `SELECT COUNT(*)::int AS total FROM stores s ${countWhereClause}`,
    filterParams
  );

  const params = [req.user.id, ...filterParams, limit, offset];
  const storesResult = await query(
    `SELECT
       s.id,
       s.name,
       s.address,
       COALESCE(ROUND(AVG(all_ratings.rating)::numeric, 2), 0) AS overall_rating,
       COUNT(all_ratings.id)::int AS rating_count,
       user_rating.rating AS submitted_rating
     FROM stores s
     LEFT JOIN ratings all_ratings ON all_ratings.store_id = s.id
     LEFT JOIN ratings user_rating ON user_rating.store_id = s.id AND user_rating.user_id = $1
     ${dataWhereClause}
     GROUP BY s.id, user_rating.rating
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
  const result = await query(
    `SELECT
       s.id,
       s.name,
       s.address,
       COALESCE(ROUND(AVG(all_ratings.rating)::numeric, 2), 0) AS overall_rating,
       COUNT(all_ratings.id)::int AS rating_count,
       user_rating.rating AS submitted_rating
     FROM stores s
     LEFT JOIN ratings all_ratings ON all_ratings.store_id = s.id
     LEFT JOIN ratings user_rating ON user_rating.store_id = s.id AND user_rating.user_id = $2
     WHERE s.id = $1
     GROUP BY s.id, user_rating.rating`,
    [req.params.id, req.user.id]
  );

  if (result.rowCount === 0) {
    throw new ApiError(404, 'Store not found');
  }

  res.json({ store: result.rows[0] });
});

const submitRating = asyncHandler(async (req, res) => {
  const storeExists = await query('SELECT id FROM stores WHERE id = $1', [req.params.storeId]);

  if (storeExists.rowCount === 0) {
    throw new ApiError(404, 'Store not found');
  }

  const result = await query(
    `INSERT INTO ratings (user_id, store_id, rating)
     VALUES ($1, $2, $3)
     ON CONFLICT (user_id, store_id)
     DO UPDATE SET rating = EXCLUDED.rating
     RETURNING id, user_id, store_id, rating, created_at, updated_at`,
    [req.user.id, req.params.storeId, req.body.rating]
  );

  res.json({ rating: result.rows[0] });
});

module.exports = {
  listStores,
  getStore,
  submitRating
};
