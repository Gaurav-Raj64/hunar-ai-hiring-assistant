import { useState, useEffect } from 'react'
import api from '../services/api'
import AudioWaveformPlayer from './AudioWaveformPlayer'

export default function CallDetailModal({ call, onClose, onRefresh }) {
  const [liveCall, setLiveCall] = useState(call)

  useEffect(() => {
    if (!call) return
    setLiveCall(call)

    // Auto-refresh if call is still in progress
    if (['NOT_STARTED', 'INITIATED', 'RINGING', 'IN_PROGRESS', 'SCHEDULED'].includes(call.status)) {
      const interval = setInterval(async () => {
        const res = await api.getCall(call.id)
        if (res.success) {
          setLiveCall(res.data)
          if (['COMPLETED', 'NOT_CONNECTED', 'FAILED', 'CANCELLED'].includes(res.data.status)) {
            clearInterval(interval)
          }
        }
      }, 2000)
      return () => clearInterval(interval)
    }
  }, [call])

  if (!liveCall) return null

  const isComplete = liveCall.status === 'COMPLETED'
  const isActive = ['INITIATED', 'RINGING', 'IN_PROGRESS'].includes(liveCall.status)

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <div className="modal-title">📞 Call Conversation Details</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
              Request ID: {liveCall.request_id || liveCall.id}
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {/* Status Banner */}
        <div style={{
          padding: 16, borderRadius: 12, marginBottom: 20,
          background: isActive ? 'var(--yellow-soft)' : isComplete ? 'var(--green-soft)' : 'var(--red-soft)',
          border: `1px solid ${isActive ? 'var(--yellow)' : isComplete ? 'var(--green)' : 'var(--red)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16 }}>
              {isActive && '🔄 '}
              {liveCall.status.replace(/_/g, ' ')}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
              Lifecycle: {liveCall.lifecycle_status}
              {liveCall.answered_by && ` · Answered by: ${liveCall.answered_by}`}
              {liveCall.call_ended_by && ` · Ended by: ${liveCall.call_ended_by}`}
            </div>
          </div>
          {isActive ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="status-dot sandbox" style={{ animation: 'pulse 1s infinite' }} />
              <span style={{ fontSize: 13, fontWeight: 600 }}>Active Calling</span>
            </div>
          ) : (
            <span className={`badge ${isComplete ? 'badge-green' : 'badge-red'}`}>
              {liveCall.status}
            </span>
          )}
        </div>

        {/* Call Info Grid */}
        <div className="result-grid" style={{ marginBottom: 20 }}>
          <div className="result-item">
            <div className="result-key">Candidate</div>
            <div className="result-val" style={{ fontSize: 14 }}>{liveCall.callee_name}</div>
          </div>
          <div className="result-item">
            <div className="result-key">Phone</div>
            <div className="result-val" style={{ fontSize: 14 }}>{liveCall.mobile_number}</div>
          </div>
          <div className="result-item">
            <div className="result-key">Duration</div>
            <div className="result-val">{liveCall.duration_minutes ? `${liveCall.duration_minutes.toFixed(1)}m` : '—'}</div>
          </div>
          <div className="result-item">
            <div className="result-key">User Speech</div>
            <div className="result-val">{liveCall.user_speech_duration ? `${Math.round(liveCall.user_speech_duration)}s` : '—'}</div>
          </div>
          <div className="result-item">
            <div className="result-key">Engagement</div>
            <div className="result-val" style={{ color: liveCall.engagement_status === 'ENGAGED' ? 'var(--green)' : 'var(--text-secondary)' }}>
              {liveCall.engagement_status || '—'}
            </div>
          </div>
          <div className="result-item">
            <div className="result-key">Retries</div>
            <div className="result-val">{liveCall.retry_count || 0}/{liveCall.max_retries || 0}</div>
          </div>
        </div>

        {/* Structured Results */}
        {liveCall.result && (
          <div style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12, color: 'var(--accent-secondary)' }}>
              📋 AI-Extracted Candidate Result Schema
            </h3>
            <div className="result-grid">
              {Object.entries(liveCall.result).map(([key, val]) => (
                <div key={key} className="result-item">
                  <div className="result-key">{key.replace(/_/g, ' ')}</div>
                  <div className="result-val" style={{
                    fontSize: 14,
                    color: val === 'Yes' ? 'var(--green)' : val === 'No' ? 'var(--red)' : 'var(--text-primary)'
                  }}>
                    {val === 'Yes' ? '✓ Yes' : val === 'No' ? '✗ No' : val}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Audio Waveform Player with real synthesized audio */}
        {liveCall.transcript && liveCall.transcript.length > 0 && (
          <AudioWaveformPlayer
            transcript={liveCall.transcript}
            candidateName={liveCall.callee_name}
            language={liveCall.language || 'ENGLISH'}
          />
        )}

        {/* Transcript */}
        {liveCall.transcript && liveCall.transcript.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--accent-secondary)' }}>
                💬 Synchronized Conversation Transcript
              </h3>
              <span className="badge badge-purple">{liveCall.language || 'ENGLISH'}</span>
            </div>
            <div className="transcript-container">
              {liveCall.transcript.map((msg, i) => (
                <div key={i} className={`transcript-msg ${msg.role}`}>
                  <div className="msg-label">
                    {msg.role === 'agent' ? '🤖 Hunar AI Voice Agent (Neha)' : `👤 ${liveCall.callee_name}`}
                  </div>
                  <div className="msg-bubble">{msg.text}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Custom Data */}
        {liveCall.custom_data && Object.keys(liveCall.custom_data).length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12, color: 'var(--accent-secondary)' }}>
              📦 Custom Dynamic Variables Injected
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {Object.entries(liveCall.custom_data).map(([k, v]) => (
                <span key={k} className="badge badge-purple">
                  <strong>{k}:</strong>&nbsp;{v}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: 12, marginTop: 24, justifyContent: 'flex-end' }}>
          {isComplete && liveCall.result?.interested === 'Yes' && (
            <button className="btn btn-success btn-sm" onClick={() => alert(`Interview confirmation invite triggered for ${liveCall.callee_name}!`)}>
              📅 WhatsApp Interview Invite
            </button>
          )}
          {liveCall.status === 'NOT_CONNECTED' && (
            <button className="btn btn-primary btn-sm" onClick={async () => {
              await api.createCall({
                agent_id: liveCall.agent_id,
                callee_name: liveCall.callee_name,
                mobile_number: liveCall.mobile_number,
                custom_data: liveCall.custom_data,
                request_id: `retry-${Date.now()}`
              })
              alert('Retry call queued!')
              if (onRefresh) onRefresh()
            }}>
              🔄 Retry Outbound Call
            </button>
          )}
          <button className="btn btn-secondary btn-sm" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  )
}
