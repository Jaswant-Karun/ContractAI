const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { register, login, getMe, logout, forgotPassword } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Limit each IP to 30 requests per windowMs
  message: { success: false, message: 'Too many authentication attempts. Please try again later.' }
});

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);
router.post('/forgot-password', authLimiter, forgotPassword);

module.exports = router;
