import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { AppIcon } from '@/system/AppIcon'
import { desktopIcons, gameIcons } from '@/system/AppRegistry'
import { openApp } from '@/system/openApp'

const wallpaperBackgrounds: Record<string, string> = {
  warm: 'linear-gradient(180deg, #F5F0E8 0%, #EDE8DF 100%)',
  sunset: 'linear-gradient(180deg, #FFE4C4 0%, #FFDAB9 50%, #E8D5C4 100%)',
  forest: 'linear-gradient(180deg, #D4E8D0 0%, #C4D8C0 100%)',
  ocean: 'linear-gradient(180deg, #D6E8F0 0%, #C0D8E8 100%)',
  lavender: 'linear-gradient(180deg, #E8E0F0 0%, #D8D0E8 100%)',
  rose: 'linear-gradient(180deg, #F8E0E8 0%, #F0D0D8 100%)',
}

export function Desktop() {
  const [gameFolderOpen, setGameFolderOpen] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('webfs-settings')
    if (stored) {
      try {
        const settings = JSON.parse(stored) as { wallpaper?: string }
        const wallpaper = settings.wallpaper && wallpaperBackgrounds[settings.wallpaper]
        if (wallpaper) document.documentElement.style.setProperty('--desktop-wallpaper', wallpaper)
      } catch { /* ignore invalid saved settings */ }
    }

    const updateClock = () => {
      const el = document.getElementById('taskbar-clock')
      if (el) {
        el.textContent = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
      }
    }
    updateClock()
    const interval = setInterval(updateClock, 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!gameFolderOpen) return
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setGameFolderOpen(false)
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [gameFolderOpen])

  return (
    <div
      className="desktop"
      onClick={() => setGameFolderOpen(false)}
    >
      <div className="desktop-icon-rail">
        <DesktopIcon
          icon="Folder"
          label="Game"
          onClick={(e) => {
            e.stopPropagation()
            setGameFolderOpen(open => !open)
          }}
        />
        {desktopIcons.map((icon) => (
          <DesktopIcon
            key={icon.appId}
            icon={icon.icon}
            label={icon.label}
            onClick={(e) => {
              e.stopPropagation()
              openApp(icon.appId)
            }}
          />
        ))}
      </div>

      {gameFolderOpen && (
        <div
          className="game-folder"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="game-folder__header">
            <span className="game-folder__title">Game</span>
            <button
              className="game-folder__close"
              type="button"
              title="Close"
              onClick={() => setGameFolderOpen(false)}
            >
              <X size={15} />
            </button>
          </div>
          <div className="game-folder__grid">
            {gameIcons.map((game) => (
              <DesktopIcon
                key={game.appId}
                icon={game.icon}
                label={game.label}
                compact
                onClick={() => {
                  openApp(game.appId)
                  setGameFolderOpen(false)
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

interface DesktopIconProps {
  icon: string
  label: string
  compact?: boolean
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void
}

function DesktopIcon({ icon, label, compact = false, onClick }: DesktopIconProps) {
  return (
    <button
      type="button"
      className="desktop-icon"
      onClick={onClick}
    >
      <span className="desktop-icon__tile">
        <AppIcon icon={icon} size={compact ? 24 : 28} color="var(--color-text)" />
      </span>
      <span className="desktop-icon__label">
        {label}
      </span>
    </button>
  )
}
