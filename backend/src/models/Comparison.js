const mongoose = require('mongoose');

const comparisonSchema = new mongoose.Schema(
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
      required: true
    },
    contractAId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Contract',
      required: true
    },
    contractBId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Contract',
      required: true
    },
    addedClauses: [{ title: String, text: String, impact: String }],
    removedClauses: [{ title: String, text: String, impact: String }],
    modifiedClauses: [{ title: String, originalText: String, newText: String, diffSummary: String }],
    dateChanges: [{ field: String, valA: String, valB: String }],
    paymentChanges: [{ field: String, valA: String, valB: String }],
    riskDelta: {
      scoreA: Number,
      scoreB: Number,
      summary: String
    },
    aiSummary: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Comparison', comparisonSchema);
