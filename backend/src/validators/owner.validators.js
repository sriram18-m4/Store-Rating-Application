const { query } = require('express-validator');
const { paginationRules } = require('./common.validators');

const ownerRatingListRules = [
  ...paginationRules,
  query('storeId').optional().isUUID().withMessage('storeId must be a valid UUID'),
  query('sortBy').optional().isIn(['user_name', 'user_email', 'rating', 'created_at']).withMessage('Invalid sort field'),
  query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('sortOrder must be asc or desc')
];

module.exports = {
  ownerRatingListRules
};
