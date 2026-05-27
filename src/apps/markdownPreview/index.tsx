import { useState } from 'react'

function parseMarkdown(md: string): string {
  const html = md
    // Code blocks
    .replace(/```(\w*)\n([\s\S]*?)```/g, (_, _lang, code) => `<pre style="background:#1e1e1e;padding:12px;border-radius:6px;overflow:auto"><code>${escapeHtml(code.trim())}</code></pre>`)
    // Inline code
    .replace(/`([^`]+)`/g, '<code style="background:#E0DAD0;padding:1px5px;border-radius:3px;font-size:0.9em">$1</code>')
    // Headers
    .replace(/^#### (.+)$/gm, '<h4 style="font-size:16px;font-weight:600;color:var(--color-text);margin:12px 0 4px">$1</h4>')
    .replace(/^### (.+)$/gm, '<h3 style="font-size:18px;font-weight:600;color:var(--color-text);margin:14px 0 6px">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 style="font-size:20px;font-weight:700;color:var(--color-text);margin:16px 0 8px;border-bottom:1px solid var(--color-window-border);padding-bottom:6px">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 style="font-size:24px;font-weight:700;color:var(--color-text);margin:18px 0 10px">$1</h1>')
    // Bold & italic
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Strikethrough
    .replace(/~~(.+?)~~/g, '<del>$1</del>')
    // Blockquote
    .replace(/^> (.+)$/gm, '<blockquote style="border-left:3px solid var(--color-accent);margin:8px 0;padding:4px 12px;color:var(--color-text-secondary);font-style:italic">$1</blockquote>')
    // Unordered list
    .replace(/^- (.+)$/gm, '<li style="margin:2px 0 2px 16px">$1</li>')
    // Ordered list
    .replace(/^\d+\. (.+)$/gm, '<li style="margin:2px 0 2px 16px;list-style:decimal">$1</li>')
    // Horizontal rule
    .replace(/^---$/gm, '<hr style="border:none;border-top:1px solid var(--color-window-border);margin:16px 0"/>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" style="color:var(--color-accent)">$1</a>')
    // Images
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width:100%;border-radius:6px" />')
    // Paragraphs
    .replace(/\n\n/g, '</p><p style="margin:8px 0">')
    return '<p style="margin:8px 0">' + html + '</p>'
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

const SAMPLE = `# Welcome to Web Linux Markdown Preview

## Features
- **Bold** and *italic* text
- ~~Strikethrough~~
- Inline \`code\` and code blocks:

\`\`\`javascript
console.log("Hello from Web Linux!");
\`\`\`

## Blockquotes
> This is a blockquote.
> It can span multiple lines.

## Lists
- Item one
- Item two
- Item three

## Links & Images
[Visit Example](https://example.com)

---

Try editing the left pane!`

export function MarkdownPreviewApp() {
  const [md, setMd] = useState(SAMPLE)
  const [view, setView] = useState<'split' | 'preview'>('split')

  const html = parseMarkdown(md)

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--color-window-bg)', fontFamily: 'var(--font-mono)', fontSize: 12, overflow: 'hidden' }}>
      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 8, padding: '6px 12px', borderBottom: '1px solid var(--color-window-border)', background: 'var(--color-surface)', alignItems: 'center' }}>
        <button onClick={() => setMd('')} style={{ padding: '5px 14px', borderRadius: 6, border: '1px solid var(--color-window-border)', background: 'var(--color-surface)', color: 'var(--color-text)', cursor: 'pointer', fontSize: 11 }}>Clear</button>
        <div style={{ display: 'flex', gap: 0 }}>
          {(['split', 'preview'] as const).map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              style={{ padding: '5px 12px', border: 'none', borderBottom: view === v ? '2px solid var(--color-accent)' : '2px solid transparent', background: 'transparent', cursor: 'pointer', color: view === v ? 'var(--color-accent)' : 'var(--color-text-secondary)', fontSize: 11, textTransform: 'capitalize' }}
            >
              {v}
            </button>
          ))}
        </div>
        <span style={{ fontSize: 10, color: 'var(--color-text-muted)', marginLeft: 'auto' }}>{md.split('\n').length} lines</span>
      </div>

      {/* Editor + Preview */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {view !== 'preview' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', borderRight: view === 'split' ? '1px solid var(--color-window-border)' : 'none' }}>
            <div style={{ padding: '4px 12px', color: 'var(--color-text-secondary)', background: 'var(--color-surface)', borderBottom: '1px solid var(--color-window-border)', fontSize: 10 }}>MARKDOWN</div>
            <textarea
              value={md}
              onChange={e => setMd(e.target.value)}
              spellCheck={false}
              style={{ flex: 1, padding: 12, background: 'var(--color-window-bg)', border: 'none', outline: 'none', resize: 'none', color: 'var(--color-text)', fontFamily: 'var(--font-mono)', fontSize: 12, lineHeight: 1.6 }}
            />
          </div>
        )}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
            <div style={{ padding: '4px 12px', color: 'var(--color-text-secondary)', background: 'var(--color-surface)', borderBottom: '1px solid var(--color-window-border)', fontSize: 10 }}>PREVIEW</div>
            <div
              style={{ flex: 1, padding: 16, overflow: 'auto', background: 'var(--color-window-bg)', color: 'var(--color-text)', lineHeight: 1.6 }}
              dangerouslySetInnerHTML={{ __html: html }}
            />
          </div>
      </div>
    </div>
  )
}
