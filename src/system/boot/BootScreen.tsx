import { useState, useEffect } from 'react'
import { AppIcon } from '@/system/AppIcon'

interface BootScreenProps {
  onFinish: () => void
}

export function BootScreen({ onFinish }: BootScreenProps) {
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState('Initializing system...')

  useEffect(() => {
    const stages = [
      { target: 20, msg: 'Loading kernel...', delay: 200 },
      { target: 40, msg: 'Mounting filesystems...', delay: 300 },
      { target: 60, msg: 'Starting services...', delay: 300 },
      { target: 80, msg: 'Loading desktop environment...', delay: 400 },
      { target: 100, msg: 'Ready', delay: 200 },
    ]

    let current = 0
    const advance = () => {
      if (current >= stages.length) return
      setProgress(stages[current].target)
      setStatus(stages[current].msg)
      current++
      if (current < stages.length) {
        setTimeout(advance, stages[current - 1].delay)
      } else {
        setTimeout(onFinish, 300)
      }
    }

    const t = setTimeout(advance, 300)
    return () => clearTimeout(t)
  }, [onFinish])

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: '#F5F0E8',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'var(--font-sans)',
    }}>
      {/* Logo */}
      <div style={{
        marginBottom: 32,
        opacity: progress > 10 ? 1 : 0,
        transition: 'opacity 300ms ease',
      }}>
        <AppIcon icon="Terminal" size={48} color="var(--color-accent)" />
      </div>

      {/* 进度条 */}
      <div style={{
        width: 280,
        height: 6,
        background: 'var(--color-taskbar-border)',
        borderRadius: 3,
        overflow: 'hidden',
        marginBottom: 16,
      }}>
        <div style={{
          height: '100%',
          width: `${progress}%`,
          background: 'var(--color-accent)',
          borderRadius: 3,
          transition: 'width 300ms ease',
        }} />
      </div>

      {/* 状态文字 */}
      <div style={{
        fontSize: 12,
        color: 'var(--color-text-secondary)',
        letterSpacing: 0.5,
      }}>
        {status}
      </div>
    </div>
  )
}
