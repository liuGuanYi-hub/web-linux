import { useState } from 'react'
import { Power, Search } from 'lucide-react'
import { AppIcon } from '@/system/AppIcon'
import { getAllApps } from '@/system/AppRegistry'
import { openApp } from '@/system/openApp'

interface StartMenuProps {
  open: boolean
  onClose: () => void
}

export function StartMenu({ open, onClose }: StartMenuProps) {
  const [search, setSearch] = useState('')
  const allApps = getAllApps()

  const filtered = search.trim()
    ? allApps.filter(app => app.name.toLowerCase().includes(search.toLowerCase()))
    : allApps

  if (!open) return null

  return (
    <>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9998,
        }}
        onClick={onClose}
      />

      <div
        style={{
          position: 'fixed',
          bottom: 52,
          left: 12,
          width: 320,
          maxHeight: '60vh',
          background: 'var(--color-surface)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-lg)',
          border: '1px solid var(--color-window-border)',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <div style={{ padding: 12, borderBottom: '1px solid var(--color-taskbar-border)' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: 'var(--color-bg)',
            borderRadius: 'var(--radius-md)',
            padding: '8px 12px',
          }}>
            <Search size={16} color="var(--color-text-secondary)" />
            <input
              type="text"
              placeholder="Search apps..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              autoFocus
              style={{
                border: 'none',
                background: 'transparent',
                outline: 'none',
                fontSize: 13,
                color: 'var(--color-text)',
                width: '100%',
              }}
            />
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: 8 }}>
          {filtered.map(app => (
            <button
              key={app.id}
              onClick={() => {
                openApp(app.id)
                setSearch('')
                onClose()
              }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 12px',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'background 100ms ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'var(--color-bg)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'transparent'
              }}
            >
              <span style={{
                width: 32,
                height: 32,
                background: 'var(--color-taskbar)',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-text)',
                flexShrink: 0,
              }}>
                <AppIcon icon={app.icon} size={17} />
              </span>
              <span style={{ fontSize: 13, color: 'var(--color-text)' }}>
                {app.name}
              </span>
            </button>
          ))}
        </div>

        <div style={{
          padding: 8,
          borderTop: '1px solid var(--color-taskbar-border)',
          display: 'flex',
          justifyContent: 'flex-end',
        }}>
          <button
            onClick={() => window.location.reload()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 12px',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              fontSize: 12,
              color: 'var(--color-text-secondary)',
            }}
          >
            <Power size={14} />
            Restart
          </button>
        </div>
      </div>
    </>
  )
}
