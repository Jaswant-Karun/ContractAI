const express = require('express');
const router = express.Router();
const { uploadDocument, getDocuments, getDocumentById, deleteDocument } = require('../controllers/documentController');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.use(protect);

router.post('/upload', restrictTo('Admin', 'Manager'), upload.single('file'), uploadDocument);
router.get('/', getDocuments);
router.get('/:id', getDocumentById);
router.delete('/:id', restrictTo('Admin'), deleteDocument);

module.exports = router;
