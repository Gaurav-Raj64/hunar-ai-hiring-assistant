import { useState } from 'react'

const SAMPLE_WORKFLOWS = [
  {
    id: 'voice_whatsapp_flow',
    title: 'Voice AI Screen ➔ WhatsApp Booking ➔ Calendar Sync',
    desc: 'Automates candidate screening call, and immediately sends a WhatsApp confirmation with an interview slot booking link if qualified.',
    status: 'ACTIVE',
    steps: [
      { id: 1, type: 'trigger', name: 'Candidate Sourced / Matched', channel: 'Search Engine', icon: '🔍' },
      { id: 2, type: 'action', name: 'Hunar Voice AI Screening Call', channel: 'Voice Telephony', icon: '📞' },
      { id: 3, type: 'branch', name: 'Is Candidate Qualified & Interested?', channel: 'Decision Logic', icon: '🔀' },
      { id: 4, type: 'action', name: 'Send WhatsApp Self-Schedule Link', channel: 'WhatsApp API', icon: '💬' },
      { id: 5, type: 'action', name: 'Sync Calendar & Send SMS Reminder', channel: 'Google / SMS', icon: '📅' },
    ]
  },
  {
    id: 'retry_recovery_flow',
    title: 'Unanswered Call ➔ WhatsApp Reachout ➔ Scheduled Redial',
    desc: 'Recovers unresponsive candidates when an outbound call is not connected or busy.',
    status: 'ACTIVE',
    steps: [
      { id: 1, type: 'trigger', name: 'Call Not Connected (Busy / No Answer)', channel: 'Voice Telephony', icon: '📵' },
      { id: 2, type: 'action', name: 'Send WhatsApp "We tried calling you" note', channel: 'WhatsApp API', icon: '💬' },
      { id: 3, type: 'action', name: 'Wait 6 Hours (Retry Config Interval)', channel: 'Time Delay', icon: '⏳' },
      { id: 4, type: 'action', name: 'Auto-Redial via Hunar Retry Engine', channel: 'Voice Telephony', icon: '🔄' },
    ]
  }
]

