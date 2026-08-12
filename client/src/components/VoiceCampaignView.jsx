import { useState, useEffect } from 'react'
import api from '../services/api'

const PERSONAS = [
  { id: 'NEHA', name: 'Neha', desc: 'Warm & professional female voice' },
  { id: 'ROY', name: 'Roy', desc: 'Confident & friendly male voice' },
  { id: 'ZOE', name: 'Zoe', desc: 'Energetic & clear female voice' },
  { id: 'SAM', name: 'Sam', desc: 'Calm & authoritative male voice' },
  { id: 'MIRA', name: 'Mira', desc: 'Soft & empathetic female voice' },
  { id: 'EESHA', name: 'Eesha', desc: 'Dynamic & articulate female voice' },
]

const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']

export default function VoiceCampaignView() {
  const [agents, setAgents] = useState([])
  const [selectedAgent, setSelectedAgent] = useState(null)
  const [numbers, setNumbers] = useState([])
  const [mode, setMode] = useState('bulk') // default to bulk if candidates are sent
  const [loading, setLoading] = useState(false)
  const [callResult, setCallResult] = useState(null)

  // Single call form
  const [singleForm, setSingleForm] = useState({
    callee_name: 'Priya Sharma',
    mobile_number: '+919876543210',
    job_role: 'Senior Full Stack AI Engineer',
    location: 'Bangalore',
    company: 'Hunar AI',
    salary_range: '₹18-25 LPA'
  })

  // Bulk call form
  const [bulkRows, setBulkRows] = useState([
    { callee_name: 'Priya Sharma', mobile_number: '+919876543210', job_role: 'Senior Software Engineer', location: 'Bangalore' },
    { callee_name: 'Arjun Nair', mobile_number: '+919567890123', job_role: 'Frontend Engineer', location: 'Bangalore' },
    { callee_name: 'Aditya Joshi', mobile_number: '+919901234567', job_role: 'ML Engineer', location: 'Bangalore' }
  ])

  // Config
  const [config, setConfig] = useState({
    from_phone_number: '',
    timezone: 'Asia/Kolkata',
    retry_enabled: true,
    max_retry_count: 2,
    retry_interval_hours: 6,
    guardrails_enabled: true,
    allowed_days: ['MON', 'TUE', 'WED', 'THU', 'FRI'],
    earliest_call_time: '09:00',
    last_call_time: '18:00'
  })

  useEffect(() => {
    loadAgents()
    loadNumbers()

    // Check for candidates stored from Sourcing tab
    const saved = localStorage.getItem('pendingCampaignCandidates')
    if (saved) {
      try {
        const candidates = JSON.parse(saved)
        if (Array.isArray(candidates) && candidates.length > 0) {
          setBulkRows(candidates.map(c => ({
            callee_name: c.name,
            mobile_number: c.phone,
            job_role: c.title,
            location: c.location
          })))
          setMode('bulk')
        }
      } catch (e) {
        console.error('Error parsing stored candidates', e)
      }
    }

    function handleCampaign(e) {
      const { candidates } = e.detail
      if (candidates && candidates.length > 0) {
        setMode('bulk')
        setBulkRows(candidates.map(c => ({
          callee_name: c.name,
          mobile_number: c.phone,
          job_role: c.title,
          location: c.location
        })))
      }
    }
    window.addEventListener('startCampaign', handleCampaign)
    return () => window.removeEventListener('startCampaign', handleCampaign)
  }, [])

  async function loadAgents() {
    const res = await api.listAgents()
    if (res.success && res.data?.results) {
      setAgents(res.data.results)
      if (res.data.results.length > 0) setSelectedAgent(res.data.results[0].id)
    }
  }

  async function loadNumbers() {
    const res = await api.listNumbers()
    if (res.success && res.data?.results) {
      setNumbers(res.data.results)
      if (res.data.results.length > 0) {
        setConfig(c => ({ ...c, from_phone_number: res.data.results[0].phone_number }))
      }
    }
  }

  function buildCallPayload() {
    const payload = {}
    if (config.from_phone_number) payload.from_phone_number = config.from_phone_number
    payload.timezone = config.timezone
    if (config.retry_enabled) {
      payload.retry_config = {
        max_retry_count: config.max_retry_count,
        retry_interval_hours: config.retry_interval_hours
      }
    }
    if (config.guardrails_enabled) {
      payload.guardrails = {
        allowed_days: config.allowed_days,
        earliest_call_time: config.earliest_call_time,
        last_call_time: config.last_call_time
      }
    }
    return payload
  }

  async function handleSingleCall() {
    if (!selectedAgent || !singleForm.callee_name || !singleForm.mobile_number) return
    setLoading(true)
    setCallResult(null)

    const customData = {}
    if (singleForm.job_role) customData.job_role = singleForm.job_role
    if (singleForm.location) customData.location = singleForm.location
    if (singleForm.company) customData.company = singleForm.company
    if (singleForm.salary_range) customData.salary_range = singleForm.salary_range

    const payload = {
      agent_id: selectedAgent,
      callee_name: singleForm.callee_name,
      mobile_number: singleForm.mobile_number,
      custom_data: customData,
      request_id: `single-${Date.now()}`,
      ...buildCallPayload()
    }

    const res = await api.createCall(payload)
    setCallResult(res)
    setLoading(false)
  }

  async function handleBulkCalls() {
    if (!selectedAgent || bulkRows.length === 0) return
    setLoading(true)
    setCallResult(null)

    const validRows = bulkRows.filter(r => r.callee_name && r.mobile_number)
    const payload = {
      agent_id: selectedAgent,
      request_id: `bulk-${Date.now()}`,
      data: validRows.map(r => ({
        callee_name: r.callee_name,
        mobile_number: r.mobile_number,
        custom_data: {
          job_role: r.job_role,
          location: r.location,
          company: 'Hunar AI',
          salary_range: '₹18-25 LPA'
        }
      })),
      ...buildCallPayload()
    }

    const res = await api.createBulkCalls(payload)
    setCallResult(res)
    setLoading(false)
  }

  function addBulkRow() {
    setBulkRows(r => [...r, { callee_name: '', mobile_number: '', job_role: '', location: '' }])
  }

  function updateBulkRow(idx, field, val) {
    setBulkRows(rows => rows.map((r, i) => i === idx ? { ...r, [field]: val } : r))
  }

  function removeBulkRow(idx) {
    setBulkRows(rows => rows.filter((_, i) => i !== idx))
  }

  const activeAgent = agents.find(a => a.id === selectedAgent)

  return (
    <div className="animate-in">
      <div className="section-header">
        <div>
          <h1 className="section-title">Voice AI Outreach Studio</h1>
          <p className="section-desc">
            Configure, personalize, and trigger AI-powered outbound voice campaigns using Hunar Voice Agents
          </p>
        </div>
      </div>

      <div className="grid-2">
        {/* Left: Call Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Agent Selector */}
          <div className="card">
            <div className="card-title" style={{ marginBottom: 16 }}>🤖 Active Hunar Voice Agent</div>
            <div className="form-group">
              <label className="form-label">Voice Agent</label>
              <select
                className="select"
                value={selectedAgent || ''}
                onChange={e => setSelectedAgent(e.target.value)}
              >
                {agents.map(a => (
                  <option key={a.id} value={a.id}>{a.name} ({a.persona_name} - {a.language})</option>
                ))}
              </select>
            </div>
            {activeAgent && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                <span className="badge badge-purple">🎤 Persona: {activeAgent.voice_persona}</span>
                <span className="badge badge-blue">🌐 Language: {activeAgent.language}</span>
                <span className="badge badge-green">● Status: {activeAgent.status}</span>
                {activeAgent.custom_variables?.map((v, i) => (
                  <span key={i} className="skill-chip">📝 {'{' + v + '}'}</span>
                ))}
              </div>
            )}
          </div>

          {/* Call Mode Toggle */}
          <div className="inner-tabs" style={{ marginBottom: 0 }}>
            <button className={`inner-tab ${mode === 'bulk' ? 'active' : ''}`} onClick={() => setMode('bulk')}>
              Bulk Campaign ({bulkRows.length} candidates)
            </button>
            <button className={`inner-tab ${mode === 'single' ? 'active' : ''}`} onClick={() => setMode('single')}>
              Single Direct Call
            </button>
          </div>

          {/* Bulk Call Form */}
          {mode === 'bulk' && (
            <div className="card">
              <div className="card-header">
                <div>
                  <div className="card-title">📋 Campaign Call List ({bulkRows.length})</div>
                  <div className="card-subtitle">Recipients will be dialed sequentially with dynamic variables</div>
                </div>
                <button className="btn btn-secondary btn-sm" onClick={addBulkRow}>+ Add Row</button>
              </div>
              <div className="table-container" style={{ maxHeight: 350, overflowY: 'auto' }}>
                <table>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Candidate Name *</th>
                      <th>Phone Number *</th>
                      <th>Target Role</th>
                      <th>Location</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {bulkRows.map((row, i) => (
                      <tr key={i}>
                        <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{i + 1}</td>
                        <td><input className="input" placeholder="Name" value={row.callee_name} onChange={e => updateBulkRow(i, 'callee_name', e.target.value)} /></td>
                        <td><input className="input" placeholder="+91..." value={row.mobile_number} onChange={e => updateBulkRow(i, 'mobile_number', e.target.value)} /></td>
                        <td><input className="input" placeholder="Role" value={row.job_role} onChange={e => updateBulkRow(i, 'job_role', e.target.value)} /></td>
                        <td><input className="input" placeholder="City" value={row.location} onChange={e => updateBulkRow(i, 'location', e.target.value)} /></td>
                        <td><button className="btn-icon" onClick={() => removeBulkRow(i)}>✕</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: 16 }}
                onClick={handleBulkCalls} disabled={loading || bulkRows.filter(r => r.callee_name && r.mobile_number).length === 0}>
                {loading ? '⏳ Dispatching Campaign...' : `🚀 Launch Bulk Campaign (${bulkRows.filter(r => r.callee_name && r.mobile_number).length} Calls)`}
              </button>
            </div>
          )}

          {/* Single Call Form */}
          {mode === 'single' && (
            <div className="card">
              <div className="card-title" style={{ marginBottom: 16 }}>📞 Single Direct Voice Call</div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Candidate Name *</label>
                  <input className="input" placeholder="John Doe" value={singleForm.callee_name}
                    onChange={e => setSingleForm(f => ({ ...f, callee_name: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number *</label>
                  <input className="input" placeholder="+919876543210" value={singleForm.mobile_number}
                    onChange={e => setSingleForm(f => ({ ...f, mobile_number: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Job Role</label>
                  <input className="input" placeholder="Senior Engineer" value={singleForm.job_role}
                    onChange={e => setSingleForm(f => ({ ...f, job_role: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Location</label>
                  <input className="input" placeholder="Bangalore" value={singleForm.location}
                    onChange={e => setSingleForm(f => ({ ...f, location: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Company</label>
                  <input className="input" placeholder="Hunar AI" value={singleForm.company}
                    onChange={e => setSingleForm(f => ({ ...f, company: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Salary Range</label>
                  <input className="input" placeholder="₹15-25 LPA" value={singleForm.salary_range}
                    onChange={e => setSingleForm(f => ({ ...f, salary_range: e.target.value }))} />
                </div>
              </div>
              <button className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: 16 }}
                onClick={handleSingleCall} disabled={loading || !singleForm.callee_name || !singleForm.mobile_number}>
                {loading ? '⏳ Initiating Outbound Call...' : '📞 Trigger Outbound Voice Call'}
              </button>
            </div>
          )}

          {/* Call Result Notification */}
          {callResult && (
            <div className="card" style={{ borderColor: callResult.success ? 'var(--green)' : 'var(--red)' }}>
              <div className="card-title" style={{ color: callResult.success ? 'var(--green)' : 'var(--red)' }}>
                {callResult.success ? '✅ Call(s) Created Successfully in Telephony Queue' : '❌ Error Creating Call'}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 6 }}>
                {callResult.success ? 'Navigate to Recruiter Dashboard to track live progression, listen to audio playback, and view transcripts!' : JSON.stringify(callResult.error)}
              </div>
            </div>
          )}
        </div>

        {/* Right: Configuration */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Caller ID & Timezone */}
          <div className="card">
            <div className="card-title" style={{ marginBottom: 16 }}>📱 Caller ID & Regional Scheduling</div>
            <div className="form-group">
              <label className="form-label">From Phone Number (Caller ID)</label>
              <select className="select" value={config.from_phone_number}
                onChange={e => setConfig(c => ({ ...c, from_phone_number: e.target.value }))}>
                <option value="">Auto-assigned Organization Number</option>
                {numbers.map(n => (
                  <option key={n.id} value={n.phone_number}>{n.phone_number} (Allowed: {n.allowed_countries?.join(', ')})</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Timezone</label>
              <select className="select" value={config.timezone}
                onChange={e => setConfig(c => ({ ...c, timezone: e.target.value }))}>
                <option value="Asia/Kolkata">Asia/Kolkata (IST - India Standard Time)</option>
                <option value="America/New_York">America/New_York (EST)</option>
                <option value="America/Los_Angeles">America/Los_Angeles (PST)</option>
                <option value="America/Chicago">America/Chicago (CST)</option>
                <option value="Europe/London">Europe/London (GMT/BST)</option>
                <option value="Asia/Riyadh">Asia/Riyadh (AST)</option>
              </select>
            </div>
          </div>

          {/* Retry Config */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <div className="card-title">🔄 Telephony Retry Engine</div>
                <div className="card-subtitle">Auto-redial unanswered or busy candidates</div>
              </div>
              <label className="checkbox-container">
                <input type="checkbox" checked={config.retry_enabled}
                  onChange={e => setConfig(c => ({ ...c, retry_enabled: e.target.checked }))} />
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Enabled</span>
              </label>
            </div>
            {config.retry_enabled && (
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Max Retries (1-10)</label>
                  <input className="input" type="number" min="1" max="10" value={config.max_retry_count}
                    onChange={e => setConfig(c => ({ ...c, max_retry_count: parseInt(e.target.value) || 1 }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Retry Interval (hours)</label>
                  <select className="select" value={config.retry_interval_hours}
                    onChange={e => setConfig(c => ({ ...c, retry_interval_hours: parseInt(e.target.value) }))}>
                    <option value="3">3 hours</option>
                    <option value="6">6 hours</option>
                    <option value="9">9 hours</option>
                    <option value="12">12 hours</option>
                    <option value="24">24 hours</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Guardrails */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <div className="card-title">🛡️ Calling Hour Guardrails</div>
                <div className="card-subtitle">Ensure compliance with calling time windows</div>
              </div>
              <label className="checkbox-container">
                <input type="checkbox" checked={config.guardrails_enabled}
                  onChange={e => setConfig(c => ({ ...c, guardrails_enabled: e.target.checked }))} />
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Enabled</span>
              </label>
            </div>
            {config.guardrails_enabled && (
              <>
                <div className="form-group">
                  <label className="form-label">Allowed Weekdays (min 3 days)</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {DAYS.map(d => (
                      <label key={d} className="checkbox-container" style={{ background: config.allowed_days.includes(d) ? 'var(--accent-glow)' : 'var(--bg-secondary)', padding: '6px 12px', borderRadius: 6, border: '1px solid var(--border)' }}>
                        <input type="checkbox" checked={config.allowed_days.includes(d)}
                          onChange={e => {
                            if (e.target.checked) setConfig(c => ({ ...c, allowed_days: [...c.allowed_days, d] }))
                            else setConfig(c => ({ ...c, allowed_days: c.allowed_days.filter(x => x !== d) }))
                          }} />
                        <span style={{ fontSize: 12, fontWeight: 600 }}>{d}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="grid-2" style={{ marginTop: 12 }}>
                  <div className="form-group">
                    <label className="form-label">Earliest Calling Window</label>
                    <input className="input" type="time" value={config.earliest_call_time}
                      onChange={e => setConfig(c => ({ ...c, earliest_call_time: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Latest Calling Window</label>
                    <input className="input" type="time" value={config.last_call_time}
                      onChange={e => setConfig(c => ({ ...c, last_call_time: e.target.value }))} />
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Voice Personas Reference */}
          <div className="card">
            <div className="card-title" style={{ marginBottom: 16 }}>🎙️ Hunar AI Voice Personas</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {PERSONAS.map(p => (
                <div key={p.id} style={{
                  padding: 12, background: activeAgent?.voice_persona === p.id ? 'var(--accent-glow)' : 'var(--bg-secondary)',
                  border: `1px solid ${activeAgent?.voice_persona === p.id ? 'var(--accent-primary)' : 'var(--border)'}`,
                  borderRadius: 8, transition: 'var(--transition-fast)'
                }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{p.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
