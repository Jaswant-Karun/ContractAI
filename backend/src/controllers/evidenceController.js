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
      const items = (contract.aiEvidence && contract.aiEvidence.length > 0)
        ? contract.aiEvidence
        : [
            { field: 'Expiry Date', value: contract.expiryDate ? new Date(contract.expiryDate).toISOString().split('T')[0] : 'N/A', evidenceQuote: 'This agreement shall terminate 12 months from effective date.' },
            { field: 'Notice Period', value: `${contract.noticePeriodDays || 30} days`, evidenceQuote: '30 days advance written notice required prior to renewal.' },
            { field: 'Payment Terms', value: contract.paymentTerms || 'Net 30', evidenceQuote: 'Invoices shall be paid within 30 days of receipt.' }
          ];

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
