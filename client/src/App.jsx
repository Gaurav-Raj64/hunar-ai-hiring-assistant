import { useState, useEffect } from 'react'
import './index.css'
import HeroLanding from './components/HeroLanding'
import Navbar from './components/Navbar'
import SourcingView from './components/SourcingView'
import VoiceCampaignView from './components/VoiceCampaignView'
import DashboardView from './components/DashboardView'
import WorkflowView from './components/WorkflowView'
import AttendanceView from './components/AttendanceView'
import LiveCallDemo from './components/LiveCallDemo'
import SettingsModal from './components/SettingsModal'
import api from './services/api'

const TABS = [
  { id: 'sourcing', label: '🔍 Candidate Sourcing', icon: '🔍' },
  { id: 'campaign', label: '📞 Voice AI Outreach', icon: '📞' },
  { id: 'dashboard', label: '📊 Recruiter Dashboard', icon: '📊' },
  { id: 'workflow', label: '⚡ Multi-Channel Workflows', icon: '⚡' },
  { id: 'livedemo', label: '🔴 Live API Demo', icon: '🔴' },
  { id: 'attendance', label: '📋 Q3: Attendance System', icon: '📋' },
]

function App() {
  const [showHero, setShowHero] = useState(true)
  const [activeTab, setActiveTab] = useState('sourcing')
  const [apiStatus, setApiStatus] = useState({ live: false, mode: 'checking' })
  const [showSettings, setShowSettings] = useState(false)
  const [tabTransition, setTabTransition] = useState(false)

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

  function handleTabChange(tabId) {
    setTabTransition(true)
    setTimeout(() => {
      setActiveTab(tabId)
      setTimeout(() => setTabTransition(false), 50)
    }, 150)
  }

  function handleEnterDashboard() {
    setShowHero(false)
  }

  if (showHero) {
    return <HeroLanding onEnter={handleEnterDashboard} />
  }

  return (
    <div className="app-container">
      <Navbar
        tabs={TABS}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        apiStatus={apiStatus}
        onSettings={() => setShowSettings(true)}
      />

      {/* Mobile Tabs */}
      <div className="mobile-tabs">
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`navbar-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => handleTabChange(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <main className="main-content" style={{
        opacity: tabTransition ? 0 : 1,
        transform: tabTransition ? 'translateY(12px)' : 'translateY(0)',
        transition: 'opacity 0.2s ease, transform 0.2s ease',
      }}>
        {activeTab === 'sourcing' && (
          <SourcingView onNavigateToCampaign={() => handleTabChange('campaign')} />
        )}
        {activeTab === 'campaign' && <VoiceCampaignView />}
        {activeTab === 'dashboard' && <DashboardView />}
        {activeTab === 'workflow' && <WorkflowView />}
        {activeTab === 'livedemo' && <LiveCallDemo />}
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
