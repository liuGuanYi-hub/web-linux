import { useState, useCallback } from 'react'
import { Trophy, X } from 'lucide-react'

const SIZE = 9
const BOX = 3

type Cell = { value: number; given: boolean; notes: number[]; selected: boolean }
type DisplayCell = Cell & { highlighted: boolean; sameNum: boolean }

function createBoard(): Cell[][] {
  const board: Cell[][] = Array(SIZE).fill(null).map(() =>
    Array(SIZE).fill(null).map(() => ({ value: 0, given: false, notes: [], selected: false }))
  )
  // Generate a valid Sudoku (simple backtracking)
  const solve = (b: number[][]): boolean => {
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        if (b[r][c] === 0) {
          const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5)
          for (const n of nums) {
            if (isValid(b, r, c, n)) {
              b[r][c] = n
              if (solve(b)) return true
              b[r][c] = 0
            }
          }
          return false
        }
      }
    }
    return true
  }
  const numBoard: number[][] = Array(SIZE).fill(null).map(() => Array(SIZE).fill(0))
  solve(numBoard)

  // Remove some numbers to create puzzle (keep ~35-40)
  const removed: boolean[][] = Array(SIZE).fill(null).map(() => Array(SIZE).fill(false))
  let count = 0
  while (count < 45) {
    const r = Math.floor(Math.random() * SIZE)
    const c = Math.floor(Math.random() * SIZE)
    if (!removed[r][c]) {
      removed[r][c] = true
      count++
    }
  }

  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (!removed[r][c]) {
        board[r][c] = { value: numBoard[r][c], given: true, notes: [], selected: false }
      }
    }
  }
  return board
}

function isValid(board: number[][], row: number, col: number, num: number): boolean {
  for (let c = 0; c < SIZE; c++) if (board[row][c] === num) return false
  for (let r = 0; r < SIZE; r++) if (board[r][col] === num) return false
  const br = Math.floor(row / BOX) * BOX
  const bc = Math.floor(col / BOX) * BOX
  for (let r = br; r < br + BOX; r++)
    for (let c = bc; c < bc + BOX; c++)
      if (board[r][c] === num) return false
  return true
}

function checkComplete(board: Cell[][]): boolean {
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++)
      if (board[r][c].value === 0) return false
  return true
}

