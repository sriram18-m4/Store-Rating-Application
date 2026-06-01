const express = require('express');
const ownerController = require('../controllers/owner.controller');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { ownerRatingListRules } = require('../validators/owner.validators');

const router = express.Router();

router.use(authenticate, authorize('STORE_OWNER'));

router.get('/dashboard', ownerController.dashboard);
router.get('/ratings', ownerRatingListRules, validate, ownerController.listRatings);

module.exports = router;
