import { useState, useEffect } from 'react'
import { BootScreen } from './BootScreen'
import { LoginScreen } from './LoginScreen'
import { Desktop } from '../desktop/Desktop'
import { WindowManager } from '../windowManager/WindowManager'
import { Taskbar } from '../taskbar/Taskbar'
import { useKeyboardShortcuts } from '../keyboard/useKeyboardShortcuts'
import { openApp } from '@/system/openApp'

type Phase = 'boot' | 'login' | 'desktop'

export function AppShell() {
  const [phase, setPhase] = useState<Phase>('boot')

  // 启用快捷键
  useKeyboardShortcuts()

  // 监听 open-app 事件（从终端输入 open 命令）
  useEffect(() => {
    const handler = (e: CustomEvent<string>) => {
      openApp(e.detail)
    }
    window.addEventListener('open-app', handler as EventListener)
    return () => window.removeEventListener('open-app', handler as EventListener)
  }, [])

  if (phase === 'boot') {
    return <BootScreen onFinish={() => setPhase('login')} />
  }

  if (phase === 'login') {
    return (
      <LoginScreen
        onLogin={() => setPhase('desktop')}
      />
    )
  }

  return (
    <>
      <Desktop />
      <WindowManager />
      <Taskbar />
    </>
  )
}