export default function WorkflowView() {
  const [selectedWorkflow, setSelectedWorkflow] = useState(SAMPLE_WORKFLOWS[0])
  const [simulatedCandidate, setSimulatedCandidate] = useState({
    name: 'Rohan Verma',
    phone: '+919876543210',
    role: 'Senior Full Stack Engineer',
    company: 'Hunar AI'
  })
  const [executionLog, setExecutionLog] = useState([])
  const [isExecuting, setIsExecuting] = useState(false)

  const runWorkflowSimulation = () => {
    setIsExecuting(true)
    setExecutionLog([])

    const logs = [
      { step: 1, time: '00:00', text: `🎯 Sourced candidate: ${simulatedCandidate.name} (${simulatedCandidate.role})`, status: 'completed' },
      { step: 2, time: '00:02', text: `📞 Triggered Hunar Voice AI Outbound Call to ${simulatedCandidate.phone}...`, status: 'completed' },
      { step: 3, time: '00:05', text: `🤖 Voice Agent Neha completed 2m 45s screening conversation. Result: Qualified=Yes, Interested=Yes`, status: 'completed' },
      { step: 4, time: '00:08', text: `💬 WhatsApp Webhook fired: Sent personalized booking link to ${simulatedCandidate.phone}`, status: 'completed' },
      { step: 5, time: '00:11', text: `📅 Candidate booked interview slot: Thursday 3:00 PM IST. Google Calendar event created & SMS sent!`, status: 'completed' }
    ]

    logs.forEach((log, index) => {
      setTimeout(() => {
        setExecutionLog(prev => [...prev, log])
        if (index === logs.length - 1) {
          setIsExecuting(false)
        }
      }, (index + 1) * 1200)
    })
  }

  return (
    <div className="animate-in">
      <div className="section-header">
        <div>
          <h1 className="section-title">Multi-Channel Communication Orchestrator</h1>
          <p className="section-desc">
            Orchestrate automated workflows combining Voice AI, WhatsApp Business API, SMS Alerts, and Calendar Booking
          </p>
        </div>
      </div>

      <div className="grid-2">
        {/* Left: Workflow Builder Diagram */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title">🔄 Active Workflows</div>
                <div className="card-subtitle">Select an automated communication pipeline</div>
              </div>
              <span className="badge badge-green">LIVE ORCHESTRATION</span>
            </div>

            <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
              {SAMPLE_WORKFLOWS.map(wf => (
                <button
                  key={wf.id}
                  onClick={() => setSelectedWorkflow(wf)}
                  className={`btn ${selectedWorkflow.id === wf.id ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                  style={{ flex: 1 }}
                >
                  {wf.title.split('➔')[0]}...
                </button>
              ))}
            </div>

            <div style={{ padding: 16, background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', marginBottom: 20 }}>
              <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--accent-secondary)', marginBottom: 6 }}>
                {selectedWorkflow.title}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                {selectedWorkflow.desc}
              </div>
            </div>

            {/* Visual Node Sequence */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {selectedWorkflow.steps.map((step, idx) => (
                <div key={step.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: step.type === 'branch' ? 'var(--yellow-soft)' : step.type === 'trigger' ? 'var(--blue-soft)' : 'var(--accent-glow)',
                    border: `1px solid ${step.type === 'branch' ? 'var(--yellow)' : step.type === 'trigger' ? 'var(--blue)' : 'var(--accent-primary)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 16,
                    flexShrink: 0
                  }}>
                    {step.icon}
                  </div>
                  <div style={{
                    flex: 1,
                    padding: '10px 14px',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{step.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Channel: {step.channel}</div>
                    </div>
                    <span className="badge badge-purple" style={{ fontSize: 10 }}>Step {idx + 1}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Live Interactive Workflow Execution Simulator */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title">⚡ Multi-Channel Live Simulator</div>
                <div className="card-subtitle">Test the end-to-end recruitment journey</div>
              </div>
              <button
                className="btn btn-primary btn-sm"
                onClick={runWorkflowSimulation}
                disabled={isExecuting}
              >
                {isExecuting ? '⏳ Executing...' : '▶ Run Multi-Channel Test'}
              </button>
            </div>

            <div className="grid-2" style={{ marginBottom: 16 }}>
              <div className="form-group">
                <label className="form-label">Test Candidate</label>
                <input
                  className="input"
                  value={simulatedCandidate.name}
                  onChange={e => setSimulatedCandidate(c => ({ ...c, name: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  className="input"
                  value={simulatedCandidate.phone}
                  onChange={e => setSimulatedCandidate(c => ({ ...c, phone: e.target.value }))}
                />
              </div>
            </div>

            {/* Execution Stream */}
            <div style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: 16,
              minHeight: 250,
              maxHeight: 320,
              overflowY: 'auto'
            }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 12 }}>
                📡 Live Pipeline Event Stream
              </div>

              {executionLog.length === 0 && !isExecuting && (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px 0', fontSize: 13 }}>
                  Click <strong>"Run Multi-Channel Test"</strong> to trigger the automated Voice AI ➔ WhatsApp ➔ Calendar workflow.
                </div>
              )}

              {executionLog.map((log, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    gap: 10,
                    marginBottom: 10,
                    fontSize: 13,
                    padding: '8px 12px',
                    background: 'var(--bg-card)',
                    borderRadius: 6,
                    border: '1px solid var(--border)',
                    animation: 'fadeIn 0.3s ease'
                  }}
                >
                  <span style={{ color: 'var(--accent-secondary)', fontWeight: 600, fontFamily: 'monospace' }}>[{log.time}]</span>
                  <span style={{ color: 'var(--text-primary)' }}>{log.text}</span>
                </div>
              ))}
            </div>

            {/* WhatsApp Message Preview Mockup */}
            <div style={{ marginTop: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 10 }}>
                📱 Instant WhatsApp Notification Preview
              </div>
              <div style={{
                background: '#075E54',
                color: '#fff',
                padding: 14,
                borderRadius: '12px 12px 12px 2px',
                fontSize: 13,
                lineHeight: 1.5,
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
              }}>
                <div style={{ fontWeight: 700, marginBottom: 4 }}>💬 Hunar Recruitment Assistant</div>
                <div>
                  "Hi <strong>{simulatedCandidate.name}</strong>! 🎉 Thanks for speaking with Neha regarding the <strong>{simulatedCandidate.role}</strong> position. You have been shortlisted! Click here to select your preferred technical interview slot: <u>https://cal.hunar.ai/interview-slot?token=9xAKlw</u>"
                </div>
                <div style={{ fontSize: 10, textAlign: 'right', opacity: 0.8, marginTop: 6 }}>
                  {new Date().toLocaleTimeString()} ✓✓
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
