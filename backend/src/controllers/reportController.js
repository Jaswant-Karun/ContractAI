const Contract = require('../models/Contract');
const { triggerN8nReportSync } = require('../services/n8nService');

// @desc Get reporting metrics & distribution charts
// @route GET /api/reports
exports.getReports = async (req, res, next) => {
  try {
    const companyId = req.user.companyId;
    const contracts = await Contract.find({ companyId });

    let activeCount = 0;
    let expiringCount = 0;
    let expiredCount = 0;
    let renewedCount = 0;

    const riskCounts = { Low: 0, Medium: 0, High: 0, Critical: 0 };

    contracts.forEach(c => {
      const status = c.renewalStatus || 'Active';
      if (status === 'Active') activeCount++;
      if (status === 'Expiring Soon') expiringCount++;
      if (status === 'Expired') expiredCount++;
      if (status === 'Renewed') renewedCount++;

      const risk = c.riskLevel || 'Low';
      riskCounts[risk] = (riskCounts[risk] || 0) + 1;
    });

    res.json({
      success: true,
      data: {
        summary: {
          totalContracts: contracts.length,
          activeContracts: activeCount,
          expiringSoon: expiringCount,
          expiredContracts: expiredCount,
          renewedContracts: renewedCount,
          highRisk: riskCounts.High,
          mediumRisk: riskCounts.Medium,
          lowRisk: riskCounts.Low,
          criticalRisk: riskCounts.Critical
        },
        riskDistribution: [
          { name: 'Low', count: riskCounts.Low },
          { name: 'Medium', count: riskCounts.Medium },
          { name: 'High', count: riskCounts.High },
          { name: 'Critical', count: riskCounts.Critical }
        ],
        statusDistribution: [
          { name: 'Active', count: activeCount },
          { name: 'Expiring Soon', count: expiringCount },
          { name: 'Expired', count: expiredCount },
          { name: 'Renewed', count: renewedCount }
        ]
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc Export contract data as CSV file for Excel / Google Sheets
// @route GET /api/reports/export/csv
exports.exportCSV = async (req, res, next) => {
  try {
    const companyId = req.user.companyId;
    const contracts = await Contract.find({ companyId });

    // Sync to n8n webhook asynchronously if configured
    triggerN8nReportSync({ companyId, contractCount: contracts.length }).catch(() => {});

    // CSV Header required in requirement #19
    const headers = [
      'Contract ID', 'Company ID', 'Contract Name', 'Contract Type',
      'Parties', 'Start Date', 'Expiry Date', 'Renewal Date',
      'Renewal Type', 'Notice Period', 'Contract Value', 'Currency',
      'Risk', 'Status', 'Uploaded Date'
    ];

    const rows = contracts.map(c => [
      `"${c._id}"`,
      `"${c.companyId}"`,
      `"${(c.contractTitle || '').replace(/"/g, '""')}"`,
      `"${(c.contractType || '').replace(/"/g, '""')}"`,
      `"${(c.parties || []).join('; ').replace(/"/g, '""')}"`,
      `"${c.startDate ? new Date(c.startDate).toISOString().split('T')[0] : ''}"`,
      `"${c.expiryDate ? new Date(c.expiryDate).toISOString().split('T')[0] : ''}"`,
      `"${c.renewalDate ? new Date(c.renewalDate).toISOString().split('T')[0] : ''}"`,
      `"${(c.renewalType || '').replace(/"/g, '""')}"`,
      `"${c.noticePeriodDays || 30}"`,
      `"${c.contractValue || 0}"`,
      `"${c.currency || 'USD'}"`,
      `"${c.riskLevel || 'Low'}"`,
      `"${c.renewalStatus || 'Active'}"`,
      `"${new Date(c.createdAt).toISOString().split('T')[0]}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="ContractIQ_Contracts_Export.csv"');
    res.status(200).send(csvContent);
  } catch (error) {
    next(error);
  }
};
