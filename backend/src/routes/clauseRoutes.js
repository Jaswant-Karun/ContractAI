const express = require('express');
const router = express.Router();
const { getClauseIntelligence } = require('../controllers/clauseController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getClauseIntelligence);

module.exports = router;
