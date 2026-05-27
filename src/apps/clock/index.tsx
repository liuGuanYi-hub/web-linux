import { useState, useEffect, useRef } from 'react'
import { BellRing, TimerReset, X } from 'lucide-react'

type Tab = 'clock' | 'alarm' | 'stopwatch' | 'timer'

export function ClockApp() {
  const [activeTab, setActiveTab] = useState<Tab>('clock')

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--color-window-bg)' }}>
      {/* Tab 导航 */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--color-window-border)', background: 'var(--color-titlebar)', flexShrink: 0 }}>
        {([
          { id: 'clock' as const, label: 'Clock' },
          { id: 'alarm' as const, label: 'Alarm' },
          { id: 'stopwatch' as const, label: 'Stopwatch' },
          { id: 'timer' as const, label: 'Timer' },
        ]).map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1,
              padding: '10px 0',
              border: 'none',
              background: 'transparent',
              borderBottom: activeTab === tab.id ? '2px solid var(--color-accent)' : '2px solid transparent',
              cursor: 'pointer',
              fontSize: 12,
              color: activeTab === tab.id ? 'var(--color-text)' : 'var(--color-text-secondary)',
              fontWeight: activeTab === tab.id ? 600 : 400,
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 内容 */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        {activeTab === 'clock' && <ClockTab />}
        {activeTab === 'alarm' && <AlarmTab />}
        {activeTab === 'stopwatch' && <StopwatchTab />}
        {activeTab === 'timer' && <TimerTab />}
      </div>
    </div>
  )
}

// 时钟 Tab
function ClockTab() {
  const [time, setTime] = useState(new Date())
  const [showDate, setShowDate] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  const hours = time.getHours()
  const minutes = time.getMinutes()
  const seconds = time.getSeconds()
  const ampm = hours >= 12 ? 'PM' : 'AM'
  const displayHours = hours % 12 || 12

  const formatTime = (n: number) => n.toString().padStart(2, '0')

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, cursor: 'pointer' }} onClick={() => setShowDate(!showDate)}>
      {/* 时间 */}
      <div style={{ fontSize: 72, fontWeight: 200, fontFamily: 'var(--font-mono)', color: 'var(--color-text)', letterSpacing: -2 }}>
        <span>{formatTime(displayHours)}</span>
        <span style={{ opacity: seconds % 2 === 0 ? 1 : 0 }}>:</span>
        <span>{formatTime(minutes)}</span>
        <span style={{ opacity: seconds % 2 === 0 ? 1 : 0 }}>:</span>
        <span style={{ fontSize: 36, verticalAlign: 'super', marginLeft: 4 }}>{formatTime(seconds)}</span>
      </div>

      {/* AM/PM */}
      <div style={{ fontSize: 16, color: 'var(--color-text-secondary)', letterSpacing: 4 }}>
        {ampm}
      </div>

      {/* 日期 */}
      {showDate && (
        <div style={{ fontSize: 18, color: 'var(--color-text-secondary)', marginTop: 8 }}>
          {time.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      )}

      <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 8 }}>
        Click to {showDate ? 'hide' : 'show'} date
      </div>
    </div>
  )
}

