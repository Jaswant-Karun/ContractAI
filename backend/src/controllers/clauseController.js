const Contract = require('../models/Contract');

// @desc Get clause-level breakdown across all company contracts
// @route GET /api/clauses
exports.getClauseIntelligence = async (req, res, next) => {
  try {
    const companyId = req.user.companyId;
    const { clauseType, riskLevel } = req.query;

    const contracts = await Contract.find({ companyId, isArchived: { $ne: true } });

    let allClauses = [];

    contracts.forEach(contract => {
      const clauses = Array.isArray(contract.clauses) ? contract.clauses : [];

      clauses.forEach(c => {
        allClauses.push({
          contractId: contract._id,
          contractTitle: contract.contractTitle,
          counterparty: contract.counterparty,
          department: contract.department,
          ...c
        });
      });
    });

    if (clauseType) {
      allClauses = allClauses.filter(c => c.clauseType.toLowerCase() === clauseType.toLowerCase());
    }
    if (riskLevel) {
      allClauses = allClauses.filter(c => c.risk.toLowerCase() === riskLevel.toLowerCase());
    }

    const categories = ['Auto Renewal', 'Termination', 'Liability', 'Indemnity', 'Payment Terms', 'Confidentiality', 'Data Protection', 'SLA'];

    res.json({
      success: true,
      data: {
        categories,
        totalClauses: allClauses.length,
        clauses: allClauses
      }
    });
  } catch (error) {
    next(error);
  }
};
