const mongoose = require('mongoose');

const counterpartySchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      index: true
    },
    name: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    type: {
      type: String,
      enum: ['Vendor', 'Customer', 'Partner', 'Other'],
      default: 'Vendor'
    },
    contactEmail: {
      type: String,
      default: ''
    },
    contactPhone: {
      type: String,
      default: ''
    },
    website: {
      type: String,
      default: ''
    },
    notes: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Counterparty', counterpartySchema);
