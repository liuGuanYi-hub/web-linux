import { useCallback, useEffect, useState } from 'react'
import { FilePlus2, FolderOpen, Save } from 'lucide-react'

interface FileData {
  path: string
  content: string
  modified: string
}

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

  const handleNew = () => {
    if (isModified) {
      const confirmed = window.confirm('Discard unsaved changes?')
      if (!confirmed) return
    }
    setContent('')
    setFileName('untitled.txt')
    setIsModified(false)
  }

  const handleOpen = () => {
    const selected = Object.keys(virtualFiles).map(path => path.split('/').pop() || '')[0]
    if (!selected) return

    const fullPath = Object.keys(virtualFiles).find(path => path.endsWith(selected)) || ''
    const file = virtualFiles[fullPath]
    if (file) {
      setContent(file.content)
      setFileName(selected)
      setIsModified(false)
    }
  }

  const handleSave = useCallback(() => {
    const fullPath = `/home/user/${fileName}`
    virtualFiles[fullPath] = {
      path: fullPath,
      content,
      modified: new Date().toISOString().split('T')[0],
    }
    setIsModified(false)
  }, [content, fileName])

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(event.target.value)
    setIsModified(true)
  }

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault()
        handleSave()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleSave])

  return (
    <div className="app-surface text-editor-app">
      <div className="app-toolbar">
        <button type="button" onClick={handleNew} title="New" className="toolbar-button">
          <FilePlus2 size={14} /> New
        </button>
        <button type="button" onClick={handleOpen} title="Open" className="toolbar-button">
          <FolderOpen size={14} /> Open
        </button>
        <button type="button" onClick={handleSave} title="Save (Ctrl+S)" className="toolbar-button">
          <Save size={14} /> Save
        </button>

        <div className="toolbar-divider" />

        <span className="text-editor-title">
          {fileName}
          {isModified && <span className="text-editor-modified"> *</span>}
        </span>
      </div>

      <textarea
        value={content}
        onChange={handleChange}
        placeholder="Start typing..."
        className="text-editor-area"
      />

      <div className="app-statusbar">
        <span>{content.length} characters</span>
        <span>{fileName}</span>
      </div>
    </div>
  )
}
