import { useState, useEffect, useCallback } from 'react'
import api from '../services/api'
import CallDetailModal from './CallDetailModal'

const STATUS_CONFIG = {
  NOT_STARTED: { color: 'var(--text-muted)', badge: 'badge-purple', label: 'Not Started' },
  SCHEDULED: { color: 'var(--blue)', badge: 'badge-blue', label: 'Scheduled' },
  INITIATED: { color: 'var(--yellow)', badge: 'badge-yellow', label: 'Initiated' },
  RINGING: { color: 'var(--yellow)', badge: 'badge-yellow', label: 'Ringing' },
  IN_PROGRESS: { color: 'var(--orange)', badge: 'badge-orange', label: 'In Progress' },
  COMPLETED: { color: 'var(--green)', badge: 'badge-green', label: 'Completed' },
  NOT_CONNECTED: { color: 'var(--red)', badge: 'badge-red', label: 'Not Connected' },
  FAILED: { color: 'var(--red)', badge: 'badge-red', label: 'Failed' },
  CANCELLED: { color: 'var(--text-muted)', badge: 'badge-purple', label: 'Cancelled' },
}

export default function DashboardView() {
  const [calls, setCalls] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [selectedCall, setSelectedCall] = useState(null)

  const loadData = useCallback(async () => {
    const [callsRes, statsRes] = await Promise.all([
      api.listCalls({ page_size: 50, ...(statusFilter ? { status: statusFilter } : {}) }),
      api.getStats()
    ])
    if (callsRes.success) setCalls(callsRes.data?.results || [])
    if (statsRes.success) setStats(statsRes.data)
    setLoading(false)
  }, [statusFilter])

  useEffect(() => {
    loadData()
    const interval = setInterval(loadData, 3000) // Poll every 3s for real-time updates
    return () => clearInterval(interval)
  }, [loadData])

  function openCallDetail(call) {
    setSelectedCall(call)
  }

  if (loading && !stats) {
    return (
      <div className="animate-in">
        <div className="section-header">
          <div>
            <h1 className="section-title">Analytics Dashboard</h1>
            <p className="section-desc">Loading call analytics...</p>
          </div>
        </div>
        <div className="stats-grid">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="skeleton" style={{ height: 100 }} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="animate-in">
      <div className="section-header">
        <div>
          <h1 className="section-title">Analytics Dashboard</h1>
          <p className="section-desc">
            Real-time voice campaign metrics and call conversation insights
          </p>
        </div>
        <button className="btn btn-secondary" onClick={loadData}>🔄 Refresh</button>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">Total Calls</div>
            <div className="stat-value">{stats.total}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Completed</div>
            <div className="stat-value" style={{ color: 'var(--green)' }}>{stats.completed}</div>
            <div className="stat-change positive">{stats.connection_rate}% connection rate</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Not Connected</div>
            <div className="stat-value" style={{ color: 'var(--red)' }}>{stats.not_connected}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">In Progress</div>
            <div className="stat-value" style={{ color: 'var(--yellow)' }}>{stats.in_progress}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Interested</div>
            <div className="stat-value" style={{ color: 'var(--accent-secondary)' }}>{stats.interested}</div>
            <div className="stat-change positive">{stats.interest_rate}% interest rate</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Avg Duration</div>
            <div className="stat-value">{stats.avg_duration_minutes}m</div>
            <div className="stat-change">{stats.total_duration_minutes}m total</div>
          </div>
        </div>
      )}

      {/* Funnel Visualization */}
      {stats && stats.total > 0 && (
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="card-title" style={{ marginBottom: 16 }}>📊 Conversion Funnel</div>
          <div style={{ display: 'flex', gap: 4, alignItems: 'stretch', height: 60 }}>
            {[
              { label: 'Total Calls', value: stats.total, pct: 100, color: 'var(--accent-primary)' },
              { label: 'Connected', value: stats.completed, pct: stats.total > 0 ? (stats.completed / stats.total * 100) : 0, color: 'var(--blue)' },
              { label: 'Interested', value: stats.interested, pct: stats.total > 0 ? (stats.interested / stats.total * 100) : 0, color: 'var(--green)' },
              { label: 'Qualified', value: stats.qualified, pct: stats.total > 0 ? (stats.qualified / stats.total * 100) : 0, color: 'var(--yellow)' },
            ].map((step, i) => (
              <div key={i} style={{ flex: Math.max(step.pct, 10), display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: step.color, borderRadius: i === 0 ? '8px 0 0 8px' : i === 3 ? '0 8px 8px 0' : '0', opacity: 0.7 + (step.pct / 400), transition: 'flex 0.5s ease' }}>
                <span style={{ fontWeight: 700, fontSize: 16, color: '#fff' }}>{step.value}</span>
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase', fontWeight: 600 }}>{step.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Call List */}
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">📋 Call History</div>
            <div className="card-subtitle">Click any call to view transcript and results</div>
          </div>
          <select className="select" style={{ width: 'auto', minWidth: 160 }} value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}>
            <option value="">All Statuses</option>
            <option value="COMPLETED">Completed</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="NOT_CONNECTED">Not Connected</option>
            <option value="NOT_STARTED">Not Started</option>
            <option value="FAILED">Failed</option>
          </select>
        </div>

        {calls.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📊</div>
            <div className="empty-title">No calls yet</div>
            <div className="empty-desc">
              Create calls from the Voice Outreach tab to see analytics here. Calls update in real-time every 3 seconds.
            </div>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Candidate</th>
                  <th>Phone</th>
                  <th>Duration</th>
                  <th>Engagement</th>
                  <th>Result</th>
                  <th>Created</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {calls.map(call => {
                  const sc = STATUS_CONFIG[call.status] || STATUS_CONFIG.NOT_STARTED
                  return (
                    <tr key={call.id} style={{ cursor: 'pointer' }} onClick={() => openCallDetail(call)}>
                      <td>
                        <span className={`badge ${sc.badge}`}>
                          {sc.label}
                        </span>
                      </td>
                      <td style={{ fontWeight: 600 }}>{call.callee_name}</td>
                      <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{call.mobile_number}</td>
                      <td>
                        {call.duration_minutes > 0
                          ? `${call.duration_minutes.toFixed(1)} min`
                          : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                      </td>
                      <td>
                        {call.engagement_status
                          ? <span className={`badge ${call.engagement_status === 'ENGAGED' ? 'badge-green' : 'badge-red'}`}>
                            {call.engagement_status}
                          </span>
                          : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                      </td>
                      <td>
                        {call.result?.interested
                          ? <span className={`badge ${call.result.interested === 'Yes' ? 'badge-green' : 'badge-red'}`}>
                            {call.result.interested === 'Yes' ? '✓ Interested' : '✗ Not Interested'}
                          </span>
                          : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                      </td>
                      <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        {new Date(call.created_at).toLocaleTimeString()}
                      </td>
                      <td>
                        <button className="btn btn-secondary btn-sm" onClick={e => { e.stopPropagation(); openCallDetail(call) }}>
                          View
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Call Detail Modal */}
      {selectedCall && (
        <CallDetailModal
          call={selectedCall}
          onClose={() => setSelectedCall(null)}
          onRefresh={async () => {
            const res = await api.getCall(selectedCall.id)
            if (res.success) setSelectedCall(res.data)
          }}
        />
      )}
    </div>
  )
}
