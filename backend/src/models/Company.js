const mongoose = require('mongoose');

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true
    },
    domain: {
      type: String,
      default: ''
    },
    industry: {
      type: String,
      default: 'Technology'
    },
    plan: {
      type: String,
      default: 'Enterprise Tier'
    },
    maxContracts: {
      type: Number,
      default: 1000
    },
    settings: {
      emailNotifications: {
        type: Boolean,
        default: true
      },
      reminderDays: {
        type: [Number],
        default: [90, 60, 30, 15, 7, 1]
      }
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Company', companySchema);
