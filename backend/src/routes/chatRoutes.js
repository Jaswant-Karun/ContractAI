const express = require('express');
const router = express.Router();
const { getChatSessions, sendChatMessage } = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/sessions', getChatSessions);
router.post('/', sendChatMessage);

module.exports = router;
