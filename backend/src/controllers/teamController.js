const User = require('../models/User');
const AuditLog = require('../models/AuditLog');

// @desc Get team members for company
// @route GET /api/team
exports.getTeamMembers = async (req, res, next) => {
  try {
    const team = await User.find({ companyId: req.user.companyId }).select('-passwordHash').sort({ createdAt: -1 });
    res.json({
      success: true,
      data: team
    });
  } catch (error) {
    next(error);
  }
};

// @desc Invite new team member (Admin only)
// @route POST /api/team
exports.inviteMember = async (req, res, next) => {
  try {
    const { name, email, role = 'Member', password } = req.body;

    if (!name || !email) {
      return res.status(400).json({ success: false, message: 'Name and email are required.' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'A user with this email address already exists.' });
    }

    const tempPassword = password || 'Password123!';

    const newUser = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash: tempPassword,
      companyId: req.user.companyId,
      role: role
    });

    await AuditLog.create({
      companyId: req.user.companyId,
      userId: req.user._id,
      action: 'Team Member Invited',
      entityType: 'User',
      entityId: newUser._id,
      metadata: { invitedEmail: newUser.email, role: newUser.role }
    });

    res.status(201).json({
      success: true,
      data: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        tempPassword
      },
      message: 'Team member added successfully.'
    });
  } catch (error) {
    next(error);
  }
};

// @desc Update team member role (Admin only)
// @route PUT /api/team/:id
exports.updateMemberRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['Admin', 'Manager', 'Member'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role specified.' });
    }

    const member = await User.findOne({ _id: req.params.id, companyId: req.user.companyId });
    if (!member) {
      return res.status(404).json({ success: false, message: 'Team member not found or access denied.' });
    }

    member.role = role;
    await member.save();

    await AuditLog.create({
      companyId: req.user.companyId,
      userId: req.user._id,
      action: 'Team Member Role Updated',
      entityType: 'User',
      entityId: member._id,
      metadata: { updatedUser: member.email, newRole: role }
    });

    res.json({
      success: true,
      data: member,
      message: 'Role updated successfully.'
    });
  } catch (error) {
    next(error);
  }
};

// @desc Remove team member (Admin only)
// @route DELETE /api/team/:id
exports.removeMember = async (req, res, next) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot remove your own account.' });
    }

    const member = await User.findOneAndDelete({ _id: req.params.id, companyId: req.user.companyId });
    if (!member) {
      return res.status(404).json({ success: false, message: 'Team member not found.' });
    }

    await AuditLog.create({
      companyId: req.user.companyId,
      userId: req.user._id,
      action: 'Team Member Removed',
      entityType: 'User',
      entityId: member._id,
      metadata: { removedUser: member.email }
    });

    res.json({
      success: true,
      message: 'Team member removed successfully.'
    });
  } catch (error) {
    next(error);
  }
};
