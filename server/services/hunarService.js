// =============================================================================
// Hunar Voice AI Service Layer
// Dual-Mode: Live API integration + Resilient Sandbox Simulator
// Fully compliant with Hunar External API v1 specification
// =============================================================================

const { v4: uuidv4 } = require('uuid');

const HUNAR_BASE_URL = 'https://api.voice.hunar.ai/external/v1';

// ---------------------------------------------------------------------------
// Sandbox Simulator Data
// ---------------------------------------------------------------------------

const SANDBOX_AGENTS = [
  {
    id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    name: "AI Hiring Screener",
    voice_persona: "NEHA",
    persona_name: "Neha",
    voice_name: "Neha",
    language: "ENGLISH",
    custom_variables: ["job_role", "company", "location", "salary_range"],
    summary: "An intelligent hiring assistant that screens candidates for open positions through natural conversation.",
    status: "ACTIVE",
    logo: null,
    agent_code: "AG-HIRE-001",
    required_variables: ["callee_name", "mobile_number"],
    result_variables: ["interested", "qualified", "expected_ctc", "notice_period", "available_for_interview"],
    created_at: "2026-07-01T10:00:00.000Z",
    agent_prompt: "You are Neha, a friendly and professional AI hiring assistant from {company}. You are calling {callee_name} about a {job_role} position in {location}. The salary range is {salary_range}. Your goal is to assess their interest, qualifications, current notice period, and expected CTC. Be warm, conversational, and respectful of their time.",
    objective: "Screen candidates for open job positions by assessing interest, qualifications, availability, and salary expectations through natural voice conversation.",
    introduction: "Hi! Am I speaking with {callee_name}? This is {persona_name} calling from {company}. I'm reaching out regarding an exciting {job_role} opportunity in {location}. Do you have a couple of minutes to chat?",
    silence_response: "Hello? Are you still there? I was just asking about your interest in the role.",
    conclusion: "Thank you so much for your time, {callee_name}! We really appreciate you speaking with us. Our team will get back to you soon with next steps. Have a wonderful day!",
    result_prompt: "Based on the conversation, extract the following information about the candidate's response to the job opportunity.",
    result_schema: {
      interested: "boolean",
      qualified: "boolean",
      expected_ctc: "string",
      notice_period: "string",
      available_for_interview: "boolean"
    }
  },
  {
    id: "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    name: "Hindi Hiring Agent",
    voice_persona: "MIRA",
    persona_name: "Mira",
    voice_name: "Mira",
    language: "HINDI",
    custom_variables: ["job_role", "company", "location"],
    summary: "Hindi-language hiring agent for blue-collar and frontline recruitment across India.",
    status: "ACTIVE",
    logo: null,
    agent_code: "AG-HIRE-002",
    required_variables: ["callee_name", "mobile_number"],
    result_variables: ["interested", "available", "current_salary"],
    created_at: "2026-07-15T10:00:00.000Z",
    agent_prompt: "Aap Mira hain, {company} se ek friendly hiring assistant. Aap {callee_name} ko {location} mein {job_role} ke liye call kar rahi hain. Unse interest, availability, aur current salary ke baare mein poochein.",
    objective: "Hindi-language candidate screening for frontline and blue-collar hiring across India.",
    introduction: "Namaste! Kya main {callee_name} ji se baat kar rahi hoon? Main {persona_name} bol rahi hoon {company} se. Aapke liye {location} mein ek {job_role} ka mauka hai.",
    silence_response: "Hello? Kya aap sun rahe hain?",
    conclusion: "Bahut dhanyavaad {callee_name} ji! Aapka samay dene ke liye shukriya. Hum jaldi aapko update denge. Aapka din shubh ho!",
    result_prompt: "Candidate ki baatcheet se yeh jaankari nikalein.",
    result_schema: {
      interested: "boolean",
      available: "boolean",
      current_salary: "string"
    }
  }
];

const SANDBOX_NUMBERS = [
  { id: uuidv4(), phone_number: "+911140001234", allowed_countries: ["IN"], status: "ACTIVE" },
  { id: uuidv4(), phone_number: "+911140005678", allowed_countries: ["IN"], status: "ACTIVE" },
  { id: uuidv4(), phone_number: "+14155559999", allowed_countries: ["US", "IN"], status: "ACTIVE" }
];

