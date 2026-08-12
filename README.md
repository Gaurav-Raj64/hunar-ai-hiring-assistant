# Hunar AI - Voice AI Hiring Assistant & Candidate Outreach Platform

A production-grade full-stack recruitment platform built using **Hunar Voice AI Agents**, **Candidate Sourcing APIs** (Apollo.io, People Data Labs, Proxycurl), an **Automated Multi-Channel Outreach Engine**, and an interactive architectural solution for **Frontline Attendance Tracking**.

---

## 🌟 Key Features

### 1. 🔍 AI Candidate Sourcing & People Search (Task 2)
- **Job Description AI Entity Extractor**: Analyzes job requirements to automatically extract required skills, experience bounds, title keywords, and target locations.
- **Multi-Source Sourcing Engine**: Integrates with candidate data providers (Apollo.io, People Data Labs, Proxycurl) with intelligent match scoring (0-100%).
- **Quick-Fill JD Templates**: 1-click presets for Engineering, Sales, DevOps, and Operations roles.
- **Batch Selection**: One-click selection to immediately dispatch targeted voice outreach campaigns.

### 2. 📞 Hunar Voice AI Outreach Studio (Task 1)
- **Voice Agent Management**: Direct integration with Hunar Voice AI Agents supporting 6 personas (*Neha, Roy, Zoe, Sam, Mira, Eesha*) and 12 languages (*English, Hindi, Tamil, Telugu, Kannada, Marathi, Gujarati, etc.*).
- **Dynamic Context Injection**: Maps custom variables (`{job_role}`, `{company}`, `{location}`, `{salary_range}`) directly into voice conversation prompts.
- **Telephony & Guardrails**: Configurable caller IDs, retry logic (`max_retry_count`, `retry_interval_hours`), scheduling guardrails (`allowed_days`, `earliest_call_time`, `last_call_time`), and timezones (`Asia/Kolkata`, etc.).
- **Dual-Mode Engine**: Live Hunar API integration + resilient high-fidelity sandbox simulator ensuring 100% demo reliability.

### 3. 📊 Recruiter Conversation Analytics Dashboard
- **Real-Time Call Tracking**: Live visual status badges (`NOT_STARTED` $\rightarrow$ `IN_PROGRESS` $\rightarrow$ `COMPLETED`).
- **Interactive Audio Waveform Player**: Synthesizes and plays audio recordings in the browser with real-time speech synthesis.
- **Synchronized Bilingual Transcripts**: Full candidate vs. AI agent conversation logs with role badges and timestamps.
- **Structured AI Result Schema**: Extracts `interested`, `qualified`, `expected_ctc`, `notice_period`, and `available_for_interview`.
- **Conversion Funnel Metrics**: Connection rates, qualification rates, average duration, and cost savings.

### 4. ⚡ Multi-Channel Workflow Orchestrator
- **End-to-End Automation**: Connects Voice AI screening $\rightarrow$ Instant WhatsApp interview self-scheduling $\rightarrow$ Google Calendar sync $\rightarrow$ SMS alerts.
- **Live Pipeline Simulator**: Test the complete candidate journey interactively from the UI.

### 5. 📋 Question 3: 1,000 Workers / 100 Locations Attendance System
- **Comprehensive Whitepaper**: Complete technical system design addressing attendance tracking without smartphones using Voice LLM IVR, Caller ID geofencing, and voice biometrics.
- **Interactive In-App Simulator**: Live simulation of a frontline employee dialing in from an ordinary phone and getting verified by an LLM in native Hindi.

---

## 🛠️ Architecture & Tech Stack

```
d:/Hunar ai/
├── client/                     # Vite + React 19 Frontend
│   ├── src/
│   │   ├── components/         # Sourcing, Voice Campaign, Dashboard, Workflow, Attendance, Settings
│   │   ├── services/api.js     # API Client
│   │   ├── index.css           # Premium Dark-Theme Glassmorphism Design System
│   │   └── App.jsx             # Main Navigation Shell
├── server/                     # Node.js + Express Backend
│   ├── routes/                 # /api/search, /api/hunar
│   ├── services/               # Hunar Voice AI Service & Search Engine
│   ├── mockData/               # Candidate Database & Transcripts
│   └── server.js               # Express Server & Webhook Handler
├── docs/                       # Architectural Whitepapers & System Design Guides
│   ├── QUESTION_3_ATTENDANCE_SYSTEM_DESIGN.md
│   └── API_INTEGRATION_GUIDE.md
└── package.json                # Root Orchestrator (concurrent client + server)
```

- **Frontend**: React 19, Vite, Vanilla CSS Design System with Glassmorphism, Web Speech Synthesis & Web Audio API.
- **Backend**: Node.js, Express, Axios, CORS, Dotenv, UUID.
- **Telephony & AI**: Hunar Voice AI External API v1 (`https://api.voice.hunar.ai/external/v1/`).

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Node.js (v18+)
- npm (v9+)

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/your-username/hunar-ai-hiring-assistant.git
cd "d:/Hunar ai"

# Install all dependencies (root, server, and client)
npm run install-all
```

### 3. Environment Configuration
Create a `.env` file in the `server/` directory:
```env
HUNAR_API_KEY=your_hunar_api_key_here
PORT=3001
CLIENT_URL=http://localhost:5173
API_MODE=live
```
*(Note: If `HUNAR_API_KEY` is not provided or is expired, the server will automatically run in sandbox simulator mode).*

### 4. Run Locally
```bash
# Start both backend and frontend concurrently
npm run dev
```

- **Frontend Application**: `http://localhost:5173`
- **Backend API**: `http://localhost:3001`
- **API Health Endpoint**: `http://localhost:3001/api/hunar/health`

---

## 🧪 Testing the Live Application

1. **Sourcing Candidates**:
   - Go to **Candidate Sourcing** tab.
   - Click one of the template buttons (e.g. *Senior Full Stack AI Engineer*), then click **Search Candidates**.
   - Review match scores and click **Launch Voice Outreach Campaign**.
2. **Placing Outbound Voice Calls**:
   - In **Voice AI Outreach**, choose your Voice Agent (Neha/Mira), configure retries or guardrails, and click **Trigger Voice Call**.
3. **Reviewing Analytics & Transcripts**:
   - Switch to **Recruiter Dashboard** to see live status updates.
   - Click on any completed call to open the **Call Details Modal**, click **Play** to listen to the synthesized call audio, and inspect the AI-extracted structured scorecard.
4. **Multi-Channel Orchestration**:
   - Go to **Multi-Channel Workflows** and click **Run Multi-Channel Test** to see the Voice AI $\rightarrow$ WhatsApp $\rightarrow$ Calendar pipeline in action.
5. **Question 3 System Design**:
   - Navigate to **Q3: Attendance System** to explore the architecture, cost breakdown, and run the interactive voice check-in terminal.

---

## 📄 Submission Details
- **Candidate Name**: Gaurav Raj
- **Assignment**: Hunar.ai Selection Process - AI Hiring Assistant, People Search & Frontline Attendance System
- **API Documentation Reference**: [Hunar Voice Agents API Docs](https://api.voice.hunar.ai/docs/external/)
