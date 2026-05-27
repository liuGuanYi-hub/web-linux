import { useEffect, useState } from 'react'
import { Bomb, Clock, Flag, Trophy } from 'lucide-react'

const BOARD_SIZE = 9
const TOTAL_MINES = 10

interface Cell {
  revealed: boolean
  flagged: boolean
  mine: boolean
  adjacent: number
}

type GameState = 'playing' | 'won' | 'lost'

function createBoard(safeCell?: [number, number]): Cell[][] {
  const board: Cell[][] = []
  for (let i = 0; i < BOARD_SIZE; i++) {
    board[i] = []
    for (let j = 0; j < BOARD_SIZE; j++) {
      board[i][j] = { revealed: false, flagged: false, mine: false, adjacent: 0 }
    }
  }

  let placed = 0
  while (placed < TOTAL_MINES) {
    const r = Math.floor(Math.random() * BOARD_SIZE)
    const c = Math.floor(Math.random() * BOARD_SIZE)
    if (!board[r][c].mine && (!safeCell || safeCell[0] !== r || safeCell[1] !== c)) {
      board[r][c].mine = true
      placed++
    }
  }

  for (let i = 0; i < BOARD_SIZE; i++) {
    for (let j = 0; j < BOARD_SIZE; j++) {
      if (!board[i][j].mine) {
        let count = 0
        for (let di = -1; di <= 1; di++) {
          for (let dj = -1; dj <= 1; dj++) {
            const ni = i + di
            const nj = j + dj
            if (ni >= 0 && ni < BOARD_SIZE && nj >= 0 && nj < BOARD_SIZE && board[ni][nj].mine) count++
          }
        }
        board[i][j].adjacent = count
      }
    }
  }

  return board
}

function floodFill(board: Cell[][], r: number, c: number): Cell[][] {
  const newBoard = board.map(row => row.map(cell => ({ ...cell })))
  const stack: [number, number][] = [[r, c]]
  const visited = new Set<string>()

  while (stack.length > 0) {
    const [i, j] = stack.pop()!
    const key = `${i},${j}`
    if (visited.has(key)) continue
    visited.add(key)

    const cell = newBoard[i][j]
    if (cell.revealed || cell.mine || cell.flagged) continue

    cell.revealed = true

    if (cell.adjacent === 0) {
      for (let di = -1; di <= 1; di++) {
        for (let dj = -1; dj <= 1; dj++) {
          const ni = i + di
          const nj = j + dj
          if (ni >= 0 && ni < BOARD_SIZE && nj >= 0 && nj < BOARD_SIZE && !newBoard[ni][nj].revealed && !newBoard[ni][nj].mine) {
            stack.push([ni, nj])
          }
        }
      }
    }
  }

  return newBoard
}

