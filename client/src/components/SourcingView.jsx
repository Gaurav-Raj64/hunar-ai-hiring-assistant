import { useState } from 'react'
import api from '../services/api'

const SAMPLE_JDS = [
  {
    title: 'Senior Full Stack AI Engineer',
    text: 'Looking for a Senior Full Stack AI Engineer with 4-7 years of experience in JavaScript, React, Node.js, Python, and AWS. Location: Bangalore. The role involves architecting Voice AI agent workflows, integrating LLMs, and building real-time dashboards.'
  },
  {
    title: 'B2B Sales Executive (Hindi/English)',
    text: 'Hiring a dynamic B2B Sales Executive with 3-5 years of experience in lead qualification, client communication, and CRM management. Location: Mumbai or Delhi. Fluency in Hindi and English required.'
  },
  {
    title: 'DevOps & Cloud Architect',
    text: 'Seeking an experienced DevOps Engineer with 5-8 years of experience in AWS, Kubernetes, Docker, Terraform, and CI/CD pipelines. Location: Pune. Responsible for 99.99% uptime of telephony voice pipelines.'
  },
  {
    title: 'Frontline Operations Fleet Lead',
    text: 'Urgent requirement for a Fleet Operations Lead with 2-4 years experience managing field delivery personnel and logistics tracking across 50+ hubs. Location: Bangalore or Hyderabad.'
  }
]

