const express = require('express');
const router = express.Router();
const { getAnalyticsOverview } = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getAnalyticsOverview);

module.exports = router;
