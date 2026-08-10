const express = require('express');
const router = express.Router();
const { getRenewalCenter, handleRenewalAction } = require('../controllers/renewalController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getRenewalCenter);
router.post('/:contractId/action', restrictTo('Admin', 'Manager'), handleRenewalAction);

module.exports = router;
