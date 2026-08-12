import { useState, useEffect, useRef } from 'react'

export default function AudioWaveformPlayer({ transcript, language = 'ENGLISH', candidateName = 'Candidate' }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentLineIndex, setCurrentLineIndex] = useState(-1)
  const [progress, setProgress] = useState(0)
  const synthRef = useRef(null)
  const utteranceRef = useRef(null)

  useEffect(() => {
    synthRef.current = window.speechSynthesis
    return () => {
      if (synthRef.current) {
        synthRef.current.cancel()
      }
    }
  }, [])

  const stopPlayback = () => {
    if (synthRef.current) {
      synthRef.current.cancel()
    }
    setIsPlaying(false)
    setCurrentLineIndex(-1)
    setProgress(0)
  }

  const playLine = (index) => {
    if (!transcript || index >= transcript.length) {
      setIsPlaying(false)
      setCurrentLineIndex(-1)
      setProgress(100)
      return
    }

    setCurrentLineIndex(index)
    setProgress(Math.round(((index + 1) / transcript.length) * 100))

    const line = transcript[index]
    const utterance = new SpeechSynthesisUtterance(line.text)
    utteranceRef.current = utterance

    // Choose voice based on role and language
    const voices = synthRef.current ? synthRef.current.getVoices() : []
    if (voices.length > 0) {
      if (line.role === 'agent') {
        // Female voice for Neha / Agent
        const femaleVoice = voices.find(v => (v.name.includes('Female') || v.name.includes('Zira') || v.name.includes('Google UK English Female') || v.name.includes('Samantha'))) || voices[0]
        utterance.voice = femaleVoice
        utterance.pitch = 1.1
        utterance.rate = 1.05
      } else {
        // Male voice or different pitch for Candidate
        const maleVoice = voices.find(v => (v.name.includes('Male') || v.name.includes('David') || v.name.includes('Google UK English Male') || v.name.includes('Alex'))) || voices[0]
        utterance.voice = maleVoice
        utterance.pitch = 0.95
        utterance.rate = 1.0
      }
    }

    utterance.onend = () => {
      // Pause slightly between lines
      setTimeout(() => {
        playLine(index + 1)
      }, 400)
    }

    utterance.onerror = (e) => {
      console.warn('SpeechSynthesis error:', e)
      setIsPlaying(false)
    }

    if (synthRef.current) {
      synthRef.current.speak(utterance)
    }
  }

  const handlePlayToggle = () => {
    if (isPlaying) {
      stopPlayback()
    } else {
      setIsPlaying(true)
      playLine(0)
    }
  }

  return (
    <div style={{
      background: 'var(--bg-secondary)',
      border: '1px solid var(--border-accent)',
      borderRadius: 'var(--radius-md)',
      padding: 16,
      marginBottom: 20
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={handlePlayToggle}
            className="btn btn-primary btn-sm"
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 16
            }}
          >
            {isPlaying ? '⏸' : '▶'}
          </button>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>
              {isPlaying ? 'Playing Live Call Recording' : 'Call Audio Playback'}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              {isPlaying ? `Speaking: ${transcript[currentLineIndex]?.role === 'agent' ? 'AI Voice Agent (Neha)' : candidateName}` : 'Click play to listen to synthesized call dialogue'}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className={`badge ${isPlaying ? 'badge-green' : 'badge-purple'}`}>
            {isPlaying ? '● LIVE AUDIO' : 'HD AUDIO'}
          </span>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
            {progress}%
          </span>
        </div>
      </div>

      {/* Dynamic Animated Audio Waveform */}
      <div style={{
        height: 44,
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-sm)',
        padding: '0 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 3,
        overflow: 'hidden',
        position: 'relative'
      }}>
        {Array.from({ length: 48 }, (_, i) => {
          const isCurrentChunk = (i / 48) <= (progress / 100)
          const barHeight = isPlaying
            ? Math.max(6, Math.sin((i + Date.now() / 200)) * 18 + 16 + Math.random() * 8)
            : Math.max(6, Math.sin(i * 0.4) * 14 + 16)
          
          return (
            <div
              key={i}
              style={{
                flex: 1,
                height: `${barHeight}px`,
                background: isCurrentChunk
                  ? 'var(--accent-gradient)'
                  : 'rgba(255, 255, 255, 0.1)',
                borderRadius: 2,
                transition: isPlaying ? 'height 0.1s ease, background 0.2s ease' : 'all 0.3s ease'
              }}
            />
          )
        })}
      </div>
    </div>
  )
}
