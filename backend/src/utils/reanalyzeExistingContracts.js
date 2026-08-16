require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const Contract = require('../models/Contract');
const Document = require('../models/Document');
const Obligation = require('../models/Obligation');
const AutomationLog = require('../models/AutomationLog');
const { extractTextFromDocument, analyzeContractText } = require('../services/aiService');

const parseValidDate = (val) => {
  if (!val) return null;
  const d = new Date(val);
  return isNaN(d.getTime()) ? null : d;
};

const isDummyValue = (val) => {
  if (typeof val === 'string') {
    const l = val.toLowerCase();
    if (l.includes('acme digital') || l.includes('counterparty enterprise') || l.includes('master agreement')) return true;
  }
  return false;
};

const runReanalysis = async () => {
  try {
    const connStr = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/contractiq';
    console.log(`Connecting to MongoDB at: ${connStr}`);
    await mongoose.connect(connStr);
    console.log('Connected to MongoDB.');

    // Remove dummy automation logs
    await AutomationLog.deleteMany({});
    console.log('Cleared old automation logs.');

    // Fetch all contracts with uploaded documents
    const contracts = await Contract.find({}).populate('documentId');
    console.log(`Found ${contracts.length} contracts to inspect and re-analyze...`);

    let updatedCount = 0;

    for (const contract of contracts) {
      const doc = contract.documentId;
      
      // Clean title from " Master Agreement" suffix if present
      let cleanTitle = contract.contractTitle.replace(/\s+Master Agreement$/i, '').trim();

      if (doc && doc.filePath) {
        try {
          console.log(`Processing file: ${doc.filePath} for contract: "${cleanTitle}"...`);
          const extractedText = await extractTextFromDocument(doc.filePath, doc.mimeType);
          const analysis = await analyzeContractText(extractedText, doc.fileName || `${cleanTitle}.pdf`);

          contract.contractTitle = analysis.contract_title && analysis.contract_title !== 'Untitled Document' ? analysis.contract_title : (doc.fileName ? doc.fileName.replace(/\.[^/.]+$/, "").replace(/_/g, " ") : cleanTitle);
          contract.contractType = analysis.contract_type || 'General Agreement';
          contract.parties = Array.isArray(analysis.parties) ? analysis.parties : [];
          contract.startDate = parseValidDate(analysis.start_date);
          contract.expiryDate = parseValidDate(analysis.expiry_date);
          contract.renewalDate = parseValidDate(analysis.renewal_date);
          contract.renewalType = analysis.renewal_type || null;
          contract.noticePeriodDays = (typeof analysis.notice_period_days === 'number') ? analysis.notice_period_days : null;
          contract.contractValue = (typeof analysis.contract_value === 'number') ? analysis.contract_value : null;
          contract.currency = analysis.currency || null;
          contract.paymentTerms = analysis.payment_terms || null;
          contract.terminationClause = analysis.termination_clause || null;
          contract.keyObligations = Array.isArray(analysis.key_obligations) ? analysis.key_obligations : [];
          contract.risks = Array.isArray(analysis.risks) ? analysis.risks : [];
          contract.riskLevel = analysis.risk_level || 'Low';
          contract.importantDates = Array.isArray(analysis.important_dates) ? analysis.important_dates : [];
          contract.summary = analysis.summary || null;
          contract.aiEvidence = Array.isArray(analysis.evidence) ? analysis.evidence : [];

          await contract.save();
          updatedCount++;
          console.log(`Updated Contract ${contract._id}: "${contract.contractTitle}" (Parties: ${JSON.stringify(contract.parties)}, Value: ${contract.contractValue})`);
          continue;
        } catch (err) {
          console.warn(`Could not extract file for contract ${contract._id}:`, err.message);
        }
      }

      // If no file exists or re-extraction failed, scrub dummy values from DB record
      contract.contractTitle = cleanTitle;
      if (Array.isArray(contract.parties) && contract.parties.some(isDummyValue)) {
        contract.parties = [];
      }
      if (contract.contractValue === 75000 || contract.contractValue === 50000) {
        contract.contractValue = null;
      }
      if (Array.isArray(contract.keyObligations) && contract.keyObligations.some(o => isDummyValue(o.party) || isDummyValue(o.description))) {
        contract.keyObligations = [];
      }
      if (Array.isArray(contract.risks) && contract.risks.some(r => isDummyValue(r.title) || isDummyValue(r.description) || isDummyValue(r.evidence))) {
        contract.risks = [];
        contract.riskLevel = 'Low';
      }
      if (Array.isArray(contract.aiEvidence) && contract.aiEvidence.some(e => isDummyValue(e.evidenceQuote))) {
        contract.aiEvidence = [];
      }
      if (isDummyValue(contract.summary)) {
        contract.summary = `Contract ${cleanTitle}`;
      }

      await contract.save();
      updatedCount++;
      console.log(`Scrubbed dummy values for Contract ${contract._id}: "${contract.contractTitle}"`);
    }

    // Reset obligations table to re-sync cleanly
    await Obligation.deleteMany({});
    console.log('Cleared obligations table.');

    console.log(`\nRe-analysis finished! Successfully processed ${updatedCount} / ${contracts.length} contracts.`);
    process.exit(0);
  } catch (error) {
    console.error('Re-analysis error:', error);
    process.exit(1);
  }
};

runReanalysis();
