import { useEffect, useState } from 'react'
import { openApp } from '@/system/openApp'
import { BootScreen } from './BootScreen'
import { LoginScreen } from './LoginScreen'
import { Desktop } from '../desktop/Desktop'
import { WindowManager } from '../windowManager/WindowManager'
import { Taskbar } from '../taskbar/Taskbar'
import { useKeyboardShortcuts } from '../keyboard/useKeyboardShortcuts'

type Phase = 'boot' | 'login' | 'desktop'

export function AppShell() {
  const [phase, setPhase] = useState<Phase>('boot')

  useKeyboardShortcuts()

  useEffect(() => {
    const handler = (event: CustomEvent<string>) => {
      openApp(event.detail)
    }
    window.addEventListener('open-app', handler as EventListener)
    return () => window.removeEventListener('open-app', handler as EventListener)
  }, [])

  if (phase === 'boot') {
    return <BootScreen onFinish={() => setPhase('login')} />
  }

  if (phase === 'login') {
    return <LoginScreen onLogin={() => setPhase('desktop')} />
  }

  return (
    <>
      <Desktop />
      <WindowManager />
      <Taskbar />
    </>
  )
}
