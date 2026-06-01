const express = require('express');
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  signupRules,
  loginRules,
  updatePasswordRules
} = require('../validators/auth.validators');

const router = express.Router();

router.post('/signup', signupRules, validate, authController.signup);
router.post('/login', loginRules, validate, authController.login);
router.get('/me', authenticate, authController.me);
router.patch('/password', authenticate, updatePasswordRules, validate, authController.updatePassword);

module.exports = router;
