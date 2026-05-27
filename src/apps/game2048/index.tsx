import { useState, useEffect, useCallback } from 'react'
import { Trophy } from 'lucide-react'

const SIZE = 4

function createBoard(): number[][] {
  const board: number[][] = Array(SIZE).fill(null).map(() => Array(SIZE).fill(0))
  addRandom(board)
  addRandom(board)
  return board
}

function addRandom(board: number[][]) {
  const empty: [number, number][] = []
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++)
      if (board[r][c] === 0) empty.push([r, c])
  if (empty.length === 0) return
  const [r, c] = empty[Math.floor(Math.random() * empty.length)]
  board[r][c] = Math.random() < 0.9 ? 2 : 4
}

function clone(board: number[][]): number[][] {
  return board.map(row => [...row])
}

function rotateClockwise(board: number[][]): number[][] {
  const n = SIZE
  const result: number[][] = Array(n).fill(null).map(() => Array(n).fill(0))
  for (let r = 0; r < n; r++)
    for (let c = 0; c < n; c++)
      result[c][n - 1 - r] = board[r][c]
  return result
}

function slideRow(row: number[]): number[] {
  const filtered = row.filter(v => v !== 0)
  const result: number[] = []
  let i = 0
  while (i < filtered.length) {
    if (i + 1 < filtered.length && filtered[i] === filtered[i + 1]) {
      result.push(filtered[i] * 2)
      i += 2
    } else {
      result.push(filtered[i])
      i++
    }
  }
  return [...result, ...Array(SIZE - result.length).fill(0)]
}

function rotateCounter(board: number[][]): number[][] {
  const n = SIZE
  const result: number[][] = Array(n).fill(null).map(() => Array(n).fill(0))
  for (let r = 0; r < n; r++)
    for (let c = 0; c < n; c++)
      result[n - 1 - c][r] = board[r][c]
  return result
}

function doMove(board: number[][], dir: number): { board: number[][], moved: boolean } {
  let b = clone(board)
  const rotates = dir === 2 ? 2 : dir === 3 ? 1 : dir === 1 ? 3 : 0
  for (let i = 0; i < rotates; i++) b = rotateClockwise(b)
  const nb: number[][] = []
  for (const row of b) {
    nb.push(slideRow(row))
  }

  let final = nb
  for (let i = 0; i < rotates; i++) final = rotateCounter(final)
  const moved = final.some((row, r) => row.some((cell, c) => cell !== board[r][c]))

  return { board: final, moved }
}

function canMove(board: number[][]): boolean {
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++)
      if (board[r][c] === 0) return true
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++) {
      if (c < SIZE - 1 && board[r][c] === board[r][c + 1]) return true
      if (r < SIZE - 1 && board[r][c] === board[r + 1][c]) return true
    }
  return false
}

const COLORS: Record<number, { bg: string; text: string }> = {
  0:    { bg: '#D4CFC5', text: '#4A4540' },
  2:    { bg: '#F5F0E8', text: '#4A4540' },
  4:    { bg: '#EDE8DF', text: '#4A4540' },
  8:    { bg: '#E8D5C4', text: '#fff' },
  16:   { bg: '#DEB887', text: '#fff' },
  32:   { bg: '#D4A574', text: '#fff' },
  64:   { bg: '#C49A6C', text: '#fff' },
  128:  { bg: '#B8895A', text: '#fff' },
  256:  { bg: '#A07848', text: '#fff' },
  512:  { bg: '#886838', text: '#fff' },
  1024: { bg: '#6B8DD6', text: '#fff' },
  2048: { bg: '#5AC05A', text: '#fff' },
}

export function Game2048() {
  const [board, setBoard] = useState(() => createBoard())
  const [score, setScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [won, setWon] = useState(false)
  const [keepPlaying, setKeepPlaying] = useState(false)

  const handle = useCallback((dir: number) => {
    if (gameOver) return
    const { board: nb, moved } = doMove(board, dir)
    if (moved) {
      addRandom(nb)
      setBoard([...nb])
      setScore(nb.flat().reduce((a, b) => a + b, 0))
      if (!keepPlaying && nb.flat().some(v => v >= 2048)) setWon(true)
      if (!canMove(nb)) setGameOver(true)
    }
  }, [board, gameOver, keepPlaying])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const m: Record<string, number> = { ArrowLeft: 0, ArrowUp: 1, ArrowRight: 2, ArrowDown: 3 }
      if (m[e.key] !== undefined) { e.preventDefault(); handle(m[e.key]) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [handle])

  const reset = () => {
    setBoard(createBoard())
    setScore(0)
    setGameOver(false)
    setWon(false)
    setKeepPlaying(false)
  }

  const cellSize = 'min(60px, 18vw)'

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--color-window-bg)', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: `calc(${cellSize} * 4 + 20px)`, padding: '0 4px' }}>
        <div>
          <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--color-text)' }}>2048</div>
          <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>Score: {score}</div>
        </div>
        <button onClick={reset} style={{ padding: '8px 16px', borderRadius: 'var(--radius-md)', border: 'none', background: 'var(--color-accent)', color: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>New Game</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${SIZE}, ${cellSize})`, gap: 8, padding: 10, background: '#C8C0B5', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)' }}>
        {board.map((row, ri) => row.map((val, ci) => {
          const { bg, text } = COLORS[val] || { bg: '#4A4540', text: '#fff' }
          return (
            <div key={`${ri}-${ci}`} style={{
              width: cellSize, height: cellSize, background: bg, borderRadius: 'var(--radius-md)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: val >= 1000 ? 16 : val >= 100 ? 20 : 24,
              fontWeight: 700, color: text,
            }}>
              {val || ''}
            </div>
          )
        }))}
      </div>

      <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Arrow Keys to move tiles</div>

      {won && !keepPlaying && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, borderRadius: 'var(--radius-lg)' }}>
          <Trophy size={48} color="#F5C842" />
          <div style={{ fontSize: 30, fontWeight: 700, color: '#fff' }}>You Win!</div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={() => setKeepPlaying(true)} style={{ padding: '10px 24px', borderRadius: 'var(--radius-md)', border: 'none', background: 'var(--color-accent)', color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>Keep Playing</button>
            <button onClick={reset} style={{ padding: '10px 24px', borderRadius: 'var(--radius-md)', border: '2px solid #fff', background: 'transparent', color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>New Game</button>
          </div>
        </div>
      )}

      {gameOver && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, borderRadius: 'var(--radius-lg)' }}>
          <div style={{ fontSize: 36, fontWeight: 700, color: '#fff' }}>Game Over</div>
          <div style={{ fontSize: 16, color: 'rgba(255,255,255,0.7)' }}>Score: {score}</div>
          <button onClick={reset} style={{ padding: '10px 24px', borderRadius: 'var(--radius-md)', border: 'none', background: 'var(--color-accent)', color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>Try Again</button>
        </div>
      )}
    </div>
  )
}
