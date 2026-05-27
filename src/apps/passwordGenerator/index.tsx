import { useState, useCallback } from 'react'

export function PasswordGeneratorApp() {
  const [length, setLength] = useState(16)
  const [password, setPassword] = useState('')
  const [history, setHistory] = useState<string[]>([])
  const [options, setOptions] = useState({
    upper: true, lower: true, numbers: true, symbols: true,
    excludeAmbiguous: false, custom: '',
  })
  const [copied, setCopied] = useState(false)

  const charset = useCallback(() => {
    let c = ''
    if (options.upper) c += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    if (options.lower) c += 'abcdefghijklmnopqrstuvwxyz'
    if (options.numbers) c += '0123456789'
    if (options.symbols) c += '!@#$%^&*()_+-=[]{}|;:,.<>?'
    if (options.excludeAmbiguous) c = c.replace(/[Il1O0]/g, '')
    const custom = options.custom.trim()
    if (custom) c += custom
    return c || 'abcdefghijklmnopqrstuvwxyz'
  }, [options])

  const generate = useCallback(() => {
    const c = charset()
    let p = ''
    for (let i = 0; i < length; i++) {
      p += c[Math.floor(Math.random() * c.length)]
    }
    setPassword(p)
    setHistory(h => [p, ...h.slice(0, 9)])
    setCopied(false)
  }, [charset, length])

  const copy = () => {
    if (password) {
      navigator.clipboard.writeText(password)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    }
  }

  const strength = (p: string): { label: string; color: string; width: string } => {
    if (p.length < 6) return { label: 'Very Weak', color: '#E85454', width: '20%' }
    if (p.length < 10) return { label: 'Weak', color: '#E88040', width: '40%' }
    if (p.length < 14) return { label: 'Medium', color: '#F5C842', width: '60%' }
    if (p.length < 18) return { label: 'Strong', color: '#5AC05A', width: '80%' }
    return { label: 'Very Strong', color: '#5AC05A', width: '100%' }
  }

  const s = strength(password)

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--color-window-bg)', fontFamily: 'var(--font-mono)', fontSize: 12, overflow: 'hidden' }}>
      {/* Generator */}
      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12, borderBottom: '1px solid var(--color-window-border)' }}>
        {/* Password display */}
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            value={password}
            readOnly
            placeholder='Click Generate...'
            style={{ flex: 1, padding: '10px 14px', borderRadius: 8, border: '1px solid var(--color-window-border)', background: 'var(--color-surface)', color: 'var(--color-text)', fontFamily: 'var(--font-mono)', fontSize: 14, letterSpacing: 1 }}
          />
          <button onClick={copy} style={{ padding: '10px 16px', borderRadius: 8, border: 'none', background: copied ? '#5AC05A' : 'var(--color-accent)', color: '#fff', cursor: 'pointer', fontSize: 12, minWidth: 70 }}>
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>

        {/* Strength bar */}
        {password && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ flex: 1, height: 6, background: '#E0DAD0', borderRadius: 3 }}>
              <div style={{ width: s.width, height: '100%', background: s.color, borderRadius: 3, transition: 'all 300ms' }} />
            </div>
            <span style={{ fontSize: 11, color: s.color, fontWeight: 600 }}>{s.label}</span>
          </div>
        )}

        {/* Length */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ color: 'var(--color-text-secondary)', fontSize: 11, minWidth: 60 }}>Length: <strong style={{ color: 'var(--color-text)' }}>{length}</strong></span>
          <input type="range" min={4} max={64} value={length} onChange={e => setLength(Number(e.target.value))} style={{ flex: 1, accentColor: 'var(--color-accent)' }} />
        </div>

        {/* Options */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {[
            { key: 'upper', label: 'A-Z' },
            { key: 'lower', label: 'a-z' },
            { key: 'numbers', label: '0-9' },
            { key: 'symbols', label: '!@#$' },
            { key: 'excludeAmbiguous', label: 'No ambiguous' },
          ].map(opt => (
            <label key={opt.key} style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', fontSize: 11 }}>
              <input
                type="checkbox"
                checked={options[opt.key as keyof typeof options] as boolean}
                onChange={e => setOptions(o => ({ ...o, [opt.key]: e.target.checked }))}
              />
              <span style={{ color: (options[opt.key as keyof typeof options] as boolean) ? 'var(--color-text)' : 'var(--color-text-muted)' }}>{opt.label}</span>
            </label>
          ))}
        </div>

        {/* Custom chars */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ color: 'var(--color-text-secondary)', fontSize: 11 }}>Custom:</span>
          <input
            value={options.custom}
            onChange={e => setOptions(o => ({ ...o, custom: e.target.value }))}
            placeholder='Extra characters...'
            style={{ flex: 1, padding: '4px 10px', borderRadius: 6, border: '1px solid var(--color-window-border)', background: 'var(--color-surface)', color: 'var(--color-text)', fontFamily: 'var(--font-mono)', fontSize: 11 }}
          />
        </div>

        <button onClick={generate} style={{ padding: '10px', borderRadius: 8, border: 'none', background: 'var(--color-accent)', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
          Generate Password
        </button>
      </div>

      {/* History */}
      {history.length > 0 && (
        <div style={{ flex: 1, overflow: 'auto', padding: '8px 0' }}>
          <div style={{ padding: '4px 16px', color: 'var(--color-text-secondary)', background: 'var(--color-surface)', borderBottom: '1px solid var(--color-window-border)', fontSize: 10 }}>HISTORY</div>
          {history.map((p, i) => (
            <div
              key={i}
              onClick={() => { setPassword(p); setCopied(false) }}
              style={{ padding: '6px 16px', borderBottom: '1px solid var(--color-window-border)', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11 }}
            >
              <span style={{ color: 'var(--color-text)', letterSpacing: 1 }}>{p}</span>
              <span style={{ color: 'var(--color-text-muted)', fontSize: 10 }}>{p.length}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}