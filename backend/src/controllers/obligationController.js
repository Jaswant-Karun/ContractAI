const Obligation = require('../models/Obligation');
const Contract = require('../models/Contract');
const AuditLog = require('../models/AuditLog');

// @desc Get list of contract obligations and tasks
// @route GET /api/obligations
exports.getObligations = async (req, res, next) => {
  try {
    const companyId = req.user.companyId;
    const { status, priority } = req.query;

    let obligations = await Obligation.find({ companyId })
      .populate('contractId', 'contractTitle counterparty expiryDate')
      .populate('assignee', 'name email')
      .sort({ dueDate: 1 });

    // Fallback: If database table has no rows yet, populate dynamically from Contract keyObligations
    if (obligations.length === 0) {
      const contracts = await Contract.find({ companyId, isArchived: { $ne: true } }).limit(10);
      const createdItems = [];

      for (const contract of contracts) {
        if (Array.isArray(contract.keyObligations) && contract.keyObligations.length > 0) {
          for (const ob of contract.keyObligations) {
            const item = await Obligation.create({
              companyId,
              contractId: contract._id,
              title: ob.description || 'Deliver contracted SLA services',
              party: ob.party || 'Vendor',
              dueDate: contract.expiryDate || new Date(Date.now() + 30 * 86400000),
              priority: contract.riskLevel === 'Critical' ? 'High' : 'Medium',
              status: 'Pending'
            });
            createdItems.push(item);
          }
        }
      }

      obligations = await Obligation.find({ companyId })
        .populate('contractId', 'contractTitle counterparty expiryDate')
        .populate('assignee', 'name email');
    }

    if (status) {
      obligations = obligations.filter(o => o.status.toLowerCase() === status.toLowerCase());
    }
    if (priority) {
      obligations = obligations.filter(o => o.priority.toLowerCase() === priority.toLowerCase());
    }

    res.json({
      success: true,
      data: obligations
    });
  } catch (error) {
    next(error);
  }
};

// @desc Create or update obligation task status
// @route PUT /api/obligations/:id
exports.updateObligation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, assignee, priority, dueDate } = req.body;

    const obligation = await Obligation.findOne({ _id: id, companyId: req.user.companyId });
    if (!obligation) {
      return res.status(404).json({ success: false, message: 'Obligation task not found.' });
    }

    if (status) obligation.status = status;
    if (assignee) obligation.assignee = assignee;
    if (priority) obligation.priority = priority;
    if (dueDate) obligation.dueDate = dueDate;

    await obligation.save();

    await AuditLog.create({
      companyId: req.user.companyId,
      userId: req.user._id,
      action: 'Obligation Updated',
      entityType: 'Obligation',
      entityId: obligation._id,
      metadata: { status: obligation.status }
    });

    res.json({
      success: true,
      data: obligation,
      message: 'Obligation task updated.'
    });
  } catch (error) {
    next(error);
  }
};