const CALL_STATUSES = ['NOT_STARTED', 'SCHEDULED', 'INITIATED', 'RINGING', 'IN_PROGRESS', 'COMPLETED', 'NOT_CONNECTED', 'FAILED', 'CANCELLED'];
const ENGAGEMENT_STATUSES = ['ENGAGED', 'NOT_ENGAGED'];

// In-memory call store for sandbox mode
const sandboxCalls = new Map();

// Simulated conversation transcripts
const SAMPLE_TRANSCRIPTS = [
  {
    language: "ENGLISH",
    messages: [
      { role: "agent", text: "Hi! Am I speaking with {name}? This is Neha calling from {company}. I'm reaching out regarding an exciting {role} opportunity. Do you have a couple of minutes?" },
      { role: "user", text: "Yes, this is {name}. Sure, I can talk for a few minutes. What's the opportunity about?" },
      { role: "agent", text: "Great! We have a {role} position in {location}. The salary range is {salary}. Could you tell me about your current experience?" },
      { role: "user", text: "I have about {exp} years of experience in this domain. I'm currently working at {currentCompany} and my notice period is {notice}." },
      { role: "agent", text: "That sounds excellent! What would be your expected CTC for this kind of role?" },
      { role: "user", text: "I'm looking at something around {expectedCTC}. But I'm flexible depending on the overall package and growth opportunities." },
      { role: "agent", text: "Perfect! Would you be available for a detailed interview this week or next?" },
      { role: "user", text: "Yes, I can make time next week. Please send me the details." },
      { role: "agent", text: "Wonderful! Thank you so much for your time, {name}. Our team will reach out with the interview details. Have a great day!" },
      { role: "user", text: "Thank you, Neha. Looking forward to it!" }
    ]
  },
  {
    language: "ENGLISH",
    messages: [
      { role: "agent", text: "Hi! Am I speaking with {name}? This is Neha from {company} regarding a {role} opportunity." },
      { role: "user", text: "Yes, hi. I'm a bit busy right now actually." },
      { role: "agent", text: "I completely understand! This will just take two minutes. We have a {role} opening in {location} with a competitive salary. Would you be interested in hearing more?" },
      { role: "user", text: "Honestly, I'm not looking for a change right now. I just got promoted last month." },
      { role: "agent", text: "Congratulations on your promotion! I totally understand. Would it be okay if we kept your profile for future opportunities?" },
      { role: "user", text: "Sure, that's fine. You can reach out again in 6 months or so." },
      { role: "agent", text: "Absolutely! Thank you for your time, {name}. Wishing you the best in your new role. Have a wonderful day!" }
    ]
  }
];

// ---------------------------------------------------------------------------
// Helper functions
// ---------------------------------------------------------------------------

function generateTranscript(candidateName, company, role, location, salary, experience) {
  const template = SAMPLE_TRANSCRIPTS[Math.random() > 0.3 ? 0 : 1];
  const replacements = {
    '{name}': candidateName,
    '{company}': company || 'our client',
    '{role}': role || 'the position',
    '{location}': location || 'the office',
    '{salary}': salary || '₹15-25 LPA',
    '{exp}': experience || '4',
    '{currentCompany}': 'my current company',
    '{notice}': ['30 days', '60 days', '90 days', '15 days'][Math.floor(Math.random() * 4)],
    '{expectedCTC}': ['₹18-22 LPA', '₹25-30 LPA', '₹15-20 LPA', '₹22-28 LPA'][Math.floor(Math.random() * 4)]
  };

  return template.messages.map(msg => {
    let text = msg.text;
    for (const [key, value] of Object.entries(replacements)) {
      text = text.replaceAll(key, value);
    }
    return { role: msg.role, text, timestamp: new Date().toISOString() };
  });
}

function generateResult(isInterested) {
  if (isInterested) {
    return {
      interested: "Yes",
      qualified: Math.random() > 0.2 ? "Yes" : "No",
      expected_ctc: ['₹18-22 LPA', '₹25-30 LPA', '₹15-20 LPA', '₹22-28 LPA'][Math.floor(Math.random() * 4)],
      notice_period: ['30 days', '60 days', '90 days', '15 days'][Math.floor(Math.random() * 4)],
      available_for_interview: Math.random() > 0.15 ? "Yes" : "No"
    };
  }
  return {
    interested: "No",
    qualified: "N/A",
    expected_ctc: "N/A",
    notice_period: "N/A",
    available_for_interview: "No"
  };
}

