const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

const EXTRACTION_SYSTEM_PROMPT = `You are ContractIQ AI, an enterprise contract intelligence extraction engine.
You analyze contract text and extract structured fields in strict JSON format.

RULES:
- Extract ONLY information explicitly present in the document.
- Never invent or hallucinate dates, monetary values, parties, or clauses.
- If information is missing or ambiguous, set the value to null or an empty array [].
- Never infer missing information.
- Return ONLY valid JSON matching the exact schema.

SCHEMA REQUIREMENT:
{
  "contract_title": string | null,
  "contract_type": string | null,
  "parties": string[],
  "start_date": string (YYYY-MM-DD) | null,
  "expiry_date": string (YYYY-MM-DD) | null,
  "renewal_date": string (YYYY-MM-DD) | null,
  "renewal_type": string | null,
  "notice_period_days": number | null,
  "contract_value": number | null,
  "currency": string | null,
  "payment_terms": string | null,
  "termination_clause": string | null,
  "key_obligations": [ { "party": string, "description": string } ],
  "risks": [ { "title": string, "description": string, "severity": "Low"|"Medium"|"High"|"Critical", "evidence": string } ],
  "risk_level": "Low" | "Medium" | "High" | "Critical",
  "important_dates": [ { "event": string, "date": string, "description": string } ],
  "summary": string | null,
  "evidence": [ { "field": string, "value": string, "evidenceQuote": string } ]
}`;

const extractTextFromDocument = async (filePath, mimeType) => {
  try {
    const ext = path.extname(filePath).toLowerCase();
    const dataBuffer = fs.readFileSync(filePath);

    if (ext === '.pdf' || mimeType === 'application/pdf') {
      const data = await pdfParse(dataBuffer);
      return data.text || '';
    } else if (ext === '.docx' || ext === '.doc') {
      const result = await mammoth.extractRawText({ buffer: dataBuffer });
      return result.value || '';
    }
    return '';
  } catch (error) {
    console.error('[Document Text Extraction Failed]:', error.message);
    return '';
  }
};

const analyzeContractText = async (text, fileName) => {
  const groqApiKey = process.env.GROQ_API_KEY;

  if (groqApiKey && text.length > 50) {
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${groqApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama3-70b-8192',
          messages: [
            { role: 'system', content: EXTRACTION_SYSTEM_PROMPT },
            { role: 'user', content: `Document Title: ${fileName}\n\nContract Text:\n${text.substring(0, 20000)}` }
          ],
          temperature: 0.1,
          response_format: { type: 'json_object' }
        })
      });

      if (response.ok) {
        const jsonResult = await response.json();
        const contentStr = jsonResult.choices[0].message.content;
        const parsedData = JSON.parse(contentStr);
        return formatStructuredAnalysis(parsedData, fileName);
      }
    } catch (groqErr) {
      console.warn('[Groq API Call Failed, Falling Back to Structured Document Analysis]:', groqErr.message);
    }
  }

  // Smart fallback extraction engine based on heuristics & text patterns
  return generateIntelligentFallbackAnalysis(text, fileName);
};

const formatStructuredAnalysis = (data, fileName) => {
  const cleanName = fileName ? fileName.replace(/\.[^/.]+$/, "").replace(/_/g, " ") : "Untitled Document";

  return {
    contract_title: data.contract_title || cleanName,
    contract_type: data.contract_type || "General Agreement",
    parties: Array.isArray(data.parties) ? data.parties.filter(Boolean) : [],
    start_date: data.start_date || null,
    expiry_date: data.expiry_date || null,
    renewal_date: data.renewal_date || null,
    renewal_type: data.renewal_type || null,
    notice_period_days: (typeof data.notice_period_days === 'number' && !isNaN(data.notice_period_days)) ? data.notice_period_days : null,
    contract_value: (typeof data.contract_value === 'number' && !isNaN(data.contract_value)) ? data.contract_value : null,
    currency: data.currency || null,
    payment_terms: data.payment_terms || null,
    termination_clause: data.termination_clause || null,
    key_obligations: Array.isArray(data.key_obligations) ? data.key_obligations : [],
    risks: Array.isArray(data.risks) ? data.risks : [],
    risk_level: data.risk_level || (Array.isArray(data.risks) && data.risks.some(r => r.severity === 'Critical' || r.severity === 'High') ? "High" : "Low"),
    important_dates: Array.isArray(data.important_dates) ? data.important_dates : [],
    summary: data.summary || `Extracted document analysis for ${cleanName}.`,
    evidence: Array.isArray(data.evidence) ? data.evidence : []
  };
};

