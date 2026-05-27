import { useEffect } from 'react'
import { AppIcon } from '@/system/AppIcon'
import { desktopIcons } from '@/system/AppRegistry'
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
        {desktopIcons.map((icon) => (
          <button
            key={icon.appId}
            onDoubleClick={() => openApp(icon.appId)}
            onClick={(e) => e.stopPropagation()}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
              cursor: 'pointer',
              padding: 8,
              border: 'none',
              background: 'transparent',
              borderRadius: 'var(--radius-md)',
              transition: 'background 100ms ease',
            }}
          >
            <span
              style={{
                width: 56,
                height: 56,
                background: 'var(--color-surface)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AppIcon icon={icon.icon} size={28} color="var(--color-text)" />
            </span>
            <span
              style={{
                fontSize: 11,
                color: 'var(--color-text)',
                textAlign: 'center',
                maxWidth: 72,
                lineHeight: 1.2,
                textShadow: '0 1px 2px rgba(255,255,255,0.8)',
                overflowWrap: 'anywhere',
              }}
            >
              {icon.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
