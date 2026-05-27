import { useState, useEffect } from 'react'
import { MonitorCog } from 'lucide-react'

const wallpapers = [
  { id: 'warm', name: 'Warm Cream', bg: 'linear-gradient(180deg, #F5F0E8 0%, #EDE8DF 100%)' },
  { id: 'sunset', name: 'Sunset', bg: 'linear-gradient(180deg, #FFE4C4 0%, #FFDAB9 50%, #E8D5C4 100%)' },
  { id: 'forest', name: 'Forest', bg: 'linear-gradient(180deg, #D4E8D0 0%, #C4D8C0 100%)' },
  { id: 'ocean', name: 'Ocean Blue', bg: 'linear-gradient(180deg, #D6E8F0 0%, #C0D8E8 100%)' },
  { id: 'lavender', name: 'Lavender', bg: 'linear-gradient(180deg, #E8E0F0 0%, #D8D0E8 100%)' },
  { id: 'rose', name: 'Rose', bg: 'linear-gradient(180deg, #F8E0E8 0%, #F0D0D8 100%)' },
]

const themes = [
  { id: 'default', name: 'Default', accent: '#C49A6C' },
  { id: 'blue', name: 'Ocean', accent: '#6B8DD6' },
  { id: 'green', name: 'Forest', accent: '#5AC05A' },
  { id: 'purple', name: 'Royal', accent: '#B06BC4' },
  { id: 'orange', name: 'Sunset', accent: '#E88040' },
]

interface SettingsState {
  wallpaper: string
  theme: string
  fontSize: number
}

const defaultSettings: SettingsState = {
  wallpaper: 'warm',
  theme: 'default',
  fontSize: 13,
}

function applyWallpaper(wallpaperId: string) {
  const wp = wallpapers.find(w => w.id === wallpaperId)
  if (wp) document.documentElement.style.setProperty('--desktop-wallpaper', wp.bg)
}

function applyTheme(themeId: string) {
  const th = themes.find(t => t.id === themeId)
  if (th) document.documentElement.style.setProperty('--color-accent', th.accent)
}

export function SettingsApp() {
  const [settings, setSettings] = useState<SettingsState>(() => {
    const stored = localStorage.getItem('webfs-settings')
    return stored ? JSON.parse(stored) : defaultSettings
  })
  const [activeTab, setActiveTab] = useState<'wallpaper' | 'theme' | 'about'>('wallpaper')

  useEffect(() => {
    applyWallpaper(settings.wallpaper)
    applyTheme(settings.theme)
  }, [settings.wallpaper, settings.theme])

  const handleWallpaperChange = (id: string) => {
    const newSettings = { ...settings, wallpaper: id }
    setSettings(newSettings)
    applyWallpaper(id)
    localStorage.setItem('webfs-settings', JSON.stringify(newSettings))
  }

  const handleThemeChange = (id: string) => {
    const newSettings = { ...settings, theme: id }
    setSettings(newSettings)
    applyTheme(id)
    localStorage.setItem('webfs-settings', JSON.stringify(newSettings))
  }

  const handleReset = () => {
    setSettings(defaultSettings)
    applyWallpaper('warm')
    applyTheme('default')
    document.documentElement.style.setProperty('--color-accent', '#C49A6C')
    localStorage.removeItem('webfs-settings')
  }

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--color-window-bg)' }}>
      <div style={{ display: 'flex', borderBottom: '1px solid var(--color-window-border)', background: 'var(--color-titlebar)', flexShrink: 0 }}>
        {(['wallpaper', 'theme', 'about'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '10px 20px',
              border: 'none',
              background: 'transparent',
              borderBottom: activeTab === tab ? '2px solid var(--color-accent)' : '2px solid transparent',
              cursor: 'pointer',
              fontSize: 13,
              color: activeTab === tab ? 'var(--color-text)' : 'var(--color-text-secondary)',
              fontWeight: activeTab === tab ? 600 : 400,
            }}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
        {activeTab === 'wallpaper' && (
          <div>
            <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: 'var(--color-text)' }}>Choose a wallpaper</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
              {wallpapers.map(wp => (
                <div
                  key={wp.id}
                  onClick={() => handleWallpaperChange(wp.id)}
                  style={{
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    border: settings.wallpaper === wp.id ? '3px solid var(--color-accent)' : '1px solid var(--color-window-border)',
                    transition: 'all 150ms ease',
                  }}
                >
                  <div style={{ height: 80, background: wp.bg }} />
                  <div style={{ padding: '8px 10px', fontSize: 11, color: 'var(--color-text)', textAlign: 'center', background: 'var(--color-surface)' }}>
                    {wp.name}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'theme' && (
          <div>
            <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: 'var(--color-text)' }}>Accent Color</h3>
            <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
              {themes.map(th => (
                <div
                  key={th.id}
                  onClick={() => handleThemeChange(th.id)}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: th.accent,
                    cursor: 'pointer',
                    border: settings.theme === th.id ? '3px solid var(--color-text)' : '2px solid transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 11,
                    color: '#fff',
                    fontWeight: 600,
                  }}
                  title={th.name}
                >
                  {th.name[0]}
                </div>
              ))}
            </div>
            <p style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>More font size options coming soon.</p>
          </div>
        )}

        {activeTab === 'about' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, alignItems: 'center', padding: '20px 0' }}>
            <MonitorCog size={48} color="var(--color-accent)" />
            <div style={{ fontSize: 20, fontWeight: 600, color: 'var(--color-text)' }}>Web Linux</div>
            <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>Version 1.0.0</div>
            <div style={{ fontSize: 12, color: 'var(--color-text-muted)', textAlign: 'center', maxWidth: 300, lineHeight: 1.6 }}>
              A web-based Linux desktop simulator built with React, TypeScript, and Tailwind CSS.
            </div>
            <button
              onClick={handleReset}
              style={{
                padding: '8px 20px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-btn-close)',
                background: 'transparent',
                color: 'var(--color-btn-close)',
                fontSize: 12,
                cursor: 'pointer',
              }}
            >
              Reset Settings
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
