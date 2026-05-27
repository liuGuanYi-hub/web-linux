import { useEffect } from 'react'
import { useWindowStore } from '@/stores/windowStore'
import { openApp } from '@/system/openApp'

export function useKeyboardShortcuts() {
  const { windows, activeId, closeWindow, focusWindow } = useWindowStore()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase()

      // Alt+Tab - 切换窗口
      if (e.altKey && key === 'tab') {
        e.preventDefault()
        const visibleWindows = windows.filter(w => !w.isMinimized)
        if (visibleWindows.length < 2) return
        const currentIndex = visibleWindows.findIndex(w => w.id === activeId)
        const nextIndex = (currentIndex + 1) % visibleWindows.length
        focusWindow(visibleWindows[nextIndex].id)
        return
      }

      // Ctrl+W / Alt+F4 - 关闭窗口
      if ((e.ctrlKey && key === 'w') || (e.altKey && key === 'f4')) {
        if (activeId) {
          e.preventDefault()
          closeWindow(activeId)
        }
        return
      }

      // Ctrl+Q - 退出当前 app
      if (e.ctrlKey && key === 'q') {
        if (activeId) {
          e.preventDefault()
          closeWindow(activeId)
        }
        return
      }

      // Win+R - 打开运行对话框
      if (e.altKey && key === 'r') {
        e.preventDefault()
        openApp('runDialog')
        return
      }

      // Alt+Space - 打开搜索
      if (e.altKey && key === ' ') {
        e.preventDefault()
        openApp('search')
        return
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [windows, activeId, closeWindow, focusWindow])
}