const express = require('express');
const router = express.Router();
const {
  getContracts,
  getContractById,
  updateContract,
  deleteContract,
  reanalyzeContract,
  bulkOperations
} = require('../controllers/contractController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getContracts);
router.post('/bulk', restrictTo('Admin', 'Manager'), bulkOperations);
router.get('/:id', getContractById);
router.put('/:id', restrictTo('Admin', 'Manager'), updateContract);
router.post('/:id/reanalyze', restrictTo('Admin', 'Manager'), reanalyzeContract);
router.delete('/:id', restrictTo('Admin'), deleteContract);

module.exports = router;
