const { body, param, query } = require('express-validator');

const passwordMessage =
  'Password must be 8 to 16 characters long and include at least one uppercase letter and one special character';

const nameRule = (field = 'name') =>
  body(field)
    .trim()
    .isLength({ min: 20, max: 60 })
    .withMessage('Name must be between 20 and 60 characters');

const optionalNameRule = (field = 'name') =>
  body(field)
    .optional()
    .trim()
    .isLength({ min: 20, max: 60 })
    .withMessage('Name must be between 20 and 60 characters');

const emailRule = (field = 'email') =>
  body(field)
    .trim()
    .isEmail()
    .withMessage('Email must be valid')
    .normalizeEmail();

const optionalEmailRule = (field = 'email') =>
  body(field)
    .optional()
    .trim()
    .isEmail()
    .withMessage('Email must be valid')
    .normalizeEmail();

const addressRule = (field = 'address') =>
  body(field)
    .trim()
    .notEmpty()
    .withMessage('Address is required')
    .isLength({ max: 400 })
    .withMessage('Address must not exceed 400 characters');

const optionalAddressRule = (field = 'address') =>
  body(field)
    .optional()
    .trim()
    .isLength({ max: 400 })
    .withMessage('Address must not exceed 400 characters');

const passwordRule = (field = 'password') =>
  body(field)
    .matches(/^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,16}$/)
    .withMessage(passwordMessage);

const optionalPasswordRule = (field = 'password') =>
  body(field)
    .optional()
    .matches(/^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,16}$/)
    .withMessage(passwordMessage);

const uuidParam = (field = 'id') =>
  param(field).isUUID().withMessage(`${field} must be a valid UUID`);

const paginationRules = [
  query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be between 1 and 100')
];

module.exports = {
  nameRule,
  optionalNameRule,
  emailRule,
  optionalEmailRule,
  addressRule,
  optionalAddressRule,
  passwordRule,
  optionalPasswordRule,
  uuidParam,
  paginationRules,
  passwordMessage
};
