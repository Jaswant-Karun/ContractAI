const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Company = require('../models/Company');
const AuditLog = require('../models/AuditLog');

const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'contractiq_super_secret_jwt_key_2026_change_in_production',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// @desc Register user & new company
// @route POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const { name, companyName, email, password, confirmPassword } = req.body;

    if (!name || !companyName || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide all required registration fields.' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match.' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account with this email address already exists.' });
    }

    // Create Company
    const company = await Company.create({
      name: companyName.trim()
    });

    // Create Admin User for new company
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash: password,
      companyId: company._id,
      role: 'Admin'
    });

    // Log audit action
    await AuditLog.create({
      companyId: company._id,
      userId: user._id,
      action: 'Account & Company Registered',
      entityType: 'User',
      entityId: user._id,
      metadata: { companyName: company.name, email: user.email }
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          companyId: user.companyId,
          companyName: company.name
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc Login user
// @route POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password.' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+passwordHash');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. User not found.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. Password incorrect.' });
    }

    const company = await Company.findById(user.companyId);

    // Audit log
    await AuditLog.create({
      companyId: user.companyId,
      userId: user._id,
      action: 'User Logged In',
      entityType: 'User',
      entityId: user._id
    });

    const token = generateToken(user._id);

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          companyId: user.companyId,
          companyName: company ? company.name : 'Company'
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get current user profile
// @route GET /api/auth/me
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const company = await Company.findById(req.user.companyId);

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          companyId: user.companyId,
          companyName: company ? company.name : 'Company'
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc Logout user
// @route POST /api/auth/logout
exports.logout = async (req, res) => {
  res.json({
    success: true,
    message: 'Successfully logged out.'
  });
};

// @desc Request password reset
// @route POST /api/auth/forgot-password
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email address is required.' });
    }

    res.json({
      success: true,
      message: 'If an account exists with that email, a password reset link has been dispatched.'
    });
  } catch (error) {
    next(error);
  }
};
