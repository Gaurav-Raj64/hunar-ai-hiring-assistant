import { useState } from 'react'

export default function AttendanceView() {
  const [activeSection, setActiveSection] = useState('overview')

  const sections = [
    { id: 'overview', label: '📋 Overview' },
    { id: 'architecture', label: '🏗️ Architecture' },
    { id: 'workflow', label: '🔄 Workflow' },
    { id: 'tech', label: '⚙️ Tech Stack' },
    { id: 'simulator', label: '🎮 Live Simulator' },
  ]

  return (
    <div className="animate-in">
      <div className="section-header">
        <div>
          <h1 className="section-title">Question 3: Attendance Tracking System</h1>
          <p className="section-desc">
            If there were no smartphones but LLMs exist, how would an HR track attendance of 1,000 people in 100 locations daily?
          </p>
        </div>
      </div>

      <div className="inner-tabs" style={{ marginBottom: 24 }}>
        {sections.map(s => (
          <button key={s.id} className={`inner-tab ${activeSection === s.id ? 'active' : ''}`}
            onClick={() => setActiveSection(s.id)}>
            {s.label}
          </button>
        ))}
      </div>

      {activeSection === 'overview' && <OverviewSection />}
      {activeSection === 'architecture' && <ArchitectureSection />}
      {activeSection === 'workflow' && <WorkflowSection />}
      {activeSection === 'tech' && <TechStackSection />}
      {activeSection === 'simulator' && <SimulatorSection />}
    </div>
  )
}

