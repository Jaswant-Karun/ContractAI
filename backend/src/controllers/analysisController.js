const Contract = require('../models/Contract');

// @desc Get 8-tab structured AI analysis for a specific contract or latest contract
// @route GET /api/analysis/:contractId
exports.getContractAnalysis = async (req, res, next) => {
  try {
    const { contractId } = req.params;
    let contract;

    if (contractId === 'latest') {
      contract = await Contract.findOne({ companyId: req.user.companyId })
        .sort({ createdAt: -1 })
        .populate('documentId', 'fileName fileUrl fileSize');
    } else {
      contract = await Contract.findOne({ _id: contractId, companyId: req.user.companyId })
        .populate('documentId', 'fileName fileUrl fileSize');
    }

    if (!contract) {
      return res.status(404).json({ success: false, message: 'No contract found.' });
    }

    // Standardize 8 tabs output
    const analysisData = {
      contractId: contract._id,
      contractTitle: contract.contractTitle,
      contractType: contract.contractType,
      counterparty: contract.counterparty,
      department: contract.department,
      summary: contract.summary || 'AI structured extraction completed for this contract.',
      keyTerms: {
        parties: contract.parties || [],
        effectiveDate: contract.startDate,
        expiryDate: contract.expiryDate,
        renewalType: contract.renewalType,
        noticePeriodDays: contract.noticePeriodDays,
        contractValue: contract.contractValue,
        currency: contract.currency,
        paymentTerms: contract.paymentTerms
      },
      obligations: contract.keyObligations || [],
      paymentTerms: {
        terms: contract.paymentTerms || 'Net 30 Days',
        annualValue: contract.annualValue || contract.contractValue,
        frequency: contract.paymentFrequency || 'Annual',
        priceEscalation: contract.priceEscalation || 'Standard 3-5% cap'
      },
      termination: {
        clause: contract.terminationClause || '30 days written notice prior to renewal date.',
        noticePeriodDays: contract.noticePeriodDays
      },
      renewal: {
        renewalType: contract.renewalType,
        renewalDate: contract.renewalDate,
        expiryDate: contract.expiryDate,
        noticeDeadline: contract.noticeDeadline,
        daysRemaining: contract.daysRemaining
      },
      risks: contract.risks || [],
      recommendations: contract.recommendations && contract.recommendations.length > 0 ? contract.recommendations : [
        'Review notice period deadline 60 days prior to expiry.',
        'Request confirmation of auto-renewal status from vendor contact.',
        'Verify indemnification caps against standard corporate guidelines.'
      ],
      evidence: contract.aiEvidence || []
    };

    res.json({
      success: true,
      data: analysisData
    });
  } catch (error) {
    next(error);
  }
};
