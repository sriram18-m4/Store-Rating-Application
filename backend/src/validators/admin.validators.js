const { body, query } = require('express-validator');
const {
  nameRule,
  optionalNameRule,
  emailRule,
  optionalEmailRule,
  addressRule,
  optionalAddressRule,
  passwordRule,
  optionalPasswordRule,
  uuidParam,
  paginationRules
} = require('./common.validators');

const roleRule = body('role')
  .isIn(['ADMIN', 'USER', 'STORE_OWNER'])
  .withMessage('Role must be ADMIN, USER, or STORE_OWNER');

const optionalRoleRule = body('role')
  .optional()
  .isIn(['ADMIN', 'USER', 'STORE_OWNER'])
  .withMessage('Role must be ADMIN, USER, or STORE_OWNER');

const createUserRules = [
  nameRule(),
  emailRule(),
  addressRule(),
  passwordRule(),
  roleRule
];

const updateUserRules = [
  uuidParam(),
  optionalNameRule(),
  optionalEmailRule(),
  optionalAddressRule(),
  optionalPasswordRule(),
  optionalRoleRule
];

const userFilterRules = [
  ...paginationRules,
  query('name').optional().trim(),
  query('email').optional().trim(),
  query('address').optional().trim(),
  query('role').optional().isIn(['ADMIN', 'USER', 'STORE_OWNER']).withMessage('Invalid role filter'),
  query('sortBy').optional().isIn(['name', 'email', 'address', 'role', 'created_at']).withMessage('Invalid sort field'),
  query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('sortOrder must be asc or desc')
];

const createStoreRules = [
  nameRule(),
  emailRule(),
  addressRule(),
  body('ownerId').optional({ nullable: true }).isUUID().withMessage('ownerId must be a valid UUID')
];

const updateStoreRules = [
  uuidParam(),
  optionalNameRule(),
  optionalEmailRule(),
  optionalAddressRule(),
  body('ownerId').optional({ nullable: true }).isUUID().withMessage('ownerId must be a valid UUID')
];

const storeFilterRules = [
  ...paginationRules,
  query('name').optional().trim(),
  query('email').optional().trim(),
  query('address').optional().trim(),
  query('sortBy').optional().isIn(['name', 'email', 'address', 'rating', 'created_at']).withMessage('Invalid sort field'),
  query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('sortOrder must be asc or desc')
];

module.exports = {
  createUserRules,
  updateUserRules,
  userFilterRules,
  createStoreRules,
  updateStoreRules,
  storeFilterRules
};
