import { useState, useEffect, useCallback } from 'react'

const COLS = 10
const ROWS = 20
const EMPTY = 0

type Shape = number[][]
type Direction = 'left' | 'right' | 'down' | 'rotate' | 'drop'
type GameState = 'start' | 'playing' | 'paused' | 'over'
type Cell = number | string
type Piece = ReturnType<typeof randomPiece>

const SHAPES: Array<{ shape: Shape; color: string; name: string }> = [
  { name: 'I', color: '#5ABCB8', shape: [[1, 1, 1, 1]] },
  { name: 'O', color: '#F5C842', shape: [[1, 1], [1, 1]] },
  { name: 'T', color: '#B06BC4', shape: [[0, 1, 0], [1, 1, 1]] },
  { name: 'S', color: '#5AC05A', shape: [[0, 1, 1], [1, 1, 0]] },
  { name: 'Z', color: '#E85454', shape: [[1, 1, 0], [0, 1, 1]] },
  { name: 'L', color: '#E88040', shape: [[1, 0], [1, 0], [1, 1]] },
  { name: 'J', color: '#6B8DD6', shape: [[0, 1], [0, 1], [1, 1]] },
]

function createBoard(): Cell[][] {
  return Array(ROWS).fill(null).map(() => Array(COLS).fill(EMPTY))
}

function randomPiece() {
  const p = SHAPES[Math.floor(Math.random() * SHAPES.length)]
  return {
    shape: p.shape.map(row => [...row]),
    color: p.color,
    name: p.name,
    x: Math.floor((COLS - p.shape[0].length) / 2),
    y: 0,
  }
}

function canPlace(board: Cell[][], piece: { shape: Shape; x: number; y: number }): boolean {
  for (let r = 0; r < piece.shape.length; r++) {
    for (let c = 0; c < piece.shape[r].length; c++) {
      if (piece.shape[r][c]) {
        const nx = piece.x + c
        const ny = piece.y + r
        if (nx < 0 || nx >= COLS || ny >= ROWS) return false
        if (ny >= 0 && board[ny][nx] !== EMPTY) return false
      }
    }
  }
  return true
}

function placePiece(board: Cell[][], piece: { shape: Shape; color: string; x: number; y: number }): Cell[][] {
  const nb = board.map(row => [...row])
  for (let r = 0; r < piece.shape.length; r++) {
    for (let c = 0; c < piece.shape[r].length; c++) {
      if (piece.shape[r][c]) {
        const ny = piece.y + r
        const nx = piece.x + c
        if (ny >= 0) nb[ny][nx] = piece.color
      }
    }
  }
  return nb
}

function rotate(shape: Shape): Shape {
  const rows = shape.length
  const cols = shape[0].length
  const rotated: Shape = Array(cols).fill(null).map(() => Array(rows).fill(0))
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      rotated[c][rows - 1 - r] = shape[r][c]
  return rotated
}

function clearLines(board: Cell[][]): { board: Cell[][]; lines: number } {
  const newBoard = board.filter(row => row.some(cell => cell === EMPTY))
  const lines = ROWS - newBoard.length
  for (let i = 0; i < lines; i++) newBoard.unshift(Array(COLS).fill(EMPTY))
  return { board: newBoard, lines }
}

