const express = require('express');
const router = express.Router();
const { getObligations, updateObligation } = require('../controllers/obligationController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getObligations);
router.put('/:id', updateObligation);

module.exports = router;
