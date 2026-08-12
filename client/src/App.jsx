import { useState, useEffect } from 'react'
import './index.css'
import Navbar from './components/Navbar'
import SourcingView from './components/SourcingView'
import VoiceCampaignView from './components/VoiceCampaignView'
import DashboardView from './components/DashboardView'
import WorkflowView from './components/WorkflowView'
import AttendanceView from './components/AttendanceView'
import SettingsModal from './components/SettingsModal'
import api from './services/api'

const TABS = [
  { id: 'sourcing', label: '🔍 Candidate Sourcing', icon: '🔍' },
  { id: 'campaign', label: '📞 Voice AI Outreach', icon: '📞' },
  { id: 'dashboard', label: '📊 Recruiter Dashboard', icon: '📊' },
  { id: 'workflow', label: '⚡ Multi-Channel Workflows', icon: '⚡' },
  { id: 'attendance', label: '📋 Q3: Attendance System', icon: '📋' },
]

function App() {
  const [activeTab, setActiveTab] = useState('sourcing')
  const [apiStatus, setApiStatus] = useState({ live: false, mode: 'checking' })
  const [showSettings, setShowSettings] = useState(false)

  useEffect(() => {
    checkApiStatus()
    const interval = setInterval(checkApiStatus, 30000)
    return () => clearInterval(interval)
  }, [])

  async function checkApiStatus() {
    const res = await api.hunarHealth()
    if (res && res.success) {
      setApiStatus(res.data)
    } else {
      setApiStatus({ live: false, mode: 'sandbox', message: 'Running in sandbox mode' })
    }
  }

  return (
    <div className="app-container">
      <Navbar
        tabs={TABS}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        apiStatus={apiStatus}
        onSettings={() => setShowSettings(true)}
      />

      {/* Mobile Tabs */}
      <div className="mobile-tabs">
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`navbar-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <main className="main-content">
        {activeTab === 'sourcing' && (
          <SourcingView onNavigateToCampaign={() => setActiveTab('campaign')} />
        )}
        {activeTab === 'campaign' && <VoiceCampaignView />}
        {activeTab === 'dashboard' && <DashboardView />}
        {activeTab === 'workflow' && <WorkflowView />}
        {activeTab === 'attendance' && <AttendanceView />}
      </main>

      {showSettings && (
        <SettingsModal
          apiStatus={apiStatus}
          onClose={() => setShowSettings(false)}
          onSave={async (key) => {
            await api.updateApiKey(key)
            checkApiStatus()
          }}
        />
      )}
    </div>
  )
}

export default App
