const express = require('express');
const router = express.Router();
const { handleAnalysisResult, handleRenewalTrigger } = require('../controllers/n8nWebhookController');

router.post('/n8n/analysis-result', handleAnalysisResult);
router.post('/n8n/reminder-triggered', handleRenewalTrigger);

module.exports = router;
