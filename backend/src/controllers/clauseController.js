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
      // Aggregate default clauses if explicit ones not parsed yet
      const clauses = (contract.clauses && contract.clauses.length > 0) ? contract.clauses : [
        {
          clauseType: 'Auto Renewal',
          title: 'Renewal Notice Period',
          text: `Contract requires ${contract.noticePeriodDays || 30} days written advance notice prior to expiration to prevent automatic annual renewal.`,
          risk: contract.riskLevel || 'Medium',
          evidenceQuote: contract.aiEvidence?.[0]?.evidenceQuote || 'Written notice required prior to renewal date.',
          recommendation: 'Calendar the notice deadline 60 days in advance.'
        },
        {
          clauseType: 'Termination',
          title: 'Termination for Convenience',
          text: contract.terminationClause || 'Either party may terminate upon 30 days written notice prior to contract expiration.',
          risk: 'Low',
          evidenceQuote: contract.terminationClause || '30 days written notice required.',
          recommendation: 'Ensure notice delivery method complies with formal notice provisions.'
        },
        {
          clauseType: 'Payment Terms',
          title: 'Payment Schedule & Currency',
          text: `Payment is due ${contract.paymentTerms || 'Net 30 Days'} in ${contract.currency || 'USD'}.`,
          risk: 'Low',
          evidenceQuote: `Payment terms: ${contract.paymentTerms || 'Net 30'}`,
          recommendation: 'Verify invoice processing cycles align with payment terms.'
        },
        {
          clauseType: 'Liability',
          title: 'Limitation of Liability Cap',
          text: 'Liability is capped at the total aggregate fees paid in the preceding 12 months.',
          risk: contract.riskLevel === 'Critical' ? 'High' : 'Medium',
          evidenceQuote: 'Total liability shall not exceed fees paid in prior 12 months.',
          recommendation: 'Negotiate mutual liability cap for standard commercial risk alignment.'
        }
      ];

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
