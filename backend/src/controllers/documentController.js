const Document = require('../models/Document');
const Contract = require('../models/Contract');
const AuditLog = require('../models/AuditLog');
const { extractTextFromDocument, analyzeContractText } = require('../services/aiService');
const { triggerN8nDocumentAnalysis } = require('../services/n8nService');
const { createNotification } = require('../services/notificationService');

// @desc Upload new PDF/DOCX contract document
// @route POST /api/documents/upload
exports.uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded or file type not allowed.' });
    }

    const { originalname, mimetype, size, filename, path: filePath } = req.file;
    const fileStorageUrl = process.env.FILE_STORAGE_URL || 'http://localhost:5000/uploads';
    const fileUrl = `${fileStorageUrl}/${filename}`;

    // Create Document record in MongoDB
    const document = await Document.create({
      companyId: req.user.companyId,
      uploadedBy: req.user._id,
      fileName: originalname,
      fileType: mimetype,
      mimeType: mimetype,
      filePath: filePath,
      fileSize: size,
      fileUrl: fileUrl,
      status: 'processing'
    });

    // Log upload audit
    await AuditLog.create({
      companyId: req.user.companyId,
      userId: req.user._id,
      action: 'Document Uploaded',
      entityType: 'Document',
      entityId: document._id,
      metadata: { fileName: originalname, fileSize: size }
    });

    // Asynchronously process text extraction & AI analysis
    processDocumentPipeline(document, filePath, req.user).catch(err => {
      console.error('[Document Pipeline Processing Async Error]:', err);
    });

    res.status(202).json({
      success: true,
      data: {
        documentId: document._id,
        fileName: document.fileName,
        fileUrl: document.fileUrl,
        status: document.status,
        message: 'File uploaded successfully. Processing contract text and AI analysis...'
      }
    });
  } catch (error) {
    next(error);
  }
};

// Async processing function
const processDocumentPipeline = async (document, filePath, user) => {
  try {
    // 1. Optionally notify n8n webhook asynchronously (non-blocking)
    triggerN8nDocumentAnalysis({
      documentId: document._id.toString(),
      companyId: user.companyId.toString(),
      userId: user._id.toString(),
      fileName: document.fileName,
      fileType: document.fileType,
      fileUrl: document.fileUrl,
      userEmail: user.email
    }).catch(n8nErr => {
      console.warn('[Document Pipeline]: n8n dispatch warning:', n8nErr.message);
    });

    // 2. Execute text extraction & AI contract analysis engine
    console.log(`[Document Pipeline]: Executing text extraction for document ${document._id} (${document.fileName})`);
    const extractedText = await extractTextFromDocument(filePath, document.fileType);
    
    console.log(`[Document Pipeline]: Running AI contract analysis engine for document ${document._id}`);
    const aiAnalysis = await analyzeContractText(extractedText, document.fileName);

    // Check if contract already exists for this documentId
    let contract = await Contract.findOne({ documentId: document._id });
    if (!contract) {
      contract = await Contract.create({
        companyId: user.companyId,
        documentId: document._id,
        uploadedBy: user._id,
        contractTitle: aiAnalysis.contract_title,
        contractType: aiAnalysis.contract_type,
        parties: aiAnalysis.parties,
        startDate: aiAnalysis.start_date ? new Date(aiAnalysis.start_date) : null,
        expiryDate: aiAnalysis.expiry_date ? new Date(aiAnalysis.expiry_date) : null,
        renewalDate: aiAnalysis.renewal_date ? new Date(aiAnalysis.renewal_date) : null,
        renewalType: aiAnalysis.renewal_type || 'Manual',
        noticePeriodDays: aiAnalysis.notice_period_days || 30,
        contractValue: aiAnalysis.contract_value,
        currency: aiAnalysis.currency || 'USD',
        paymentTerms: aiAnalysis.payment_terms,
        terminationClause: aiAnalysis.termination_clause,
        keyObligations: aiAnalysis.key_obligations,
        risks: aiAnalysis.risks,
        riskLevel: aiAnalysis.risk_level,
        importantDates: (aiAnalysis.important_dates || []).map(d => ({ ...d, date: new Date(d.date) })),
        summary: aiAnalysis.summary,
        aiEvidence: aiAnalysis.evidence,
        renewalStatus: 'Active'
      });
    }

    // Update document status
    document.status = 'completed';
    await document.save();

    // Create notification & audit log
    await createNotification({
      companyId: user.companyId,
      userId: user._id,
      contractId: contract._id,
      type: 'AI Analysis Completed',
      title: 'Contract Analysis Complete',
      message: `AI analysis completed successfully for "${contract.contractTitle}".`
    });

    await AuditLog.create({
      companyId: user.companyId,
      userId: user._id,
      action: 'AI Contract Analysis Completed',
      entityType: 'Contract',
      entityId: contract._id,
      metadata: { contractTitle: contract.contractTitle, riskLevel: contract.riskLevel }
    });

    console.log(`[Document Pipeline]: Successfully completed processing for document ${document._id}`);
  } catch (error) {
    console.error(`[Document Pipeline Error]: Failed for document ${document._id}:`, error);
    document.status = 'failed';
    document.errorMessage = error.message;
    await document.save();

    await createNotification({
      companyId: user.companyId,
      userId: user._id,
      contractId: null,
      type: 'Processing Failed',
      title: 'Document Analysis Failed',
      message: `Unable to analyze document "${document.fileName}". ${error.message}`
    });
  }
};

// @desc Get all documents for company
// @route GET /api/documents
exports.getDocuments = async (req, res, next) => {
  try {
    const documents = await Document.find({ companyId: req.user.companyId }).sort({ createdAt: -1 });
    res.json({
      success: true,
      data: documents
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get single document by ID
// @route GET /api/documents/:id
exports.getDocumentById = async (req, res, next) => {
  try {
    const document = await Document.findOne({ _id: req.params.id, companyId: req.user.companyId });
    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found or access denied.' });
    }
    res.json({
      success: true,
      data: document
    });
  } catch (error) {
    next(error);
  }
};

// @desc Delete document
// @route DELETE /api/documents/:id
exports.deleteDocument = async (req, res, next) => {
  try {
    const document = await Document.findOneAndDelete({ _id: req.params.id, companyId: req.user.companyId });
    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found or access denied.' });
    }

    // Delete associated contract
    await Contract.deleteMany({ documentId: req.params.id, companyId: req.user.companyId });

    res.json({
      success: true,
      message: 'Document and associated contract deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};
