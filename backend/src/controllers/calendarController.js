const Contract = require('../models/Contract');
const { getCalendarUrgency } = require('../utils/dateUtils');

// @desc Get calendar contract events with urgency categories
// @route GET /api/calendar
exports.getCalendarEvents = async (req, res, next) => {
  try {
    const contracts = await Contract.find({ companyId: req.user.companyId });
    const events = [];

    contracts.forEach(contract => {
      const urgency = getCalendarUrgency(contract.expiryDate);

      if (contract.expiryDate) {
        events.push({
          id: `${contract._id}-expiry`,
          contractId: contract._id,
          title: `${contract.contractTitle} (Expiry)`,
          date: contract.expiryDate,
          type: 'Contract Expiry',
          urgency,
          noticePeriodDays: contract.noticePeriodDays,
          contractType: contract.contractType,
          riskLevel: contract.riskLevel
        });
      }

      if (contract.noticeDeadline) {
        events.push({
          id: `${contract._id}-notice`,
          contractId: contract._id,
          title: `Notice Deadline: ${contract.contractTitle}`,
          date: contract.noticeDeadline,
          type: 'Notice Deadline',
          urgency,
          noticePeriodDays: contract.noticePeriodDays,
          contractType: contract.contractType,
          riskLevel: contract.riskLevel
        });
      }
    });

    res.json({
      success: true,
      data: events
    });
  } catch (error) {
    next(error);
  }
};
