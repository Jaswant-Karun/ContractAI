const express = require('express');
const router = express.Router();
const { getAutomationStatus } = require('../controllers/automationController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getAutomationStatus);

module.exports = router;
