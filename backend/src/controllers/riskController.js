const Contract = require('../models/Contract');

// @desc Get company-wide risk intelligence overview, category breakdown, & affected contracts
// @route GET /api/risks
exports.getRiskOverview = async (req, res, next) => {
  try {
    const companyId = req.user.companyId;

    const contracts = await Contract.find({ companyId, isArchived: { $ne: true } });

    const severityCounts = { Critical: 0, High: 0, Medium: 0, Low: 0 };
    const categoryCounts = {
      'Unlimited Liability': 0,
      'Auto Renewal Trap': 0,
      'Price Escalation': 0,
      'Termination Penalty': 0,
      'Indemnification': 0,
      'Data Protection / GDPR': 0,
      'Payment Terms Risk': 0,
      'SLA Breach Penalty': 0,
      'Missing Mandatory Clauses': 0
    };

    const riskByDepartment = {};
    const riskByType = {};
    const affectedContracts = [];

    contracts.forEach(contract => {
      const level = contract.riskLevel || 'Low';
      severityCounts[level] = (severityCounts[level] || 0) + 1;

      const dept = contract.department || 'General';
      if (!riskByDepartment[dept]) riskByDepartment[dept] = { Low: 0, Medium: 0, High: 0, Critical: 0 };
      riskByDepartment[dept][level]++;

      const type = contract.contractType || 'Commercial Agreement';
      if (!riskByType[type]) riskByType[type] = { Low: 0, Medium: 0, High: 0, Critical: 0 };
      riskByType[type][level]++;

      // Categorize risks
      if (Array.isArray(contract.risks) && contract.risks.length > 0) {
        contract.risks.forEach(r => {
          const t = (r.title || '').toLowerCase() + ' ' + (r.description || '').toLowerCase();
          if (t.includes('liability') || t.includes('uncapped')) categoryCounts['Unlimited Liability']++;
          if (t.includes('auto') || t.includes('renewal')) categoryCounts['Auto Renewal Trap']++;
          if (t.includes('price') || t.includes('escalation')) categoryCounts['Price Escalation']++;
          if (t.includes('termination') || t.includes('penalty')) categoryCounts['Termination Penalty']++;
          if (t.includes('indemni')) categoryCounts['Indemnification']++;
          if (t.includes('data') || t.includes('gdpr') || t.includes('privacy')) categoryCounts['Data Protection / GDPR']++;
          if (t.includes('payment') || t.includes('late')) categoryCounts['Payment Terms Risk']++;
          if (t.includes('sla') || t.includes('service level')) categoryCounts['SLA Breach Penalty']++;
          if (t.includes('missing') || t.includes('clause')) categoryCounts['Missing Mandatory Clauses']++;
        });

        affectedContracts.push({
          _id: contract._id,
          contractTitle: contract.contractTitle,
          contractType: contract.contractType,
          counterparty: contract.counterparty,
          department: contract.department,
          riskLevel: contract.riskLevel,
          risksCount: contract.risks.length,
          topRisk: contract.risks[0]?.title || 'Auto-renewal Notice Window'
        });
      }
    });

    res.json({
      success: true,
      data: {
        severityCounts,
        categoryCounts: Object.keys(categoryCounts).map(cat => ({ category: cat, count: categoryCounts[cat] })),
        riskByDepartment: Object.keys(riskByDepartment).map(d => ({ department: d, ...riskByDepartment[d] })),
        riskByType: Object.keys(riskByType).map(t => ({ type: t, ...riskByType[t] })),
        affectedContracts: affectedContracts.sort((a, b) => (b.riskLevel === 'Critical' ? 1 : -1))
      }
    });
  } catch (error) {
    next(error);
  }
};