export function MinesweeperApp() {
  const [board, setBoard] = useState<Cell[][]>(() => createBoard())
  const [gameState, setGameState] = useState<GameState>('playing')
  const [flagCount, setFlagCount] = useState(0)
  const [time, setTime] = useState(0)
  const [timerOn, setTimerOn] = useState(false)
  const [firstMove, setFirstMove] = useState(true)

  useEffect(() => {
    let interval: number | undefined
    if (timerOn && gameState === 'playing') {
      interval = window.setInterval(() => setTime(t => t + 1), 1000)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [timerOn, gameState])

  const resetGame = () => {
    setBoard(createBoard())
    setGameState('playing')
    setFlagCount(0)
    setTime(0)
    setTimerOn(false)
    setFirstMove(true)
  }

  const revealCell = (r: number, c: number) => {
    if (gameState !== 'playing') return
    let currentBoard = board
    if (firstMove) {
      currentBoard = createBoard([r, c])
      setFirstMove(false)
    }

    const cell = currentBoard[r][c]
    if (cell.revealed || cell.flagged) return
    if (!timerOn) setTimerOn(true)

    if (cell.mine) {
      const newBoard = currentBoard.map(row => row.map(cell => ({ ...cell })))
      newBoard[r][c].revealed = true
      for (let i = 0; i < BOARD_SIZE; i++) {
        for (let j = 0; j < BOARD_SIZE; j++) {
          if (newBoard[i][j].mine && !newBoard[i][j].flagged) newBoard[i][j].revealed = true
        }
      }
      setBoard(newBoard)
      setGameState('lost')
      setTimerOn(false)
      return
    }

    const newBoard = floodFill(currentBoard, r, c)
    setBoard(newBoard)

    let unrevealed = 0
    for (let i = 0; i < BOARD_SIZE; i++) {
      for (let j = 0; j < BOARD_SIZE; j++) {
        if (!newBoard[i][j].revealed && !newBoard[i][j].mine) unrevealed++
      }
    }
    if (unrevealed === 0) {
      setGameState('won')
      setTimerOn(false)
    }
  }

  const toggleFlag = (e: React.MouseEvent, r: number, c: number) => {
    e.preventDefault()
    if (gameState !== 'playing' || board[r][c].revealed) return
    const newBoard = board.map(row => row.map(cell => ({ ...cell })))
    newBoard[r][c].flagged = !newBoard[r][c].flagged
    setBoard(newBoard)
    setFlagCount(flagCount + (newBoard[r][c].flagged ? 1 : -1))
  }

  const getCellContent = (cell: Cell) => {
    if (cell.flagged) return <Flag size={15} />
    if (!cell.revealed) return ''
    if (cell.mine) return <Bomb size={15} />
    if (cell.adjacent === 0) return ''
    return cell.adjacent
  }

  const getCellColor = (adjacent: number): string => {
    const colors: Record<number, string> = {
      1: '#5AC05A', 2: '#6B8DD6', 3: '#E85454',
      4: '#B06BC4', 5: '#C49A6C', 6: '#5ABCB8',
      7: '#4A4540', 8: '#7A746C',
    }
    return colors[adjacent] || 'var(--color-text)'
  }

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--color-window-bg)',
      gap: 16,
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        width: '100%',
        maxWidth: 360,
        padding: '0 8px',
        fontSize: 14,
        fontFamily: 'var(--font-mono)',
      }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Flag size={13} /> {flagCount}/{TOTAL_MINES}</span>
        {gameState === 'won' && <span style={{ color: 'var(--color-btn-maximize)', display: 'inline-flex', alignItems: 'center', gap: 4 }}><Trophy size={14} /> You win!</span>}
        {gameState === 'lost' && <span style={{ color: 'var(--color-btn-close)', display: 'inline-flex', alignItems: 'center', gap: 4 }}><Bomb size={14} /> Game over</span>}
        {gameState === 'playing' && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Clock size={13} /> {formatTime(time)}</span>}
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${BOARD_SIZE}, 36px)`,
        gap: 2,
        padding: 8,
        background: 'var(--color-titlebar)',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-md)',
      }}>
        {board.map((row, i) =>
          row.map((cell, j) => (
            <button
              key={`${i}-${j}`}
              onClick={() => revealCell(i, j)}
              onContextMenu={e => toggleFlag(e, i, j)}
              style={{
                width: 36,
                height: 36,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 16,
                fontWeight: 700,
                fontFamily: 'var(--font-mono)',
                borderRadius: 'var(--radius-sm)',
                cursor: gameState !== 'playing' && cell.revealed ? 'default' : 'pointer',
                background: cell.revealed
                  ? cell.mine ? 'var(--color-btn-close)' : 'var(--color-surface)'
                  : 'var(--color-accent)',
                color: cell.revealed && !cell.mine ? getCellColor(cell.adjacent) : 'var(--color-surface)',
                boxShadow: cell.revealed ? 'none' : 'var(--shadow-sm)',
                transition: 'all 80ms ease',
                border: cell.flagged ? '2px solid var(--color-accent)' : 'none',
                padding: 0,
              }}
            >
              {getCellContent(cell)}
            </button>
          ))
        )}
      </div>

      <button
        onClick={resetGame}
        style={{
          padding: '8px 24px',
          border: 'none',
          borderRadius: 'var(--radius-md)',
          background: 'var(--color-accent)',
          color: '#fff',
          fontSize: 14,
          cursor: 'pointer',
        }}
      >
        {gameState === 'playing' ? 'New Game' : 'Play Again'}
      </button>
    </div>
  )
}
