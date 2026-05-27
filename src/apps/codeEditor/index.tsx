import { useState, useRef } from 'react'

const LANGUAGES = ['JavaScript', 'TypeScript', 'Python', 'HTML', 'CSS', 'JSON', 'Markdown']

const DEFAULT_CODE: Record<string, string> = {
  JavaScript: `// JavaScript Example
function greet(name) {
  return "Hello, " + name + "!";
}

const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(n => n * 2);
console.log(greet("World"));
console.log("Doubled:", doubled);`,
  TypeScript: `// TypeScript Example
interface User {
  name: string;
  age: number;
}

function greet(user: User): string {
  return "Hello, " + user.name + "!";
}

const user: User = { name: "Alice", age: 25 };
console.log(greet(user));`,
  Python: `# Python Example
def greet(name):
    return "Hello, " + name + "!"

numbers = [1, 2, 3, 4, 5]
doubled = [n * 2 for n in numbers]
print(greet("World"))
print("Doubled:", doubled)`,
  HTML: `<!DOCTYPE html>
<html>
<head>
  <title>My Page</title>
</head>
<body>
  <h1>Hello, World!</h1>
  <p>This is a paragraph.</p>
</body>
</html>`,
  CSS: `/* CSS Example */
.container {
  display: flex;
  gap: 16px;
  padding: 20px;
}

.title {
  font-size: 24px;
  font-weight: bold;
  color: #333;
}`,
  JSON: `{
  "name": "Web Linux",
  "version": "1.0.0",
  "features": [
    "Window Manager",
    "Terminal",
    "File Manager"
  ],
  "settings": {
    "theme": "dark",
    "fontSize": 14
  }
}`,
  Markdown: `# Heading 1

## Heading 2

This is **bold** and *italic* text.

- List item 1
- List item 2

console.log("Hello!");

> A blockquote`,
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function highlight(code: string, lang: string): string {
  let html = escapeHtml(code)

  if (lang === 'HTML') {
    html = html.replace(/(&lt;\/?[\w-]+)/g, '<span style="color:#E85454">$1</span>')
    html = html.replace(/([\w-]+=)/g, '<span style="color:#C49A6C">$1</span>')
    html = html.replace(/(".*?")/g, '<span style="color:#5AC05A">$1</span>')
  } else if (lang === 'CSS') {
    html = html.replace(/([.#][\w-]+)/g, '<span style="color:#E85454">$1</span>')
    html = html.replace(/([\w-]+):/g, '<span style="color:#6B8DD6">$1</span>:')
    html = html.replace(/:\s*(.*?);/g, ': <span style="color:#5AC05A">$1</span>;')
    html = html.replace(/(\/\*[\s\S]*?\*\/)/g, '<span style="color:#7A746C">$1</span>')
  } else if (lang === 'JSON') {
    html = html.replace(/("(?:[^"\\]|\\.)*")\s*:/g, '<span style="color:#6B8DD6">$1</span>:')
    html = html.replace(/:\s*("(?:[^"\\]|\\.)*")/g, ': <span style="color:#5AC05A">$1</span>')
    html = html.replace(/:\s*(\d+(?:\.\d+)?)/g, ': <span style="color:#C49A6C">$1</span>')
    html = html.replace(/:\s*(true|false|null)/g, ': <span style="color:#B06BC4">$1</span>')
  } else {
    // JS/TS/Python
    html = html.replace(/(\/\/.*)/g, '<span style="color:#7A746C">$1</span>')
    html = html.replace(/(#.*)/g, '<span style="color:#7A746C">$1</span>')
    html = html.replace(/("(?:[^"\\]|\\.)*")/g, '<span style="color:#5AC05A">$1</span>')
    html = html.replace(/('(?:[^'\\]|\\.)*')/g, '<span style="color:#5AC05A">$1</span>')
    const kw = '\\b(function|const|let|var|if|else|for|while|return|class|import|export|from|def|interface|type|async|await|try|catch|new|this|true|false|null|undefined|of|in)\\b'
    html = html.replace(new RegExp(kw, 'g'), '<span style="color:#B06BC4">$1</span>')
    html = html.replace(/\b(\d+(?:\.\d+)?)\b/g, '<span style="color:#C49A6C">$1</span>')
  }

  return html
}

function getSavedDocument() {
  const saved = localStorage.getItem('code-editor')
  if (saved) {
    try {
      const parsed = JSON.parse(saved) as { code?: string; lang?: string }
      if (parsed.code && parsed.lang) return { code: parsed.code, lang: parsed.lang }
    } catch { /* ignore invalid saved data */ }
  }
  return { code: DEFAULT_CODE.JavaScript, lang: 'JavaScript' }
}

export function CodeEditorApp() {
  const [{ code: initialCode, lang: initialLang }] = useState(getSavedDocument)
  const [code, setCode] = useState(initialCode)
  const [lang, setLang] = useState(initialLang)
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault()
      const ta = textareaRef.current!
      const start = ta.selectionStart
      const end = ta.selectionEnd
      const newCode = code.substring(0, start) + '  ' + code.substring(end)
      setCode(newCode)
      requestAnimationFrame(() => {
        ta.selectionStart = ta.selectionEnd = start + 2
      })
    }
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault()
      localStorage.setItem('code-editor', JSON.stringify({ code, lang }))
    }
  }

  const handleLangChange = (newLang: string) => {
    setLang(newLang)
    if (DEFAULT_CODE[newLang]) {
      setCode(DEFAULT_CODE[newLang])
    }
  }

  const bg = theme === 'dark' ? '#1e1e1e' : '#fafafa'
  const textColor = theme === 'dark' ? '#d4d4d4' : '#333'
  const lineNumBg = theme === 'dark' ? '#252526' : '#f0f0f0'

  const lines = code.split('\n')

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: bg, color: textColor, fontFamily: 'var(--font-mono)', fontSize: 13 }}>
      {/* 工具栏 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', background: theme === 'dark' ? '#252526' : '#eee', borderBottom: '1px solid ' + (theme === 'dark' ? '#333' : '#ccc'), flexShrink: 0 }}>
        <select
          value={lang}
          onChange={e => handleLangChange(e.target.value)}
          style={{ padding: '4px 8px', borderRadius: 4, border: '1px solid ' + (theme === 'dark' ? '#444' : '#ccc'), background: theme === 'dark' ? '#333' : '#fff', color: textColor, fontSize: 12, cursor: 'pointer' }}
        >
          {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
        </select>

        <button
          onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
          style={{ padding: '4px 10px', borderRadius: 4, border: '1px solid ' + (theme === 'dark' ? '#444' : '#ccc'), background: 'transparent', color: textColor, fontSize: 12, cursor: 'pointer' }}
        >
          {theme === 'dark' ? 'Light' : 'Dark'}
        </button>

        <span style={{ fontSize: 10, color: theme === 'dark' ? '#666' : '#999', marginLeft: 'auto' }}>
          Ctrl+S to save
        </span>
      </div>

      {/* 编辑器 */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* 行号 */}
        <div style={{ width: 44, background: lineNumBg, borderRight: '1px solid ' + (theme === 'dark' ? '#333' : '#ddd'), padding: '12px 8px', textAlign: 'right', fontSize: 12, color: theme === 'dark' ? '#666' : '#999', userSelect: 'none', overflow: 'hidden' }}>
          {lines.map((_, i) => <div key={i} style={{ lineHeight: '1.5' }}>{i + 1}</div>)}
        </div>

        {/* 代码区 */}
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          <div
            style={{
              position: 'absolute', inset: 0,
              padding: 12,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
              lineHeight: '1.5',
              color: textColor,
              pointerEvents: 'none',
              overflow: 'auto',
            }}
            dangerouslySetInnerHTML={{ __html: highlight(code, lang) }}
          />
          <textarea
            ref={textareaRef}
            value={code}
            onChange={e => setCode(e.target.value)}
            onKeyDown={handleKeyDown}
            spellCheck={false}
            style={{
              position: 'absolute', inset: 0,
              padding: 12,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
              lineHeight: '1.5',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              resize: 'none',
              color: 'transparent',
              caretColor: theme === 'dark' ? '#aeafad' : '#333',
              fontFamily: 'inherit',
              fontSize: 'inherit',
              overflow: 'auto',
            }}
          />
        </div>
      </div>

      {/* 状态栏 */}
      <div style={{ padding: '4px 12px', background: theme === 'dark' ? '#252526' : '#eee', borderTop: '1px solid ' + (theme === 'dark' ? '#333' : '#ccc'), fontSize: 10, color: theme === 'dark' ? '#666' : '#999', display: 'flex', justifyContent: 'space-between' }}>
        <span>{lang}</span>
        <span>{lines.length} lines</span>
      </div>
    </div>
  )
}
