const Contract = require('../models/Contract');
const AuditLog = require('../models/AuditLog');
const { calculateContractStatus } = require('../utils/dateUtils');

// @desc Get contracts list with search, filter, sort & pagination
// @route GET /api/contracts
exports.getContracts = async (req, res, next) => {
  try {
    const { status, risk, type, search, sortBy = 'createdAt', sortOrder = 'desc', page = 1, limit = 10 } = req.query;

    const query = { companyId: req.user.companyId };

    if (risk) query.riskLevel = risk;
    if (type) query.contractType = type;

    if (search) {
      query.$or = [
        { contractTitle: { $regex: search, $options: 'i' } },
        { parties: { $regex: search, $options: 'i' } },
        { summary: { $regex: search, $options: 'i' } }
      ];
    }

    let contracts = await Contract.find(query).populate('documentId', 'fileName fileUrl fileSize status');

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
      .populate('documentId', 'fileName fileUrl fileSize fileType status')
      .populate('uploadedBy', 'name email');

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
      'currency', 'paymentTerms', 'terminationClause', 'riskLevel', 'renewalStatus'
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
