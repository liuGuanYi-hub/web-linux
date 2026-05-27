import { useEffect, useRef, useState } from 'react'
import { Terminal as XTerm } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import { X } from 'lucide-react'
import '@xterm/xterm/css/xterm.css'

// 虚拟 FS 命令
const commands: Record<string, (args: string[], term: XTerm) => void> = {
  ls: (_args, term) => {
    const dirs = ['documents', 'pictures', 'music', 'videos', 'downloads', '.config']
    term.writeln('\x1b[33mdrwxr-xr-x\x1b[0m  \x1b[34m.\x1b[0m                  ..')
    dirs.forEach(d => term.writeln('\x1b[33mdrwxr-xr-x\x1b[0m  \x1b[34m' + d.padEnd(20) + '\x1b[0m'))
    term.writeln('\x1b[33m-rw-r--r--\x1b[0m  \x1b[34mreadme.txt\x1b[0m')
  },
  pwd: (_args, term) => {
    term.writeln('/home/user')
  },
  cd: (args, term) => {
    if (!args[0] || args[0] === '~' || args[0] === '/home/user') {
      term.writeln('')
    } else {
      term.writeln(`\x1b[31mbash: cd: ${args[0]}: No such file or directory\x1b[0m`)
    }
  },
  mkdir: (args, term) => {
    if (!args[0]) {
      term.writeln('\x1b[31mmkdir: missing operand\x1b[0m')
    } else {
      term.writeln('')
    }
  },
  touch: (args, term) => {
    if (!args[0]) {
      term.writeln('\x1b[31mtouch: missing file operand\x1b[0m')
    } else {
      term.writeln('')
    }
  },
  cat: (args, term) => {
    if (!args[0]) {
      term.writeln('\x1b[31mcat: missing operand\x1b[0m')
    } else if (args[0] === 'readme.txt') {
      term.writeln('Welcome to Web Linux!')
      term.writeln('This is a simulated terminal environment.')
      term.writeln('')
      term.writeln('Available commands: ls, pwd, cd, mkdir, touch, cat, clear, help, open')
      term.writeln('')
      term.writeln('Try typing \x1b[32mopen fileManager\x1b[0m to open the file manager.')
    } else {
      term.writeln(`\x1b[31mcat: ${args[0]}: No such file\x1b[0m`)
    }
  },
  clear: (_args, term) => {
    term.clear()
  },
  help: (_args, term) => {
    term.writeln('\x1b[1mAvailable commands:\x1b[0m')
    term.writeln('  \x1b[32mls\x1b[0m          List directory contents')
    term.writeln('  \x1b[32mpwd\x1b[0m         Print working directory')
    term.writeln('  \x1b[32mcd\x1b[0m [dir]     Change directory')
    term.writeln('  \x1b[32mmkdir\x1b[0m [name]  Make directory')
    term.writeln('  \x1b[32mtouch\x1b[0m [name]  Create file')
    term.writeln('  \x1b[32mcat\x1b[0m [file]   Display file contents')
    term.writeln('  \x1b[32mclear\x1b[0m        Clear terminal')
    term.writeln('  \x1b[32mhelp\x1b[0m         Show this help')
    term.writeln('  \x1b[32mopen\x1b[0m [app]   Open an application')
    term.writeln('')
    term.writeln('\x1b[1mAvailable apps:\x1b[0m')
    term.writeln('  \x1b[33mfileManager\x1b[0m  \x1b[33mtextEditor\x1b[0m  \x1b[33mcalculator\x1b[0m  \x1b[33mcalendar\x1b[0m')
    term.writeln('  \x1b[33mclock\x1b[0m  \x1b[33mstickyNotes\x1b[0m  \x1b[33msettings\x1b[0m')
  },
  open: (args, term) => {
    if (!args[0]) {
      term.writeln('\x1b[31mopen: missing app name\x1b[0m')
      term.writeln('Try: open fileManager')
      return
    }
    const appId = args[0]
    term.writeln(`\x1b[32mOpening ${appId}...\x1b[0m`)
    // 调用 openApp 打开 app
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('open-app', { detail: appId }))
    }, 100)
  },
}

const welcomeText = `\x1b[33m╔══════════════════════════════════════════╗\x1b[0m
\x1b[33m║\x1b[0m  \x1b[1mWelcome to Web Linux Terminal\x1b[[0m          \x1b[33m║\x1b[0m
\x1b[33m║\x1b[0m  Type \x1b[32mhelp\x1b[0m for available commands      \x1b[33m║\x1b[0m
\x1b[33m╚══════════════════════════════════════════╝\x1b[0m
`

