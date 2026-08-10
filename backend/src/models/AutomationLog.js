const mongoose = require('mongoose');

const automationLogSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      index: true
    },
    workflowName: {
      type: String,
      required: true,
      index: true
    },
    workflowType: {
      type: String,
      enum: ['Document AI Analysis', 'Renewal Monitoring', '90-Day Reminder', '60-Day Reminder', '30-Day Reminder', 'Email Notification', 'Google Sheets Sync'],
      required: true
    },
    status: {
      type: String,
      enum: ['Active', 'Completed', 'Failed', 'Running'],
      default: 'Completed',
      index: true
    },
    executionTimeMs: {
      type: Number,
      default: 0
    },
    details: {
      type: String,
      default: ''
    },
    errorDetails: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('AutomationLog', automationLogSchema);
