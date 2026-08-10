const Contract = require('../models/Contract');

// @desc Get analytics dashboard metrics, trends, and charts
// @route GET /api/analytics
exports.getAnalyticsOverview = async (req, res, next) => {
  try {
    const companyId = req.user.companyId;
    const contracts = await Contract.find({ companyId, isArchived: { $ne: true } });

    const contractsByType = {};
    const contractsByDepartment = {};
    const contractsByCounterparty = {};
    const contractValueByDepartment = {};

    let totalValue = 0;
    let autoRenewCount = 0;

    const monthlyExpiries = Array(12).fill(0);
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    contracts.forEach(c => {
      const type = c.contractType || 'Commercial Agreement';
      contractsByType[type] = (contractsByType[type] || 0) + 1;

      const dept = c.department || 'General';
      contractsByDepartment[dept] = (contractsByDepartment[dept] || 0) + 1;

      const cp = c.counterparty || 'Counterparty';
      contractsByCounterparty[cp] = (contractsByCounterparty[cp] || 0) + 1;

      const val = c.contractValue || 0;
      totalValue += val;
      contractValueByDepartment[dept] = (contractValueByDepartment[dept] || 0) + val;

      if (c.renewalType && c.renewalType.toLowerCase().includes('auto')) {
        autoRenewCount++;
      }

      if (c.expiryDate) {
        const monthIdx = new Date(c.expiryDate).getMonth();
        monthlyExpiries[monthIdx]++;
      }
    });

    const autoRenewalPercentage = contracts.length > 0 ? Math.round((autoRenewCount / contracts.length) * 100) : 0;

    res.json({
      success: true,
      data: {
        totalContracts: contracts.length,
        totalPortfolioValue: totalValue,
        autoRenewalPercentage,
        contractsByType: Object.keys(contractsByType).map(k => ({ type: k, count: contractsByType[k] })),
        contractsByDepartment: Object.keys(contractsByDepartment).map(k => ({ department: k, count: contractsByDepartment[k] })),
        contractsByCounterparty: Object.keys(contractsByCounterparty).map(k => ({ counterparty: k, count: contractsByCounterparty[k] })),
        valueByDepartment: Object.keys(contractValueByDepartment).map(k => ({ department: k, value: contractValueByDepartment[k] })),
        monthlyExpiriesTrend: monthNames.map((month, idx) => ({ month, count: monthlyExpiries[idx] }))
      }
    });
  } catch (error) {
    next(error);
  }
};