export function TerminalApp() {
  const termRef = useRef<HTMLDivElement>(null)
  const xtermRef = useRef<XTerm | null>(null)
  const fitAddonRef = useRef<FitAddon | null>(null)
  const [tabs, setTabs] = useState([{ id: 1 }])
  const [activeTab, setActiveTab] = useState(1)
  const tabCounter = useRef(1)

  useEffect(() => {
    if (!termRef.current) return

    const term = new XTerm({
      theme: {
        background: '#FEFEFE',
        foreground: '#4A4540',
        cursor: '#C49A6C',
        cursorAccent: '#FEFEFE',
        selectionBackground: '#C49A6C40',
        black: '#4A4540',
        brightBlack: '#7A746C',
        red: '#E85454',
        brightRed: '#FF6B6B',
        green: '#5AC05A',
        brightGreen: '#7ED67D',
        yellow: '#C49A6C',
        brightYellow: '#D4A87A',
        blue: '#6B8DD6',
        brightBlue: '#8BA8E8',
        magenta: '#B06BC4',
        brightMagenta: '#C88AD8',
        cyan: '#5ABCB8',
        brightCyan: '#7DD4D0',
        white: '#4A4540',
        brightWhite: '#6A6460',
      },
      fontFamily: '"Cascadia Code", "Fira Code", monospace',
      fontSize: 13,
      lineHeight: 1.2,
      cursorBlink: true,
      cursorStyle: 'bar',
    })

    const fitAddon = new FitAddon()
    term.loadAddon(fitAddon)
    term.open(termRef.current)
    fitAddon.fit()

    xtermRef.current = term
    fitAddonRef.current = fitAddon

    // 初始欢迎信息
    term.writeln(welcomeText)
    term.write('\r\n\x1b[32muser@weblinux\x1b[0m:\x1b[34m~\x1b[0m$ ')

    // 命令处理
    let currentLine = ''

    term.onKey(({ key, domEvent }) => {
      const printable = !domEvent.altKey && !domEvent.ctrlKey && !domEvent.metaKey

      if (domEvent.key === 'Enter') {
        const cmd = currentLine.trim()
        term.writeln('')

        if (cmd) {
          const parts = cmd.split(' ')
          const command = parts[0]
          const args = parts.slice(1)

          if (commands[command]) {
            commands[command](args, term)
          } else if (command) {
            term.writeln(`\x1b[31mbash: ${command}: command not found\x1b[0m`)
          }
        }

        term.write('\r\n\x1b[32muser@weblinux\x1b[0m:\x1b[34m~\x1b[0m$ ')
        currentLine = ''
      } else if (domEvent.key === 'Backspace') {
        if (currentLine.length > 0) {
          currentLine = currentLine.slice(0, -1)
          term.write('\b \b')
        }
      } else if (domEvent.key === 'Tab') {
        // 自动补全
        const completions = Object.keys(commands)
        const matches = completions.filter(c => c.startsWith(currentLine))
        if (matches.length === 1) {
          const completion = matches[0].slice(currentLine.length)
          currentLine += completion
          term.write(completion)
        }
      } else if (printable) {
        currentLine += key
        term.write(key)
      }
    })

    term.onData(() => {
      // 处理一些特殊情况
    })

    // 监听 resize
    const handleResize = () => {
      if (fitAddonRef.current) {
        fitAddonRef.current.fit()
      }
    }

    window.addEventListener('resize', handleResize)

    // 监听 open-app 事件（从终端输入 open 命令）
    const handleOpenApp = (e: CustomEvent<string>) => {
      term.writeln(`Opening ${e.detail}...`)
    }
    window.addEventListener('open-app', handleOpenApp as EventListener)

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('open-app', handleOpenApp as EventListener)
      term.dispose()
    }
  }, [])

  // 添加新标签页
  const addTab = () => {
    tabCounter.current++
    setTabs([...tabs, { id: tabCounter.current }])
    setActiveTab(tabCounter.current)
  }

  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--color-window-bg)',
    }}>
      {/* Tab bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        background: 'var(--color-titlebar)',
        borderBottom: '1px solid var(--color-window-border)',
        padding: '4px 8px',
        gap: 4,
        flexShrink: 0,
      }}>
        {tabs.map(tab => (
          <div
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '4px 12px',
              borderRadius: 'var(--radius-sm)',
              background: activeTab === tab.id ? 'var(--color-surface)' : 'transparent',
              cursor: 'pointer',
              fontSize: 12,
              color: 'var(--color-text)',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <span>Terminal</span>
            {tabs.length > 1 && (
              <span
                onClick={(e) => {
                  e.stopPropagation()
                  setTabs(tabs.filter(t => t.id !== tab.id))
                  if (activeTab === tab.id && tabs.length > 1) {
                    setActiveTab(tabs[0].id)
                  }
                }}
                style={{ opacity: 0.6, fontSize: 10 }}
              >
                <X size={11} />
              </span>
            )}
          </div>
        ))}
        <button
          onClick={addTab}
          style={{
            padding: '4px 8px',
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            fontSize: 14,
            color: 'var(--color-text-secondary)',
          }}
        >
          +
        </button>
      </div>

      {/* Terminal */}
      <div
        ref={termRef}
        style={{
          flex: 1,
          padding: 8,
          overflow: 'hidden',
        }}
      />
    </div>
  )
}
