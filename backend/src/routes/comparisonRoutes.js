const express = require('express');
const router = express.Router();
const { compareContracts } = require('../controllers/comparisonController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', compareContracts);

module.exports = router;
