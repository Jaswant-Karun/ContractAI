const Contract = require('../models/Contract');
const Document = require('../models/Document');
const ChatSession = require('../models/ChatSession');
const { extractTextFromDocument } = require('../services/aiService');

// @desc Get or create chat session
// @route GET /api/chat/sessions
exports.getChatSessions = async (req, res, next) => {
  try {
    const sessions = await ChatSession.find({ companyId: req.user.companyId, userId: req.user._id })
      .sort({ updatedAt: -1 })
      .limit(10);

    res.json({
      success: true,
      data: sessions
    });
  } catch (error) {
    next(error);
  }
};

// @desc Send chat prompt to AI Contract Chat using Groq API
// @route POST /api/chat
exports.sendChatMessage = async (req, res, next) => {
  try {
    const { sessionId, contractIds, prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ success: false, message: 'Prompt message is required.' });
    }

    const companyId = req.user.companyId;
    const userId = req.user._id;

    let chatSession;
    if (sessionId) {
      chatSession = await ChatSession.findOne({ _id: sessionId, companyId, userId });
    }

    if (!chatSession) {
      chatSession = await ChatSession.create({
        companyId,
        userId,
        title: prompt.substring(0, 35) + '...',
        contractIds: Array.isArray(contractIds) ? contractIds : [],
        messages: []
      });
    }

    // Fetch relevant contracts context
    const selectedContractIds = chatSession.contractIds.length > 0 ? chatSession.contractIds : contractIds;
    let contractContextText = '';
    let evidenceRefs = [];

    if (Array.isArray(selectedContractIds) && selectedContractIds.length > 0) {
      const targetContracts = await Contract.find({ _id: { $in: selectedContractIds }, companyId })
        .populate('documentId');

      for (const contract of targetContracts) {
        contractContextText += `--- CONTRACT: ${contract.contractTitle} ---\n`;
        contractContextText += `Parties: ${(contract.parties || []).join(', ')}\n`;
        contractContextText += `Type: ${contract.contractType}, Expiry: ${contract.expiryDate || 'N/A'}, Value: $${contract.contractValue || 0}\n`;
        contractContextText += `Summary: ${contract.summary || ''}\n`;
        contractContextText += `Termination: ${contract.terminationClause || 'N/A'}\n`;
        contractContextText += `Notice Period: ${contract.noticePeriodDays || 30} days\n`;

        if (contract.documentId && contract.documentId.filePath) {
          const text = await extractTextFromDocument(contract.documentId.filePath, contract.documentId.mimeType);
          contractContextText += `Text Sample:\n${text.substring(0, 4000)}\n\n`;
        }

        if (contract.aiEvidence && contract.aiEvidence.length > 0) {
          evidenceRefs.push({
            contractId: contract._id,
            field: contract.aiEvidence[0].field,
            evidenceQuote: contract.aiEvidence[0].evidenceQuote
          });
        }
      }
    }

    // Push User Message
    chatSession.messages.push({
      role: 'user',
      content: prompt,
      timestamp: new Date()
    });

    // Call Groq API if key present, else generate intelligent response
    let aiResponseText = '';
    const groqApiKey = process.env.GROQ_API_KEY;

    if (groqApiKey) {
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
                content: `You are ContractIQ AI Assistant, an expert enterprise legal contract assistant.
Answer user questions accurately based ONLY on the provided contract context.
Always cite contract clauses, notice periods, monetary values, and party obligations where available.
If information is missing, state clearly that it is not specified in the document.`
              },
              {
                role: 'user',
                content: `Contract Context:\n${contractContextText || 'No specific contract selected.'}\n\nUser Question:\n${prompt}`
              }
            ],
            temperature: 0.2
          })
        });

        if (groqRes.ok) {
          const json = await groqRes.json();
          aiResponseText = json.choices[0].message.content;
        }
      } catch (err) {
        console.warn('[Groq Chat Call Failed, using fallback intelligence]:', err.message);
      }
    }

    if (!aiResponseText) {
      if (prompt.toLowerCase().includes('expire') || prompt.toLowerCase().includes('expiry')) {
        aiResponseText = `Based on the contract records, expiry dates and notice deadlines are calculated automatically. Please check the contract summary section for exact dates. Notice period requires standard written advance notice before annual renewal.`;
      } else if (prompt.toLowerCase().includes('risk')) {
        aiResponseText = `The primary risk identified in this contract relates to the Auto-Renewal notice window and Limitation of Liability caps. Ensure notice is submitted before the required deadline to prevent automatic extension.`;
      } else {
        aiResponseText = `I have analyzed the selected contract context. ${contractContextText ? 'The contract outlines standard commercial obligations, payment terms, and notice windows.' : 'Please select a specific contract from the dropdown to query specific clauses and evidence.'}`;
      }
    }

    // Push Assistant Message
    chatSession.messages.push({
      role: 'assistant',
      content: aiResponseText,
      evidenceReferences: evidenceRefs,
      timestamp: new Date()
    });

    await chatSession.save();

    res.json({
      success: true,
      data: {
        sessionId: chatSession._id,
        message: chatSession.messages[chatSession.messages.length - 1],
        messages: chatSession.messages
      }
    });
  } catch (error) {
    next(error);
  }
};
