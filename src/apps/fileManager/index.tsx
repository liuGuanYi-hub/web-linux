import { useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  File,
  FileArchive,
  FileImage,
  FileMusic,
  FileSpreadsheet,
  FileText,
  FileVideo,
  Folder,
  type LucideIcon,
} from 'lucide-react'

interface FSNode {
  name: string
  type: 'file' | 'folder'
  size?: number
  modified?: string
}

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
    txt: FileText,
    md: FileText,
    js: FileText,
    ts: FileText,
    py: FileText,
    jpg: FileImage,
    png: FileImage,
    gif: FileImage,
    mp3: FileMusic,
    mp4: FileVideo,
    zip: FileArchive,
    deb: FileArchive,
    xlsx: FileSpreadsheet,
    pdf: FileText,
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
    <div className="app-surface file-manager-app">
      <div className="app-toolbar">
        <button type="button" disabled className="toolbar-button file-manager-nav" title="Back">
          <ArrowLeft size={16} />
        </button>
        <button type="button" disabled className="toolbar-button file-manager-nav" title="Forward">
          <ArrowRight size={16} />
        </button>
        <button type="button" onClick={goUp} className="toolbar-button file-manager-nav" title="Up">
          <ArrowUp size={16} />
        </button>

        <div className="path-pill">{currentPath}</div>
      </div>

      <div className="file-manager-header">
        <span>Name</span>
        <span>Size</span>
        <span>Modified</span>
      </div>

      <div className="app-content file-manager-list">
        {items.map(item => {
          const FileIcon = getFileIcon(item.name, item.type)
          const isSelected = selected === item.name
          return (
            <div
              key={item.name}
              onClick={() => setSelected(item.name)}
              onDoubleClick={() => navigate(item)}
              className={`file-manager-row ${isSelected ? 'file-manager-row--selected' : ''}`}
            >
              <span className="file-manager-name">
                <FileIcon size={18} />
                <span>{item.name}</span>
              </span>
              <span className="file-manager-meta">
                {item.type === 'file' ? formatSize(item.size) : ''}
              </span>
              <span className="file-manager-meta">
                {item.modified || ''}
              </span>
            </div>
          )
        })}
      </div>

      <div className="app-statusbar">
        <span>{items.length} items</span>
        <span>{currentPath}</span>
      </div>
    </div>
  )
}
