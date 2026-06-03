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
      <div className="taskbar">
        <button
          type="button"
          onClick={() => setStartMenuOpen(!startMenuOpen)}
          className={`taskbar__start ${startMenuOpen ? 'taskbar__start--open' : ''}`}
          title="Start"
        >
          <Home size={20} color={startMenuOpen ? '#fff' : 'var(--color-text)'} />
        </button>

        <div className="taskbar__separator" />

        <div className="taskbar__windows">
          {windows.map(win => {
            const app = getApp(win.appId)
            const isActive = activeId === win.id
            const className = [
              'taskbar__window',
              isActive ? 'taskbar__window--active' : '',
              win.isMinimized ? 'taskbar__window--minimized' : '',
            ].filter(Boolean).join(' ')

            return (
              <button
                type="button"
                key={win.id}
                onClick={() => {
                  if (isActive) {
                    minimizeWindow(win.id)
                  } else {
                    focusWindow(win.id)
                  }
                }}
                title={win.title}
                className={className}
              >
                <AppIcon icon={app?.icon || win.icon} size={15} color="var(--color-text)" />
                <span className="taskbar__window-label">
                  {app?.name || win.title}
                </span>
                {isActive && <span className="taskbar__window-indicator" />}
              </button>
            )
          })}
        </div>

        <div className="taskbar__clock" id="taskbar-clock" />
      </div>

      <StartMenu open={startMenuOpen} onClose={() => setStartMenuOpen(false)} />
    </>
  )
}
