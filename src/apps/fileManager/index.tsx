import { useState } from 'react'
import { ArrowLeft, ArrowRight, ArrowUp, File, FileArchive, FileImage, FileMusic, FileSpreadsheet, FileText, FileVideo, Folder, type LucideIcon } from 'lucide-react'

interface FSNode {
  name: string
  type: 'file' | 'folder'
  size?: number
  modified?: string
}

// 模拟虚拟 FS
const virtualFS: Record<string, FSNode[]> = {
  '/': [
    { name: 'home', type: 'folder' },
    { name: 'system', type: 'folder' },
  ],
  '/home': [
    { name: 'user', type: 'folder' },
  ],
  '/home/user': [
    { name: 'documents', type: 'folder', modified: '2024-01-15' },
    { name: 'pictures', type: 'folder', modified: '2024-01-14' },
    { name: 'music', type: 'folder', modified: '2024-01-13' },
    { name: 'videos', type: 'folder', modified: '2024-01-12' },
    { name: 'downloads', type: 'folder', modified: '2024-01-11' },
    { name: 'readme.txt', type: 'file', size: 1024, modified: '2024-01-10' },
  ],
  '/home/user/documents': [
    { name: 'notes.txt', type: 'file', size: 2048, modified: '2024-01-15' },
    { name: 'plans.md', type: 'file', size: 4096, modified: '2024-01-14' },
    { name: 'budget.xlsx', type: 'file', size: 8192, modified: '2024-01-13' },
  ],
  '/home/user/pictures': [
    { name: 'vacation.jpg', type: 'file', size: 2048000, modified: '2024-01-14' },
    { name: 'profile.png', type: 'file', size: 102400, modified: '2024-01-01' },
  ],
  '/home/user/music': [
    { name: 'song.mp3', type: 'file', size: 5120000, modified: '2024-01-13' },
  ],
  '/home/user/videos': [
    { name: 'clip.mp4', type: 'file', size: 15360000, modified: '2024-01-12' },
  ],
  '/home/user/downloads': [
    { name: 'installer.deb', type: 'file', size: 40960000, modified: '2024-01-11' },
    { name: 'archive.zip', type: 'file', size: 8192000, modified: '2024-01-10' },
  ],
}

function formatSize(bytes?: number): string {
  if (!bytes) return ''
  if (bytes >= 1048576) return (bytes / 1048576).toFixed(1) + ' MB'
  if (bytes >= 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return bytes + ' B'
}

function getFileIcon(name: string, type: 'file' | 'folder'): LucideIcon {
  if (type === 'folder') return Folder
  const ext = name.split('.').pop()?.toLowerCase()
  const icons: Record<string, LucideIcon> = {
    txt: FileText, md: FileText, js: FileText, ts: FileText, py: FileText,
    jpg: FileImage, png: FileImage, gif: FileImage, mp3: FileMusic, mp4: FileVideo,
    zip: FileArchive, deb: FileArchive, xlsx: FileSpreadsheet, pdf: FileText,
  }
  return icons[ext || ''] || File
}

export function FileManagerApp() {
  const [currentPath, setCurrentPath] = useState('/home/user')
  const [selected, setSelected] = useState<string | null>(null)

  const items = virtualFS[currentPath] || []

  const navigate = (item: FSNode) => {
    if (item.type === 'folder') {
      const newPath = currentPath === '/' ? `/${item.name}` : `${currentPath}/${item.name}`
      setCurrentPath(newPath)
      setSelected(null)
    }
  }

  const goUp = () => {
    if (currentPath === '/home/user') setCurrentPath('/home')
    else if (currentPath.startsWith('/home/')) setCurrentPath('/home')
    else if (currentPath === '/home') setCurrentPath('/')
  }

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
        gap: 8,
        padding: '8px 12px',
        background: 'var(--color-titlebar)',
        borderBottom: '1px solid var(--color-window-border)',
      }}>
        {/* 后退/前进按钮（占位） */}
        <button disabled style={{
          width: 28,
          height: 28,
          border: 'none',
          borderRadius: 'var(--radius-sm)',
          background: 'transparent',
          cursor: 'not-allowed',
          opacity: 0.4,
          fontSize: 16,
        }} title="Back"><ArrowLeft size={16} /></button>
        <button disabled style={{
          width: 28,
          height: 28,
          border: 'none',
          borderRadius: 'var(--radius-sm)',
          background: 'transparent',
          cursor: 'not-allowed',
          opacity: 0.4,
          fontSize: 16,
        }} title="Forward"><ArrowRight size={16} /></button>

        {/* 上层按钮 */}
        <button onClick={goUp} style={{
          width: 28,
          height: 28,
          border: 'none',
          borderRadius: 'var(--radius-sm)',
          background: 'var(--color-surface)',
          cursor: 'pointer',
          fontSize: 16,
        }} title="Up"><ArrowUp size={16} /></button>

        {/* 路径栏 */}
        <div style={{
          flex: 1,
          padding: '4px 12px',
          background: 'var(--color-surface)',
          borderRadius: 'var(--radius-sm)',
          fontSize: 12,
          fontFamily: 'var(--font-mono)',
          color: 'var(--color-text)',
        }}>
          {currentPath}
        </div>
      </div>

      {/* 表头 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 100px 120px',
        padding: '8px 16px',
        borderBottom: '1px solid var(--color-window-border)',
        fontSize: 11,
        color: 'var(--color-text-secondary)',
        fontWeight: 600,
      }}>
        <span>Name</span>
        <span>Size</span>
        <span>Modified</span>
      </div>

      {/* 文件列表 */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
        {items.map(item => {
          const FileIcon = getFileIcon(item.name, item.type)
          return (
          <div
            key={item.name}
            onClick={() => setSelected(item.name)}
            onDoubleClick={() => navigate(item)}
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 100px 120px',
              padding: '8px 16px',
              alignItems: 'center',
              cursor: 'pointer',
              background: selected === item.name ? 'var(--color-accent)' : 'transparent',
              borderRadius: 'var(--radius-sm)',
              margin: '2px 8px',
              transition: 'background 100ms ease',
            }}
            onMouseEnter={e => {
              if (selected !== item.name) {
                e.currentTarget.style.background = 'var(--color-bg)'
              }
            }}
            onMouseLeave={e => {
              if (selected !== item.name) {
                e.currentTarget.style.background = 'transparent'
              }
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 }}>
              <FileIcon size={18} />
              <span style={{ color: 'var(--color-text)' }}>{item.name}</span>
            </span>
            <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
              {item.type === 'file' ? formatSize(item.size) : ''}
            </span>
            <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
              {item.modified || ''}
            </span>
          </div>
          )
        })}
      </div>

      {/* 状态栏 */}
      <div style={{
        padding: '6px 16px',
        borderTop: '1px solid var(--color-window-border)',
        fontSize: 11,
        color: 'var(--color-text-secondary)',
        background: 'var(--color-titlebar)',
      }}>
        {items.length} items | {currentPath}
      </div>
    </div>
  )
}
