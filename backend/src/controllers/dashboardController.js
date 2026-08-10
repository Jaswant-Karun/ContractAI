const Contract = require('../models/Contract');
const AuditLog = require('../models/AuditLog');
const { calculateContractStatus } = require('../utils/dateUtils');

// @desc Get complete executive dashboard metrics, distributions & activity
// @route GET /api/dashboard
exports.getDashboardStats = async (req, res, next) => {
  try {
    const companyId = req.user.companyId;

    const rawContracts = await Contract.find({ companyId, isArchived: { $ne: true } })
      .populate('owner', 'name email')
      .populate('uploadedBy', 'name email');

    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(now.getDate() + 30);

    const ninetyDaysFromNow = new Date();
    ninetyDaysFromNow.setDate(now.getDate() + 90);

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
    let expiring30DaysCount = 0;
    let expiring90DaysCount = 0;
    let highRiskCount = 0;
    let criticalRiskCount = 0;
    let autoRenewingCount = 0;
    let totalContractValue = 0;

    const riskDistribution = { Low: 0, Medium: 0, High: 0, Critical: 0 };
    const statusDistribution = { Active: 0, 'Expiring Soon': 0, Expired: 0, Renewed: 0 };
    const departmentMap = {};
    const typeMap = {};

    contracts.forEach(c => {
      const status = c.renewalStatus || 'Active';
      statusDistribution[status] = (statusDistribution[status] || 0) + 1;

      if (status === 'Active') activeCount++;

      if (c.expiryDate) {
        const expDate = new Date(c.expiryDate);
        if (expDate >= now && expDate <= thirtyDaysFromNow) {
          expiring30DaysCount++;
        }
        if (expDate >= now && expDate <= ninetyDaysFromNow) {
          expiring90DaysCount++;
        }
      }

      const risk = c.riskLevel || 'Low';
      riskDistribution[risk] = (riskDistribution[risk] || 0) + 1;
      if (risk === 'High') highRiskCount++;
      if (risk === 'Critical') criticalRiskCount++;

      if (c.renewalType && c.renewalType.toLowerCase().includes('auto')) {
        autoRenewingCount++;
      }

      if (c.contractValue) {
        totalContractValue += Number(c.contractValue);
      }

      // Department breakdown
      const dept = c.department || 'General';
      departmentMap[dept] = (departmentMap[dept] || 0) + 1;

      // Type breakdown
      const type = c.contractType || 'Commercial Agreement';
      typeMap[type] = (typeMap[type] || 0) + 1;
    });

    const departmentDistribution = Object.keys(departmentMap).map(name => ({
      name,
      count: departmentMap[name]
    }));

    const contractTypeDistribution = Object.keys(typeMap).map(name => ({
      name,
      count: typeMap[name]
    }));

    // Filter upcoming renewals
    const upcomingRenewals = contracts
      .filter(c => c.expiryDate && c.renewalStatus !== 'Expired' && c.renewalStatus !== 'Renewed')
      .sort((a, b) => (a.daysRemaining ?? 999) - (b.daysRemaining ?? 999))
      .slice(0, 5)
      .map(c => ({
        _id: c._id,
        contractTitle: c.contractTitle,
        counterparty: c.counterparty || (c.parties && c.parties[1]) || (c.parties && c.parties[0]) || 'Counterparty',
        department: c.department || 'General',
        expiryDate: c.expiryDate,
        daysRemaining: c.daysRemaining,
        riskLevel: c.riskLevel,
        status: c.renewalStatus,
        contractValue: c.contractValue
      }));

    // Recent Uploads
    const recentUploads = contracts
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);

    // Fetch recent audit activity
    const recentActivity = await AuditLog.find({ companyId })
      .sort({ createdAt: -1 })
      .limit(8)
      .populate('userId', 'name role');

    res.json({
      success: true,
      data: {
        stats: {
          totalContracts,
          activeContracts: activeCount,
          expiringIn30Days: expiring30DaysCount,
          expiringIn90Days: expiring90DaysCount,
          highRiskContracts: highRiskCount,
          criticalRiskContracts: criticalRiskCount,
          autoRenewingContracts: autoRenewingCount,
          totalContractValue
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
        departmentDistribution,
        contractTypeDistribution,
        upcomingRenewals,
        recentUploads,
        recentActivity
      }
    });
  } catch (error) {
    next(error);
  }
};
