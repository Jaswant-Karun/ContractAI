const Contract = require('../models/Contract');
const AuditLog = require('../models/AuditLog');
const { calculateContractStatus } = require('../utils/dateUtils');

// @desc Get dashboard metrics, status breakdown, risk distribution & recent activity
// @route GET /api/dashboard
exports.getDashboardStats = async (req, res, next) => {
  try {
    const companyId = req.user.companyId;

    const rawContracts = await Contract.find({ companyId });

    // Recalculate dynamic statuses for dashboard stats
    const contracts = rawContracts.map(c => {
      const item = c.toObject();
      if (item.expiryDate && item.renewalStatus !== 'Renewed') {
        item.renewalStatus = calculateContractStatus(item.expiryDate);
      }
      return item;
    });

    const totalContracts = contracts.length;
    let activeCount = 0;
    let expiringSoonCount = 0;
    let expiredCount = 0;
    let renewedCount = 0;
    let highRiskCount = 0;

    const riskDistribution = { Low: 0, Medium: 0, High: 0, Critical: 0 };
    const statusDistribution = { Active: 0, 'Expiring Soon': 0, Expired: 0, Renewed: 0 };

    contracts.forEach(c => {
      const status = c.renewalStatus || 'Active';
      statusDistribution[status] = (statusDistribution[status] || 0) + 1;

      if (status === 'Active') activeCount++;
      if (status === 'Expiring Soon') expiringSoonCount++;
      if (status === 'Expired') expiredCount++;
      if (status === 'Renewed') renewedCount++;

      const risk = c.riskLevel || 'Low';
      riskDistribution[risk] = (riskDistribution[risk] || 0) + 1;
      if (risk === 'High' || risk === 'Critical') {
        highRiskCount++;
      }
    });

    // Filter upcoming renewals (contracts expiring in future, sorted by days remaining)
    const upcomingRenewals = contracts
      .filter(c => c.expiryDate && c.renewalStatus !== 'Expired' && c.renewalStatus !== 'Renewed')
      .sort((a, b) => (a.daysRemaining ?? 999) - (b.daysRemaining ?? 999))
      .slice(0, 5)
      .map(c => ({
        _id: c._id,
        contractTitle: c.contractTitle,
        counterparty: (c.parties && c.parties[1]) || (c.parties && c.parties[0]) || 'N/A',
        expiryDate: c.expiryDate,
        daysRemaining: c.daysRemaining,
        riskLevel: c.riskLevel,
        status: c.renewalStatus
      }));

    // Fetch recent audit activity
    const recentActivity = await AuditLog.find({ companyId })
      .sort({ createdAt: -1 })
      .limit(6)
      .populate('userId', 'name role');

    res.json({
      success: true,
      data: {
        stats: {
          totalContracts,
          activeContracts: activeCount,
          expiringSoon: expiringSoonCount,
          expiredContracts: expiredCount,
          renewedContracts: renewedCount,
          highRiskContracts: highRiskCount
        },
        statusDistribution: [
          { name: 'Active', count: statusDistribution.Active, color: '#10B981' },
          { name: 'Expiring Soon', count: statusDistribution['Expiring Soon'], color: '#F59E0B' },
          { name: 'Expired', count: statusDistribution.Expired, color: '#EF4444' },
          { name: 'Renewed', count: statusDistribution.Renewed, color: '#3B82F6' }
        ],
        riskDistribution: [
          { name: 'Low', count: riskDistribution.Low, color: '#10B981' },
          { name: 'Medium', count: riskDistribution.Medium, color: '#3B82F6' },
          { name: 'High', count: riskDistribution.High, color: '#F59E0B' },
          { name: 'Critical', count: riskDistribution.Critical, color: '#EF4444' }
        ],
        upcomingRenewals,
        recentActivity
      }
    });
  } catch (error) {
    next(error);
  }
};
