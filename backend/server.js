require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./src/config/db');
const errorHandler = require('./src/middleware/errorHandler');
const { checkAndTriggerRenewalReminders } = require('./src/services/notificationService');

// Express App setup
const app = express();

// Connect MongoDB
connectDB();

// Core Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Static file serving for uploaded document storage
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'ContractIQ Backend API service operational.',
    timestamp: new Date()
  });
});

// Mount Routes
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/documents', require('./src/routes/documentRoutes'));
app.use('/api/contracts', require('./src/routes/contractRoutes'));
app.use('/api/dashboard', require('./src/routes/dashboardRoutes'));
app.use('/api/notifications', require('./src/routes/notificationRoutes'));
app.use('/api/calendar', require('./src/routes/calendarRoutes'));
app.use('/api/reports', require('./src/routes/reportRoutes'));
app.use('/api/team', require('./src/routes/teamRoutes'));
app.use('/api/settings', require('./src/routes/settingsRoutes'));
app.use('/api/webhooks', require('./src/routes/webhookRoutes'));

// Extended Enterprise Routes
app.use('/api/analysis', require('./src/routes/analysisRoutes'));
app.use('/api/risks', require('./src/routes/riskRoutes'));
app.use('/api/renewals', require('./src/routes/renewalRoutes'));
app.use('/api/chat', require('./src/routes/chatRoutes'));
app.use('/api/comparison', require('./src/routes/comparisonRoutes'));
app.use('/api/clauses', require('./src/routes/clauseRoutes'));
app.use('/api/evidence', require('./src/routes/evidenceRoutes'));
app.use('/api/analytics', require('./src/routes/analyticsRoutes'));
app.use('/api/counterparties', require('./src/routes/counterpartyRoutes'));
app.use('/api/obligations', require('./src/routes/obligationRoutes'));
app.use('/api/automations', require('./src/routes/automationRoutes'));
app.use('/api/audit', require('./src/routes/auditRoutes'));
app.use('/api/workspace', require('./src/routes/workspaceRoutes'));

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route '${req.originalUrl}' not found.` });
});

// Centralized Error Handler
app.use(errorHandler);

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(` ContractIQ Backend API running on port ${PORT}`);
  console.log(` Mode: ${process.env.NODE_ENV || 'development'}`);
  console.log(` Base API URL: http://localhost:${PORT}/api`);
  console.log(`=======================================================`);

  // Run background renewal notification check every 6 hours
  setInterval(() => {
    console.log('[Scheduled Task]: Executing background contract renewal check...');
    checkAndTriggerRenewalReminders();
  }, 6 * 60 * 60 * 1000);
});
