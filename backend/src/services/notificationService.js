const Notification = require('../models/Notification');
const Contract = require('../models/Contract');
const User = require('../models/User');

const createNotification = async ({ companyId, userId, contractId, type, title, message }) => {
  try {
    const notification = await Notification.create({
      companyId,
      userId,
      contractId,
      type,
      title,
      message,
      scheduledFor: new Date(),
      sentAt: new Date(),
      read: false
    });
    return notification;
  } catch (error) {
    console.error('[Notification Service Error]:', error.message);
    return null;
  }
};

const notifyCompanyAdmins = async ({ companyId, contractId, type, title, message }) => {
  try {
    const users = await User.find({ companyId, role: { $in: ['Admin', 'Manager'] } });
    const notifications = await Promise.all(
      users.map(user =>
        Notification.create({
          companyId,
          userId: user._id,
          contractId,
          type,
          title,
          message,
          read: false
        })
      )
    );
    return notifications;
  } catch (error) {
    console.error('[Notify Company Admins Error]:', error.message);
    return [];
  }
};

const checkAndTriggerRenewalReminders = async (companyId = null) => {
  try {
    const query = { renewalStatus: { $in: ['Active', 'Expiring Soon'] } };
    if (companyId) query.companyId = companyId;

    const contracts = await Contract.find(query);
    const now = new Date();
    let triggeredCount = 0;

    for (const contract of contracts) {
      if (!contract.expiryDate) continue;

      const diffTime = new Date(contract.expiryDate).getTime() - now.getTime();
      const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      const intervals = [90, 60, 30, 15, 7, 1];

      for (const interval of intervals) {
        const intervalKey = String(interval);
        
        // If contract is within interval threshold and reminder hasn't been sent yet
        if (daysRemaining <= interval && daysRemaining > 0 && !contract.remindersSent[intervalKey]) {
          // Trigger notification
          await notifyCompanyAdmins({
            companyId: contract.companyId,
            contractId: contract._id,
            type: 'Renewal Reminder',
            title: `Renewal Alert: ${contract.contractTitle}`,
            message: `Contract "${contract.contractTitle}" is expiring in ${daysRemaining} day(s) on ${new Date(contract.expiryDate).toLocaleDateString()}. Notice deadline: ${contract.noticePeriodDays} days.`
          });

          // Mark reminder interval as sent to prevent duplicates
          contract.remindersSent[intervalKey] = true;
          if (daysRemaining <= 30) {
            contract.renewalStatus = 'Expiring Soon';
          }
          await contract.save();
          triggeredCount++;
          break; // Process one interval per check
        }
      }

      // Check if expired
      if (daysRemaining <= 0 && contract.renewalStatus !== 'Expired') {
        contract.renewalStatus = 'Expired';
        await contract.save();

        await notifyCompanyAdmins({
          companyId: contract.companyId,
          contractId: contract._id,
          type: 'Contract Expired',
          title: `Contract Expired: ${contract.contractTitle}`,
          message: `Contract "${contract.contractTitle}" has officially expired on ${new Date(contract.expiryDate).toLocaleDateString()}.`
        });
        triggeredCount++;
      }
    }

    return { success: true, processed: contracts.length, triggered: triggeredCount };
  } catch (error) {
    console.error('[Check Renewal Reminders Error]:', error.message);
    return { success: false, error: error.message };
  }
};

module.exports = {
  createNotification,
  notifyCompanyAdmins,
  checkAndTriggerRenewalReminders
};