function simulateCallProgression(callId) {
  const call = sandboxCalls.get(callId);
  if (!call) return;

  const statusSequence = ['INITIATED', 'RINGING', 'IN_PROGRESS'];
  let delay = 1000;

  statusSequence.forEach((status, i) => {
    setTimeout(() => {
      const c = sandboxCalls.get(callId);
      if (c && c.status !== 'CANCELLED') {
        c.status = status;
        c.lifecycle_status = status === 'IN_PROGRESS' ? 'IN_PROGRESS' : c.lifecycle_status;
        if (status === 'IN_PROGRESS') c.started_at = new Date().toISOString();
        sandboxCalls.set(callId, c);
      }
    }, delay * (i + 1));
  });

  // Complete call after 8-15 seconds
  const completionDelay = 8000 + Math.random() * 7000;
  setTimeout(() => {
    const c = sandboxCalls.get(callId);
    if (c && c.status !== 'CANCELLED') {
      const connected = Math.random() > 0.15;
      const interested = connected ? Math.random() > 0.3 : false;

      c.status = connected ? 'COMPLETED' : 'NOT_CONNECTED';
      c.lifecycle_status = connected ? 'COMPLETED' : 'NOT_CONNECTED';
      c.ended_at = new Date().toISOString();
      c.duration_seconds = connected ? 120 + Math.random() * 240 : 0;
      c.duration_minutes = parseFloat((c.duration_seconds / 60).toFixed(2));
      c.user_speech_duration = connected ? c.duration_seconds * (0.3 + Math.random() * 0.3) : 0;
      c.engagement_status = connected ? (interested ? 'ENGAGED' : 'NOT_ENGAGED') : null;
      c.answered_by = connected ? 'HUMAN' : null;
      c.call_ended_by = connected ? (Math.random() > 0.5 ? 'AGENT' : 'USER') : null;
      c.recording_url = connected ? `https://sandbox-recordings.hunar.ai/${callId}.mp3` : null;
      c.result = connected ? generateResult(interested) : null;
      c.transcript = connected ? generateTranscript(
        c.callee_name,
        c.custom_data?.company,
        c.custom_data?.job_role,
        c.custom_data?.location,
        c.custom_data?.salary_range,
        null
      ) : null;

      sandboxCalls.set(callId, c);
    }
  }, completionDelay);
}

// ---------------------------------------------------------------------------
// Hunar Service - Dual Mode (Live API + Sandbox)
// ---------------------------------------------------------------------------

class HunarService {
  constructor() {
    this.apiKey = process.env.HUNAR_API_KEY || '';
    this.mode = process.env.API_MODE || 'live';
    this.isLive = false;
  }

  getHeaders() {
    return {
      'X-API-Key': this.apiKey,
      'Content-Type': 'application/json'
    };
  }

  updateApiKey(newKey) {
    this.apiKey = newKey;
    this.isLive = false; // Reset; will re-validate on next call
  }

  async checkApiHealth() {
    if (!this.apiKey || this.mode === 'sandbox') {
      return { live: false, mode: 'sandbox', message: 'Running in sandbox simulator mode' };
    }
    try {
      const response = await fetch(`${HUNAR_BASE_URL}/agents/?page=1&page_size=1`, {
        headers: this.getHeaders()
      });
      if (response.ok) {
        this.isLive = true;
        return { live: true, mode: 'live', message: 'Connected to Hunar Voice AI API' };
      }
      const err = await response.json().catch(() => ({}));
      this.isLive = false;
      return { live: false, mode: 'sandbox', message: err.message || `API returned ${response.status}`, fallback: true };
    } catch (e) {
      this.isLive = false;
      return { live: false, mode: 'sandbox', message: 'Cannot reach Hunar API, using sandbox', fallback: true };
    }
  }

  // ---- Agents ----

  async listAgents(params = {}) {
    if (this.isLive) {
      try {
        const qs = new URLSearchParams(params).toString();
        const res = await fetch(`${HUNAR_BASE_URL}/agents/?${qs}`, { headers: this.getHeaders() });
        if (res.ok) return await res.json();
        this.isLive = false;
      } catch { this.isLive = false; }
    }
    // Sandbox fallback
    let filtered = [...SANDBOX_AGENTS];
    if (params.language) filtered = filtered.filter(a => a.language === params.language);
    if (params.status) filtered = filtered.filter(a => a.status === params.status);
    return { count: filtered.length, next: null, previous: null, results: filtered };
  }

