export default function Navbar({ tabs, activeTab, onTabChange, apiStatus, onSettings }) {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <div className="navbar-logo">H</div>
        <div>
          <div className="navbar-title">Hunar AI Hiring Assistant</div>
          <div className="navbar-subtitle">Voice AI Recruitment Platform</div>
        </div>
      </div>

      <div className="navbar-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`navbar-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => onTabChange(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="navbar-actions">
        <div className="navbar-status">
          <span className={`status-dot ${apiStatus.live ? 'live' : 'sandbox'}`} />
          <span>{apiStatus.live ? 'Live API' : apiStatus.mode === 'checking' ? 'Checking...' : 'Sandbox Mode'}</span>
        </div>
        <button className="btn-settings" onClick={onSettings}>⚙️ Settings</button>
      </div>
    </nav>
  )
}
