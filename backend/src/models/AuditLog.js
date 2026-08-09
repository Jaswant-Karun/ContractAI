const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
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
    action: {
      type: String,
      required: true
    },
    entityType: {
      type: String,
      required: true // User, Contract, Document, Company
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('AuditLog', auditLogSchema);