  async getAgent(agentId) {
    if (this.isLive) {
      try {
        const res = await fetch(`${HUNAR_BASE_URL}/agents/${agentId}/`, { headers: this.getHeaders() });
        if (res.ok) return await res.json();
        if (res.status === 404) return null;
        this.isLive = false;
      } catch { this.isLive = false; }
    }
    return SANDBOX_AGENTS.find(a => a.id === agentId) || null;
  }

  async createAgent(data) {
    if (this.isLive) {
      try {
        const res = await fetch(`${HUNAR_BASE_URL}/agents/`, {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify(data)
        });
        if (res.ok) return { success: true, data: await res.json() };
        return { success: false, error: await res.json() };
      } catch { this.isLive = false; }
    }
    // Sandbox: create in-memory
    const prompt = data.agent_prompt || '';
    const variableRegex = /\{(\w+)\}/g;
    const customVars = [];
    let match;
    while ((match = variableRegex.exec(prompt)) !== null) {
      if (!['callee_name', 'mobile_number', 'persona_name'].includes(match[1])) {
        customVars.push(match[1]);
      }
    }

    const agent = {
      id: uuidv4(),
      name: data.name,
      voice_persona: data.voice_persona || 'NEHA',
      persona_name: data.persona_name || data.voice_persona || 'Neha',
      voice_name: data.persona_name || data.voice_persona || 'Neha',
      language: data.language || 'ENGLISH',
      custom_variables: [...new Set(customVars)],
      summary: data.objective || '',
      status: 'ACTIVE',
      logo: null,
      agent_code: `AG-${Date.now().toString(36).toUpperCase()}`,
      required_variables: ['callee_name', 'mobile_number'],
      result_variables: data.result_schema ? Object.keys(data.result_schema) : [],
      created_at: new Date().toISOString(),
      agent_prompt: data.agent_prompt,
      objective: data.objective || '',
      introduction: data.introduction || '',
      silence_response: 'Hello? Are you there?',
      conclusion: 'Thank you for your time. Have a great day!',
      result_prompt: data.result_prompt || '',
      result_schema: data.result_schema || {}
    };
    SANDBOX_AGENTS.push(agent);
    return { success: true, data: agent };
  }

  // ---- Calls ----

  async createCall(data) {
    if (this.isLive) {
      try {
        const res = await fetch(`${HUNAR_BASE_URL}/calls/`, {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify(data)
        });
        const body = await res.json();
        if (res.ok) return { success: true, data: body };
        return { success: false, error: body };
      } catch { this.isLive = false; }
    }
    // Sandbox
    const callId = uuidv4();
    const call = {
      id: callId,
      request_id: data.request_id || uuidv4(),
      agent_id: data.agent_id,
      callee_name: data.callee_name,
      mobile_number: data.mobile_number,
      from_phone_number: data.from_phone_number || SANDBOX_NUMBERS[0].phone_number,
      language: SANDBOX_AGENTS.find(a => a.id === data.agent_id)?.language || 'ENGLISH',
      status: 'NOT_STARTED',
      lifecycle_status: 'NOT_STARTED',
      custom_data: data.custom_data || {},
      system_data: { greeting: new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 17 ? 'Good afternoon' : 'Good evening' },
      recording_url: null,
      result: null,
      transcript: null,
      duration_minutes: 0,
      duration_seconds: 0,
      user_speech_duration: 0,
      engagement_status: null,
      answered_by: null,
      call_ended_by: null,
      max_retries: data.retry_config?.max_retry_count || 0,
      retry_count: 0,
      retries_left: data.retry_config?.max_retry_count || 0,
      redial_status: null,
      timezone: data.timezone || 'Asia/Kolkata',
      callback_config: data.callback_config || null,
      guardrails: data.guardrails || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      started_at: null,
      ended_at: null,
      triggered_by: 'api@sandbox.hunar.ai'
    };

    sandboxCalls.set(callId, call);
    simulateCallProgression(callId);
    return { success: true, data: call };
  }

