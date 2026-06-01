const express = require('express');
const storeController = require('../controllers/store.controller');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { storeListRules, ratingRules } = require('../validators/store.validators');
const { uuidParam } = require('../validators/common.validators');

const router = express.Router();

router.use(authenticate);

router.get('/', storeListRules, validate, storeController.listStores);
router.get('/:id', uuidParam(), validate, storeController.getStore);
router.post('/:storeId/rating', authorize('USER'), ratingRules, validate, storeController.submitRating);
router.put('/:storeId/rating', authorize('USER'), ratingRules, validate, storeController.submitRating);

module.exports = router;
