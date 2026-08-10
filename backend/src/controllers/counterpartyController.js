const Contract = require('../models/Contract');
const Counterparty = require('../models/Counterparty');

// @desc Get counterparty/vendor list with aggregate contract value and risk profiles
// @route GET /api/counterparties
exports.getCounterparties = async (req, res, next) => {
  try {
    const companyId = req.user.companyId;

    const contracts = await Contract.find({ companyId, isArchived: { $ne: true } });

    const cpMap = {};

    contracts.forEach(c => {
      const name = c.counterparty || (c.parties && c.parties[1]) || (c.parties && c.parties[0]) || 'Unknown Counterparty';
      if (!cpMap[name]) {
        cpMap[name] = {
          name,
          contractCount: 0,
          totalValue: 0,
          riskLevels: { Low: 0, Medium: 0, High: 0, Critical: 0 },
          contracts: [],
          upcomingRenewals: 0
        };
      }

      cpMap[name].contractCount++;
      cpMap[name].totalValue += (c.contractValue || 0);

      const risk = c.riskLevel || 'Low';
      cpMap[name].riskLevels[risk] = (cpMap[name].riskLevels[risk] || 0) + 1;

      if (c.daysRemaining !== null && c.daysRemaining >= 0 && c.daysRemaining <= 90) {
        cpMap[name].upcomingRenewals++;
      }

      cpMap[name].contracts.push({
        _id: c._id,
        contractTitle: c.contractTitle,
        contractType: c.contractType,
        expiryDate: c.expiryDate,
        riskLevel: c.riskLevel,
        contractValue: c.contractValue
      });
    });

    const list = Object.values(cpMap);

    res.json({
      success: true,
      data: {
        totalCounterparties: list.length,
        counterparties: list.sort((a, b) => b.totalValue - a.totalValue)
      }
    });
  } catch (error) {
    next(error);
  }
};
