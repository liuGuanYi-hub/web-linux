import { useEffect, useState } from 'react'
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

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        bottom: 48,
        background: 'var(--desktop-wallpaper)',
        overflow: 'hidden',
      }}
      onClick={() => setGameFolderOpen(false)}
    >
      <div
        style={{
          position: 'absolute',
          top: 20,
          left: 20,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
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
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'absolute',
            top: 20,
            left: 116,
            width: 316,
            padding: 16,
            background: 'rgba(255,255,255,0.96)',
            border: '1px solid var(--color-window-border)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-lg)',
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 10,
            zIndex: 2,
            backdropFilter: 'blur(8px)',
          }}
        >
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
      onClick={onClick}
      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.42)' }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 4,
        cursor: 'pointer',
        padding: compact ? 6 : 8,
        border: 'none',
        background: 'transparent',
        borderRadius: 'var(--radius-md)',
        transition: 'background 100ms ease',
      }}
    >
      <span
        style={{
          width: compact ? 48 : 56,
          height: compact ? 48 : 56,
          background: 'var(--color-surface)',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <AppIcon icon={icon} size={compact ? 24 : 28} color="var(--color-text)" />
      </span>
      <span
        style={{
          fontSize: 11,
          color: 'var(--color-text)',
          textAlign: 'center',
          maxWidth: compact ? 80 : 72,
          lineHeight: 1.2,
          textShadow: '0 1px 2px rgba(255,255,255,0.8)',
          overflowWrap: 'anywhere',
        }}
      >
        {label}
      </span>
    </button>
  )
}
