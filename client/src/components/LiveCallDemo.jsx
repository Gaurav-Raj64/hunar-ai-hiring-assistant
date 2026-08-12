import { useState, useEffect } from 'react'
import api from '../services/api'

export default function LiveCallDemo() {
  const [phone, setPhone] = useState('')
  const [name, setName] = useState('Gaurav Raj')
  const [agents, setAgents] = useState([])
  const [selectedAgent, setSelectedAgent] = useState('')
  const [callStatus, setCallStatus] = useState(null) // null | 'calling' | 'success' | 'error'
  const [callData, setCallData] = useState(null)
  const [liveStatus, setLiveStatus] = useState(null)
  const [statusHistory, setStatusHistory] = useState([])

  useEffect(() => {
    loadAgents()
  }, [])

  async function loadAgents() {
    const res = await api.listAgents()
    if (res.success && res.data?.results) {
      setAgents(res.data.results)
      if (res.data.results.length > 0) {
        setSelectedAgent(res.data.results[0].id)
      }
    }
  }

  async function triggerLiveCall() {
    if (!phone || !selectedAgent || !name) return

    setCallStatus('calling')
    setStatusHistory([{ time: new Date().toLocaleTimeString(), status: 'INITIATING', text: `Sending call request to Hunar Voice AI...` }])
    setCallData(null)
    setLiveStatus('INITIATING')

    const now = new Date()
    const hour = now.getHours()
    const isOutsideHours = hour >= 21 || hour < 8

    if (isOutsideHours) {
      setCallStatus('error')
      setStatusHistory([{
        time: now.toLocaleTimeString(),
        status: 'BLOCKED',
        text: `⏰ Hunar Voice AI only allows calls between 8:00 AM - 9:00 PM IST. Current time: ${now.toLocaleTimeString()}. Try again tomorrow morning!`
      }])
      return
    }

    const res = await api.createCall({
      agent_id: selectedAgent,
      callee_name: name,
      mobile_number: phone.startsWith('+') ? phone : `+91${phone}`,
      request_id: `live-demo-${Date.now()}`,
      custom_data: {
        job_role: 'Senior Full Stack AI Engineer',
        company: 'Hunar AI',
        location: 'Bangalore',
        salary_range: '18-25 LPA'
      },
      guardrails: {
        earliest_call_time: '08:00',
        last_call_time: '21:00',
        allowed_days: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']
      }
    })

    if (res.success) {
      const callId = res.data?.id || res.data?.call_id
      setCallData(res.data)
      setStatusHistory(prev => [...prev, {
        time: new Date().toLocaleTimeString(),
        status: 'INITIATED',
        text: `Call created! ID: ${callId?.slice(0, 8)}...`
      }])
      setLiveStatus('INITIATED')

      // Poll for status updates
      if (callId) {
        let pollCount = 0
        let lastSeenStatus = 'INITIATED'
        const pollInterval = setInterval(async () => {
          pollCount++
          const statusRes = await api.getCall(callId)
          if (statusRes.success) {
            const call = statusRes.data
            const newStatus = call.status || call.lifecycle_status

            if (newStatus && newStatus !== lastSeenStatus) {
              lastSeenStatus = newStatus
              setLiveStatus(newStatus)
              setCallData(call)
              setStatusHistory(prev => [...prev, {
                time: new Date().toLocaleTimeString(),
                status: newStatus,
                text: getStatusText(newStatus, call)
              }])
            }

            if (['COMPLETED', 'NOT_CONNECTED', 'FAILED', 'CANCELLED'].includes(newStatus) || pollCount > 40) {
              clearInterval(pollInterval)
              if (pollCount > 40) {
                setStatusHistory(prev => [...prev, {
                  time: new Date().toLocaleTimeString(),
                  status: 'TIMEOUT',
                  text: 'Polling timed out after 2 minutes. Check the Dashboard tab for final results.'
                }])
              }
              setCallStatus(['COMPLETED'].includes(newStatus) ? 'success' : 'error')
            }
          }
        }, 3000)
      } else {
        setCallStatus('success')
      }
    } else {
      setCallStatus('error')
      const errMsg = res.message || res.error?.message || res.error?.detail || 'Unknown error'
      setStatusHistory(prev => [...prev, {
        time: new Date().toLocaleTimeString(),
        status: 'ERROR',
        text: `Failed: ${errMsg}`
      }])
    }
  }

  function getStatusText(status, call) {
    switch (status) {
      case 'SCHEDULED': return 'Call is queued in Hunar telephony. Waiting for the dialer to place the call...'
      case 'INITIATED': return 'Call request accepted by Hunar telephony engine.'
      case 'RINGING': return `Phone is ringing at ${call.mobile_number}...`
      case 'IN_PROGRESS': return '🔴 Call connected! AI Agent is speaking with the candidate...'
      case 'COMPLETED': return `✅ Call completed! Duration: ${call.duration_minutes?.toFixed(1) || '?'}m. Engagement: ${call.engagement_status || 'N/A'}`
      case 'NOT_CONNECTED': return '📵 Call was not answered. The retry engine will attempt again.'
      case 'FAILED': return '❌ Call failed due to a telephony error.'
      case 'CANCELLED': return '🚫 Call was cancelled.'
      case 'TIMEOUT': return '⏰ Polling timed out. Check Dashboard for final results.'
      default: return `Status updated to: ${status}`
    }
  }

  function getStatusColor(status) {
    if (['COMPLETED'].includes(status)) return 'var(--green)'
    if (['IN_PROGRESS', 'RINGING'].includes(status)) return 'var(--yellow)'
    if (['FAILED', 'NOT_CONNECTED', 'CANCELLED', 'ERROR', 'BLOCKED'].includes(status)) return 'var(--red)'
    return 'var(--accent-secondary)'
  }

  const activeAgent = agents.find(a => a.id === selectedAgent)

  return (
    <div className="card" style={{ border: '1px solid var(--accent-primary)', background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.05), rgba(6, 182, 212, 0.05))' }}>
      <div className="card-header">
        <div>
          <div className="card-title" style={{ fontSize: 18 }}>🔴 Live Voice AI Demo — Call a Real Phone</div>
          <div className="card-subtitle">Trigger an actual Hunar Voice AI outbound screening call to any phone number</div>
        </div>
        <span className="badge badge-red" style={{ animation: 'pulse 2s infinite' }}>● LIVE API</span>
      </div>

      <div className="grid-2" style={{ marginBottom: 16 }}>
        <div className="form-group">
          <label className="form-label">Your Name</label>
          <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="Gaurav Raj" />
        </div>
        <div className="form-group">
          <label className="form-label">Phone Number (with country code)</label>
          <input className="input" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+919876543210" />
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom: 16 }}>
        <div className="form-group">
          <label className="form-label">Voice Agent</label>
          <select className="select" value={selectedAgent} onChange={e => setSelectedAgent(e.target.value)}>
            {agents.map(a => (
              <option key={a.id} value={a.id}>{a.name} ({a.voice_persona || a.persona_name})</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Agent Info</label>
          <div style={{ padding: '8px 12px', background: 'var(--bg-secondary)', borderRadius: 8, fontSize: 13, color: 'var(--text-secondary)' }}>
            {activeAgent ? `${activeAgent.summary?.slice(0, 100)}...` : 'Select an agent'}
          </div>
        </div>
      </div>

      <button
        className="btn btn-primary btn-lg"
        style={{ width: '100%', marginBottom: 16, background: callStatus === 'calling' ? 'var(--yellow)' : undefined }}
        onClick={triggerLiveCall}
        disabled={callStatus === 'calling' || !phone || !name}
      >
        {callStatus === 'calling' ? '📞 Call In Progress — Waiting for Response...' : '🔴 Trigger Real Voice AI Call Now'}
      </button>

      {/* Live Status Feed */}
      {statusHistory.length > 0 && (
        <div style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          padding: 16,
          maxHeight: 300,
          overflowY: 'auto'
        }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 12 }}>
            📡 Live Telephony Event Stream
          </div>
          {statusHistory.map((entry, i) => (
            <div key={i} style={{
              display: 'flex', gap: 10, marginBottom: 8, fontSize: 13,
              padding: '8px 12px', background: 'var(--bg-card)', borderRadius: 6,
              borderLeft: `3px solid ${getStatusColor(entry.status)}`,
              animation: 'fadeIn 0.3s ease'
            }}>
              <span style={{ color: getStatusColor(entry.status), fontWeight: 700, fontFamily: 'monospace', flexShrink: 0 }}>
                [{entry.time}]
              </span>
              <span style={{ color: getStatusColor(entry.status), fontWeight: 600, flexShrink: 0 }}>
                {entry.status}
              </span>
              <span style={{ color: 'var(--text-primary)' }}>{entry.text}</span>
            </div>
          ))}
          {callStatus === 'calling' && (
            <div style={{ textAlign: 'center', padding: 8, color: 'var(--yellow)', fontSize: 13 }}>
              ⏳ Polling for updates every 3 seconds...
            </div>
          )}
        </div>
      )}

      {/* Result Schema */}
      {callData?.result && (
        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent-secondary)', marginBottom: 8 }}>
            📋 AI-Extracted Structured Result
          </div>
          <div className="result-grid">
            {Object.entries(callData.result).map(([key, val]) => (
              <div key={key} className="result-item">
                <div className="result-key">{key.replace(/_/g, ' ')}</div>
                <div className="result-val">{val}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Transcript */}
      {callData?.transcript && callData.transcript.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent-secondary)', marginBottom: 8 }}>
            💬 Real Conversation Transcript
          </div>
          <div className="transcript-container" style={{ maxHeight: 200 }}>
            {callData.transcript.map((msg, i) => (
              <div key={i} className={`transcript-msg ${msg.role}`}>
                <div className="msg-label">{msg.role === 'agent' ? '🤖 AI Agent' : `👤 ${name}`}</div>
                <div className="msg-bubble">{msg.text}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
