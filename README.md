# ContractIQ – AI Contract Intelligence & Renewal Management Platform

> *"Understand every contract. Never miss a renewal."*

ContractIQ is a complete, production-ready B2B SaaS platform designed to transform complex enterprise legal documents into structured intelligence. It automatically extracts key dates, financial terms, and obligations, detects high-severity risks, calculates advance notice deadlines, dispatches automated email alerts, and syncs reports with Google Sheets via n8n automation workflows.

---

## 🚀 Key Features

1. **Multi-Tenant Workspace Security**: Strict company-level data isolation via JWT `companyId` scoping.
2. **AI-Powered Contract Extraction**: Automatically extracts contract title, type, parties, financial values, payment terms, termination clauses, and key obligations using Groq LLM API.
3. **Automated Risk & Severity Scoring**: Identifies price escalation clauses, uncapped liability, and auto-renewal traps, tagging them as Low, Medium, High, or Critical risk.
4. **Source Evidence Verifiability**: Displays exact quotes from original documents supporting extracted fields.
5. **Renewal Calendar & Urgency Tracking**: Color-coded calendar showing contract expiration dates and notice deadlines (Safe, Upcoming, Urgent, Critical, Expired).
6. **n8n Automation Engine**: Server-side document processing, automated email alerts at customizable intervals (90, 60, 30, 15, 7, 1 days), and Google Sheets reporting.
7. **Team Role-Based Access Control (RBAC)**: Admin, Manager, and Member roles with invitation workflows.
8. **Dark & Light Mode UI**: Premium enterprise visual design system with vanilla CSS variables.

---

## 🛠️ Technology Stack

- **Frontend**: React (Vite, JavaScript, JSX), React Router v6, Axios, Recharts, Lucide React, Custom CSS with CSS variables (No Tailwind CSS, No TypeScript).
- **Backend**: Node.js, Express.js, JavaScript, Mongoose, MongoDB, JWT (`jsonwebtoken`), bcrypt (`bcryptjs`), Multer file handler, `pdf-parse`, `mammoth`.
- **Automation & AI**: n8n workflows, Groq LLM API (`llama3-70b-8192`), SMTP Email, Google Sheets API.

---

## 📁 Project Architecture & Folder Structure

```
ContractIQ/
├── backend/
│   ├── src/
│   │   ├── config/          # Mongoose MongoDB connection
│   │   ├── controllers/     # Auth, Contract, Document, Dashboard, Notification, Calendar, Report, Team, Settings, Webhook controllers
│   │   ├── middleware/      # JWT Auth verification, Multer upload security, error handling
│   │   ├── models/          # Company, User, Document, Contract, Notification, AuditLog schemas
│   │   ├── routes/          # Express API route endpoints
│   │   ├── services/        # AI extraction, n8n webhook dispatcher, notification & renewal engines
│   │   └── utils/           # Date calculations, seed data, seed runner
│   ├── uploads/             # Local object storage folder for contract documents
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── assets/          # Icons & graphics
│   │   ├── components/      # Button, StatCard, Dropzone, StatusBadge, RiskBadge, Modal, Toast, Skeleton, Sidebar, Header
│   │   ├── context/         # AuthContext, ThemeContext, NotificationContext
│   │   ├── hooks/           # useAuth, useTheme
│   │   ├── layouts/         # DashboardLayout, AuthLayout
│   │   ├── pages/           # Landing, Login, Register, ForgotPassword, Dashboard, ContractList, ContractDetails, Upload, Calendar, Notifications, Reports, Team, Settings
│   │   ├── services/        # Centralized API service layer (api.js, authService, contractService, etc.)
│   │   ├── styles/          # Core CSS variables, global, layout, components, forms, tables, dashboard, contract, responsive CSS
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── n8n/
│   ├── README.md            # Detailed workflow setup guide
│   └── workflows/           # Exportable n8n workflow JSON templates
├── .env.example
└── README.md
```

---

## ⚙️ Quick Start Installation & Setup

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB running locally (`mongodb://127.0.0.1:27017/contractiq`) or MongoDB Atlas URI
- npm or yarn

### 1. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file inside `backend/`:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/contractiq
JWT_SECRET=contractiq_super_secret_jwt_key_2026
JWT_EXPIRES_IN=7d
FILE_STORAGE_URL=http://localhost:5000/uploads
MAX_FILE_SIZE_MB=15

# Optional: Groq API Key for direct AI extraction
GROQ_API_KEY=gsk_your_groq_api_key_here

# Optional: n8n Webhook Integration
N8N_DOCUMENT_ANALYSIS_WEBHOOK=http://localhost:5678/webhook/contractiq-analyze
N8N_REPORT_WEBHOOK=http://localhost:5678/webhook/contractiq-report
```

Seed the database with sample B2B development data:
```bash
npm run seed
```

Start the backend API server:
```bash
npm run dev
```
*(Server will start on `http://localhost:5000`)*

---

### 2. Frontend Setup
Open a new terminal window:
```bash
cd frontend
npm install
```

Create `.env` inside `frontend/`:
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

Start the Vite development server:
```bash
npm run dev
```
*(App will open on `http://localhost:3000`)*

---

## 🔐 Demo Development Login Credentials

After running `npm run seed`, you can sign in immediately with these sample accounts:

- **Admin User**: `admin@acme.com` | Password: `Password123!`
- **Manager User**: `manager@acme.com` | Password: `Password123!`
- **Member User**: `member@acme.com` | Password: `Password123!`
- **NovaTech Admin**: `admin@novatech.com` | Password: `Password123!` *(Isolated company account)*

---

## ⚡ Complete End-to-End Workflow Execution Path

```
REGISTER NEW COMPANY
  ├──> LOGIN SECURELY (JWT Issued)
  ├──> DASHBOARD OVERVIEW (Live stats from API)
  ├──> UPLOAD PDF / DOCX CONTRACT
  ├──> BACKEND API RECEIVES FILE & STORES URL
  ├──> N8N WEBHOOK / BACKEND AI PIPELINE EXECUTED
  ├──> GROQ AI EXTRACTS STRUCTURED METADATA & RISKS
  ├──> MONGODB CONTRACT RECORD CREATED
  ├──> CONTRACT DETAILS PAGE SHOWS EVIDENCE QUOTES & OBLIGATIONS
  ├──> RENEWAL CALENDAR COMPUTES NOTICE DEADLINES & URGENCY
  ├──> CRON SCHEDULE EXECUTES SERVER-SIDE EMAIL REMINDERS
  └──> CSV REPORT EXPORTED FOR GOOGLE SHEETS SYNC
```

---

## 📜 License
MIT License. Created for ContractIQ Platform Inc.
