const express = require('express');
const router = express.Router();
const { getWorkspaceDetails } = require('../controllers/workspaceController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getWorkspaceDetails);

module.exports = router;
