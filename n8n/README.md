# ContractIQ - n8n Automation Workflows & Integration Guide

ContractIQ relies on **n8n** as an external automation engine to handle asynchronous document text processing, Groq AI contract extraction, automated email alerts, and Google Sheets report synchronization.

---

## 1. Workflows Overview

### Workflow 1: ContractIQ - Document AI Analysis
- **Trigger**: HTTP Webhook (`POST /webhook/contractiq-analyze`)
- **Nodes**:
  1. `Webhook`: Receives document upload event from ContractIQ backend API.
  2. `Download Document`: Fetches contract PDF/DOCX file from `FILE_STORAGE_URL`.
  3. `Extract Text`: Converts PDF text or DOCX XML into clean UTF-8 text string.
  4. `Groq AI Node`: Sends extracted text to Groq API using `llama3-70b-8192` with strict JSON schema.
  5. `Validate JSON`: Ensures all required fields (`contract_title`, `expiry_date`, `notice_period_days`, `risks`, `obligations`) exist.
  6. `MongoDB Upsert`: Saves extracted analysis data into `contracts` collection.
  7. `Google Sheets Row`: Appends contract summary row into Google Sheet report.
  8. `Callback API`: Posts final status back to ContractIQ backend webhook (`/api/webhooks/n8n/analysis-result`).

### Workflow 2: ContractIQ - Renewal Monitoring & Email Alerts
- **Trigger**: Cron Schedule (Runs daily at 00:00 UTC or 6-hour interval)
- **Nodes**:
  1. `Schedule Trigger`: Triggers daily check.
  2. `MongoDB Query`: Queries all active contracts from `contracts` collection where `renewalStatus` is 'Active' or 'Expiring Soon'.
  3. `Code Node (Calculate Days)`: Computes `daysRemaining` and evaluates if `remindersSent` threshold flag (`90`, `60`, `30`, `15`, `7`, `1`) needs to be triggered.
  4. `IF Filter`: Checks if email notification is required.
  5. `SMTP Email`: Sends professional HTML email alert to company admins.
  6. `MongoDB Update`: Updates `remindersSent[interval]` flag to `true` to prevent duplicate emails.
  7. `Create Notification`: Inserts notification record in MongoDB `notifications` collection.

### Workflow 3: ContractIQ - Reports & Google Sheets Export
- **Trigger**: HTTP Webhook (`POST /webhook/contractiq-report`)
- **Nodes**:
  1. `Webhook`: Triggered upon user report export.
  2. `MongoDB Aggregate`: Aggregates contract statistics by companyId.
  3. `Transform Data`: Formats rows into spreadsheet column schema.
  4. `Google Sheets Sync`: Syncs latest contract details into designated Google Sheet tab.

---

## 2. Environment Variables & Credentials Setup

In your n8n instance, configure the following credentials:
- **Groq API**: Add Header Auth (`Authorization: Bearer gsk_your_groq_api_key`)
- **MongoDB Credentials**: `mongodb://localhost:27017/contractiq`
- **SMTP Credentials**: Set up SMTP credentials for email alerts.
- **Google Sheets OAuth2**: Connect Google Sheets API account.

---

## 3. Importing Workflows into n8n

1. Open your n8n dashboard (`http://localhost:5678`).
2. Click **Workflows** -> **Import from File**.
3. Select the workflow files from `n8n/workflows/`:
   - `contractiq_document_analysis.json`
   - `contractiq_renewal_monitoring.json`
   - `contractiq_reports_export.json`
4. Update node credential references and activate the workflows!