export function SudokuGame() {
  const [board, setBoard] = useState(() => createBoard())
  const [selected, setSelected] = useState<[number, number] | null>(null)
  const [error, setError] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium')

  const reset = useCallback(() => {
    setBoard(createBoard())
    setSelected(null)
    setError(false)
    setCompleted(false)
  }, [])

  const toggleNote = (r: number, c: number, num: number) => {
    if (board[r][c].given || board[r][c].value !== 0) return
    const notes = board[r][c].notes.includes(num)
      ? board[r][c].notes.filter(n => n !== num)
      : [...board[r][c].notes, num]
    const nb = board.map(row => row.map(cell => ({ ...cell })))
    nb[r][c].notes = notes
    setBoard(nb)
  }

  const setValue = (r: number, c: number, num: number) => {
    if (board[r][c].given) return
    const nb = board.map(row => row.map(cell => ({ ...cell })))
    nb[r][c].value = num
    nb[r][c].notes = []
    setBoard(nb)

    if (num !== 0) {
      // Check if valid
      const testBoard = board.map(row => row.map(cell => cell.value))
      testBoard[r][c] = num
      if (!isValid(testBoard, r, c, num)) {
        setError(true)
        setTimeout(() => setError(false), 800)
      } else {
        setError(false)
        if (checkComplete(nb)) setCompleted(true)
      }
    }
  }

  const highlightRelated = (): DisplayCell[][] => {
    if (!selected) {
      return board.map(row => row.map(cell => ({ ...cell, highlighted: false, sameNum: false })))
    }
    const [sr, sc] = selected
    return board.map((row, r) => row.map((cell, c) => ({
      ...cell,
      highlighted: r === sr || c === sc || (Math.floor(r / BOX) === Math.floor(sr / BOX) && Math.floor(c / BOX) === Math.floor(sc / BOX)),
      sameNum: cell.value === board[sr][sc].value && cell.value !== 0,
    })))
  }

  const displayBoard = highlightRelated()

  const getBg = (cell: DisplayCell, r: number, c: number): string => {
    if (cell.given) return '#E8E2D8'
    if (error && selected && selected[0] === r && selected[1] === c) return '#fdd'
    if (cell.selected) return '#C49A6C40'
    if (cell.highlighted) return '#C49A6C20'
    if (cell.sameNum) return '#C49A6C15'
    return '#FEFEFE'
  }

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--color-window-bg)', gap: 12, padding: 12 }}>
      <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-text)' }}>Sudoku</div>

      {/* Difficulty */}
      <div style={{ display: 'flex', gap: 8 }}>
        {(['easy', 'medium', 'hard'] as const).map(d => (
          <button key={d} onClick={() => { setDifficulty(d); reset() }}
            style={{ padding: '4px 12px', borderRadius: 6, border: '1px solid var(--color-window-border)', background: difficulty === d ? 'var(--color-accent)' : 'var(--color-surface)', color: difficulty === d ? '#fff' : 'var(--color-text)', cursor: 'pointer', fontSize: 11, textTransform: 'capitalize' }}>
            {d}
          </button>
        ))}
      </div>

      {/* Board */}
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${SIZE}, 1fr)`, gap: 1, background: '#C8C0B5', padding: 2, borderRadius: 8, border: '2px solid #C8C0B5', boxShadow: 'var(--shadow-md)' }}>
        {displayBoard.map((row, ri) =>
          row.map((cell, ci) => {
            const isSelected = selected?.[0] === ri && selected?.[1] === ci
            return (
              <div
                key={`${ri}-${ci}`}
                onClick={() => {
                  if (cell.given) return
                  setSelected(isSelected ? null : [ri, ci])
                  const nb = board.map(r => r.map(c => ({ ...c, selected: false })))
                  nb[ri][ci].selected = true
                  setBoard(nb)
                }}
                style={{
                  width: 'min(38px, 9vw)',
                  height: 'min(38px, 9vw)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: getBg(cell, ri, ci),
                  border: (ci % BOX === 0 && ci !== 0) || (ri % BOX === 0 && ri !== 0) ? '1px solid #C8C0B5' : 'none',
                  borderRight: ci === SIZE - 1 ? '1px solid #C8C0B5' : 'none',
                  borderBottom: ri === SIZE - 1 ? '1px solid #C8C0B5' : 'none',
                  cursor: cell.given ? 'default' : 'pointer',
                  fontSize: cell.value !== 0 ? 16 : 9,
                  fontWeight: cell.given ? 700 : 500,
                  color: cell.given ? '#4A4540' : '#6B8DD6',
                  fontFamily: 'var(--font-mono)',
                  transition: 'background 100ms',
                }}
              >
                {cell.value !== 0 ? cell.value : cell.notes.length > 0 ? cell.notes.join(' ') : ''}
              </div>
            )
          })
        )}
      </div>

      {/* Number pad */}
      <div style={{ display: 'flex', gap: 6 }}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
          <button
            key={n}
            onClick={() => selected && setValue(selected[0], selected[1], n)}
            style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid var(--color-window-border)', background: 'var(--color-surface)', fontSize: 14, fontWeight: 700, cursor: 'pointer', color: 'var(--color-text)' }}
          >
            {n}
          </button>
        ))}
        <button
          onClick={() => selected && setValue(selected[0], selected[1], 0)}
          style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid var(--color-window-border)', background: 'var(--color-surface)', fontSize: 12, cursor: 'pointer', color: 'var(--color-text-muted)' }}
        >
          <X size={14} />
        </button>
      </div>

      {/* Notes toggle */}
      <div style={{ display: 'flex', gap: 8, fontSize: 11, color: 'var(--color-text-secondary)' }}>
        <button
          onClick={() => { if (selected) toggleNote(selected[0], selected[1], 1) }}
          style={{ padding: '4px 12px', borderRadius: 6, border: '1px solid var(--color-window-border)', background: 'var(--color-surface)', cursor: 'pointer', fontSize: 11, color: 'var(--color-text-secondary)' }}
        >
          Notes: Off
        </button>
        <button onClick={reset} style={{ padding: '4px 12px', borderRadius: 6, border: '1px solid var(--color-window-border)', background: 'var(--color-accent)', color: '#fff', cursor: 'pointer', fontSize: 11 }}>New Game</button>
      </div>

      {completed && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, borderRadius: 12 }}>
          <Trophy size={40} color="#F5C842" />
          <div style={{ fontSize: 24, fontWeight: 700, color: '#fff' }}>Solved!</div>
          <button onClick={reset} style={{ padding: '10px 24px', borderRadius: 8, border: 'none', background: '#5AC05A', color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>Play Again</button>
        </div>
      )}
    </div>
  )
}