// 闹钟 Tab
function AlarmTab() {
  const [alarms, setAlarms] = useState<Array<{ id: string; time: string; enabled: boolean; label: string }>>([
    { id: '1', time: '07:00', enabled: true, label: 'Wake up' },
  ])
  const [newHour, setNewHour] = useState('07')
  const [newMin, setNewMin] = useState('00')
  const [newLabel, setNewLabel] = useState('')
  const [playing, setPlaying] = useState<string | null>(null)

  const addAlarm = () => {
    const time = `${newHour}:${newMin}`
    if (alarms.find(a => a.time === time)) return
    setAlarms([...alarms, { id: Date.now().toString(), time, enabled: true, label: newLabel || 'Alarm' }])
    setNewLabel('')
  }

  const toggleAlarm = (id: string) => {
    setAlarms(alarms.map(a => a.id === id ? { ...a, enabled: !a.enabled } : a))
  }

  const deleteAlarm = (id: string) => {
    setAlarms(alarms.filter(a => a.id !== id))
  }

  const now = new Date()
  const currentTimeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`

  // 检查是否触发闹钟
  useEffect(() => {
    const interval = setInterval(() => {
      const t = new Date()
      const current = `${t.getHours().toString().padStart(2, '0')}:${t.getMinutes().toString().padStart(2, '0')}`
      alarms.forEach(alarm => {
        if (alarm.enabled && alarm.time === current && playing !== alarm.id) {
          setPlaying(alarm.id)
          // 3秒后自动停止（模拟）
          setTimeout(() => setPlaying(null), 3000)
        }
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [alarms, playing])

  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* 已有的闹钟 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {alarms.map(alarm => (
          <div key={alarm.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: alarm.time === currentTimeStr && alarm.enabled ? 'var(--color-accent)' : 'var(--color-surface)', borderRadius: 'var(--radius-md)', opacity: alarm.enabled ? 1 : 0.5 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 24, fontFamily: 'var(--font-mono)', color: alarm.time === currentTimeStr && alarm.enabled ? '#fff' : 'var(--color-text)' }}>{alarm.time}</div>
              <div style={{ fontSize: 11, color: alarm.time === currentTimeStr && alarm.enabled ? 'rgba(255,255,255,0.7)' : 'var(--color-text-secondary)' }}>{alarm.label}</div>
            </div>
            <button onClick={() => toggleAlarm(alarm.id)} style={{ padding: '4px 12px', borderRadius: 'var(--radius-sm)', border: 'none', background: alarm.enabled ? 'var(--color-accent)' : 'var(--color-window-border)', color: '#fff', fontSize: 11, cursor: 'pointer' }}>
              {alarm.enabled ? 'ON' : 'OFF'}
            </button>
            <button onClick={() => deleteAlarm(alarm.id)} title="Delete alarm" style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 16, color: 'var(--color-text-muted)' }}><X size={15} /></button>
          </div>
        ))}
      </div>

      {/* 新增闹钟 */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '12px 14px', background: 'var(--color-titlebar)', borderRadius: 'var(--radius-md)' }}>
        <input
          type="number"
          value={newHour}
          onChange={e => setNewHour(e.target.value.slice(0, 2))}
          min={0} max={23}
          style={timeInputStyle}
        />
        <span style={{ fontSize: 20 }}>:</span>
        <input
          type="number"
          value={newMin}
          onChange={e => setNewMin(e.target.value.slice(0, 2))}
          min={0} max={59}
          style={timeInputStyle}
        />
        <input
          type="text"
          value={newLabel}
          onChange={e => setNewLabel(e.target.value)}
          placeholder="Label"
          style={{ ...timeInputStyle, flex: 1, fontSize: 12 }}
        />
        <button onClick={addAlarm} style={{ padding: '6px 14px', borderRadius: 'var(--radius-sm)', border: 'none', background: 'var(--color-accent)', color: '#fff', fontSize: 12, cursor: 'pointer' }}>Add</button>
      </div>

      {/* 播放提示 */}
      {playing && (
        <div style={{ padding: 16, background: 'var(--color-btn-close)', borderRadius: 'var(--radius-md)', color: '#fff', fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <BellRing size={17} /> Alarm ringing
        </div>
      )}
    </div>
  )
}

const timeInputStyle: React.CSSProperties = {
  width: 50,
  padding: '4px 6px',
  borderRadius: 'var(--radius-sm)',
  border: '1px solid var(--color-window-border)',
  background: 'var(--color-surface)',
  fontSize: 16,
  fontFamily: 'var(--font-mono)',
  textAlign: 'center',
  outline: 'none',
}

// 秒表 Tab
function StopwatchTab() {
  const [time, setTime] = useState(0) // 毫秒
  const [running, setRunning] = useState(false)
  const [laps, setLaps] = useState<number[]>([])
  const intervalRef = useRef<number | null>(null)
  const startedAtRef = useRef(0)

  useEffect(() => {
    if (running) {
      intervalRef.current = window.setInterval(() => setTime(Date.now() - startedAtRef.current), 10)
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [running])

  const start = () => {
    startedAtRef.current = Date.now() - time
    setRunning(true)
  }
  const stop = () => setRunning(false)
  const reset = () => { setRunning(false); setTime(0); setLaps([]) }
  const lap = () => { if (running) setLaps([...laps, time]) }

  const formatMs = (ms: number) => {
    const mins = Math.floor(ms / 60000)
    const secs = Math.floor((ms % 60000) / 1000)
    const cs = Math.floor((ms % 1000) / 10)
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${cs.toString().padStart(2, '0')}`
  }

  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* 时间显示 */}
      <div style={{ fontSize: 56, fontFamily: 'var(--font-mono)', textAlign: 'center', padding: '24px 0', color: 'var(--color-text)' }}>
        {formatMs(time)}
      </div>

      {/* 控制按钮 */}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 16 }}>
        {running ? (
          <button onClick={lap} style={{ ...btnStyle, background: 'var(--color-window-border)', color: 'var(--color-text)' }}>Lap</button>
        ) : (
          <button onClick={start} style={{ ...btnStyle, background: 'var(--color-btn-maximize)', color: '#fff' }}>Start</button>
        )}
        <button onClick={stop} disabled={!running} style={{ ...btnStyle, background: running ? 'var(--color-btn-close)' : 'var(--color-window-border)', color: '#fff', opacity: running ? 1 : 0.5 }}>Stop</button>
        <button onClick={reset} style={{ ...btnStyle, background: 'var(--color-titlebar)', color: 'var(--color-text)', border: '1px solid var(--color-window-border)' }}>Reset</button>
      </div>

      {/* 圈数 */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {laps.map((lapTime, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 16px', borderBottom: '1px solid var(--color-window-border)', fontSize: 13 }}>
            <span style={{ color: 'var(--color-text-secondary)' }}>Lap {i + 1}</span>
            <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text)' }}>{formatMs(lapTime)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

const btnStyle: React.CSSProperties = {
  padding: '10px 24px',
  borderRadius: 'var(--radius-md)',
  border: 'none',
  fontSize: 14,
  cursor: 'pointer',
  fontWeight: 600,
}

// 计时器 Tab
function TimerTab() {
  const [totalSeconds, setTotalSeconds] = useState(5 * 60) // 默认5分钟
  const [remaining, setRemaining] = useState(5 * 60)
  const [running, setRunning] = useState(false)
  const intervalRef = useRef<number | null>(null)

  useEffect(() => {
    if (running && remaining > 0) {
      intervalRef.current = window.setInterval(() => {
        setRemaining(r => {
          if (r <= 1) {
            setRunning(false)
            return 0
          }
          return r - 1
        })
      }, 1000)
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [running, remaining])

  const start = () => setRunning(true)
  const pause = () => setRunning(false)
  const reset = () => { setRunning(false); setRemaining(totalSeconds) }
  const setTime = (seconds: number) => { setTotalSeconds(seconds); setRemaining(seconds); setRunning(false) }

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`
  }

  const presets = [1 * 60, 3 * 60, 5 * 60, 10 * 60, 15 * 60, 30 * 60]
  const progress = totalSeconds > 0 ? (totalSeconds - remaining) / totalSeconds : 0

  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', height: '100%', gap: 16 }}>
      {/* 圆形进度 */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
        <svg width="160" height="160" viewBox="0 0 160 160">
          <circle cx="80" cy="80" r="70" fill="none" stroke="var(--color-window-border)" strokeWidth="8" />
          <circle
            cx="80" cy="80" r="70" fill="none"
            stroke={remaining === 0 ? 'var(--color-btn-close)' : 'var(--color-accent)'}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 70}`}
            strokeDashoffset={`${2 * Math.PI * 70 * (1 - progress)}`}
            transform="rotate(-90 80 80)"
            style={{ transition: 'stroke-dashoffset 1s linear' }}
          />
        </svg>
        <div style={{ position: 'absolute', fontSize: 36, fontFamily: 'var(--font-mono)', fontWeight: 600, color: remaining === 0 ? 'var(--color-btn-close)' : 'var(--color-text)' }}>
          {formatTime(remaining)}
        </div>
      </div>

      {/* 预设按钮 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
        {presets.map(sec => (
          <button
            key={sec}
            onClick={() => setTime(sec)}
            style={{
              padding: '6px 0',
              borderRadius: 'var(--radius-sm)',
              border: totalSeconds === sec ? '2px solid var(--color-accent)' : '1px solid var(--color-window-border)',
              background: totalSeconds === sec ? 'var(--color-accent)' : 'var(--color-surface)',
              color: totalSeconds === sec ? '#fff' : 'var(--color-text)',
              fontSize: 11,
              cursor: 'pointer',
            }}
          >
            {sec >= 60 ? `${sec / 60} min` : `${sec} sec`}
          </button>
        ))}
      </div>

      {/* 控制按钮 */}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
        {remaining === 0 ? (
          <button onClick={reset} style={{ ...btnStyle, background: 'var(--color-btn-close)', color: '#fff' }}>Reset</button>
        ) : running ? (
          <button onClick={pause} style={{ ...btnStyle, background: 'var(--color-btn-minimize)', color: '#fff' }}>Pause</button>
        ) : (
          <button onClick={start} style={{ ...btnStyle, background: 'var(--color-btn-maximize)', color: '#fff' }}>Start</button>
        )}
        <button onClick={reset} style={{ ...btnStyle, background: 'var(--color-titlebar)', color: 'var(--color-text)', border: '1px solid var(--color-window-border)' }}>Reset</button>
      </div>

      {remaining === 0 && (
        <div style={{ color: 'var(--color-btn-close)', fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <TimerReset size={17} /> Time is up
        </div>
      )}
    </div>
  )
}