export default function SourcingView({ onNavigateToCampaign }) {
  const [jdText, setJdText] = useState(SAMPLE_JDS[0].text)
  const [candidates, setCandidates] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState(null)
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [filters, setFilters] = useState({ location: '', source: '' })

  async function handleSearch(customText) {
    const textToUse = typeof customText === 'string' ? customText : jdText
    if (!textToUse.trim()) return
    setLoading(true)
    try {
      // First parse the JD to extract parameters
      const parseRes = await api.parseJD(textToUse)
      let params = {}
      if (parseRes.success) {
        params = parseRes.data
        setSearchQuery(params)
      }
      // Then search candidates
      const searchRes = await api.searchCandidates(params)
      if (searchRes.success) {
        const results = searchRes.data.results || []
        setCandidates(results)
        // Auto-select top 3 matching candidates by default for quick test convenience
        if (results.length > 0) {
          setSelectedIds(new Set(results.slice(0, 3).map(c => c.id)))
        }
      }
    } catch (err) {
      console.error('Search error:', err)
    }
    setLoading(false)
  }

  function handleQuickJd(sample) {
    setJdText(sample.text)
    handleSearch(sample.text)
  }

  function toggleSelect(id) {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function selectAll() {
    if (selectedIds.size === filteredCandidates.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filteredCandidates.map(c => c.id)))
    }
  }

  function startCampaignWithSelected() {
    const selected = filteredCandidates.filter(c => selectedIds.has(c.id))
    try {
      localStorage.setItem('pendingCampaignCandidates', JSON.stringify(selected))
    } catch (e) {
      console.error(e)
    }
    const event = new CustomEvent('startCampaign', { detail: { candidates: selected } })
    window.dispatchEvent(event)
    if (onNavigateToCampaign) {
      onNavigateToCampaign()
    }
  }

  const filteredCandidates = candidates.filter(c => {
    if (filters.location && !c.location.toLowerCase().includes(filters.location.toLowerCase())) return false
    if (filters.source && c.source !== filters.source) return false
    return true
  })

  return (
    <div className="animate-in">
      <div className="section-header">
        <div>
          <h1 className="section-title">Candidate Search & People Sourcing</h1>
          <p className="section-desc">
            Analyze Job Descriptions with AI and discover verified candidate profiles from Apollo.io, People Data Labs & Proxycurl
          </p>
        </div>
        {selectedIds.size > 0 && (
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <span className="badge badge-purple">{selectedIds.size} candidates selected</span>
            <button className="btn btn-primary" onClick={startCampaignWithSelected}>
              📞 Launch Voice Outreach Campaign
            </button>
          </div>
        )}
      </div>

      {/* JD Input Card */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header">
          <div>
            <div className="card-title">📄 Job Description & Role Criteria</div>
            <div className="card-subtitle">Paste a custom JD or choose a pre-configured template</div>
          </div>
          <button className="btn btn-primary" onClick={() => handleSearch()} disabled={loading || !jdText.trim()}>
            {loading ? '⏳ Analyzing & Searching...' : '🔍 Search Candidates'}
          </button>
        </div>

        {/* Quick JD Template Buttons */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', alignSelf: 'center', fontWeight: 600 }}>Templates:</span>
          {SAMPLE_JDS.map((sample, i) => (
            <button
              key={i}
              className="btn btn-secondary btn-sm"
              onClick={() => handleQuickJd(sample)}
            >
              {sample.title}
            </button>
          ))}
        </div>

        <textarea
          className="textarea"
          placeholder="Paste job description here..."
          value={jdText}
          onChange={e => setJdText(e.target.value)}
          rows={4}
        />

        {searchQuery && (
          <div style={{ marginTop: 16, display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>Extracted Entities:</span>
            {searchQuery.skills && searchQuery.skills.split(',').map((s, i) => (
              <span key={i} className="skill-chip">⚡ {s.trim()}</span>
            ))}
            {searchQuery.location && <span className="badge badge-blue">📍 {searchQuery.location}</span>}
            {searchQuery.min_experience && (
              <span className="badge badge-purple">
                💼 {searchQuery.min_experience}-{searchQuery.max_experience} yrs exp
              </span>
            )}
          </div>
        )}
      </div>

      {/* Results */}
      {candidates.length > 0 && (
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">🎯 Matched Candidate Pool ({filteredCandidates.length})</div>
              <div className="card-subtitle">AI relevance ranked across Apollo.io, PDL, and Proxycurl</div>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <select
                className="select"
                style={{ width: 'auto', minWidth: 150 }}
                value={filters.location}
                onChange={e => setFilters(f => ({ ...f, location: e.target.value }))}
              >
                <option value="">All Locations</option>
                <option value="bangalore">Bangalore</option>
                <option value="mumbai">Mumbai</option>
                <option value="hyderabad">Hyderabad</option>
                <option value="pune">Pune</option>
                <option value="chennai">Chennai</option>
                <option value="noida">Noida/Delhi</option>
              </select>
              <select
                className="select"
                style={{ width: 'auto', minWidth: 150 }}
                value={filters.source}
                onChange={e => setFilters(f => ({ ...f, source: e.target.value }))}
              >
                <option value="">All API Sources</option>
                <option value="Apollo.io">Apollo.io</option>
                <option value="People Data Labs">People Data Labs</option>
                <option value="Proxycurl">Proxycurl</option>
              </select>
            </div>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>
                    <label className="checkbox-container">
                      <input
                        type="checkbox"
                        checked={selectedIds.size === filteredCandidates.length && filteredCandidates.length > 0}
                        onChange={selectAll}
                      />
                    </label>
                  </th>
                  <th>AI Match</th>
                  <th>Candidate Name</th>
                  <th>Current Title & Company</th>
                  <th>Verified Skills</th>
                  <th>Location</th>
                  <th>Exp</th>
                  <th>Source</th>
                </tr>
              </thead>
              <tbody>
                {filteredCandidates.map(c => (
                  <tr key={c.id}>
                    <td>
                      <label className="checkbox-container">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(c.id)}
                          onChange={() => toggleSelect(c.id)}
                        />
                      </label>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div className="progress-bar" style={{ width: 50 }}>
                          <div className="progress-fill" style={{ width: `${c.match_score}%` }} />
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 700, color: c.match_score >= 70 ? 'var(--green)' : c.match_score >= 50 ? 'var(--yellow)' : 'var(--text-secondary)' }}>
                          {c.match_score}%
                        </span>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{c.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{c.phone} · {c.email}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{c.title}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{c.company} · {c.salary_range}</div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, maxWidth: 220 }}>
                        {c.skills.slice(0, 3).map((s, i) => (
                          <span key={i} className="skill-chip">{s}</span>
                        ))}
                        {c.skills.length > 3 && <span className="skill-chip">+{c.skills.length - 3}</span>}
                      </div>
                    </td>
                    <td style={{ fontSize: 13 }}>{c.location}</td>
                    <td style={{ textAlign: 'center', fontWeight: 600 }}>{c.experience_years}y</td>
                    <td><span className="badge badge-blue">{c.source}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {candidates.length === 0 && !loading && (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <div className="empty-title">Ready to source candidates</div>
            <div className="empty-desc">
              Choose a sample template above or paste your custom Job Description and click "Search Candidates" to begin sourcing.
            </div>
            <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => handleSearch()}>
              🔍 Run Initial Search
            </button>
          </div>
        </div>
      )}

      {loading && (
        <div className="card">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 20 }}>
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="skeleton" style={{ height: 48, width: '100%' }} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
