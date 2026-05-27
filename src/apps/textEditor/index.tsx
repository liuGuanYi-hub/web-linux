import { useCallback, useState, useEffect, useRef } from 'react'
import { FilePlus2, FolderOpen, Save } from 'lucide-react'

interface FileData {
  path: string
  content: string
  modified: string
}

// 模拟虚拟 FS（后续会连通真实 IndexedDB）
const virtualFiles: Record<string, FileData> = {
  '/home/user/readme.txt': {
    path: '/home/user/readme.txt',
    content: 'Welcome to Web Linux!\n\nThis is a simple text editor.\nYou can create and edit text files here.',
    modified: '2024-01-15',
  },
  '/home/user/notes.txt': {
    path: '/home/user/notes.txt',
    content: 'Meeting at 3pm tomorrow.\nBuy groceries.\nCall mom.',
    modified: '2024-01-14',
  },
  '/home/user/plans.md': {
    path: '/home/user/plans.md',
    content: '# Project Plans\n\n## TODO\n- [ ] Learn Linux\n- [ ] Build a web OS\n- [ ] Finish the minesweeper game',
    modified: '2024-01-13',
  },
}

export function TextEditorApp() {
  const [content, setContent] = useState('')
  const [fileName, setFileName] = useState('untitled.txt')
  const [isModified, setIsModified] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // 新建
  const handleNew = () => {
    if (isModified) {
      const confirm = window.confirm('Discard unsaved changes?')
      if (!confirm) return
    }
    setContent('')
    setFileName('untitled.txt')
    setIsModified(false)
  }

  // 打开（简单处理）
  const handleOpen = () => {
    const names = Object.keys(virtualFiles).map(p => p.split('/').pop() || '')
    const selected = names[0] // 简单取第一个
    if (selected) {
      const fullPath = Object.keys(virtualFiles).find(p => p.endsWith(selected)) || ''
      const file = virtualFiles[fullPath]
      if (file) {
        setContent(file.content)
        setFileName(selected)
        setIsModified(false)
      }
    }
  }

  // 保存
  const handleSave = useCallback(() => {
    // 简单保存到 virtualFiles
    const fullPath = `/home/user/${fileName}`
    virtualFiles[fullPath] = {
      path: fullPath,
      content,
      modified: new Date().toISOString().split('T')[0],
    }
    setIsModified(false)

  }, [content, fileName])

  // 内容变化
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value)
    setIsModified(true)
  }

  // Ctrl+S 保存
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        handleSave()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleSave])

  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--color-window-bg)',
    }}>
      {/* 工具栏 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        padding: '6px 10px',
        background: 'var(--color-titlebar)',
        borderBottom: '1px solid var(--color-window-border)',
        flexShrink: 0,
      }}>
        <button
          onClick={handleNew}
          title="New"
          style={toolbarBtnStyle}
        >
          <FilePlus2 size={14} /> New
        </button>
        <button
          onClick={handleOpen}
          title="Open"
          style={toolbarBtnStyle}
        >
          <FolderOpen size={14} /> Open
        </button>
        <button
          onClick={handleSave}
          title="Save (Ctrl+S)"
          style={toolbarBtnStyle}
        >
          <Save size={14} /> Save
        </button>

        <div style={{
          width: 1,
          height: 20,
          background: 'var(--color-window-border)',
          margin: '0 6px',
        }} />

        {/* 文件名 */}
        <span style={{
          fontSize: 12,
          color: 'var(--color-text)',
          fontFamily: 'var(--font-mono)',
        }}>
          {fileName}
          {isModified && <span style={{ color: 'var(--color-accent)' }}> *</span>}
        </span>
      </div>

      {/* 编辑器 */}
      <textarea
        ref={textareaRef}
        value={content}
        onChange={handleChange}
        placeholder="Start typing..."
        style={{
          flex: 1,
          border: 'none',
          outline: 'none',
          resize: 'none',
          padding: '12px 16px',
          fontSize: 13,
          fontFamily: 'var(--font-mono)',
          lineHeight: 1.6,
          color: 'var(--color-text)',
          background: 'var(--color-surface)',
        }}
      />

      {/* 状态栏 */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        padding: '4px 12px',
        background: 'var(--color-titlebar)',
        borderTop: '1px solid var(--color-window-border)',
        fontSize: 11,
        color: 'var(--color-text-secondary)',
      }}>
        <span>{content.length} characters</span>
        <span>{fileName}</span>
      </div>
    </div>
  )
}

const toolbarBtnStyle: React.CSSProperties = {
  padding: '4px 10px',
  border: 'none',
  borderRadius: 'var(--radius-sm)',
  background: 'transparent',
  cursor: 'pointer',
  fontSize: 12,
  color: 'var(--color-text)',
  transition: 'background 100ms ease',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 5,
}
