const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ['user', 'assistant', 'system'],
      required: true
    },
    content: {
      type: String,
      required: true
    },
    evidenceReferences: [
      {
        contractId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contract' },
        field: String,
        evidenceQuote: String
      }
    ],
    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  { _id: true }
);

const chatSessionSchema = new mongoose.Schema(
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
    title: {
      type: String,
      default: 'New Contract Query'
    },
    contractIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Contract'
      }
    ],
    messages: [chatMessageSchema]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('ChatSession', chatSessionSchema);
