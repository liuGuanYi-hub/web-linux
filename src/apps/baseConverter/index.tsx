import { useState } from 'react'

type Base = 2 | 8 | 10 | 16

const BASES: Base[] = [2, 8, 10, 16]
const BASE_LABELS: Record<Base, string> = { 2: 'BIN', 8: 'OCT', 10: 'DEC', 16: 'HEX' }
const BASE_COLORS: Record<Base, string> = { 2: '#6B8DD6', 8: '#5AC05A', 10: '#C49A6C', 16: '#B06BC4' }

function convert(value: string, from: Base): Record<Base, string> {
  if (!value) return { 2: '', 8: '', 10: '', 16: '' }
  try {
    const num = parseInt(value, from)
    if (isNaN(num)) return { 2: 'Invalid', 8: 'Invalid', 10: 'Invalid', 16: 'Invalid' }
    return {
      2: num.toString(2),
      8: num.toString(8),
      10: num.toString(10),
      16: num.toString(16).toUpperCase(),
    }
  } catch {
    return { 2: 'Error', 8: 'Error', 10: 'Error', 16: 'Error' }
  }
}

function encodeBase16(str: string): string {
  return Array.from(new TextEncoder().encode(str)).map(b => b.toString(16).toUpperCase().padStart(2, '0')).join(' ')
}

function decodeBase16(hex: string): string {
  const bytes = hex.split(/\s+/).map(b => parseInt(b, 16))
  if (bytes.some(isNaN)) return 'Invalid hex'
  try {
    return new TextDecoder().decode(new Uint8Array(bytes.filter(b => !isNaN(b))))
  } catch {
    return 'Decode error'
  }
}

export function BaseConverterApp() {
  const [input, setInput] = useState('')
  const [fromBase, setFromBase] = useState<Base>(10)
  const [mode, setMode] = useState<'number' | 'text'>('number')

  const result = mode === 'number' ? convert(input, fromBase) : null

  const textResult = mode === 'text' ? (input.startsWith('0x') ? decodeBase16(input.slice(2)) : encodeBase16(input)) : null

  const copy = (val: string) => { if (val && !['Invalid', 'Error'].includes(val)) navigator.clipboard.writeText(val) }

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--color-window-bg)', fontFamily: 'var(--font-mono)', fontSize: 12, overflow: 'hidden' }}>
      {/* Mode toggle */}
      <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--color-window-border)', padding: '0 12px' }}>
        {(['number', 'text'] as const).map(m => (
          <button
            key={m}
            onClick={() => { setMode(m); setInput('') }}
            style={{ padding: '8px 16px', border: 'none', borderBottom: mode === m ? '2px solid var(--color-accent)' : '2px solid transparent', background: 'transparent', cursor: 'pointer', color: mode === m ? 'var(--color-accent)' : 'var(--color-text-secondary)', fontSize: 12, textTransform: 'capitalize' }}
          >
            {m === 'number' ? 'Base Converter' : 'Text ↔ Hex'}
          </button>
        ))}
      </div>

      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12, flex: 1, overflow: 'auto' }}>
        {mode === 'number' ? (
          <>
            {/* From */}
            <div>
              <div style={{ fontSize: 10, color: 'var(--color-text-secondary)', marginBottom: 4 }}>INPUT BASE</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ display: 'flex', gap: 4 }}>
                  {BASES.map(b => (
                    <button
                      key={b}
                      onClick={() => setFromBase(b)}
                      style={{ padding: '5px 12px', borderRadius: 6, border: '1px solid ' + (fromBase === b ? BASE_COLORS[b] : 'var(--color-window-border)'), background: fromBase === b ? BASE_COLORS[b] + '20' : 'var(--color-surface)', color: fromBase === b ? BASE_COLORS[b] : 'var(--color-text-secondary)', cursor: 'pointer', fontSize: 11, fontWeight: 700 }}
                    >
                      {BASE_LABELS[b]}
                    </button>
                  ))}
                </div>
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder={`Enter ${BASE_LABELS[fromBase]} value...`}
                  style={{ flex: 1, padding: '6px 12px', borderRadius: 6, border: '1px solid var(--color-window-border)', background: 'var(--color-surface)', color: 'var(--color-text)', fontFamily: 'var(--font-mono)', fontSize: 13 }}
                />
              </div>
            </div>

            {/* Results */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {BASES.filter(b => b !== fromBase).map(b => (
                <div
                  key={b}
                  onClick={() => copy(result?.[b] || '')}
                  style={{ padding: 12, borderRadius: 8, border: '1px solid var(--color-window-border)', background: 'var(--color-surface)', cursor: result?.[b] && !['Invalid', 'Error'].includes(result[b]) ? 'pointer' : 'default' }}
                >
                  <div style={{ fontSize: 10, color: 'var(--color-text-secondary)', marginBottom: 4 }}>{BASE_LABELS[b]}</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: BASE_COLORS[b], wordBreak: 'break-all' }}>{result?.[b] || '—'}</div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <div>
              <div style={{ fontSize: 10, color: 'var(--color-text-secondary)', marginBottom: 4 }}>TEXT</div>
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder='Enter text to encode, or 0x... to decode'
                style={{ width: '100%', height: 80, padding: 8, borderRadius: 6, border: '1px solid var(--color-window-border)', background: 'var(--color-surface)', color: 'var(--color-text)', fontFamily: 'var(--font-mono)', fontSize: 12, resize: 'none', outline: 'none' }}
              />
            </div>
            <div>
              <div style={{ fontSize: 10, color: 'var(--color-text-secondary)', marginBottom: 4 }}>{input.startsWith('0x') ? 'DECODED TEXT' : 'HEX ENCODED'}</div>
              <div onClick={() => copy(textResult || '')} style={{ padding: 12, borderRadius: 8, border: '1px solid var(--color-window-border)', background: 'var(--color-surface)', cursor: textResult && !['Invalid', 'Decode error'].includes(textResult) ? 'pointer' : 'default', fontSize: 13, color: 'var(--color-text)', wordBreak: 'break-all', minHeight: 40 }}>
                {textResult || '—'}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}