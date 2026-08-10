const Company = require('../models/Company');
const User = require('../models/User');
const Contract = require('../models/Contract');
const Document = require('../models/Document');

// @desc Get organization workspace details, storage usage, team members & RBAC permission matrix
// @route GET /api/workspace
exports.getWorkspaceDetails = async (req, res, next) => {
  try {
    const companyId = req.user.companyId;

    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({ success: false, message: 'Workspace organization not found.' });
    }
    const members = await User.find({ companyId }).select('-passwordHash');

    const totalContracts = await Contract.countDocuments({ companyId });

    // Storage calculation
    const docs = await Document.find({ companyId });
    let totalBytes = 0;
    docs.forEach(d => {
      totalBytes += (d.fileSize || 0);
    });

    const storageUsageMB = (totalBytes / (1024 * 1024)).toFixed(2);

    const rbacMatrix = [
      { feature: 'View Contracts & Repositories', Admin: true, Manager: true, Member: true },
      { feature: 'Upload & Process Documents', Admin: true, Manager: true, Member: true },
      { feature: 'Re-analyze & Edit Metadata', Admin: true, Manager: true, Member: false },
      { feature: 'Perform Renewal Actions', Admin: true, Manager: true, Member: false },
      { feature: 'Export Portfolio & Reports', Admin: true, Manager: true, Member: true },
      { feature: 'Manage Workspace & Invite Users', Admin: true, Manager: false, Member: false },
      { feature: 'Delete Contracts & Audit Logs', Admin: true, Manager: false, Member: false }
    ];

    res.json({
      success: true,
      data: {
        organization: {
          _id: company._id,
          name: company.name,
          domain: company.domain || '',
          industry: company.industry || 'Technology',
          plan: company.plan || 'Enterprise Tier',
          contractQuota: company.maxContracts || 1000,
          totalContracts,
          storageUsageMB,
          storageLimitMB: 5000
        },
        members,
        rbacMatrix
      }
    });
  } catch (error) {
    next(error);
  }
};
