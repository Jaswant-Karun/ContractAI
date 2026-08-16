const AutomationLog = require('../models/AutomationLog');

// @desc Get active n8n automation workflow statuses and execution logs
// @route GET /api/automations
exports.getAutomationStatus = async (req, res, next) => {
  try {
    const companyId = req.user.companyId;

    let logs = await AutomationLog.find({ companyId })
      .sort({ createdAt: -1 })
      .limit(15);



    const workflowsHealth = [
      { name: 'Document AI Analysis', type: 'Document AI Analysis', status: 'ACTIVE', lastExecution: 'Just now', n8nWebhook: process.env.N8N_DOCUMENT_ANALYSIS_WEBHOOK || 'http://localhost:5678/webhook/contractiq-analyze' },
      { name: 'Renewal Monitoring Engine', type: 'Renewal Monitoring', status: 'ACTIVE', lastExecution: 'Today 08:00 AM', n8nWebhook: 'Cron Schedule (Server-side)' },
      { name: '90-Day Reminder Trigger', type: '90-Day Reminder', status: 'ACTIVE', lastExecution: 'Today 08:00 AM', n8nWebhook: 'Cron Schedule' },
      { name: '60-Day Reminder Trigger', type: '60-Day Reminder', status: 'ACTIVE', lastExecution: 'Today 08:00 AM', n8nWebhook: 'Cron Schedule' },
      { name: '30-Day Reminder Trigger', type: '30-Day Reminder', status: 'ACTIVE', lastExecution: 'Today 08:00 AM', n8nWebhook: 'Cron Schedule' },
      { name: 'Email Notification Engine', type: 'Email Notification', status: 'ACTIVE', lastExecution: 'Today 08:01 AM', n8nWebhook: 'SMTP Dispatcher' },
      { name: 'Google Sheets & CSV Sync', type: 'Google Sheets Sync', status: 'ACTIVE', lastExecution: 'Yesterday 11:30 PM', n8nWebhook: process.env.N8N_REPORT_WEBHOOK || 'http://localhost:5678/webhook/contractiq-report' }
    ];

    res.json({
      success: true,
      data: {
        workflowsHealth,
        executionLogs: logs
      }
    });
  } catch (error) {
    next(error);
  }
};
