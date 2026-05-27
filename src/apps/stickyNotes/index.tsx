import { useState } from 'react'
import { X } from 'lucide-react'

interface Note {
  id: string
  content: string
  color: string
  created: string
}

const colors = [
  '#FFF9C4', // 浅黄
  '#F8BBD9', // 粉色
  '#B2EBF2', // 浅蓝
  '#C8E6C9', // 浅绿
  '#FFE0B2', // 橙色
  '#E1BEE7', // 浅紫
]

export function StickyNotesApp() {
  const [notes, setNotes] = useState<Note[]>([
    {
      id: '1',
      content: 'Welcome to Sticky Notes!\n\nClick + to add a new note.',
      color: '#FFF9C4',
      created: new Date().toISOString(),
    },
  ])
  const [selectedNote, setSelectedNote] = useState<string | null>('1')

  const addNote = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      content: '',
      color: colors[Math.floor(Math.random() * colors.length)],
      created: new Date().toISOString(),
    }
    setNotes([...notes, newNote])
    setSelectedNote(newNote.id)
  }

  const updateNote = (id: string, content: string) => {
    setNotes(notes.map(n => n.id === id ? { ...n, content } : n))
  }

  const deleteNote = (id: string) => {
    const newNotes = notes.filter(n => n.id !== id)
    setNotes(newNotes)
    if (selectedNote === id) {
      setSelectedNote(newNotes.length > 0 ? newNotes[0].id : null)
    }
  }

  const selected = notes.find(n => n.id === selectedNote)

  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      background: 'var(--color-bg)',
      gap: 8,
      padding: 8,
    }}>
      {/* 侧边栏 - 笔记列表 */}
      <div style={{
        width: 100,
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        flexShrink: 0,
      }}>
        {/* 添加按钮 */}
        <button
          onClick={addNote}
          style={{
            width: '100%',
            height: 60,
            border: '2px dashed var(--color-window-border)',
            borderRadius: 'var(--radius-md)',
            background: 'transparent',
            cursor: 'pointer',
            fontSize: 24,
            color: 'var(--color-text-secondary)',
          }}
        >
          +
        </button>

        {/* 笔记卡片列表 */}
        {notes.map(note => (
          <div
            key={note.id}
            onClick={() => setSelectedNote(note.id)}
            style={{
              width: '100%',
              height: 60,
              background: note.color,
              borderRadius: 'var(--radius-md)',
              padding: 6,
              cursor: 'pointer',
              boxShadow: selectedNote === note.id ? 'var(--shadow-md)' : 'var(--shadow-sm)',
              border: selectedNote === note.id ? '2px solid var(--color-accent)' : '2px solid transparent',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <span style={{ fontSize: 9, color: 'var(--color-text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: 1.2 }}>
              {note.content.split('\n')[0] || 'Empty'}
            </span>
            <button
              onClick={(e) => { e.stopPropagation(); deleteNote(note.id) }}
              style={{
                alignSelf: 'flex-end',
                border: 'none',
                background: 'rgba(0,0,0,0.1)',
                borderRadius: '50%',
                width: 16,
                height: 16,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0,
              }}
            >
              <X size={10} />
            </button>
          </div>
        ))}
      </div>

      {/* 主编辑区 */}
      <div style={{
        flex: 1,
        background: selected ? selected.color : 'var(--color-surface)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-md)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>
        {selected ? (
          <>
            {/* 内容区 */}
            <textarea
              value={selected.content}
              onChange={e => updateNote(selected.id, e.target.value)}
              placeholder="Type your note..."
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                resize: 'none',
                padding: 16,
                fontSize: 14,
                lineHeight: 1.6,
                color: 'var(--color-text)',
                background: 'transparent',
                fontFamily: 'var(--font-sans)',
              }}
            />

            {/* 底部工具栏 */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '8px 12px',
              borderTop: '1px solid rgba(0,0,0,0.1)',
              background: 'rgba(255,255,255,0.3)',
            }}>
              {/* 颜色选择 */}
              <div style={{ display: 'flex', gap: 4 }}>
                {colors.map(c => (
                  <button
                    key={c}
                    onClick={() => {
                      setNotes(notes.map(n => n.id === selected.id ? { ...n, color: c } : n))
                    }}
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: '50%',
                      border: selected.color === c ? '2px solid var(--color-text)' : '1px solid rgba(0,0,0,0.2)',
                      background: c,
                      cursor: 'pointer',
                    }}
                  />
                ))}
              </div>
              <span style={{ fontSize: 10, color: 'var(--color-text-secondary)' }}>
                {new Date(selected.created).toLocaleDateString()}
              </span>
            </div>
          </>
        ) : (
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-text-secondary)',
            fontSize: 14,
          }}>
            Select or add a note
          </div>
        )}
      </div>
    </div>
  )
}
