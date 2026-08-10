const express = require('express');
const router = express.Router();
const { getCounterparties } = require('../controllers/counterpartyController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getCounterparties);

module.exports = router;
