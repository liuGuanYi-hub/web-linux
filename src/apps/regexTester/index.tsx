import { useState, useMemo } from 'react'
import { XCircle } from 'lucide-react'

const DEFAULT_INPUT = 'The quick brown fox jumps over the lazy dog.\nEmail: user@example.com\nPhone: 123-456-7890'

export function RegexTesterApp() {
  const [pattern, setPattern] = useState('')
  const [flags, setFlags] = useState('g')
  const [input] = useState(DEFAULT_INPUT)

  const result = useMemo(() => {
    if (!pattern) return { matches: [], error: '' }
    try {
      const re = new RegExp(pattern, flags)
      const matches: { match: string; index: number; groups?: string[] }[] = []
      const reForExec = new RegExp(pattern, flags.includes('g') ? flags : flags + 'g')
      if (flags.includes('g')) {
        let m
        while ((m = reForExec.exec(input)) !== null) {
          matches.push({ match: m[0], index: m.index, groups: m.slice(1) })
          if (!m[0]) break
        }
      } else {
        const m = re.exec(input)
        if (m) matches.push({ match: m[0], index: m.index, groups: m.slice(1) })
      }
      return { matches, error: '' }
    } catch (e: unknown) {
      return { matches: [], error: (e as Error).message }
    }
  }, [pattern, flags, input])

  const { matches, error } = result

  const highlightInput = () => {
    if (!pattern || !input) return null
    try {
      const re = new RegExp(pattern, flags.includes('g') ? flags : flags + 'g')
      const parts = input.split(re)
      const matches = input.match(re) || []
      return parts.map((part, i) => {
        const result: React.ReactNode = <span key={i} style={{ color: 'var(--color-text)' }}>{part}</span>
        if (i < matches.length) {
          return [
            result,
            <mark key={'m' + i} style={{ background: '#F5C84260', borderRadius: 2, padding: '0 2px' }}>{matches[i]}</mark>
          ]
        }
        return result
      }).flat()
    } catch {
      return null
    }
  }

  const toggleFlag = (f: string) => {
    setFlags(prev => prev.includes(f) ? prev.replace(f, '') : prev + f)
  }

  const highlighted = highlightInput()

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--color-window-bg)', fontFamily: 'var(--font-mono)', fontSize: 12, overflow: 'hidden' }}>
      {/* Pattern bar */}
      <div style={{ display: 'flex', gap: 8, padding: '10px 12px', borderBottom: '1px solid var(--color-window-border)', background: 'var(--color-surface)', alignItems: 'center' }}>
        <span style={{ color: 'var(--color-text-secondary)', fontSize: 11 }}>/</span>
        <input
          value={pattern}
          onChange={e => setPattern(e.target.value)}
          placeholder='Regular expression'
          style={{ flex: 1, padding: '5px 10px', borderRadius: 6, border: '1px solid var(--color-window-border)', background: 'var(--color-window-bg)', color: 'var(--color-text)', fontFamily: 'var(--font-mono)', fontSize: 12, outline: 'none' }}
        />
        <span style={{ color: 'var(--color-text-secondary)', fontSize: 11 }}>/</span>
        <div style={{ display: 'flex', gap: 4 }}>
          {['g', 'i', 'm', 's'].map(f => (
            <button
              key={f}
              onClick={() => toggleFlag(f)}
              style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid var(--color-window-border)', background: flags.includes(f) ? 'var(--color-accent)' : 'var(--color-surface)', color: flags.includes(f) ? '#fff' : 'var(--color-text-secondary)', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div style={{ padding: '6px 12px', background: '#fdd', color: '#E85454', fontSize: 11, borderBottom: '1px solid #fcc', display: 'flex', alignItems: 'center', gap: 6 }}>
          <XCircle size={13} /> {error}
        </div>
      )}

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Input */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', borderRight: '1px solid var(--color-window-border)' }}>
          <div style={{ padding: '4px 12px', color: 'var(--color-text-secondary)', background: 'var(--color-surface)', borderBottom: '1px solid var(--color-window-border)', fontSize: 10 }}>TEST STRING</div>
          <div style={{ flex: 1, padding: 12, overflow: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-all', color: 'var(--color-text)', lineHeight: 1.6 }}>
            {highlighted || input}
          </div>
        </div>

        {/* Results */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '4px 12px', color: 'var(--color-text-secondary)', background: 'var(--color-surface)', borderBottom: '1px solid var(--color-window-border)', fontSize: 10 }}>MATCHES ({matches.length})</div>
          <div style={{ flex: 1, overflow: 'auto', padding: '8px 0' }}>
            {matches.length === 0 && !error && (
              <div style={{ padding: '12px 16px', color: 'var(--color-text-muted)', fontSize: 11 }}>No matches found</div>
            )}
            {matches.map((m, i) => (
              <div key={i} style={{ padding: '6px 16px', borderBottom: '1px solid var(--color-window-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, color: 'var(--color-accent)', fontWeight: 600 }}>"{m.match}"</span>
                  <span style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>@{m.index}</span>
                </div>
                {m.groups && m.groups.length > 0 && m.groups.some(g => g !== undefined) && (
                  <div style={{ fontSize: 10, color: 'var(--color-text-secondary)', marginTop: 2 }}>
                    Groups: {m.groups.map((g, gi) => g != null ? <span key={gi} style={{ color: '#B06BC4' }}>[{gi + 1}]: {g}</span> : null)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