export function TetrisGame() {
  const [board, setBoard] = useState<Cell[][]>(() => createBoard())
  const [piece, setPiece] = useState(() => randomPiece())
  const [score, setScore] = useState(0)
  const [lines, setLines] = useState(0)
  const [level, setLevel] = useState(1)
  const [gameState, setGameState] = useState<GameState>('start')
  const [preview, setPreview] = useState(() => randomPiece())

  const startGame = useCallback(() => {
    setBoard(createBoard())
    setPiece(randomPiece())
    setPreview(randomPiece())
    setScore(0)
    setLines(0)
    setLevel(1)
    setGameState('playing')
  }, [])

  const move = useCallback((dir: Direction) => {
    if (gameState !== 'playing') return
    setPiece(prev => {
      const np = { ...prev }

      const lockPiece = (lockedPiece: Piece) => {
        const nb = placePiece(board, lockedPiece)
        const { board: cb, lines: cl } = clearLines(nb)
        setBoard(cb)
        setScore(s => s + cl * 10 * level)
        const newLines = lines + cl
        setLines(newLines)
        if (cl > 0) setLevel(Math.floor(newLines / 10) + 1)
        const next = preview
        setPreview(randomPiece())
        if (!canPlace(cb, next)) {
          setGameState('over')
          return lockedPiece
        }
        return next
      }

      if (dir === 'rotate') {
        const rotated = rotate(prev.shape)
        np.shape = rotated
        if (!canPlace(board, np)) return prev
      } else if (dir === 'left') {
        np.x--
        if (!canPlace(board, np)) return prev
      } else if (dir === 'right') {
        np.x++
        if (!canPlace(board, np)) return prev
      } else if (dir === 'drop') {
        while (canPlace(board, { ...np, y: np.y + 1 })) {
          np.y++
        }
        return lockPiece(np)
      } else if (dir === 'down') {
        np.y++
        if (!canPlace(board, np)) {
          return lockPiece(prev)
        }
      }
      return np
    })
  }, [gameState, board, preview, level, lines])

  useEffect(() => {
    if (gameState !== 'playing') return
    const interval = setInterval(() => move('down'), Math.max(100, 500 - (level - 1) * 30))
    return () => clearInterval(interval)
  }, [gameState, move, level])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (gameState === 'start' || gameState === 'over') {
        if (e.key === ' ' || e.key === 'Enter') startGame()
        return
      }
      if (e.key === 'p' || e.key === 'P') {
        setGameState(s => s === 'paused' ? 'playing' : 'paused')
        return
      }
      const map: Record<string, Direction> = {
        ArrowLeft: 'left', ArrowRight: 'right', ArrowDown: 'down',
        ArrowUp: 'rotate', z: 'rotate', Z: 'rotate', ' ': 'drop',
      }
      if (map[e.key]) { e.preventDefault(); move(map[e.key]) }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [gameState, move, startGame])

  const cellSize = 'min(18px, 3vw)'

  const getCellColor = (cell: Cell): string => {
    if (cell === EMPTY) return '#111'
    return cell as string
  }

  const displayBoard = gameState === 'playing' || gameState === 'paused'
    ? placePiece(board, piece)
    : board

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', gap: 16, alignItems: 'center', justifyContent: 'center', background: 'var(--color-window-bg)', fontFamily: 'var(--font-mono)' }}>
      {/* 主游戏区 */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <div style={{ display: 'flex', gap: 24, fontSize: 12 }}>
          <div><span style={{ color: 'var(--color-text-secondary)' }}>Score</span> <strong style={{ color: 'var(--color-text)' }}>{score}</strong></div>
          <div><span style={{ color: 'var(--color-text-secondary)' }}>Lines</span> <strong style={{ color: 'var(--color-text)' }}>{lines}</strong></div>
          <div><span style={{ color: 'var(--color-text-secondary)' }}>Level</span> <strong style={{ color: 'var(--color-accent)' }}>{level}</strong></div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(' + COLS + ', ' + cellSize + ')',
          gridTemplateRows: 'repeat(' + ROWS + ', ' + cellSize + ')',
          gap: 1,
          background: '#1a1a1a',
          padding: 4,
          borderRadius: 'var(--radius-md)',
          border: '2px solid #333',
        }}>
          {displayBoard.map((row, ri) =>
            row.map((cell, ci) => (
              <div key={ri + '-' + ci} style={{
                width: cellSize, height: cellSize,
                background: getCellColor(cell),
                borderRadius: cell !== EMPTY ? 2 : 0,
                transition: 'background 50ms',
              }} />
            ))
          )}
        </div>

        <div style={{ fontSize: 10, color: 'var(--color-text-muted)', textAlign: 'center' }}>
          Left/Right Move | Up Rotate | Down Soft Drop | Space Hard Drop | P Pause
        </div>
      </div>

      {/* 右侧信息 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minWidth: 90 }}>
        <div>
          <div style={{ fontSize: 10, color: 'var(--color-text-secondary)', marginBottom: 6 }}>NEXT</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 16px)', gap: 1, background: '#111', padding: 4, borderRadius: 6 }}>
            {preview.shape.map((row, ri) =>
              row.map((cell, ci) => (
                <div key={'n' + ri + '-' + ci} style={{ width: 16, height: 16, background: cell ? preview.color : 'transparent' }} />
              ))
            )}
          </div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 10, color: 'var(--color-text-secondary)' }}>SCORE</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-text)' }}>{score}</div>
        </div>

        <button
          onClick={startGame}
          style={{
            padding: '10px 16px',
            borderRadius: 'var(--radius-md)',
            border: 'none',
            background: 'var(--color-accent)',
            color: '#fff',
            cursor: 'pointer',
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          {gameState === 'start' ? 'Start' : gameState === 'over' ? 'Play Again' : 'Restart'}
        </button>

        {gameState === 'paused' && (
          <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', textAlign: 'center' }}>Paused</div>
        )}
      </div>

      {(gameState === 'start' || gameState === 'over') && (
        <div style={{
          position: 'absolute', inset: 0,
          background: 'rgba(0,0,0,0.75)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 16,
          borderRadius: 'var(--radius-lg)',
        }}>
          <div style={{ fontSize: gameState === 'over' ? 32 : 40, fontWeight: 700, color: '#fff' }}>
            {gameState === 'over' ? 'Game Over' : 'Tetris'}
          </div>
          {gameState === 'over' && <div style={{ fontSize: 16, color: 'rgba(255,255,255,0.7)' }}>Score: {score}</div>}
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>Press Space or Enter</div>
        </div>
      )}
    </div>
  )
}
