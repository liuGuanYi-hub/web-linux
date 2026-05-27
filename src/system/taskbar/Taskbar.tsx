import { useState } from 'react'
import { Home } from 'lucide-react'
import { getApp } from '@/system/AppRegistry'
import { AppIcon } from '@/system/AppIcon'
import { useWindowStore } from '@/stores/windowStore'
import { StartMenu } from '../startMenu/StartMenu'

export function Taskbar() {
  const { windows, activeId, focusWindow, minimizeWindow } = useWindowStore()
  const [startMenuOpen, setStartMenuOpen] = useState(false)

  return (
    <>
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: 48,
          background: 'var(--color-taskbar)',
          borderTop: '1px solid var(--color-taskbar-border)',
          borderTopLeftRadius: 'var(--radius-lg)',
          borderTopRightRadius: 'var(--radius-lg)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 12px',
          gap: 8,
          zIndex: 9999,
        }}
      >
        <button
          onClick={() => setStartMenuOpen(!startMenuOpen)}
          style={{
            width: 40,
            height: 40,
            borderRadius: 'var(--radius-md)',
            border: 'none',
            background: startMenuOpen ? 'var(--color-accent)' : 'transparent',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 150ms ease',
          }}
          title="Start"
        >
          <Home size={20} color={startMenuOpen ? '#fff' : 'var(--color-text)'} />
        </button>

        <div style={{ width: 1, height: 24, background: 'var(--color-window-border)', margin: '0 4px' }} />

        <div style={{ display: 'flex', gap: 4, flex: 1, overflowX: 'auto' }}>
          {windows.map(win => {
            const app = getApp(win.appId)
            const isActive = activeId === win.id

            return (
              <button
                key={win.id}
                onClick={() => {
                  if (isActive) {
                    minimizeWindow(win.id)
                  } else {
                    focusWindow(win.id)
                  }
                }}
                title={win.title}
                style={{
                  height: 36,
                  padding: '0 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  background: isActive ? 'var(--color-surface)' : 'transparent',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  boxShadow: isActive ? 'var(--shadow-sm)' : 'none',
                  opacity: win.isMinimized ? 0.65 : 1,
                  transition: 'all 150ms ease',
                  position: 'relative',
                  maxWidth: 180,
                }}
              >
                <AppIcon icon={app?.icon || win.icon} size={15} color="var(--color-text)" />
                <span style={{ fontSize: 12, color: 'var(--color-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {app?.name || win.title}
                </span>
                {isActive && (
                  <div style={{
                    position: 'absolute',
                    bottom: 2,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 20,
                    height: 3,
                    background: 'var(--color-accent)',
                    borderRadius: 2,
                  }} />
                )}
              </button>
            )
          })}
        </div>

        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          <div style={{ fontSize: 12, color: 'var(--color-text)', minWidth: 50, textAlign: 'right' }} id="taskbar-clock" />
        </div>
      </div>

      <StartMenu open={startMenuOpen} onClose={() => setStartMenuOpen(false)} />
    </>
  )
}
