const Contract = require('../models/Contract');
const AuditLog = require('../models/AuditLog');
const { calculateContractStatus } = require('../utils/dateUtils');

// @desc Get categorized renewal center contracts (Due Today, 7 days, 30 days, 90 days, Overdue)
// @route GET /api/renewals
exports.getRenewalCenter = async (req, res, next) => {
  try {
    const companyId = req.user.companyId;

    const rawContracts = await Contract.find({ companyId, isArchived: { $ne: true } })
      .populate('owner', 'name email');

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const buckets = {
      dueToday: [],
      next7Days: [],
      next30Days: [],
      next90Days: [],
      overdue: []
    };

    rawContracts.forEach(c => {
      const item = c.toObject();
      if (!item.expiryDate) return;

      const expDate = new Date(item.expiryDate);
      expDate.setHours(0, 0, 0, 0);

      const daysDiff = Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      item.daysRemaining = daysDiff;

      // Notice deadline
      const noticeDays = item.noticePeriodDays || 30;
      const noticeDate = new Date(expDate);
      noticeDate.setDate(noticeDate.getDate() - noticeDays);
      item.noticeDeadline = noticeDate;

      if (daysDiff < 0) {
        buckets.overdue.push(item);
      } else if (daysDiff === 0) {
        buckets.dueToday.push(item);
      } else if (daysDiff <= 7) {
        buckets.next7Days.push(item);
      } else if (daysDiff <= 30) {
        buckets.next30Days.push(item);
      } else if (daysDiff <= 90) {
        buckets.next90Days.push(item);
      }
    });

    res.json({
      success: true,
      data: buckets
    });
  } catch (error) {
    next(error);
  }
};

// @desc Perform renewal action (Renew, Cancel, Reassign)
// @route POST /api/renewals/:contractId/action
exports.handleRenewalAction = async (req, res, next) => {
  try {
    const { contractId } = req.params;
    const { action, notes, newExpiryDate, ownerId } = req.body;

    const contract = await Contract.findOne({ _id: contractId, companyId: req.user.companyId });
    if (!contract) {
      return res.status(404).json({ success: false, message: 'Contract not found.' });
    }

    if (action === 'renew') {
      contract.renewalStatus = 'Renewed';
      if (newExpiryDate) {
        contract.expiryDate = new Date(newExpiryDate);
        contract.renewalStatus = 'Active';
      }
    } else if (action === 'cancel') {
      contract.renewalStatus = 'Expired';
      contract.isArchived = true;
    } else if (action === 'reassign' && ownerId) {
      contract.owner = ownerId;
    }

    await contract.save();

    await AuditLog.create({
      companyId: req.user.companyId,
      userId: req.user._id,
      action: `Renewal Action: ${action}`,
      entityType: 'Contract',
      entityId: contract._id,
      metadata: { action, notes }
    });

    res.json({
      success: true,
      data: contract,
      message: `Renewal action '${action}' updated successfully.`
    });
  } catch (error) {
    next(error);
  }
};
