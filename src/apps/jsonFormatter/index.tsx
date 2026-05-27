import { useState } from 'react'
import { XCircle } from 'lucide-react'

export function JsonFormatterApp() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [indent, setIndent] = useState(2)

  const format = () => {
    try {
      const parsed = JSON.parse(input)
      const formatted = JSON.stringify(parsed, null, indent)
      setOutput(formatted)
      setError('')
    } catch (e: unknown) {
      setError((e as Error).message)
      setOutput('')
    }
  }

  const minify = () => {
    try {
      const parsed = JSON.parse(input)
      setOutput(JSON.stringify(parsed))
      setError('')
    } catch (e: unknown) {
      setError((e as Error).message)
    }
  }

  const copy = () => {
    if (output) {
      navigator.clipboard.writeText(output)
    }
  }

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--color-window-bg)', fontFamily: 'var(--font-mono)', fontSize: 12, overflow: 'hidden' }}>
      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 8, padding: '8px 12px', borderBottom: '1px solid var(--color-window-border)', background: 'var(--color-surface)', alignItems: 'center', flexWrap: 'wrap' }}>
        <button onClick={format} style={{ padding: '5px 14px', borderRadius: 6, border: 'none', background: 'var(--color-accent)', color: '#fff', cursor: 'pointer', fontSize: 11, fontWeight: 600 }}>Format</button>
        <button onClick={minify} style={{ padding: '5px 14px', borderRadius: 6, border: '1px solid var(--color-window-border)', background: 'var(--color-surface)', color: 'var(--color-text)', cursor: 'pointer', fontSize: 11 }}>Minify</button>
        <button onClick={copy} style={{ padding: '5px 14px', borderRadius: 6, border: '1px solid var(--color-window-border)', background: 'var(--color-surface)', color: 'var(--color-text)', cursor: 'pointer', fontSize: 11 }}>Copy</button>

        <div style={{ display: 'flex', gap: 4, alignItems: 'center', marginLeft: 'auto' }}>
          <span style={{ color: 'var(--color-text-secondary)', fontSize: 11 }}>Indent:</span>
          <select value={indent} onChange={e => setIndent(Number(e.target.value))} style={{ padding: '3px 8px', borderRadius: 4, border: '1px solid var(--color-window-border)', background: 'var(--color-surface)', color: 'var(--color-text)', cursor: 'pointer', fontSize: 11 }}>
            <option value={2}>2 spaces</option>
            <option value={4}>4 spaces</option>
            <option value={1}>1 space</option>
            <option value={0}>Tab</option>
          </select>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{ padding: '8px 12px', background: '#fdd', color: '#E85454', fontSize: 11, borderBottom: '1px solid #fcc', wordBreak: 'break-all', display: 'flex', alignItems: 'center', gap: 6 }}>
          <XCircle size={13} /> {error}
        </div>
      )}

      {/* Panes */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', borderRight: '1px solid var(--color-window-border)' }}>
          <div style={{ padding: '4px 12px', color: 'var(--color-text-secondary)', background: 'var(--color-surface)', borderBottom: '1px solid var(--color-window-border)', fontSize: 10 }}>INPUT</div>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder='Paste JSON here...'
            spellCheck={false}
            style={{ flex: 1, padding: 12, background: 'var(--color-window-bg)', border: 'none', outline: 'none', resize: 'none', color: 'var(--color-text)', fontFamily: 'var(--font-mono)', fontSize: 12, lineHeight: 1.5 }}
          />
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '4px 12px', color: 'var(--color-text-secondary)', background: 'var(--color-surface)', borderBottom: '1px solid var(--color-window-border)', fontSize: 10 }}>OUTPUT</div>
          <textarea
            value={output}
            readOnly
            placeholder='Formatted output...'
            spellCheck={false}
            style={{ flex: 1, padding: 12, background: 'var(--color-window-bg)', border: 'none', outline: 'none', resize: 'none', color: output ? 'var(--color-text)' : 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', fontSize: 12, lineHeight: 1.5 }}
          />
        </div>
      </div>

      {/* Stats */}
      {output && (
        <div style={{ padding: '4px 12px', background: 'var(--color-surface)', borderTop: '1px solid var(--color-window-border)', fontSize: 10, color: 'var(--color-text-secondary)' }}>
          {output.split('\n').length} lines | {output.length} chars
        </div>
      )}
    </div>
  )
}
