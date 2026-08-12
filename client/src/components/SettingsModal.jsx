import { useState } from 'react'

export default function SettingsModal({ apiStatus, onClose, onSave }) {
  const [apiKey, setApiKey] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    if (!apiKey.trim()) return
    setSaving(true)
    await onSave(apiKey)
    setSaving(false)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">⚙️ Settings</div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {/* API Status */}
        <div style={{
          padding: 16, borderRadius: 12, marginBottom: 24,
          background: apiStatus.live ? 'var(--green-soft)' : 'var(--yellow-soft)',
          border: `1px solid ${apiStatus.live ? 'var(--green)' : 'var(--yellow)'}`
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className={`status-dot ${apiStatus.live ? 'live' : 'sandbox'}`} />
            <div>
              <div style={{ fontWeight: 700 }}>
                {apiStatus.live ? '🟢 Connected to Hunar Voice AI API' : '🟡 Running in Sandbox Mode'}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                {apiStatus.message}
                {apiStatus.fallback && ' (automatic fallback)'}
              </div>
            </div>
          </div>
        </div>

        {/* API Key Input */}
        <div className="form-group">
          <label className="form-label">Hunar Voice AI API Key</label>
          <input
            className="input"
            type="password"
            placeholder="hunar_va_live_sk_..."
            value={apiKey}
            onChange={e => setApiKey(e.target.value)}
          />
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
            Your API key is sent only to your backend server and is never stored in the browser.
          </div>
        </div>

        <button
          className="btn btn-primary"
          style={{ width: '100%', marginTop: 16 }}
          onClick={handleSave}
          disabled={saving || !apiKey.trim()}
        >
          {saving ? '⏳ Validating...' : '💾 Update API Key'}
        </button>

        {/* Info */}
        <div style={{ marginTop: 24, padding: 16, background: 'var(--bg-secondary)', borderRadius: 12, border: '1px solid var(--border)' }}>
          <div style={{ fontWeight: 700, marginBottom: 8, fontSize: 14 }}>ℹ️ How it works</div>
          <ul style={{ fontSize: 13, color: 'var(--text-secondary)', paddingLeft: 20, lineHeight: 1.8 }}>
            <li><strong>Live Mode</strong>: When a valid API key is configured, the app connects to the real Hunar Voice AI API for agent management and outbound calling.</li>
            <li><strong>Sandbox Mode</strong>: When the API key is missing or expired, the app automatically falls back to a built-in simulator with realistic call flows, transcripts, and AI-extracted results.</li>
            <li>The API key is stored only on the server and is never exposed to the frontend.</li>
          </ul>
        </div>

        <div style={{ marginTop: 16, padding: 16, background: 'var(--bg-secondary)', borderRadius: 12, border: '1px solid var(--border)' }}>
          <div style={{ fontWeight: 700, marginBottom: 8, fontSize: 14 }}>🔗 API Documentation</div>
          <a href="https://api.voice.hunar.ai/docs/external/" target="_blank" rel="noopener noreferrer"
            style={{ color: 'var(--accent-secondary)', fontSize: 13 }}>
            https://api.voice.hunar.ai/docs/external/
          </a>
        </div>
      </div>
    </div>
  )
}