function OverviewSection() {
  return (
    <div className="card whitepaper">
      <h2>🎯 Problem Statement</h2>
      <p>
        <strong>Constraints:</strong> No smartphones exist. LLMs, basic telephony (PSTN/landlines/feature phones), 
        SMS, USSD, and all server-side infrastructure exist. You are an HR managing <strong>1,000 employees</strong> across 
        <strong> 100 locations</strong> and need daily attendance tracking.
      </p>

      <h2>💡 Solution: Voice LLM IVR Attendance System</h2>
      <p>
        A <strong>toll-free Voice IVR system powered by an LLM</strong> where employees dial in to mark attendance. 
        The system uses <strong>Caller ID verification</strong>, <strong>voice biometric matching</strong>, and 
        <strong>location-based number routing</strong> to ensure authentic check-ins without any smartphone app.
      </p>

      <h3>Key Advantages</h3>
      <ul>
        <li><strong>Zero app dependency</strong> — works with any basic phone (feature phones, landlines, coin-box phones)</li>
        <li><strong>Multi-language support</strong> — LLM converses in Hindi, Tamil, Telugu, Kannada, etc. (critical for frontline workers)</li>
        <li><strong>Fraud prevention</strong> — Caller ID + Voice biometrics + Location-specific toll-free numbers prevent buddy punching</li>
        <li><strong>Real-time dashboard</strong> — HR sees live attendance across all 100 locations</li>
        <li><strong>Automated reminders</strong> — LLM-powered outbound calls to employees who haven't checked in by a cutoff time</li>
      </ul>

      <h3>Scale Analysis</h3>
      <div style={{ overflowX: 'auto' }}>
        <table>
          <thead>
            <tr><th>Metric</th><th>Value</th><th>Notes</th></tr>
          </thead>
          <tbody>
            <tr><td>Total Employees</td><td><strong>1,000</strong></td><td>Across all locations</td></tr>
            <tr><td>Locations</td><td><strong>100</strong></td><td>~10 employees per location avg</td></tr>
            <tr><td>Daily Calls (Check-in + Check-out)</td><td><strong>~2,000</strong></td><td>2 calls per employee per day</td></tr>
            <tr><td>Avg Call Duration</td><td><strong>15-30 sec</strong></td><td>Quick IVR verification</td></tr>
            <tr><td>Peak Hour Load</td><td><strong>~500 calls/hr</strong></td><td>8-9 AM check-in window</td></tr>
            <tr><td>Concurrent Channels Needed</td><td><strong>15-20</strong></td><td>At 30s avg, 20 channels handle 2400 calls/hr</td></tr>
            <tr><td>Monthly Cost (India)</td><td><strong>₹15,000-25,000</strong></td><td>Toll-free + LLM inference + storage</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

function ArchitectureSection() {
  return (
    <div className="card whitepaper">
      <h2>🏗️ System Architecture</h2>

      <div className="diagram-box">{`
┌─────────────────────────────────────────────────────────────────────────┐
│                    VOICE LLM ATTENDANCE SYSTEM                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────┐    ┌──────────────┐    ┌──────────────┐                  │
│  │ Employee  │───▶│ Toll-Free    │───▶│ Telephony    │                  │
│  │ (Feature  │    │ IVR Number   │    │ Gateway      │                  │
│  │  Phone)   │    │ (per-region) │    │ (SIP/PSTN)   │                  │
│  └──────────┘    └──────────────┘    └──────┬───────┘                  │
│                                              │                          │
│                                              ▼                          │
│                                    ┌──────────────────┐                 │
│                                    │  Voice LLM Engine │                 │
│                                    │  (Hunar Voice AI) │                 │
│                                    │                    │                 │
│                                    │  • Caller ID Check │                 │
│                                    │  • Voice Biometric │                 │
│                                    │  • Language Detect │                 │
│                                    │  • Attendance Mark │                 │
│                                    └────────┬───────────┘                │
│                                              │                          │
│                              ┌───────────────┼───────────────┐          │
│                              ▼               ▼               ▼          │
│                    ┌──────────────┐ ┌──────────────┐ ┌──────────────┐  │
│                    │  Attendance  │ │   Anomaly    │ │  HR Real-    │  │
│                    │  Database    │ │   Detection  │ │  Time        │  │
│                    │  (PostgreSQL)│ │   (LLM)      │ │  Dashboard   │  │
│                    └──────────────┘ └──────────────┘ └──────────────┘  │
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  OUTBOUND REMINDER ENGINE                                        │   │
│  │  • Auto-call employees who haven't checked in by 9:30 AM        │   │
│  │  • SMS fallback for unreachable employees                        │   │
│  │  • Escalation to supervisor after 2 failed attempts              │   │
│  └──────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
      `}</div>

      <h3>Component Details</h3>

      <h3>1. Toll-Free IVR Numbers (Regional)</h3>
      <p>
        Each region or cluster of locations gets a dedicated toll-free number. This provides a basic form of 
        <strong> location verification</strong> — an employee at a Bangalore location calls the Bangalore number, 
        not the Chennai one. This can be enhanced with <strong>USSD location codes</strong> for multi-location employers.
      </p>

      <h3>2. Voice LLM Engine (Powered by Hunar Voice AI)</h3>
      <p>
        The core intelligence layer. When an employee calls, the LLM:
      </p>
      <ul>
        <li>Matches their <strong>Caller ID</strong> against the registered employee database</li>
        <li>Performs a <strong>voice biometric check</strong> (voiceprint matching from enrollment)</li>
        <li>Asks a brief <strong>contextual question</strong> in the employee's regional language (e.g., "Good morning Ravi, aaj aap Koramangala branch mein hain?")</li>
        <li>Marks attendance with timestamp and confidence score</li>
      </ul>

      <h3>3. Anomaly Detection Engine</h3>
      <p>
        An LLM-based analysis layer that flags suspicious patterns:
      </p>
      <ul>
        <li><strong>Buddy punching</strong>: Voice doesn't match enrolled voiceprint</li>
        <li><strong>Location mismatch</strong>: Employee calls from a different regional number</li>
        <li><strong>Unusual timing</strong>: Check-in at 3 AM or far outside shift window</li>
        <li><strong>Duplicate check-ins</strong>: Same employee trying to mark multiple times</li>
      </ul>
    </div>
  )
}

function WorkflowSection() {
  return (
    <div className="card whitepaper">
      <h2>🔄 Daily Attendance Workflow</h2>

      <div className="diagram-box">{`
   EMPLOYEE                    SYSTEM                         HR DASHBOARD
      │                          │                                │
      │  ☎️ Dials toll-free       │                                │
      │  number at 8:45 AM       │                                │
      │─────────────────────────▶│                                │
      │                          │  1. Caller ID lookup            │
      │                          │  2. "Namaste Ravi! Kya aap      │
      │                          │     Koramangala mein hain?"      │
      │                          │◀────────────────────────────────│
      │  "Haan, main yahan hoon" │                                │
      │─────────────────────────▶│                                │
      │                          │  3. Voice biometric match ✓     │
      │                          │  4. Mark PRESENT at 8:45 AM     │
      │                          │  5. "Dhanyavaad Ravi!            │
      │                          │     Aapki attendance ho gayi."   │
      │◀─────────────────────────│                                │
      │                          │  6. Update dashboard ───────────▶│  ✅ Ravi - PRESENT
      │                          │                                │     8:45 AM
      │                          │                                │     Koramangala Branch
      │                          │                                │
      ▼                          ▼                                ▼

   ─── REMINDER FLOW (for employees who haven't checked in) ───

      │                          │  9:30 AM: Auto-outbound call   │
      │◀─────────────────────────│  "Priya, aapne abhi tak        │
      │                          │   attendance nahi di..."        │
      │  "Sorry, ab kar rahi hoon"│                                │
      │─────────────────────────▶│  Mark LATE at 9:35 AM ──────────▶│  ⚠️ Priya - LATE
      │                          │                                │     9:35 AM
      ▼                          ▼                                ▼
      `}</div>

      <h3>Fallback Channels</h3>
      <div style={{ overflowX: 'auto' }}>
        <table>
          <thead>
            <tr><th>Channel</th><th>How it Works</th><th>When Used</th></tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Voice IVR (Primary)</strong></td>
              <td>Employee dials toll-free → LLM verifies → marks attendance</td>
              <td>Default method for all employees</td>
            </tr>
            <tr>
              <td><strong>Missed Call</strong></td>
              <td>Employee gives a missed call to a designated number; system calls back for verification</td>
              <td>When employee has zero balance</td>
            </tr>
            <tr>
              <td><strong>USSD (*123#)</strong></td>
              <td>Employee dials USSD code, enters employee ID + location code</td>
              <td>Areas with poor voice quality</td>
            </tr>
            <tr>
              <td><strong>SMS</strong></td>
              <td>Employee sends "PRESENT [Location Code]" to shortcode</td>
              <td>Backup when voice lines are congested</td>
            </tr>
            <tr>
              <td><strong>Supervisor Proxy</strong></td>
              <td>Supervisor calls and marks attendance for their team</td>
              <td>Emergency fallback for unreachable employees</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3>End-of-Day Reconciliation</h3>
      <p>
        At the end of each day, an <strong>LLM Reconciliation Engine</strong> runs to:
      </p>
      <ol>
        <li>Cross-reference all check-in records with shift schedules</li>
        <li>Flag unresolved absences (no check-in + no leave request)</li>
        <li>Generate natural-language attendance summary per location for HR review</li>
        <li>Auto-generate compliance reports for labor regulations</li>
        <li>Send next-day shift reminders via outbound voice calls</li>
      </ol>
    </div>
  )
}

function TechStackSection() {
  return (
    <div className="card whitepaper">
      <h2>⚙️ Recommended Technology Stack</h2>

      <div style={{ overflowX: 'auto' }}>
        <table>
          <thead>
            <tr><th>Layer</th><th>Technology</th><th>Why</th></tr>
          </thead>
          <tbody>
            <tr><td><strong>Voice AI & IVR</strong></td><td>Hunar Voice AI API</td><td>Multi-language voice agents, structured result extraction, outbound calling, webhooks</td></tr>
            <tr><td><strong>Telephony Gateway</strong></td><td>Twilio / Exotel / Knowlarity</td><td>PSTN connectivity, toll-free numbers, SIP trunking for 100 locations</td></tr>
            <tr><td><strong>Voice Biometrics</strong></td><td>Azure Speaker Recognition / Custom model</td><td>Voiceprint enrollment & verification to prevent buddy punching</td></tr>
            <tr><td><strong>LLM Engine</strong></td><td>GPT-4o / Claude / Gemini</td><td>Natural conversation, anomaly detection, report generation, multi-language</td></tr>
            <tr><td><strong>Database</strong></td><td>PostgreSQL + TimescaleDB</td><td>Relational data + time-series attendance records at scale</td></tr>
            <tr><td><strong>Backend</strong></td><td>Node.js / Python FastAPI</td><td>Webhook handlers, API layer, real-time processing</td></tr>
            <tr><td><strong>Dashboard</strong></td><td>React + WebSockets</td><td>Real-time attendance visualization for HR across 100 locations</td></tr>
            <tr><td><strong>SMS/USSD Fallback</strong></td><td>Africa's Talking / Exotel USSD</td><td>Feature phone fallback channels for areas with poor voice connectivity</td></tr>
            <tr><td><strong>Cron & Scheduler</strong></td><td>Bull / Celery</td><td>Automated reminder calls, end-of-day reconciliation, shift notifications</td></tr>
          </tbody>
        </table>
      </div>

      <h2>💰 Cost Estimation (Monthly, India)</h2>
      <div style={{ overflowX: 'auto' }}>
        <table>
          <thead>
            <tr><th>Item</th><th>Calculation</th><th>Monthly Cost</th></tr>
          </thead>
          <tbody>
            <tr><td>Toll-free Numbers (10 regional)</td><td>₹500/number × 10</td><td>₹5,000</td></tr>
            <tr><td>Inbound Voice (2000 calls/day × 30s avg)</td><td>60,000 calls × ₹0.15/min</td><td>₹4,500</td></tr>
            <tr><td>Outbound Reminders (~200/day)</td><td>6,000 calls × ₹0.50/min</td><td>₹3,000</td></tr>
            <tr><td>LLM Inference (GPT-4o-mini)</td><td>60,000 calls × ~100 tokens each</td><td>₹2,000</td></tr>
            <tr><td>Voice Biometric API</td><td>60,000 verifications</td><td>₹3,000</td></tr>
            <tr><td>Infrastructure (Cloud)</td><td>2 servers + DB</td><td>₹5,000</td></tr>
            <tr><td><strong>Total</strong></td><td></td><td><strong>₹22,500/month</strong></td></tr>
            <tr><td><strong>Per Employee</strong></td><td></td><td><strong>₹22.50/month</strong></td></tr>
          </tbody>
        </table>
      </div>
      <p style={{ marginTop: 12, fontStyle: 'italic' }}>
        This is <strong>significantly cheaper</strong> than biometric hardware (~₹15,000-25,000 per device × 100 locations = ₹15-25 lakh upfront) 
        and requires <strong>zero on-site maintenance</strong>.
      </p>
    </div>
  )
}

function SimulatorSection() {
  const [step, setStep] = useState(0)
  const [employeeId] = useState('EMP-' + Math.floor(1000 + Math.random() * 9000))

  const steps = [
    { icon: '📱', title: 'Employee dials toll-free number', detail: '☎️ 1800-XXX-YYYY', system: 'IVR picks up...', delay: 1500 },
    { icon: '🤖', title: 'LLM Agent responds', detail: '"Namaste! Kya main Ravi se baat kar raha hoon? Aap Koramangala branch mein hain?"', system: `Caller ID matched: ${employeeId}`, delay: 2500 },
    { icon: '👤', title: 'Employee responds', detail: '"Haan, main Ravi hoon. Main yahan Koramangala mein hoon."', system: 'Voice capture initiated...', delay: 2000 },
    { icon: '🔐', title: 'Voice biometric verification', detail: 'Comparing voiceprint with enrolled sample...', system: '✅ Voice match: 94.2% confidence', delay: 2000 },
    { icon: '✅', title: 'Attendance marked', detail: '"Dhanyavaad Ravi! Aapki attendance 8:47 AM par mark ho gayi. Aapka din shubh ho!"', system: `PRESENT - ${new Date().toLocaleTimeString()} - Koramangala`, delay: 1500 },
    { icon: '📊', title: 'Dashboard updated', detail: 'HR dashboard shows real-time status', system: `Location: Koramangala | Status: PRESENT | Time: ${new Date().toLocaleTimeString()}`, delay: 0 },
  ]

  function runSimulation() {
    setStep(0)
    let current = 0
    function nextStep() {
      if (current < steps.length - 1) {
        current++
        setStep(current)
        setTimeout(nextStep, steps[current].delay)
      }
    }
    setTimeout(nextStep, steps[0].delay)
  }

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <div className="card-title">🎮 Interactive Attendance Check-In Simulator</div>
          <div className="card-subtitle">Watch a simulated employee check-in via Voice LLM IVR</div>
        </div>
        <button className="btn btn-primary" onClick={runSimulation}>
          ▶️ Run Simulation
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 16 }}>
        {steps.map((s, i) => (
          <div key={i} style={{
            display: 'flex', gap: 16, padding: 16,
            background: i <= step ? 'var(--bg-secondary)' : 'transparent',
            border: `1px solid ${i <= step ? (i === step ? 'var(--accent-primary)' : 'var(--border)') : 'transparent'}`,
            borderRadius: 12,
            opacity: i <= step ? 1 : 0.3,
            transform: i <= step ? 'translateX(0)' : 'translateX(20px)',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          }}>
            <div style={{ fontSize: 28, width: 48, textAlign: 'center', flexShrink: 0 }}>{s.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: i === step ? 'var(--accent-secondary)' : 'var(--text-primary)' }}>
                {s.title}
              </div>
              <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 4, fontStyle: 'italic' }}>
                {s.detail}
              </div>
              {i <= step && (
                <div style={{ fontSize: 12, color: 'var(--green)', marginTop: 6, fontFamily: 'monospace' }}>
                  ▸ {s.system}
                </div>
              )}
            </div>
            {i <= step && i < steps.length - 1 && (
              <div style={{ alignSelf: 'center' }}>
                <span className="badge badge-green">✓</span>
              </div>
            )}
            {i === step && i === steps.length - 1 && (
              <div style={{ alignSelf: 'center' }}>
                <span className="badge badge-green">Complete</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
