const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      index: true
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    fileName: {
      type: String,
      required: true
    },
    fileType: {
      type: String,
      required: true
    },
    fileSize: {
      type: Number,
      required: true
    },
    fileUrl: {
      type: String,
      required: true
    },
    filePath: {
      type: String,
      default: null   // absolute server-side path for text extraction
    },
    mimeType: {
      type: String,
      default: null   // duplicate of fileType, kept for compatibility
    },
    status: {
      type: String,
      enum: ['uploaded', 'processing', 'completed', 'failed'],
      default: 'uploaded',
      index: true
    },
    errorMessage: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Document', documentSchema);
