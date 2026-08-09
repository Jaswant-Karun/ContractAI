const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this resource. Token missing.'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'contractiq_super_secret_jwt_key_2026_change_in_production');
    
    // Attach verified user and companyId directly to request object
    const user = await User.findById(decoded.id).select('-passwordHash');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'The user belonging to this token no longer exists.'
      });
    }

    req.user = {
      _id: user._id,
      name: user.name,
      email: user.email,
      companyId: user.companyId,
      role: user.role
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Session expired or invalid token. Please log in again.'
    });
  }
};

const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user.role}' is not authorized to perform this action.`
      });
    }
    next();
  };
};

module.exports = { protect, restrictTo };
