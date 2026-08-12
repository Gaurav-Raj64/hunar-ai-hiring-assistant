// =============================================================================
// API Service Layer - Frontend to Backend Communication
// =============================================================================

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

async function request(url, options = {}) {
  try {
    const res = await fetch(`${API_BASE}${url}`, {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options
    });
    const data = await res.json();
    return data;
  } catch (err) {
    console.error(`API Error [${url}]:`, err);
    return { success: false, message: err.message };
  }
}

const api = {
  // Health
  health: () => request('/health'),
  hunarHealth: () => request('/hunar/health'),

  // Config
  updateApiKey: (api_key) => request('/hunar/config', { method: 'POST', body: JSON.stringify({ api_key }) }),

  // Search
  parseJD: (job_description) => request('/search/parse-jd', { method: 'POST', body: JSON.stringify({ job_description }) }),
  searchCandidates: (params) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/search/candidates?${qs}`);
  },

  // Agents
  listAgents: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/hunar/agents?${qs}`);
  },
  getAgent: (id) => request(`/hunar/agents/${id}`),
  createAgent: (data) => request('/hunar/agents', { method: 'POST', body: JSON.stringify(data) }),

  // Calls
  createCall: (data) => request('/hunar/calls', { method: 'POST', body: JSON.stringify(data) }),
  createBulkCalls: (data) => request('/hunar/calls/bulk', { method: 'POST', body: JSON.stringify(data) }),
  listCalls: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/hunar/calls?${qs}`);
  },
  getCall: (id) => request(`/hunar/calls/${id}`),

  // Numbers
  listNumbers: () => request('/hunar/numbers'),

  // Stats
  getStats: () => request('/hunar/stats'),
};

export default api;
