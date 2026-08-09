const Notification = require('../models/Notification');

// @desc Get user notifications
// @route GET /api/notifications
exports.getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({
      companyId: req.user.companyId,
      userId: req.user._id
    })
      .sort({ createdAt: -1 })
      .populate('contractId', 'contractTitle riskLevel expiryDate');

    const unreadCount = notifications.filter(n => !n.read).length;

    res.json({
      success: true,
      data: notifications,
      unreadCount
    });
  } catch (error) {
    next(error);
  }
};

// @desc Mark single notification read
// @route PUT /api/notifications/:id/read
exports.markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id, companyId: req.user.companyId },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found.' });
    }

    res.json({
      success: true,
      data: notification
    });
  } catch (error) {
    next(error);
  }
};

// @desc Mark all user notifications read
// @route PUT /api/notifications/read-all
exports.markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { userId: req.user._id, companyId: req.user.companyId, read: false },
      { read: true }
    );

    res.json({
      success: true,
      message: 'All notifications marked as read.'
    });
  } catch (error) {
    next(error);
  }
};