  async createBulkCalls(data) {
    if (this.isLive) {
      try {
        const res = await fetch(`${HUNAR_BASE_URL}/calls/bulk/`, {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify(data)
        });
        const body = await res.json();
        if (res.ok) return { success: true, data: body };
        return { success: false, error: body };
      } catch { this.isLive = false; }
    }
    // Sandbox bulk
    const results = [];
    for (const item of (data.data || [])) {
      const result = await this.createCall({
        agent_id: data.agent_id,
        callee_name: item.callee_name,
        mobile_number: item.mobile_number,
        custom_data: item.custom_data || {},
        from_phone_number: data.from_phone_number,
        request_id: data.request_id,
        retry_config: data.retry_config,
        guardrails: data.guardrails,
        timezone: data.timezone,
        callback_config: data.callback_config
      });
      if (result.success) results.push(result.data);
    }
    return { success: true, data: results };
  }

  async listCalls(params = {}) {
    if (this.isLive) {
      try {
        const qs = new URLSearchParams(params).toString();
        const res = await fetch(`${HUNAR_BASE_URL}/calls/?${qs}`, { headers: this.getHeaders() });
        if (res.ok) return await res.json();
        this.isLive = false;
      } catch { this.isLive = false; }
    }
    // Sandbox
    let calls = Array.from(sandboxCalls.values());
    if (params.status) calls = calls.filter(c => c.status === params.status);
    if (params.agent_id) calls = calls.filter(c => c.agent_id === params.agent_id);
    calls.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    const page = parseInt(params.page) || 1;
    const pageSize = parseInt(params.page_size) || 10;
    const start = (page - 1) * pageSize;
    const paged = calls.slice(start, start + pageSize);

    return {
      count: calls.length,
      next: start + pageSize < calls.length ? `page=${page + 1}` : null,
      previous: page > 1 ? `page=${page - 1}` : null,
      results: paged
    };
  }

  async getCall(callId) {
    if (this.isLive) {
      try {
        const res = await fetch(`${HUNAR_BASE_URL}/calls/${callId}/`, { headers: this.getHeaders() });
        if (res.ok) return await res.json();
        if (res.status === 404) return null;
        this.isLive = false;
      } catch { this.isLive = false; }
    }
    return sandboxCalls.get(callId) || null;
  }

  // ---- Numbers ----

  async listNumbers(params = {}) {
    if (this.isLive) {
      try {
        const qs = new URLSearchParams(params).toString();
        const res = await fetch(`${HUNAR_BASE_URL}/numbers/?${qs}`, { headers: this.getHeaders() });
        if (res.ok) return await res.json();
        this.isLive = false;
      } catch { this.isLive = false; }
    }
    return { count: SANDBOX_NUMBERS.length, next: null, previous: null, results: SANDBOX_NUMBERS };
  }

  // ---- Stats ----
  getCallStats() {
    const calls = Array.from(sandboxCalls.values());
    const total = calls.length;
    const completed = calls.filter(c => c.status === 'COMPLETED').length;
    const notConnected = calls.filter(c => c.status === 'NOT_CONNECTED').length;
    const inProgress = calls.filter(c => ['INITIATED', 'RINGING', 'IN_PROGRESS', 'SCHEDULED', 'NOT_STARTED'].includes(c.status)).length;
    const interested = calls.filter(c => c.result?.interested === 'Yes').length;
    const qualified = calls.filter(c => c.result?.qualified === 'Yes').length;
    const totalDuration = calls.reduce((sum, c) => sum + (c.duration_seconds || 0), 0);
    const avgDuration = completed > 0 ? totalDuration / completed : 0;

    return {
      total,
      completed,
      not_connected: notConnected,
      in_progress: inProgress,
      failed: calls.filter(c => c.status === 'FAILED').length,
      cancelled: calls.filter(c => c.status === 'CANCELLED').length,
      interested,
      qualified,
      connection_rate: total > 0 ? ((completed / total) * 100).toFixed(1) : '0.0',
      interest_rate: completed > 0 ? ((interested / completed) * 100).toFixed(1) : '0.0',
      qualification_rate: completed > 0 ? ((qualified / completed) * 100).toFixed(1) : '0.0',
      avg_duration_seconds: parseFloat(avgDuration.toFixed(1)),
      avg_duration_minutes: parseFloat((avgDuration / 60).toFixed(2)),
      total_duration_minutes: parseFloat((totalDuration / 60).toFixed(2))
    };
  }
}

module.exports = new HunarService();
