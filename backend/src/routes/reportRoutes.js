const express = require('express');
const router = express.Router();
const { getReports, exportCSV } = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getReports);
router.get('/export/csv', exportCSV);

module.exports = router;
