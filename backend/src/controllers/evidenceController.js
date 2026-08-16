const Contract = require('../models/Contract');

// @desc Get all verified source evidence quotes linked to AI contract findings
// @route GET /api/evidence
exports.getEvidenceExplorer = async (req, res, next) => {
  try {
    const companyId = req.user.companyId;
    const { contractId, field } = req.query;

    const query = { companyId, isArchived: { $ne: true } };
    if (contractId) query._id = contractId;

    const contracts = await Contract.find(query).populate('documentId', 'fileName fileUrl');

    const evidenceList = [];

    contracts.forEach(contract => {
      const items = Array.isArray(contract.aiEvidence) ? contract.aiEvidence : [];

      items.forEach(item => {
        evidenceList.push({
          contractId: contract._id,
          contractTitle: contract.contractTitle,
          counterparty: contract.counterparty,
          documentName: contract.documentId?.fileName || `${contract.contractTitle}.pdf`,
          documentUrl: contract.documentId?.fileUrl || null,
          field: item.field,
          value: item.value,
          evidenceQuote: item.evidenceQuote,
          pageNumber: item.page || null
        });
      });
    });

    let filtered = evidenceList;
    if (field) {
      filtered = evidenceList.filter(e => e.field.toLowerCase().includes(field.toLowerCase()));
    }

    res.json({
      success: true,
      data: {
        totalEvidenceItems: filtered.length,
        evidence: filtered
      }
    });
  } catch (error) {
    next(error);
  }
};
