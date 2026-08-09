const triggerN8nDocumentAnalysis = async (payload) => {
  const webhookUrl = process.env.N8N_DOCUMENT_ANALYSIS_WEBHOOK;
  if (!webhookUrl) {
    console.log('[n8n Service]: N8N_DOCUMENT_ANALYSIS_WEBHOOK not set. Using direct backend AI processing pipeline.');
    return { success: false, fallback: true };
  }

  try {
    console.log(`[n8n Service]: Dispatching document payload to n8n webhook: ${webhookUrl}`);
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      const data = await response.json();
      return { success: true, data };
    } else {
      console.warn(`[n8n Service]: n8n webhook responded with status ${response.status}. Using direct fallback.`);
      return { success: false, fallback: true };
    }
  } catch (error) {
    console.warn(`[n8n Service]: Connection to n8n webhook failed (${error.message}). Executing direct backend fallback.`);
    return { success: false, fallback: true };
  }
};

const triggerN8nReportSync = async (payload) => {
  const webhookUrl = process.env.N8N_REPORT_WEBHOOK;
  if (!webhookUrl) {
    console.log('[n8n Service]: N8N_REPORT_WEBHOOK not set.');
    return { success: false };
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return { success: response.ok };
  } catch (error) {
    console.warn(`[n8n Service]: Report sync webhook failed: ${error.message}`);
    return { success: false };
  }
};

module.exports = {
  triggerN8nDocumentAnalysis,
  triggerN8nReportSync
};
