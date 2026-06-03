import { useEffect, useRef, useState } from 'react'
import { Terminal as XTerm } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import { X } from 'lucide-react'
import '@xterm/xterm/css/xterm.css'

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
    term.writeln(args[0] ? '' : '\x1b[31mmkdir: missing operand\x1b[0m')
  },
  touch: (args, term) => {
    term.writeln(args[0] ? '' : '\x1b[31mtouch: missing file operand\x1b[0m')
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
    window.dispatchEvent(new CustomEvent('open-app', { detail: appId }))
  },
}

const welcomeText = [
  '\x1b[33m+------------------------------------------+\x1b[0m',
  '\x1b[33m|\x1b[0m  \x1b[1mWelcome to Web Linux Terminal\x1b[0m        \x1b[33m|\x1b[0m',
  '\x1b[33m|\x1b[0m  Type \x1b[32mhelp\x1b[0m for available commands       \x1b[33m|\x1b[0m',
  '\x1b[33m+------------------------------------------+\x1b[0m',
].join('\r\n')

export function TerminalApp() {
  const termRef = useRef<HTMLDivElement>(null)
  const fitAddonRef = useRef<FitAddon | null>(null)
  const [tabs, setTabs] = useState([{ id: 1 }])
  const [activeTab, setActiveTab] = useState(1)
  const tabCounter = useRef(1)

  useEffect(() => {
    if (!termRef.current) return

    const term = new XTerm({
      theme: {
        background: '#fffefd',
        foreground: '#4A4540',
        cursor: '#C49A6C',
        cursorAccent: '#fffefd',
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
      lineHeight: 1.25,
      cursorBlink: true,
      cursorStyle: 'bar',
    })

    const fitAddon = new FitAddon()
    term.loadAddon(fitAddon)
    term.open(termRef.current)
    fitAddon.fit()
    fitAddonRef.current = fitAddon

    term.writeln(welcomeText)
    term.write('\r\n\x1b[32muser@weblinux\x1b[0m:\x1b[34m~\x1b[0m$ ')

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
          } else {
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
        domEvent.preventDefault()
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

    const handleResize = () => {
      fitAddonRef.current?.fit()
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      term.dispose()
    }
  }, [])

  const addTab = () => {
    tabCounter.current += 1
    setTabs(current => [...current, { id: tabCounter.current }])
    setActiveTab(tabCounter.current)
  }

  const closeTab = (tabId: number) => {
    const next = tabs.filter(tab => tab.id !== tabId)
    setTabs(next)
    if (activeTab === tabId && next.length > 0) {
      setActiveTab(next[0].id)
    }
  }

  return (
    <div className="app-surface terminal-app">
      <div className="app-toolbar">
        {tabs.map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`toolbar-button terminal-tab ${activeTab === tab.id ? 'terminal-tab--active' : ''}`}
          >
            <span>Terminal</span>
            {tabs.length > 1 && (
              <span
                role="button"
                tabIndex={0}
                aria-label="Close tab"
                className="terminal-tab__close"
                onClick={(event) => {
                  event.stopPropagation()
                  closeTab(tab.id)
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    event.stopPropagation()
                    closeTab(tab.id)
                  }
                }}
              >
                <X size={11} />
              </span>
            )}
          </button>
        ))}
        <button type="button" onClick={addTab} className="toolbar-button terminal-add-tab" title="New tab">
          +
        </button>
      </div>

      <div ref={termRef} className="terminal-view" />
    </div>
  )
}
