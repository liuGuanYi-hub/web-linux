import { useState, useEffect } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { useWindowStore } from '@/stores/windowStore'

interface ProcessInfo {
  pid: number
  name: string
  cpu: number
  mem: number
}

function genFakeProcesses(): ProcessInfo[] {
  const names = ['init', 'systemd', 'Xorg', 'gnome-shell', 'firefox', 'code', 'terminal', 'file-manager', 'Settings', 'Clock', 'Calculator', 'bash', 'dbus-daemon', 'pulseaudio', 'NetworkManager']
  return names.map((name, i) => ({
    pid: 1000 + i * 12,
    name,
    cpu: Math.round(Math.random() * 30 * 10) / 10,
    mem: Math.round((Math.random() * 15 + 0.5) * 10) / 10,
  })).sort(() => Math.random() - 0.5)
}

export function TaskManagerApp() {
  const { windows } = useWindowStore()
  const [procs, setProcs] = useState<ProcessInfo[]>(() => genFakeProcesses())
  const [tab, setTab] = useState<'processes' | 'apps'>('processes')
  const [sortBy, setSortBy] = useState<'cpu' | 'mem' | 'name'>('cpu')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  useEffect(() => {
    const interval = setInterval(() => {
      setProcs(procs => procs.map(p => ({
        ...p,
        cpu: Math.max(0, Math.min(100, p.cpu + (Math.random() - 0.5) * 5)),
        mem: Math.max(0.1, Math.min(20, p.mem + (Math.random() - 0.5) * 0.5)),
      })))
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  const sorted = [...procs].sort((a, b) => {
    const cmp = sortBy === 'cpu'
      ? a.cpu - b.cpu
      : sortBy === 'mem'
        ? a.mem - b.mem
        : a.name.localeCompare(b.name)
    return sortDir === 'asc' ? cmp : -cmp
  })

  const totalCpu = procs.reduce((s, p) => s + p.cpu, 0)
  const totalMem = procs.reduce((s, p) => s + p.mem, 0)

  const MemBar = ({ value }: { value: number }) => (
    <div style={{ width: 48, height: 6, background: '#E0DAD0', borderRadius: 3 }}>
      <div style={{ width: `${Math.min(100, value * 5)}%`, height: '100%', background: value > 10 ? '#E85454' : value > 5 ? '#E88040' : '#5AC05A', borderRadius: 3 }} />
    </div>
  )

  const CpuBar = ({ value }: { value: number }) => (
    <div style={{ width: 48, height: 6, background: '#E0DAD0', borderRadius: 3 }}>
      <div style={{ width: `${Math.min(100, value)}%`, height: '100%', background: value > 60 ? '#E85454' : value > 30 ? '#E88040' : '#5AC05A', borderRadius: 3 }} />
    </div>
  )

  const col = (label: string, key: typeof sortBy) => (
    <div
      onClick={() => {
        if (sortBy === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
        else { setSortBy(key); setSortDir('desc') }
      }}
      style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, userSelect: 'none' }}
    >
      {label}
      {sortBy === key && (sortDir === 'asc' ? <ChevronUp size={11} /> : <ChevronDown size={11} />)}
    </div>
  )

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--color-window-bg)', fontFamily: 'var(--font-mono)', fontSize: 12, overflow: 'hidden' }}>
      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--color-window-border)', padding: '0 8px' }}>
        {(['processes', 'apps'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{ padding: '8px 16px', border: 'none', borderBottom: tab === t ? '2px solid var(--color-accent)' : '2px solid transparent', background: 'transparent', cursor: 'pointer', color: tab === t ? 'var(--color-accent)' : 'var(--color-text-secondary)', fontSize: 12, textTransform: 'capitalize' }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Overview */}
      <div style={{ display: 'flex', gap: 24, padding: '10px 16px', borderBottom: '1px solid var(--color-window-border)', background: 'var(--color-surface)' }}>
        <div><span style={{ color: 'var(--color-text-secondary)' }}>CPU:</span> <strong style={{ color: totalCpu > 80 ? '#E85454' : 'var(--color-text)' }}>{totalCpu.toFixed(1)}%</strong></div>
        <div><span style={{ color: 'var(--color-text-secondary)' }}>Memory:</span> <strong style={{ color: totalMem > 60 ? '#E85454' : 'var(--color-text)' }}>{totalMem.toFixed(1)}%</strong></div>
        <div><span style={{ color: 'var(--color-text-secondary)' }}>Processes:</span> <strong style={{ color: 'var(--color-text)' }}>{procs.length}</strong></div>
        <div><span style={{ color: 'var(--color-text-secondary)' }}>Apps:</span> <strong style={{ color: 'var(--color-text)' }}>{windows.length}</strong></div>
      </div>

      {/* Table */}
      <div style={{ flex: 1, overflow: 'auto', padding: '4px 0' }}>
        {tab === 'processes' ? (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
            <thead>
              <tr style={{ color: 'var(--color-text-secondary)', borderBottom: '1px solid var(--color-window-border)' }}>
                <th style={{ textAlign: 'left', padding: '4px 12px' }}>Process Name</th>
                <th style={{ textAlign: 'left', padding: '4px 12px' }}>PID</th>
                <th style={{ textAlign: 'left', padding: '4px 12px' }}>{col('CPU %', 'cpu')}</th>
                <th style={{ textAlign: 'left', padding: '4px 12px' }}>{col('Memory %', 'mem')}</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map(p => (
                <tr key={p.pid} style={{ borderBottom: '1px solid var(--color-window-border)' }}>
                  <td style={{ padding: '5px 12px', color: 'var(--color-text)' }}>{p.name}</td>
                  <td style={{ padding: '5px 12px', color: 'var(--color-text-muted)' }}>{p.pid}</td>
                  <td style={{ padding: '5px 12px' }}><CpuBar value={p.cpu} /><span style={{ fontSize: 10, color: 'var(--color-text-secondary)', marginLeft: 4 }}>{p.cpu.toFixed(1)}</span></td>
                  <td style={{ padding: '5px 12px' }}><MemBar value={p.mem} /><span style={{ fontSize: 10, color: 'var(--color-text-secondary)', marginLeft: 4 }}>{p.mem.toFixed(1)}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
            <thead>
              <tr style={{ color: 'var(--color-text-secondary)', borderBottom: '1px solid var(--color-window-border)' }}>
                <th style={{ textAlign: 'left', padding: '4px 12px' }}>App</th>
                <th style={{ textAlign: 'left', padding: '4px 12px' }}>Windows</th>
              </tr>
            </thead>
            <tbody>
              {windows.reduce((acc, w) => {
                const ex = acc.find(a => a.appId === w.appId)
                if (ex) ex.count++
                else acc.push({ appId: w.appId, count: 1 })
                return acc
              }, [] as { appId: string; count: number }[]).map((a, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--color-window-border)' }}>
                  <td style={{ padding: '5px 12px', color: 'var(--color-text)' }}>{a.appId}</td>
                  <td style={{ padding: '5px 12px', color: 'var(--color-accent)' }}>{a.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
