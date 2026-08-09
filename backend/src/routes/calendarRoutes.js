const express = require('express');
const router = express.Router();
const { getCalendarEvents } = require('../controllers/calendarController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getCalendarEvents);

module.exports = router;
