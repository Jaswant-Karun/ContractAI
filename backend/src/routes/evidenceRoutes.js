const express = require('express');
const router = express.Router();
const { getEvidenceExplorer } = require('../controllers/evidenceController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getEvidenceExplorer);

module.exports = router;
