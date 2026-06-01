const { body, query } = require('express-validator');
const { uuidParam, paginationRules } = require('./common.validators');

const storeListRules = [
  ...paginationRules,
  query('search').optional().trim(),
  query('name').optional().trim(),
  query('address').optional().trim(),
  query('sortBy').optional().isIn(['name', 'address', 'overall_rating', 'submitted_rating']).withMessage('Invalid sort field'),
  query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('sortOrder must be asc or desc')
];

const ratingRules = [
  uuidParam('storeId'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5')
];

module.exports = {
  storeListRules,
  ratingRules
};
