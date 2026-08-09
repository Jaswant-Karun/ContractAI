const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      index: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    contractId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Contract',
      default: null
    },
    type: {
      type: String,
      enum: ['Renewal Reminder', 'Contract Expired', 'AI Analysis Completed', 'Processing Failed', 'System'],
      required: true
    },
    title: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    scheduledFor: {
      type: Date,
      default: Date.now
    },
    sentAt: {
      type: Date,
      default: Date.now
    },
    read: {
      type: Boolean,
      default: false,
      index: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Notification', notificationSchema);