const generateIntelligentFallbackAnalysis = (text, fileName) => {
  const cleanName = fileName ? fileName.replace(/\.[^/.]+$/, "").replace(/_/g, " ") : "Untitled Document";
  const lowerText = (text || '').toLowerCase();

  // Contract Type detection
  let contractType = "General Agreement";
  if (lowerText.includes("saas") || lowerText.includes("software license")) contractType = "Software License";
  else if (lowerText.includes("lease") || lowerText.includes("rent")) contractType = "Real Estate Lease";
  else if (lowerText.includes("services agreement") || lowerText.includes("sow")) contractType = "Professional Services";
  else if (lowerText.includes("nda") || lowerText.includes("confidentiality")) contractType = "Non-Disclosure Agreement";
  else if (lowerText.includes("vendor") || lowerText.includes("supplier")) contractType = "Vendor Agreement";
  else if (lowerText.includes("employment")) contractType = "Employment Agreement";

  // Parties extraction from text
  const parties = [];
  const betweenMatch = text ? text.match(/by and between\s+([\w\s,]+?)\s+and\s+([\w\s,]+?)(?=\.|\n|,|is entered)/i) : null;
  if (betweenMatch) {
    if (betweenMatch[1]?.trim()) parties.push(betweenMatch[1].trim());
    if (betweenMatch[2]?.trim()) parties.push(betweenMatch[2].trim());
  }

  // Monetary value & currency detection
  let contractValue = null;
  let currency = null;
  const valueMatch = text ? text.match(/(?:\$|USD|INR|EUR|GBP|Rs\.?)\s*([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{2})?)/i) : null;
  if (valueMatch) {
    const rawVal = valueMatch[1].replace(/,/g, '');
    const num = parseFloat(rawVal);
    if (!isNaN(num) && num > 0) {
      contractValue = num;
      if (text.includes("INR") || text.includes("Rs")) currency = "INR";
      else if (text.includes("EUR") || text.includes("€")) currency = "EUR";
      else if (text.includes("GBP") || text.includes("£")) currency = "GBP";
      else currency = "USD";
    }
  }

  // Notice Period Days
  let noticePeriodDays = null;
  const noticeMatch = text ? text.match(/(\d+)\s*(?:days?|day)\s*(?:written)?\s*notice/i) : null;
  if (noticeMatch) {
    const days = parseInt(noticeMatch[1], 10);
    if (!isNaN(days)) noticePeriodDays = days;
  }

  // Payment Terms
  let paymentTerms = null;
  const payMatch = text ? text.match(/(net\s*\d+|\d+\s*days\s*from\s*invoice)/i) : null;
  if (payMatch) {
    paymentTerms = payMatch[1];
  }

  // Expiry / Start Date detection (Regex match for YYYY-MM-DD or MM/DD/YYYY)
  let startDate = null;
  let expiryDate = null;
  const dateMatches = text ? text.match(/\b(?:\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{4})\b/g) : null;
  if (dateMatches && dateMatches.length > 0) {
    startDate = dateMatches[0];
    if (dateMatches.length > 1) {
      expiryDate = dateMatches[1];
    }
  }

  // Risk detection
  const risks = [];
  if (lowerText.includes("uncapped liability") || lowerText.includes("unlimited liability")) {
    risks.push({
      title: "Unlimited Liability Risk",
      description: "Document specifies uncapped or unlimited liability terms.",
      severity: "High",
      evidence: "Unlimited liability text found in document."
    });
  }
  if (lowerText.includes("auto-renew") || lowerText.includes("automatic renewal")) {
    risks.push({
      title: "Automatic Renewal Clause",
      description: "Contract renews automatically unless written notice is provided.",
      severity: "Medium",
      evidence: "Automatic renewal clause detected in text."
    });
  }

  const riskLevel = risks.some(r => r.severity === 'High') ? "High" : risks.length > 0 ? "Medium" : "Low";

  return {
    contract_title: cleanName,
    contract_type: contractType,
    parties,
    start_date: startDate,
    expiry_date: expiryDate,
    renewal_date: null,
    renewal_type: lowerText.includes("auto") ? "Auto-Renewal" : null,
    notice_period_days: noticePeriodDays,
    contract_value: contractValue,
    currency,
    payment_terms: paymentTerms,
    termination_clause: lowerText.includes("terminate") ? "Termination clause detected in document text." : null,
    key_obligations: [],
    risks,
    risk_level: riskLevel,
    important_dates: [],
    summary: `Analysis performed for document ${cleanName}.`,
    evidence: []
  };
};

module.exports = {
  extractTextFromDocument,
  analyzeContractText
};
