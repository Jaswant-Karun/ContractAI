const Company = require('../models/Company');
const User = require('../models/User');

// @desc Get company & user profile settings
// @route GET /api/settings
exports.getSettings = async (req, res, next) => {
  try {
    const company = await Company.findById(req.user.companyId);
    const user = await User.findById(req.user._id).select('-passwordHash');

    res.json({
      success: true,
      data: {
        profile: {
          name: user.name,
          email: user.email,
          role: user.role
        },
        company: {
          id: company._id,
          name: company.name,
          settings: company.settings || {
            emailNotifications: true,
            reminderDays: [90, 60, 30, 15, 7, 1]
          }
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc Update settings
// @route PUT /api/settings
exports.updateSettings = async (req, res, next) => {
  try {
    const { name, companyName, emailNotifications, reminderDays } = req.body;

    if (name) {
      await User.findByIdAndUpdate(req.user._id, { name: name.trim() });
    }

    if (companyName || emailNotifications !== undefined || reminderDays) {
      const company = await Company.findById(req.user.companyId);
      if (companyName) company.name = companyName.trim();
      if (emailNotifications !== undefined) company.settings.emailNotifications = emailNotifications;
      if (reminderDays && Array.isArray(reminderDays)) company.settings.reminderDays = reminderDays;
      await company.save();
    }

    res.json({
      success: true,
      message: 'Settings updated successfully.'
    });
  } catch (error) {
    next(error);
  }
};
