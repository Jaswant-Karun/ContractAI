const express = require('express');
const router = express.Router();
const { getContracts, getContractById, updateContract, deleteContract } = require('../controllers/contractController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getContracts);
router.get('/:id', getContractById);
router.put('/:id', restrictTo('Admin', 'Manager'), updateContract);
router.delete('/:id', restrictTo('Admin'), deleteContract);

module.exports = router;
