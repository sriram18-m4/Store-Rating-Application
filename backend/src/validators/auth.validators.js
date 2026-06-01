const { body } = require('express-validator');
const {
  nameRule,
  emailRule,
  addressRule,
  passwordRule
} = require('./common.validators');

const signupRules = [
  nameRule(),
  emailRule(),
  addressRule(),
  passwordRule()
];

const loginRules = [
  body('email').trim().isEmail().withMessage('Email must be valid').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required')
];

const updatePasswordRules = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  passwordRule('newPassword')
];

module.exports = {
  signupRules,
  loginRules,
  updatePasswordRules
};
