const Contract = require('../models/Contract');
const Comparison = require('../models/Comparison');
const { extractTextFromDocument } = require('../services/aiService');

// @desc Compare Contract A vs Contract B using Groq semantic comparison
// @route POST /api/comparison
exports.compareContracts = async (req, res, next) => {
  try {
    const { contractAId, contractBId } = req.body;
    if (!contractAId || !contractBId) {
      return res.status(400).json({ success: false, message: 'Both Contract A and Contract B IDs are required.' });
    }

    const companyId = req.user.companyId;

    const contractA = await Contract.findOne({ _id: contractAId, companyId }).populate('documentId');
    const contractB = await Contract.findOne({ _id: contractBId, companyId }).populate('documentId');

    if (!contractA || !contractB) {
      return res.status(404).json({ success: false, message: 'One or both contracts were not found.' });
    }

    let textA = '';
    let textB = '';

    if (contractA.documentId && contractA.documentId.filePath) {
      textA = await extractTextFromDocument(contractA.documentId.filePath, contractA.documentId.mimeType);
    }
    if (contractB.documentId && contractB.documentId.filePath) {
      textB = await extractTextFromDocument(contractB.documentId.filePath, contractB.documentId.mimeType);
    }

    const groqApiKey = process.env.GROQ_API_KEY;
    let comparisonResult = null;

    if (groqApiKey && (textA.length > 50 || textB.length > 50)) {
      try {
        const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${groqApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'llama3-70b-8192',
            messages: [
              {
                role: 'system',
                content: `You are ContractIQ Semantic Comparison Engine. Compare Contract A vs Contract B and return strict JSON format matching:
{
  "addedClauses": [{ "title": string, "text": string, "impact": string }],
  "removedClauses": [{ "title": string, "text": string, "impact": string }],
  "modifiedClauses": [{ "title": string, "originalText": string, "newText": string, "diffSummary": string }],
  "dateChanges": [{ "field": string, "valA": string, "valB": string }],
  "paymentChanges": [{ "field": string, "valA": string, "valB": string }],
  "riskDelta": { "scoreA": number, "scoreB": number, "summary": string },
  "aiSummary": string
}`
              },
              {
                role: 'user',
                content: `CONTRACT A (${contractA.contractTitle}):\n${textA.substring(0, 10000)}\n\nCONTRACT B (${contractB.contractTitle}):\n${textB.substring(0, 10000)}`
              }
            ],
            temperature: 0.1,
            response_format: { type: 'json_object' }
          })
        });

        if (groqRes.ok) {
          const json = await groqRes.json();
          comparisonResult = JSON.parse(json.choices[0].message.content);
        }
      } catch (err) {
        console.warn('[Groq Comparison Failed, using fallback comparison]:', err.message);
      }
    }

    if (!comparisonResult) {
      const dateChanges = [];
      const paymentChanges = [];
      const modifiedClauses = [];

      const valA_exp = contractA.expiryDate ? new Date(contractA.expiryDate).toISOString().split('T')[0] : 'Not specified';
      const valB_exp = contractB.expiryDate ? new Date(contractB.expiryDate).toISOString().split('T')[0] : 'Not specified';
      if (valA_exp !== valB_exp) {
        dateChanges.push({ field: 'Expiry Date', valA: valA_exp, valB: valB_exp });
      }

      const valA_notice = contractA.noticePeriodDays !== null && contractA.noticePeriodDays !== undefined ? `${contractA.noticePeriodDays} days` : 'Not specified';
      const valB_notice = contractB.noticePeriodDays !== null && contractB.noticePeriodDays !== undefined ? `${contractB.noticePeriodDays} days` : 'Not specified';
      if (valA_notice !== valB_notice) {
        modifiedClauses.push({
          title: 'Notice Period',
          originalText: `Contract A notice: ${valA_notice}`,
          newText: `Contract B notice: ${valB_notice}`,
          diffSummary: 'Notice period requirement differs between contracts.'
        });
      }

      const valA_value = contractA.contractValue !== null && contractA.contractValue !== undefined ? `${contractA.currency || '$'}${contractA.contractValue}` : 'Not specified';
      const valB_value = contractB.contractValue !== null && contractB.contractValue !== undefined ? `${contractB.currency || '$'}${contractB.contractValue}` : 'Not specified';
      if (valA_value !== valB_value) {
        paymentChanges.push({ field: 'Contract Value', valA: valA_value, valB: valB_value });
      }

      const valA_pay = contractA.paymentTerms || 'Not specified';
      const valB_pay = contractB.paymentTerms || 'Not specified';
      if (valA_pay !== valB_pay) {
        paymentChanges.push({ field: 'Payment Terms', valA: valA_pay, valB: valB_pay });
      }

      const scoreA = contractA.riskLevel === 'Critical' ? 90 : contractA.riskLevel === 'High' ? 75 : contractA.riskLevel === 'Medium' ? 50 : 25;
      const scoreB = contractB.riskLevel === 'Critical' ? 90 : contractB.riskLevel === 'High' ? 75 : contractB.riskLevel === 'Medium' ? 50 : 25;

      comparisonResult = {
        addedClauses: [],
        removedClauses: [],
        modifiedClauses,
        dateChanges,
        paymentChanges,
        riskDelta: {
          scoreA,
          scoreB,
          summary: `Risk rating is ${contractA.riskLevel || 'Low'} for Contract A vs ${contractB.riskLevel || 'Low'} for Contract B.`
        },
        aiSummary: `Comparison generated between ${contractA.contractTitle} and ${contractB.contractTitle}.`
      };
    }

    const savedComparison = await Comparison.create({
      companyId,
      userId: req.user._id,
      contractAId: contractA._id,
      contractBId: contractB._id,
      ...comparisonResult
    });

    res.json({
      success: true,
      data: {
        contractA: { _id: contractA._id, title: contractA.contractTitle, type: contractA.contractType },
        contractB: { _id: contractB._id, title: contractB.contractTitle, type: contractB.contractType },
        comparison: savedComparison
      }
    });
  } catch (error) {
    next(error);
  }
};
