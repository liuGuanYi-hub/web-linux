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
        className="start-menu__scrim"
        onClick={onClose}
      />

      <div className="start-menu">
        <div className="start-menu__header">
          <div className="start-menu__search">
            <Search size={16} color="var(--color-text-secondary)" />
            <input
              type="text"
              placeholder="Search apps..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              autoFocus
            />
          </div>
        </div>

        <div className="start-menu__list">
          {filtered.map(app => (
            <button
              type="button"
              key={app.id}
              onClick={() => {
                openApp(app.id)
                setSearch('')
                onClose()
              }}
              className="start-menu__item"
            >
              <span className="start-menu__icon">
                <AppIcon icon={app.icon} size={17} />
              </span>
              <span className="start-menu__item-label">
                {app.name}
              </span>
            </button>
          ))}
        </div>

        <div className="start-menu__footer">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="shell-button"
          >
            <Power size={14} />
            Restart
          </button>
        </div>
      </div>
    </>
  )
}
