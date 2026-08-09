const mongoose = require('mongoose');

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true
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
