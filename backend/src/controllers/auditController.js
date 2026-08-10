const AuditLog = require('../models/AuditLog');

// @desc Get workspace activity and audit logs with user/action filters
// @route GET /api/audit
exports.getAuditLogs = async (req, res, next) => {
  try {
    const companyId = req.user.companyId;
    const { action, userId } = req.query;

    const query = { companyId };
    if (action) query.action = { $regex: action, $options: 'i' };
    if (userId) query.userId = userId;

    const logs = await AuditLog.find(query)
      .populate('userId', 'name email role')
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({
      success: true,
      data: logs
    });
  } catch (error) {
    next(error);
  }
};
