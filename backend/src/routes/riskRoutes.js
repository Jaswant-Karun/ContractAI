const express = require('express');
const router = express.Router();
const { getRiskOverview } = require('../controllers/riskController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getRiskOverview);

module.exports = router;
