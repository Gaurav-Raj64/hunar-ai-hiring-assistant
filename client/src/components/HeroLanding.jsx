import { useState, useEffect, useRef } from 'react'

export default function HeroLanding({ onEnter }) {
  const [visible, setVisible] = useState(false)
  const [counters, setCounters] = useState({ agents: 0, languages: 0, sources: 0, calls: 0 })
  const statsRef = useRef(null)

  useEffect(() => {
    setTimeout(() => setVisible(true), 100)

    // Animated counters
    const targets = { agents: 5, languages: 12, sources: 3, calls: 10000 }
    const duration = 2000
    const startTime = Date.now()

    function animate() {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3) // easeOutCubic

      setCounters({
        agents: Math.round(targets.agents * eased),
        languages: Math.round(targets.languages * eased),
        sources: Math.round(targets.sources * eased),
        calls: Math.round(targets.calls * eased),
      })

      if (progress < 1) requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
  }, [])

  return (
    <div className="hero-landing" style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.8s ease' }}>
      {/* Animated Background Particles */}
      <div className="hero-bg-effects">
        <div className="hero-orb hero-orb-1" />
        <div className="hero-orb hero-orb-2" />
        <div className="hero-orb hero-orb-3" />
        <div className="hero-grid-overlay" />
      </div>

      <div className="hero-content">
        {/* Logo & Badge */}
        <div className="hero-badge" style={{ animationDelay: '0.2s' }}>
          <span className="hero-badge-dot" />
          POWERED BY HUNAR VOICE AI
        </div>

        {/* Main Title */}
        <h1 className="hero-title" style={{ animationDelay: '0.4s' }}>
          <span className="hero-title-line">AI-Powered</span>
          <span className="hero-title-gradient">Hiring Assistant</span>
        </h1>

        {/* Subtitle */}
        <p className="hero-subtitle" style={{ animationDelay: '0.6s' }}>
          Intelligent candidate sourcing, automated voice outreach campaigns,
          and real-time recruitment analytics — all orchestrated by Voice AI Agents.
        </p>

        {/* Feature Pills */}
        <div className="hero-pills" style={{ animationDelay: '0.8s' }}>
          <span className="hero-pill">🔍 People Search</span>
          <span className="hero-pill">📞 Voice AI Screening</span>
          <span className="hero-pill">💬 WhatsApp Booking</span>
          <span className="hero-pill">📊 Live Analytics</span>
          <span className="hero-pill">📋 Attendance System</span>
        </div>

        {/* CTA Button */}
        <button className="hero-cta" onClick={onEnter} style={{ animationDelay: '1.0s' }}>
          <span>Enter Dashboard</span>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
          </svg>
        </button>

        {/* Live Stats Grid */}
        <div className="hero-stats" ref={statsRef} style={{ animationDelay: '1.2s' }}>
          <div className="hero-stat">
            <div className="hero-stat-number">{counters.agents}</div>
            <div className="hero-stat-label">Voice Agents<br />Connected</div>
          </div>
          <div className="hero-stat-divider" />
          <div className="hero-stat">
            <div className="hero-stat-number">{counters.languages}</div>
            <div className="hero-stat-label">Languages<br />Supported</div>
          </div>
          <div className="hero-stat-divider" />
          <div className="hero-stat">
            <div className="hero-stat-number">{counters.sources}</div>
            <div className="hero-stat-label">Data Sources<br />Integrated</div>
          </div>
          <div className="hero-stat-divider" />
          <div className="hero-stat">
            <div className="hero-stat-number">{counters.calls.toLocaleString()}+</div>
            <div className="hero-stat-label">Calls<br />Capacity/Day</div>
          </div>
        </div>

        {/* Tech Stack Row */}
        <div className="hero-tech" style={{ animationDelay: '1.4s' }}>
          <span>Built with</span>
          <div className="hero-tech-pills">
            <span>React</span>
            <span>Node.js</span>
            <span>Hunar Voice AI</span>
            <span>Apollo.io</span>
            <span>PDL</span>
          </div>
        </div>

        {/* Assignment Credit */}
        <div className="hero-credit" style={{ animationDelay: '1.6s' }}>
          Submission by <strong>Gaurav Raj</strong> · Hunar.ai Selection Process
        </div>
      </div>
    </div>
  )
}
