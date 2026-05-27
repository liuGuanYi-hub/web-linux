import { useState, useRef, useCallback } from 'react'
import { Image as ImageIcon, RotateCcw, RotateCw, ZoomIn, ZoomOut } from 'lucide-react'

const ZOOM_LEVELS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 3, 4]

export function ImageViewerApp() {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [fit, setFit] = useState<'contain' | 'cover' | 'fill'>('contain')
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback((file: File) => {
    const url = URL.createObjectURL(file)
    setImageUrl(url)
    setZoom(1)
    setRotation(0)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) handleFile(file)
  }, [handleFile])

  const openFile = () => fileRef.current?.click()

  const sampleImages = [
    { label: 'Nature', url: 'https://picsum.photos/seed/weblinux/800/600' },
    { label: 'City', url: 'https://picsum.photos/seed/city/800/600' },
    { label: 'Abstract', url: 'https://picsum.photos/seed/abstract/800/600' },
  ]

  return (
    <div
      style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: '#1a1a1a', overflow: 'hidden' }}
      onDrop={handleDrop}
      onDragOver={e => e.preventDefault()}
    >
      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 6, padding: '6px 12px', borderBottom: '1px solid #333', background: '#252525', alignItems: 'center', flexShrink: 0 }}>
        <button onClick={openFile} style={{ padding: '5px 14px', borderRadius: 6, border: 'none', background: '#C49A6C', color: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>Open File</button>
        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]) }} />

        <div style={{ width: 1, height: 20, background: '#444', margin: '0 4px' }} />

        <button onClick={() => setZoom(z => Math.max(ZOOM_LEVELS[0], z - 0.25))} title="Zoom out" style={{ padding: '5px 10px', borderRadius: 6, border: '1px solid #444', background: '#333', color: '#fff', cursor: 'pointer', fontSize: 12 }}><ZoomOut size={14} /></button>
        <span style={{ fontSize: 11, color: '#aaa', minWidth: 50, textAlign: 'center' }}>{Math.round(zoom * 100)}%</span>
        <button onClick={() => setZoom(z => Math.min(ZOOM_LEVELS[ZOOM_LEVELS.length - 1], z + 0.25))} title="Zoom in" style={{ padding: '5px 10px', borderRadius: 6, border: '1px solid #444', background: '#333', color: '#fff', cursor: 'pointer', fontSize: 12 }}><ZoomIn size={14} /></button>

        <button onClick={() => setRotation(r => r - 90)} title="Rotate left" style={{ padding: '5px 10px', borderRadius: 6, border: '1px solid #444', background: '#333', color: '#fff', cursor: 'pointer', fontSize: 12 }}><RotateCcw size={14} /></button>
        <button onClick={() => setRotation(r => r + 90)} title="Rotate right" style={{ padding: '5px 10px', borderRadius: 6, border: '1px solid #444', background: '#333', color: '#fff', cursor: 'pointer', fontSize: 12 }}><RotateCw size={14} /></button>

        <div style={{ width: 1, height: 20, background: '#444', margin: '0 4px' }} />

        {(['contain', 'cover', 'fill'] as const).map(m => (
          <button key={m} onClick={() => setFit(m)} style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid ' + (fit === m ? '#C49A6C' : '#444'), background: fit === m ? '#C49A6C30' : '#333', color: fit === m ? '#C49A6C' : '#aaa', cursor: 'pointer', fontSize: 10, textTransform: 'capitalize' }}>{m}</button>
        ))}
      </div>

      {/* Canvas */}
      <div style={{ flex: 1, overflow: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        {imageUrl ? (
          <img
            src={imageUrl}
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: fit,
              transform: `scale(${zoom}) rotate(${rotation}deg)`,
              transition: 'transform 200ms ease',
              borderRadius: 4,
            }}
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, color: '#666' }}>
            <ImageIcon size={48} color="#666" />
            <div style={{ fontSize: 14 }}>Drop an image here or</div>
            <button onClick={openFile} style={{ padding: '8px 20px', borderRadius: 8, border: '1px solid #444', background: 'transparent', color: '#aaa', cursor: 'pointer', fontSize: 12 }}>Open File</button>
            <div style={{ fontSize: 11, color: '#444', marginTop: 8 }}>or try a sample:</div>
            <div style={{ display: 'flex', gap: 8 }}>
              {sampleImages.map(s => (
                <button key={s.label} onClick={() => { setImageUrl(s.url); setZoom(1); setRotation(0) }} style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #444', background: 'transparent', color: '#888', cursor: 'pointer', fontSize: 11 }}>{s.label}</button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Status */}
      <div style={{ padding: '4px 12px', background: '#252525', borderTop: '1px solid #333', fontSize: 10, color: '#666', display: 'flex', justifyContent: 'space-between' }}>
        <span>{imageUrl ? 'Image loaded' : 'No image'}</span>
        <span>{Math.round(zoom * 100)}% | {rotation}deg</span>
      </div>
    </div>
  )
}
