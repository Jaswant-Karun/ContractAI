const calculateDaysRemaining = (expiryDate) => {
  if (!expiryDate) return null;
  const now = new Date();
  const expiry = new Date(expiryDate);
  const diffTime = expiry.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const calculateNoticeDeadline = (expiryDate, noticePeriodDays = 30) => {
  if (!expiryDate) return null;
  const expiry = new Date(expiryDate);
  expiry.setDate(expiry.getDate() - (noticePeriodDays || 30));
  return expiry;
};

const calculateContractStatus = (expiryDate, isRenewed = false) => {
  if (isRenewed) return 'Renewed';
  if (!expiryDate) return 'Active';
  
  const days = calculateDaysRemaining(expiryDate);
  if (days <= 0) return 'Expired';
  if (days <= 30) return 'Expiring Soon';
  return 'Active';
};

const getCalendarUrgency = (expiryDate) => {
  const days = calculateDaysRemaining(expiryDate);
  if (days === null) return 'Safe';
  if (days <= 0) return 'Expired';
  if (days <= 7) return 'Critical';
  if (days <= 30) return 'Urgent';
  if (days <= 60) return 'Upcoming';
  return 'Safe';
};

module.exports = {
  calculateDaysRemaining,
  calculateNoticeDeadline,
  calculateContractStatus,
  getCalendarUrgency
};
