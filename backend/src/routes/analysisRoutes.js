const express = require('express');
const router = express.Router();
const { getContractAnalysis } = require('../controllers/analysisController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/:contractId', getContractAnalysis);

module.exports = router;
