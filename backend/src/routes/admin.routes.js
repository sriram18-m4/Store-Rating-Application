const express = require('express');
const adminController = require('../controllers/admin.controller');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  createUserRules,
  updateUserRules,
  userFilterRules,
  createStoreRules,
  updateStoreRules,
  storeFilterRules
} = require('../validators/admin.validators');
const { uuidParam } = require('../validators/common.validators');

const router = express.Router();

router.use(authenticate, authorize('ADMIN'));

router.get('/dashboard', adminController.dashboard);

router
  .route('/users')
  .get(userFilterRules, validate, adminController.listUsers)
  .post(createUserRules, validate, adminController.createUser);

router
  .route('/users/:id')
  .get(uuidParam(), validate, adminController.getUser)
  .patch(updateUserRules, validate, adminController.updateUser)
  .delete(uuidParam(), validate, adminController.deleteUser);

router
  .route('/stores')
  .get(storeFilterRules, validate, adminController.listStores)
  .post(createStoreRules, validate, adminController.createStore);

router
  .route('/stores/:id')
  .get(uuidParam(), validate, adminController.getStore)
  .patch(updateStoreRules, validate, adminController.updateStore)
  .delete(uuidParam(), validate, adminController.deleteStore);

module.exports = router;
