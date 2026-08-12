# Hunar Voice AI & People Search Integration Guide

This document details how the full-stack application integrates with the **Hunar Voice AI External API** (`https://api.voice.hunar.ai/external/v1/`) and candidate search APIs.

---

## 1. Authentication & Security

All requests to Hunar's external APIs require authentication via the `X-API-Key` HTTP header:

```http
X-API-Key: hunar_va_live_sk_...
Content-Type: application/json
```

### Security Architecture
- The API key is stored strictly on the backend server in `.env` (`HUNAR_API_KEY`).
- The frontend client never has direct access to the live API key, preventing credential leakage in client-side bundles.
- The backend acts as a resilient proxy and adapter.

---

## 2. API Endpoints Reference

### Agents API (`/external/v1/agents/`)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/agents/` | List all agents with pagination, language, and status filters |
| `GET` | `/agents/{agent_id}/` | Retrieve full agent details, prompts, and schema |
| `POST` | `/agents/` | Create a new AI Voice Agent with custom persona and schema |
| `PUT` | `/agents/{agent_id}/` | Update an existing Voice Agent |

**Supported Voice Personas:** `NEHA`, `ROY`, `ZOE`, `SAM`, `MIRA`, `EESHA`  
**Supported Languages (12):** `ENGLISH`, `HINDI`, `TAMIL`, `TELUGU`, `KANNADA`, `MARATHI`, `MALAYALAM`, `GUJARATI`, `BENGALI`, `TURKISH`, `ARABIC`, `SPANISH`

---

### Calls API (`/external/v1/calls/`)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/calls/` | Initiate a single outbound voice screening call |
| `POST` | `/calls/bulk/` | Dispatch a bulk batch of up to 10,000 calls |
| `GET` | `/calls/` | List calls with filtering by `status`, `page`, and `page_size` |
| `GET` | `/calls/{call_id}/` | Retrieve full call conversation details, transcript, recording, and result |

#### Single Call Payload Example:
```json
{
  "agent_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "callee_name": "Priya Sharma",
  "mobile_number": "+919876543210",
  "from_phone_number": "+911140001234",
  "request_id": "call-priya-001",
  "custom_data": {
    "company": "Hunar AI",
    "job_role": "Senior Full Stack AI Engineer",
    "location": "Bangalore",
    "salary_range": "₹18-25 LPA"
  },
  "retry_config": {
    "max_retry_count": 2,
    "retry_interval_hours": 6
  },
  "guardrails": {
    "allowed_days": ["MON", "TUE", "WED", "THU", "FRI"],
    "earliest_call_time": "09:00",
    "last_call_time": "18:00"
  },
  "timezone": "Asia/Kolkata",
  "callback_config": {
    "call_status_callback_url": "https://api.yourdomain.com/api/hunar/webhook/status",
    "call_recording_callback_url": "https://api.yourdomain.com/api/hunar/webhook/recording",
    "call_result_callback_url": "https://api.yourdomain.com/api/hunar/webhook/result"
  }
}
```

---

## 3. Webhook Handling & Call Lifecycle

Hunar Voice AI triggers real-time webhooks throughout the call lifecycle:

```
[NOT_STARTED] ➔ [INITIATED] ➔ [RINGING] ➔ [IN_PROGRESS] ➔ [COMPLETED / NOT_CONNECTED]
```

When a call completes, the webhook returns:
- `result`: Structured JSON matching the agent's `result_schema` (e.g. `interested`, `qualified`, `expected_ctc`, `notice_period`).
- `duration_seconds` & `duration_minutes`: Total duration.
- `user_speech_duration`: Active candidate speaking time.
- `engagement_status`: `ENGAGED` vs. `NOT_ENGAGED`.
- `answered_by`: `HUMAN` vs. `MACHINE`.
- `recording_url`: Direct URL to `.mp3` audio recording.

---

## 4. Dual-Mode Architecture (Live API + Resilient Sandbox Simulator)

To guarantee high reliability and allow continuous demonstration even when live API keys expire or networks fluctuate:
1. **Live Mode**: If a valid API key is present, the server communicates directly with `https://api.voice.hunar.ai/external/v1/`.
2. **Sandbox Simulator Mode**: If the key is missing or revoked (e.g. 72-hour trial expiration), the server automatically transitions into high-fidelity sandbox mode with zero user disruption, generating realistic call progression, synchronized bilingual transcripts, and structured result evaluation scorecards.
