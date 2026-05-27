import { useState } from 'react'
import { AppIcon } from '@/system/AppIcon'

interface LoginScreenProps {
  onLogin: () => void
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // 简单密码验证（这里可以改成任意密码或从设置读取）
    if (password === 'linux') {
      onLogin()
    } else {
      setError(true)
      setTimeout(() => setError(false), 1000)
    }
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'linear-gradient(180deg, #EDE8DF 0%, #F5F0E8 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{
        background: 'var(--color-surface)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-lg)',
        padding: 32,
        width: 320,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 20,
      }}>
        {/* 头像 */}
        <div style={{
          width: 72,
          height: 72,
          borderRadius: '50%',
          background: 'var(--color-taskbar)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <AppIcon icon="Terminal" size={34} color="var(--color-accent)" />
        </div>

        {/* 用户名 */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-text)' }}>
            user
          </div>
          <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 2 }}>
            Web Linux
          </div>
        </div>

        {/* 密码输入 */}
        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoFocus
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              border: `2px solid ${error ? 'var(--color-btn-close)' : 'var(--color-window-border)'}`,
              background: 'var(--color-bg)',
              fontSize: 14,
              color: 'var(--color-text)',
              outline: 'none',
              textAlign: 'center',
              transition: 'border-color 150ms ease',
            }}
          />
          {error && (
            <div style={{
              fontSize: 12,
              color: 'var(--color-btn-close)',
              textAlign: 'center',
              marginTop: 8,
            }}>
              Incorrect password
            </div>
          )}
        </form>

        {/* 提示 */}
        <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
          Hint: password is "linux"
        </div>
      </div>
    </div>
  )
}
