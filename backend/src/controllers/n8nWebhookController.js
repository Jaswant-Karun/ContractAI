const Document = require('../models/Document');
const Contract = require('../models/Contract');
const AuditLog = require('../models/AuditLog');
const { createNotification, checkAndTriggerRenewalReminders } = require('../services/notificationService');

// @desc Callback endpoint for n8n to deliver AI contract analysis results
// @route POST /api/webhooks/n8n/analysis-result
exports.handleAnalysisResult = async (req, res, next) => {
  try {
    const { documentId, companyId, userId, analysisData, status, errorMessage } = req.body;

    if (!documentId || !companyId) {
      return res.status(400).json({ success: false, message: 'documentId and companyId are required.' });
    }

    const document = await Document.findById(documentId);
    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found.' });
    }

    if (status === 'failed') {
      document.status = 'failed';
      document.errorMessage = errorMessage || 'n8n workflow reported analysis failure.';
      await document.save();

      await createNotification({
        companyId,
        userId,
        contractId: null,
        type: 'Processing Failed',
        title: 'Contract Analysis Failed',
        message: `Analysis failed for document "${document.fileName}". ${document.errorMessage}`
      });

      return res.json({ success: true, message: 'Failed status recorded.' });
    }

    // Save extracted contract analysis
    const contract = await Contract.create({
      companyId,
      documentId,
      uploadedBy: userId,
      contractTitle: analysisData.contract_title || document.fileName,
      contractType: analysisData.contract_type || 'General Agreement',
      parties: analysisData.parties || [],
      startDate: analysisData.start_date ? new Date(analysisData.start_date) : null,
      expiryDate: analysisData.expiry_date ? new Date(analysisData.expiry_date) : null,
      renewalDate: analysisData.renewal_date ? new Date(analysisData.renewal_date) : null,
      renewalType: analysisData.renewal_type || 'Manual',
      noticePeriodDays: analysisData.notice_period_days || 30,
      contractValue: analysisData.contract_value || null,
      currency: analysisData.currency || 'USD',
      paymentTerms: analysisData.payment_terms || null,
      terminationClause: analysisData.termination_clause || null,
      keyObligations: analysisData.key_obligations || [],
      risks: analysisData.risks || [],
      riskLevel: analysisData.risk_level || 'Low',
      importantDates: (analysisData.important_dates || []).map(d => ({ ...d, date: new Date(d.date) })),
      summary: analysisData.summary || null,
      aiEvidence: analysisData.evidence || [],
      renewalStatus: 'Active'
    });

    document.status = 'completed';
    await document.save();

    await createNotification({
      companyId,
      userId,
      contractId: contract._id,
      type: 'AI Analysis Completed',
      title: 'AI Analysis Complete',
      message: `n8n AI processing completed for "${contract.contractTitle}".`
    });

    await AuditLog.create({
      companyId,
      userId,
      action: 'n8n AI Analysis Completed',
      entityType: 'Contract',
      entityId: contract._id
    });

    res.json({
      success: true,
      data: { contractId: contract._id },
      message: 'Analysis result saved successfully.'
    });
  } catch (error) {
    next(error);
  }
};

// @desc Callback endpoint for n8n scheduled renewal trigger
// @route POST /api/webhooks/n8n/reminder-triggered
exports.handleRenewalTrigger = async (req, res, next) => {
  try {
    const result = await checkAndTriggerRenewalReminders();
    res.json({
      success: true,
      data: result,
      message: 'Renewal reminder engine executed successfully.'
    });
  } catch (error) {
    next(error);
  }
};
