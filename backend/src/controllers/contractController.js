const Contract = require('../models/Contract');
const Document = require('../models/Document');
const AuditLog = require('../models/AuditLog');
const { calculateContractStatus } = require('../utils/dateUtils');
const { analyzeContractText, extractTextFromDocument } = require('../services/aiService');

// @desc Get contracts list with search, filter, sort & pagination
// @route GET /api/contracts
exports.getContracts = async (req, res, next) => {
  try {
    const {
      status,
      risk,
      type,
      department,
      counterparty,
      owner,
      isArchived = 'false',
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 10
    } = req.query;

    const query = { companyId: req.user.companyId };

    if (isArchived === 'true') {
      query.isArchived = true;
    } else {
      query.isArchived = { $ne: true };
    }

    if (risk) query.riskLevel = risk;
    if (type) query.contractType = type;
    if (department) query.department = department;
    if (counterparty) query.counterparty = { $regex: counterparty, $options: 'i' };
    if (owner) query.owner = owner;

    if (search) {
      query.$or = [
        { contractTitle: { $regex: search, $options: 'i' } },
        { counterparty: { $regex: search, $options: 'i' } },
        { parties: { $regex: search, $options: 'i' } },
        { summary: { $regex: search, $options: 'i' } }
      ];
    }

    let contracts = await Contract.find(query)
      .populate('documentId', 'fileName fileUrl fileSize status')
      .populate('owner', 'name email')
      .populate('uploadedBy', 'name email');

    // Dynamic expiry recalculation for accurate status rendering
    contracts = contracts.map(contract => {
      const doc = contract.toObject();
      if (doc.expiryDate && doc.renewalStatus !== 'Renewed') {
        doc.renewalStatus = calculateContractStatus(doc.expiryDate);
      }
      return doc;
    });

    if (status) {
      contracts = contracts.filter(c => c.renewalStatus.toLowerCase() === status.toLowerCase());
    }

    // Sorting logic
    contracts.sort((a, b) => {
      let valA = a[sortBy];
      let valB = b[sortBy];
      if (sortBy === 'daysRemaining') {
        valA = a.daysRemaining ?? 9999;
        valB = b.daysRemaining ?? 9999;
      }
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    // Pagination
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const paginatedContracts = contracts.slice(startIndex, startIndex + parseInt(limit));

    res.json({
      success: true,
      data: paginatedContracts,
      pagination: {
        total: contracts.length,
        page: parseInt(page),
        pages: Math.ceil(contracts.length / parseInt(limit)),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get single contract details
// @route GET /api/contracts/:id
exports.getContractById = async (req, res, next) => {
  try {
    const contract = await Contract.findOne({ _id: req.params.id, companyId: req.user.companyId })
      .populate('documentId', 'fileName fileUrl fileSize fileType status filePath')
      .populate('owner', 'name email role')
      .populate('uploadedBy', 'name email role');

    if (!contract) {
      return res.status(404).json({ success: false, message: 'Contract not found or access denied.' });
    }

    res.json({
      success: true,
      data: contract
    });
  } catch (error) {
    next(error);
  }
};

// @desc Update contract details
// @route PUT /api/contracts/:id
exports.updateContract = async (req, res, next) => {
  try {
    const contract = await Contract.findOne({ _id: req.params.id, companyId: req.user.companyId });
    if (!contract) {
      return res.status(404).json({ success: false, message: 'Contract not found or access denied.' });
    }

    const fieldsToUpdate = [
      'contractTitle', 'contractType', 'parties', 'startDate', 'expiryDate',
      'renewalDate', 'renewalType', 'noticePeriodDays', 'contractValue',
      'currency', 'paymentTerms', 'terminationClause', 'riskLevel', 'renewalStatus',
      'department', 'counterparty', 'owner', 'tags', 'recommendations', 'isArchived'
    ];

    fieldsToUpdate.forEach(field => {
      if (req.body[field] !== undefined) {
        contract[field] = req.body[field];
      }
    });

    await contract.save();

    await AuditLog.create({
      companyId: req.user.companyId,
      userId: req.user._id,
      action: 'Contract Updated',
      entityType: 'Contract',
      entityId: contract._id,
      metadata: { contractTitle: contract.contractTitle }
    });

    res.json({
      success: true,
      data: contract,
      message: 'Contract updated successfully.'
    });
  } catch (error) {
    next(error);
  }
};

// @desc Re-analyze contract using AI
// @route POST /api/contracts/:id/reanalyze
exports.reanalyzeContract = async (req, res, next) => {
  try {
    const contract = await Contract.findOne({ _id: req.params.id, companyId: req.user.companyId })
      .populate('documentId');

    if (!contract || !contract.documentId) {
      return res.status(404).json({ success: false, message: 'Contract document not found.' });
    }

    const doc = contract.documentId;
    const extractedText = await extractTextFromDocument(doc.filePath, doc.mimeType);
    const analysis = await analyzeContractText(extractedText, doc.fileName);

    contract.contractTitle = analysis.contract_title || contract.contractTitle;
    contract.contractType = analysis.contract_type || contract.contractType;
    contract.parties = analysis.parties || contract.parties;
    contract.startDate = analysis.start_date || contract.startDate;
    contract.expiryDate = analysis.expiry_date || contract.expiryDate;
    contract.renewalDate = analysis.renewal_date || contract.renewalDate;
    contract.renewalType = analysis.renewal_type || contract.renewalType;
    contract.noticePeriodDays = analysis.notice_period_days ?? contract.noticePeriodDays;
    contract.contractValue = analysis.contract_value ?? contract.contractValue;
    contract.currency = analysis.currency || contract.currency;
    contract.paymentTerms = analysis.payment_terms || contract.paymentTerms;
    contract.terminationClause = analysis.termination_clause || contract.terminationClause;
    contract.keyObligations = analysis.key_obligations || contract.keyObligations;
    contract.risks = analysis.risks || contract.risks;
    contract.riskLevel = analysis.risk_level || contract.riskLevel;
    contract.importantDates = analysis.important_dates || contract.importantDates;
    contract.summary = analysis.summary || contract.summary;
    contract.aiEvidence = analysis.evidence || contract.aiEvidence;

    await contract.save();

    await AuditLog.create({
      companyId: req.user.companyId,
      userId: req.user._id,
      action: 'Contract Re-analyzed',
      entityType: 'Contract',
      entityId: contract._id,
      metadata: { contractTitle: contract.contractTitle }
    });

    res.json({
      success: true,
      data: contract,
      message: 'Contract re-analyzed successfully.'
    });
  } catch (error) {
    next(error);
  }
};

// @desc Bulk operations on contracts
// @route POST /api/contracts/bulk
exports.bulkOperations = async (req, res, next) => {
  try {
    const { action, contractIds, payload } = req.body;
    if (!Array.isArray(contractIds) || contractIds.length === 0) {
      return res.status(400).json({ success: false, message: 'No contract IDs provided.' });
    }

    const filter = { _id: { $in: contractIds }, companyId: req.user.companyId };

    if (action === 'archive') {
      await Contract.updateMany(filter, { isArchived: true });
    } else if (action === 'unarchive') {
      await Contract.updateMany(filter, { isArchived: false });
    } else if (action === 'assignOwner') {
      await Contract.updateMany(filter, { owner: payload.ownerId });
    } else if (action === 'delete') {
      await Contract.deleteMany(filter);
    } else {
      return res.status(400).json({ success: false, message: 'Invalid bulk action.' });
    }

    await AuditLog.create({
      companyId: req.user.companyId,
      userId: req.user._id,
      action: `Bulk ${action}`,
      entityType: 'Contract',
      metadata: { count: contractIds.length }
    });

    res.json({
      success: true,
      message: `Bulk action '${action}' completed on ${contractIds.length} contracts.`
    });
  } catch (error) {
    next(error);
  }
};

// @desc Delete contract
// @route DELETE /api/contracts/:id
exports.deleteContract = async (req, res, next) => {
  try {
    const contract = await Contract.findOneAndDelete({ _id: req.params.id, companyId: req.user.companyId });
    if (!contract) {
      return res.status(404).json({ success: false, message: 'Contract not found or access denied.' });
    }

    await AuditLog.create({
      companyId: req.user.companyId,
      userId: req.user._id,
      action: 'Contract Deleted',
      entityType: 'Contract',
      entityId: contract._id,
      metadata: { contractTitle: contract.contractTitle }
    });

    res.json({
      success: true,
      message: 'Contract deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};
