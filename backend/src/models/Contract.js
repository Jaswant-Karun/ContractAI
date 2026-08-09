const mongoose = require('mongoose');

const riskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  severity: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Medium' },
  evidence: { type: String, default: 'Extracted from contract clause' }
}, { _id: false });

const obligationSchema = new mongoose.Schema({
  party: { type: String, default: 'General' },
  description: { type: String, required: true }
}, { _id: false });

const importantDateSchema = new mongoose.Schema({
  event: { type: String, required: true },
  date: { type: Date, required: true },
  description: { type: String, default: '' }
}, { _id: false });

const evidenceSchema = new mongoose.Schema({
  field: { type: String, required: true },
  value: { type: String, required: true },
  evidenceQuote: { type: String, required: true }
}, { _id: false });

const contractSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      index: true
    },
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document',
      required: true,
      index: true
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    contractTitle: {
      type: String,
      required: true,
      trim: true
    },
    contractType: {
      type: String,
      default: 'General Agreement',
      index: true
    },
    parties: {
      type: [String],
      default: []
    },
    startDate: {
      type: Date,
      default: null
    },
    expiryDate: {
      type: Date,
      default: null,
      index: true
    },
    renewalDate: {
      type: Date,
      default: null
    },
    renewalType: {
      type: String,
      default: 'Manual' // Auto-renew, Manual, Non-renewable
    },
    noticePeriodDays: {
      type: Number,
      default: 30
    },
    contractValue: {
      type: Number,
      default: null
    },
    currency: {
      type: String,
      default: 'USD'
    },
    paymentTerms: {
      type: String,
      default: null
    },
    terminationClause: {
      type: String,
      default: null
    },
    keyObligations: [obligationSchema],
    risks: [riskSchema],
    riskLevel: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Low',
      index: true
    },
    importantDates: [importantDateSchema],
    summary: {
      type: String,
      default: null
    },
    aiEvidence: [evidenceSchema],
    renewalStatus: {
      type: String,
      enum: ['Processing', 'Active', 'Expiring Soon', 'Expired', 'Renewed'],
      default: 'Active',
      index: true
    },
    remindersSent: {
      '90': { type: Boolean, default: false },
      '60': { type: Boolean, default: false },
      '30': { type: Boolean, default: false },
      '15': { type: Boolean, default: false },
      '7': { type: Boolean, default: false },
      '1': { type: Boolean, default: false }
    }
  },
  {
    timestamps: true
  }
);

// Virtual for calculating calculated days remaining dynamically
contractSchema.virtual('daysRemaining').get(function () {
  if (!this.expiryDate) return null;
  const now = new Date();
  const diffTime = new Date(this.expiryDate).getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for calculating notice deadline dynamically
contractSchema.virtual('noticeDeadline').get(function () {
  if (!this.expiryDate || !this.noticePeriodDays) return null;
  const expiry = new Date(this.expiryDate);
  expiry.setDate(expiry.getDate() - this.noticePeriodDays);
  return expiry;
});

contractSchema.set('toJSON', { virtuals: true });
contractSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Contract', contractSchema);
