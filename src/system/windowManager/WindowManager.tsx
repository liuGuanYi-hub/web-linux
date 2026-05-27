import { AppIcon } from '@/system/AppIcon'
import { getApp } from '@/system/AppRegistry'
import { useWindowStore } from '@/stores/windowStore'
import { Window } from './Window'

function AppContent({ appId }: { appId: string }) {
  const app = getApp(appId)

  if (!app) {
    return (
      <div style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--color-surface)',
        color: 'var(--color-text-secondary)',
        fontSize: 14,
      }}>
        App not found: {appId}
      </div>
    )
  }

  if (app.component) {
    const AppComponent = app.component
    return <AppComponent />
  }

  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--color-surface)',
      color: 'var(--color-text-secondary)',
      gap: 8,
    }}>
      <AppIcon icon={app.icon} size={48} color="var(--color-text-muted)" />
      <span>{app.name}</span>
      <span style={{ fontSize: 12, opacity: 0.6 }}>Coming soon...</span>
    </div>
  )
}

export function WindowManager() {
  const windows = useWindowStore(s => s.windows)

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        bottom: 48,
        overflow: 'hidden',
      }}
    >
      {windows.map(win => (
        <Window key={win.id} window={win}>
          <AppContent appId={win.appId} />
        </Window>
      ))}
    </div>
  )
}
