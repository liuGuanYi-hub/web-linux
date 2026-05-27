import { useMemo, useState, useEffect, useRef } from 'react'
import { Play } from 'lucide-react'
import { AppIcon } from '@/system/AppIcon'
import { openApp } from '@/system/openApp'
import { getAllApps } from '@/system/AppRegistry'

export function RunDialogApp() {
  const [command, setCommand] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const apps = useMemo(() => getAllApps().map(a => ({ id: a.id, name: a.name, icon: a.icon })), [])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const filtered = command.trim()
    ? apps.filter(a => a.name.toLowerCase().includes(command.toLowerCase()))
    : apps

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const match = apps.find(a => a.name.toLowerCase() === command.toLowerCase() || a.id.toLowerCase() === command.toLowerCase())
    if (match) {
      openApp(match.id)
      setCommand('')
    } else {
      // 尝试直接用 app id
      openApp(command.trim())
    }
  }

  const handleSelect = (appId: string) => {
    openApp(appId)
  }

  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--color-surface)',
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
    }}>
      {/* 输入框 */}
      <form onSubmit={handleSubmit} style={{
        display: 'flex',
        alignItems: 'center',
        padding: '12px 16px',
        gap: 12,
        borderBottom: '1px solid var(--color-window-border)',
      }}>
        <Play size={16} color="var(--color-text-secondary)" />
        <input
          ref={inputRef}
          type="text"
          value={command}
          onChange={e => setCommand(e.target.value)}
          placeholder="Enter app name to run..."
          style={{
            flex: 1,
            border: 'none',
            outline: 'none',
            fontSize: 13,
            color: 'var(--color-text)',
            background: 'transparent',
            fontFamily: 'var(--font-mono)',
          }}
        />
        <button
          type="submit"
          style={{
            padding: '4px 12px',
            border: 'none',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--color-accent)',
            color: '#fff',
            fontSize: 12,
            cursor: 'pointer',
          }}
        >
          Run
        </button>
      </form>

      {/* 建议列表 */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
        {filtered.map(app => (
          <button
            key={app.id}
            onClick={() => handleSelect(app.id)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '8px 16px',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'background 100ms ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-bg)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
          >
            <AppIcon icon={app.icon} size={19} color="var(--color-text)" />
            <span style={{ fontSize: 13, color: 'var(--color-text)' }}>{app.name}</span>
            <span style={{ fontSize: 11, color: 'var(--color-text-muted)', marginLeft: 'auto' }}>{app.id}</span>
          </button>
        ))}
      </div>

      {/* 提示 */}
      <div style={{
        padding: '6px 16px',
        background: 'var(--color-titlebar)',
        fontSize: 10,
        color: 'var(--color-text-muted)',
        borderTop: '1px solid var(--color-window-border)',
      }}>
        Press Enter to run | Click to open
      </div>
    </div>
  )
}
