import { useRef } from 'react'
import { Maximize2, Minus, Square, X } from 'lucide-react'
import { useWindowStore, type WindowState } from '@/stores/windowStore'

interface WindowProps {
  window: WindowState
  children: React.ReactNode
}

type ResizeDir = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw'

export function Window({ window: win, children }: WindowProps) {
  const {
    closeWindow,
    focusWindow,
    minimizeWindow,
    toggleMaximize,
    updatePosition,
    updateSize,
  } = useWindowStore()

  const dragRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null)
  const resizeRef = useRef<{ dir: ResizeDir; startX: number; startY: number; origW: number; origH: number; origX: number; origY: number } | null>(null)
  const isActive = useWindowStore(s => s.activeId === win.id)

  const onTitleBarMouseDown = (e: React.MouseEvent) => {
    if (win.isMaximized) return
    e.preventDefault()
    focusWindow(win.id)
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      origX: win.x,
      origY: win.y,
    }

    const onMouseMove = (e: MouseEvent) => {
      if (!dragRef.current) return
      const dx = e.clientX - dragRef.current.startX
      const dy = e.clientY - dragRef.current.startY
      let newX = dragRef.current.origX + dx
      let newY = dragRef.current.origY + dy
      const screenH = window.innerHeight - 48

      newY = Math.max(0, newY)
      newX = Math.max(0, Math.min(newX, window.innerWidth - 100))

      if (newY <= 5) {
        toggleMaximize(win.id)
        dragRef.current = null
        return
      }

      if (newX <= 5) {
        updatePosition(win.id, 0, newY)
        updateSize(win.id, Math.floor(window.innerWidth / 2), screenH)
        return
      }

      if (newX >= window.innerWidth - 105) {
        updatePosition(win.id, Math.floor(window.innerWidth / 2), newY)
        updateSize(win.id, Math.floor(window.innerWidth / 2), screenH)
        return
      }

      updatePosition(win.id, newX, newY)
    }

    const onMouseUp = () => {
      dragRef.current = null
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  }

  const onResizeMouseDown = (e: React.MouseEvent, dir: ResizeDir) => {
    if (win.isMaximized) return
    e.preventDefault()
    e.stopPropagation()
    focusWindow(win.id)
    resizeRef.current = {
      dir,
      startX: e.clientX,
      startY: e.clientY,
      origW: win.width,
      origH: win.height,
      origX: win.x,
      origY: win.y,
    }

    const onMouseMove = (e: MouseEvent) => {
      if (!resizeRef.current) return
      const dx = e.clientX - resizeRef.current.startX
      const dy = e.clientY - resizeRef.current.startY
      const { dir, origW, origH, origX, origY } = resizeRef.current

      let newW = origW
      let newH = origH
      let newX = origX
      let newY = origY

      if (dir.includes('e')) newW = Math.max(origW + dx, win.minWidth)
      if (dir.includes('w')) {
        const possibleW = origW - dx
        if (possibleW >= win.minWidth) {
          newW = possibleW
          newX = origX + dx
        }
      }
      if (dir.includes('s')) newH = Math.max(origH + dy, win.minHeight)
      if (dir.includes('n')) {
        const possibleH = origH - dy
        if (possibleH >= win.minHeight) {
          newH = possibleH
          newY = origY + dy
        }
      }

      updatePosition(win.id, newX, newY)
      updateSize(win.id, newW, newH)
    }

    const onMouseUp = () => {
      resizeRef.current = null
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  }

  const baseStyle: React.CSSProperties = {
    position: 'absolute',
    left: win.x,
    top: win.y,
    width: win.width,
    height: win.height,
    zIndex: win.zIndex,
    borderRadius: 'var(--radius-window)',
    border: '1px solid var(--color-window-border)',
    boxShadow: win.isMaximized ? 'none' : 'var(--shadow-window)',
    background: 'var(--color-window-bg)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    transition: 'transform 160ms ease-out, opacity 160ms ease-out',
    transform: win.isMinimized ? 'scale(0.8) translateY(100%)' : 'scale(1) translateY(0)',
    opacity: win.isMinimized ? 0 : 1,
    pointerEvents: win.isMinimized ? 'none' : 'auto',
  }

  return (
    <div style={baseStyle} className={`window ${isActive ? 'active' : 'inactive'}`}>
      <div
        className="title-bar"
        style={{
          height: 32,
          background: 'var(--color-titlebar)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 12px',
          cursor: win.isMaximized ? 'default' : 'move',
          flexShrink: 0,
          borderTopLeftRadius: 'var(--radius-window)',
          borderTopRightRadius: 'var(--radius-window)',
        }}
        onMouseDown={onTitleBarMouseDown}
      >
        <span style={{ fontSize: 12, color: 'var(--color-text)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {win.title}
        </span>

        <div style={{ display: 'flex', gap: 8, marginLeft: 12 }} onMouseDown={e => e.stopPropagation()}>
          <button onClick={() => minimizeWindow(win.id)} title="Minimize" style={windowButtonStyle('var(--color-btn-minimize)')}>
            <Minus size={8} color="#fff" />
          </button>
          <button onClick={() => toggleMaximize(win.id)} title={win.isMaximized ? 'Restore' : 'Maximize'} style={windowButtonStyle('var(--color-btn-maximize)')}>
            {win.isMaximized ? <Square size={7} color="#fff" /> : <Maximize2 size={7} color="#fff" />}
          </button>
          <button onClick={() => closeWindow(win.id)} title="Close" style={windowButtonStyle('var(--color-btn-close)')}>
            <X size={8} color="#fff" />
          </button>
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'hidden' }}>
        {children}
      </div>

      {!win.isMaximized && (
        <>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, cursor: 'n-resize' }} onMouseDown={e => onResizeMouseDown(e, 'n')} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 4, cursor: 's-resize' }} onMouseDown={e => onResizeMouseDown(e, 's')} />
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, cursor: 'w-resize' }} onMouseDown={e => onResizeMouseDown(e, 'w')} />
          <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 4, cursor: 'e-resize' }} onMouseDown={e => onResizeMouseDown(e, 'e')} />
          <div style={{ position: 'absolute', top: 0, left: 0, width: 8, height: 8, cursor: 'nw-resize' }} onMouseDown={e => onResizeMouseDown(e, 'nw')} />
          <div style={{ position: 'absolute', top: 0, right: 0, width: 8, height: 8, cursor: 'ne-resize' }} onMouseDown={e => onResizeMouseDown(e, 'ne')} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, width: 8, height: 8, cursor: 'sw-resize' }} onMouseDown={e => onResizeMouseDown(e, 'sw')} />
          <div style={{ position: 'absolute', bottom: 0, right: 0, width: 8, height: 8, cursor: 'se-resize' }} onMouseDown={e => onResizeMouseDown(e, 'se')} />
        </>
      )}
    </div>
  )
}

function windowButtonStyle(background: string): React.CSSProperties {
  return {
    width: 14,
    height: 14,
    borderRadius: '50%',
    border: 'none',
    background,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
  }
}
