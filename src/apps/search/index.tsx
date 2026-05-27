import { useMemo, useState } from 'react'
import { X } from 'lucide-react'
import { openApp } from '@/system/openApp'
import { getAllApps } from '@/system/AppRegistry'
import { AppIcon } from '@/system/AppIcon'

interface SearchResult {
  appId: string
  appName: string
  matchedField: 'name' | 'id'
  score: number
  icon: string
}

const builtInCommands: Array<{ cmd: string; description: string; action: string }> = [
  { cmd: 'open terminal', description: 'Open Terminal app', action: 'terminal' },
  { cmd: 'open file manager', description: 'Open File Manager', action: 'fileManager' },
  { cmd: 'open calculator', description: 'Open Calculator', action: 'calculator' },
  { cmd: 'open settings', description: 'Open Settings', action: 'settings' },
  { cmd: 'open calendar', description: 'Open Calendar', action: 'calendar' },
  { cmd: 'open clock', description: 'Open Clock', action: 'clock' },
  { cmd: 'open minesweeper', description: 'Open Minesweeper', action: 'minesweeper' },
  { cmd: 'open text editor', description: 'Open Text Editor', action: 'textEditor' },
  { cmd: 'open sticky notes', description: 'Open Sticky Notes', action: 'stickyNotes' },
  { cmd: 'shutdown', description: 'Restart the system', action: 'shutdown' },
  { cmd: 'restart', description: 'Restart the system', action: 'shutdown' },
  { cmd: 'clear', description: 'Clear search', action: 'clear' },
]

function fuzzyMatch(query: string, target: string): number {
  query = query.toLowerCase()
  target = target.toLowerCase()

  if (target === query) return 100
  if (target.startsWith(query)) return 80
  if (target.includes(query)) return 60

  // 模糊匹配：query 的每个字符在 target 中顺序出现
  let qi = 0
  let score = 0
  let consecutive = 0
  for (let i = 0; i < target.length && qi < query.length; i++) {
    if (target[i] === query[qi]) {
      qi++
      consecutive++
      score += consecutive * 10
    } else {
      consecutive = 0
    }
  }

  return qi === query.length ? score : 0
}

export function SearchApp() {
  const [query, setQuery] = useState('')
  const apps = useMemo(() => getAllApps().map(a => ({ id: a.id, name: a.name, icon: a.icon })), [])

  const results = useMemo(() => {
    if (!query.trim()) {
      return []
    }

    const q = query.toLowerCase()

    // 匹配 app
    const appResults: SearchResult[] = apps
      .map(app => {
        const nameScore = fuzzyMatch(q, app.name)
        const idScore = fuzzyMatch(q, app.id)
        const best = Math.max(nameScore, idScore)
        return best > 0
          ? { appId: app.id, appName: app.name, matchedField: nameScore >= idScore ? 'name' : 'id', score: best, icon: app.icon }
          : null
      })
      .filter(Boolean) as SearchResult[]

    // 匹配内置命令
    const cmdResults = builtInCommands
      .filter(cmd => cmd.cmd.includes(q) || cmd.description.toLowerCase().includes(q))
      .map(cmd => ({ appId: cmd.action, appName: cmd.description, matchedField: 'name' as const, score: 50, icon: apps.find(app => app.id === cmd.action)?.icon || 'Power' }))

    return [...appResults.sort((a, b) => b.score - a.score), ...cmdResults]
  }, [query, apps])

  const handleSelect = (result: SearchResult) => {
    if (result.appId === 'shutdown') {
      window.location.reload()
    } else if (result.appId === 'clear') {
      setQuery('')
    } else {
      openApp(result.appId)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && results.length > 0) {
      handleSelect(results[0])
    }
  }

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--color-window-bg)' }}>
      {/* 搜索框 */}
      <div style={{ padding: 16, borderBottom: '1px solid var(--color-window-border)' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          background: 'var(--color-bg)',
          borderRadius: 'var(--radius-lg)',
          padding: '12px 16px',
          border: query ? '2px solid var(--color-accent)' : '2px solid var(--color-window-border)',
          transition: 'border-color 150ms ease',
        }}>
          <AppIcon icon="Search" size={20} color="var(--color-text-secondary)" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search apps, commands..."
            autoFocus
            style={{
              flex: 1,
              border: 'none',
              background: 'transparent',
              outline: 'none',
              fontSize: 15,
              color: 'var(--color-text)',
            }}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              style={{
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                fontSize: 16,
                color: 'var(--color-text-muted)',
              }}
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* 结果列表 */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
        {results.length === 0 && query && (
          <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 13 }}>
            No results found for "{query}"
          </div>
        )}

        {results.length === 0 && !query && (
          <div style={{ padding: 16 }}>
            <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>
              Quick Commands
            </div>
            {builtInCommands.slice(0, 6).map(cmd => (
              <button
                key={cmd.cmd}
                onClick={() => { if (cmd.action === 'clear') setQuery(''); else openApp(cmd.action) }}
                style={{
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background 100ms ease',
                  marginBottom: 2,
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-bg)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
              >
                <span style={{ fontSize: 13, color: 'var(--color-text)' }}>{cmd.description}</span>
                <span style={{ fontSize: 11, color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>{cmd.cmd}</span>
              </button>
            ))}
          </div>
        )}

        {results.map((result, i) => (
          <button
            key={`${result.appId}-${i}`}
            onClick={() => handleSelect(result)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '10px 16px',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'background 100ms ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-bg)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
          >
            <AppIcon icon={result.icon} size={22} color="var(--color-text)" />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, color: 'var(--color-text)', fontWeight: 500 }}>
                {result.appName}
                {result.matchedField === 'id' && (
                  <span style={{ fontSize: 10, color: 'var(--color-text-muted)', marginLeft: 6, fontFamily: 'var(--font-mono)' }}>
                    ({result.appId})
                  </span>
                )}
              </div>
              <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                {result.appId === 'shutdown' ? 'System command' : 'Application'}
              </div>
            </div>
            {i === 0 && results.length > 0 && (
              <span style={{ fontSize: 10, color: 'var(--color-text-muted)', background: 'var(--color-titlebar)', padding: '2px 6px', borderRadius: 4 }}>
                Enter to open
              </span>
            )}
          </button>
        ))}
      </div>

      {/* 底部提示 */}
      <div style={{ padding: '8px 16px', borderTop: '1px solid var(--color-window-border)', background: 'var(--color-titlebar)', display: 'flex', gap: 16 }}>
        <span style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>
          <kbd style={{ background: 'var(--color-surface)', padding: '1px 4px', borderRadius: 3, border: '1px solid var(--color-window-border)' }}>Enter</kbd> to open
        </span>
        <span style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>
          <kbd style={{ background: 'var(--color-surface)', padding: '1px 4px', borderRadius: 3, border: '1px solid var(--color-window-border)' }}>Esc</kbd> to close
        </span>
      </div>
    </div>
  )
}
