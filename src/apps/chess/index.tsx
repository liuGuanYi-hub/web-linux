import { useCallback, useState } from 'react'
import { Trophy } from 'lucide-react'

type PieceType = 'K' | 'Q' | 'R' | 'B' | 'N' | 'P' | 'k' | 'q' | 'r' | 'b' | 'n' | 'p' | ''
type Board = PieceType[][]

const PIECE_CHARS: Record<string, string> = {
  K: '♔', Q: '♕', R: '♖', B: '♗', N: '♘', P: '♙',
  k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟',
}

const INIT_BOARD: Board = [
  ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
  ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
  ['', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', ''],
  ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
  ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R'],
]

function isWhite(piece: PieceType) {
  return piece !== '' && piece === piece.toUpperCase()
}

function cloneBoard(board: Board): Board {
  return board.map(row => [...row])
}

function findKing(board: Board, white: boolean): [number, number] {
  const king = white ? 'K' : 'k'
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (board[r][c] === king) return [r, c]
    }
  }
  return [-1, -1]
}

function inBounds(r: number, c: number) {
  return r >= 0 && r < 8 && c >= 0 && c < 8
}

function getMoves(board: Board, r: number, c: number): [number, number][] {
  const piece = board[r][c]
  if (!piece) return []
  const white = isWhite(piece)
  const moves: [number, number][] = []
  const type = piece.toUpperCase()

  const addIf = (nr: number, nc: number) => {
    if (!inBounds(nr, nc)) return
    const target = board[nr][nc]
    if (target === '' || white !== isWhite(target)) moves.push([nr, nc])
  }

  const addRay = (dr: number, dc: number) => {
    for (let i = 1; i < 8; i++) {
      const nr = r + dr * i
      const nc = c + dc * i
      if (!inBounds(nr, nc)) break
      const target = board[nr][nc]
      if (target === '') {
        moves.push([nr, nc])
      } else {
        if (white !== isWhite(target)) moves.push([nr, nc])
        break
      }
    }
  }

  if (type === 'P') {
    const dir = white ? -1 : 1
    if (inBounds(r + dir, c) && board[r + dir][c] === '') {
      moves.push([r + dir, c])
      if ((white && r === 6 || !white && r === 1) && board[r + 2 * dir][c] === '') moves.push([r + 2 * dir, c])
    }
    for (const dc of [-1, 1]) {
      const target = board[r + dir]?.[c + dc]
      if (target && white !== isWhite(target)) moves.push([r + dir, c + dc])
    }
  } else if (type === 'N') {
    for (const [dr, dc] of [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]]) addIf(r + dr, c + dc)
  } else if (type === 'B') {
    for (const [dr, dc] of [[-1, -1], [-1, 1], [1, -1], [1, 1]]) addRay(dr, dc)
  } else if (type === 'R') {
    for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) addRay(dr, dc)
  } else if (type === 'Q') {
    for (const [dr, dc] of [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]]) addRay(dr, dc)
  } else if (type === 'K') {
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr !== 0 || dc !== 0) addIf(r + dr, c + dc)
      }
    }
  }
  return moves
}

function isInCheck(board: Board, white: boolean): boolean {
  const [kr, kc] = findKing(board, white)
  if (kr < 0) return false
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c]
      if (piece && white !== isWhite(piece) && getMoves(board, r, c).some(([mr, mc]) => mr === kr && mc === kc)) return true
    }
  }
  return false
}

function getAllMoves(board: Board, white: boolean): { from: [number, number]; to: [number, number] }[] {
  const result: { from: [number, number]; to: [number, number] }[] = []
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c]
      if (piece && white === isWhite(piece)) {
        for (const [mr, mc] of getMoves(board, r, c)) {
          const next = cloneBoard(board)
          next[mr][mc] = next[r][c]
          next[r][c] = ''
          if (!isInCheck(next, white)) result.push({ from: [r, c], to: [mr, mc] })
        }
      }
    }
  }
  return result
}

function aiMove(board: Board): Board {
  const moves = getAllMoves(board, false)
  if (moves.length === 0) return board
  const move = moves[Math.floor(Math.random() * moves.length)]
  const next = cloneBoard(board)
  next[move.to[0]][move.to[1]] = next[move.from[0]][move.from[1]]
  next[move.from[0]][move.from[1]] = ''
  return next
}

export function ChessGame() {
  const [board, setBoard] = useState<Board>(() => cloneBoard(INIT_BOARD))
  const [selected, setSelected] = useState<[number, number] | null>(null)
  const [turn, setTurn] = useState<'white' | 'black'>('white')
  const [status, setStatus] = useState('')
  const [gameOver, setGameOver] = useState(false)
  const [moveHistory, setMoveHistory] = useState<string[]>([])

  const checkGameOver = useCallback((nextBoard: Board, whiteTurn: boolean) => {
    if (getAllMoves(nextBoard, whiteTurn).length === 0) {
      setGameOver(true)
      setStatus(whiteTurn ? 'Black wins!' : 'White wins!')
    }
  }, [])

  const handleClick = (r: number, c: number) => {
    if (gameOver || turn === 'black') return
    if (!selected) {
      const piece = board[r][c]
      if (piece && isWhite(piece) && getLegalMoves(board, r, c).length > 0) setSelected([r, c])
      return
    }

    const [sr, sc] = selected
    if (sr === r && sc === c) {
      setSelected(null)
      return
    }

    const moves = getLegalMoves(board, sr, sc)
    if (moves.some(([mr, mc]) => mr === r && mc === c)) {
      const next = cloneBoard(board)
      next[r][c] = next[sr][sc]
      next[sr][sc] = ''
      const notation = `${next[r][c]}${String.fromCharCode(97 + sc)}${8 - sr}->${String.fromCharCode(97 + c)}${8 - r}`
      setMoveHistory(history => [...history, notation])
      setBoard(next)
      setSelected(null)
      if (getAllMoves(next, false).length === 0) {
        setGameOver(true)
        setStatus('White wins!')
        return
      }
      setStatus(isInCheck(next, false) ? 'Check!' : '')
      setTurn('black')
      window.setTimeout(() => {
        const aiBoard = aiMove(next)
        setBoard(aiBoard)
        setTurn('white')
        setStatus(isInCheck(aiBoard, true) ? 'Check!' : '')
        checkGameOver(aiBoard, true)
      }, 400)
      return
    }

    const piece = board[r][c]
    setSelected(piece && isWhite(piece) && getLegalMoves(board, r, c).length > 0 ? [r, c] : null)
  }

  const reset = () => {
    setBoard(cloneBoard(INIT_BOARD))
    setSelected(null)
    setTurn('white')
    setStatus('')
    setGameOver(false)
    setMoveHistory([])
  }

  const getPieceColor = (piece: PieceType) => isWhite(piece) ? '#4A4540' : '#1a1a1a'

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#2a2a2a', gap: 12, padding: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>Chess</span>
        <span style={{ fontSize: 14, color: turn === 'white' ? '#fff' : '#aaa' }}>{turn === 'white' ? 'White' : 'Black'}'s turn</span>
        {status && <span style={{ fontSize: 14, color: '#F5C842' }}>{status}</span>}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 0, border: '3px solid #8B7355', borderRadius: 4, overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.4)' }}>
        {board.map((row, ri) =>
          row.map((piece, ci) => {
            const isLight = (ri + ci) % 2 === 0
            const isSelected = selected?.[0] === ri && selected?.[1] === ci
            return (
              <button
                key={`${ri}-${ci}`}
                onClick={() => handleClick(ri, ci)}
                style={{
                  width: 'min(44px, 10vw)',
                  height: 'min(44px, 10vw)',
                  background: isSelected ? '#C49A6C80' : isLight ? '#E8D5C4' : '#8B7355',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: 28,
                  color: getPieceColor(piece),
                  border: isSelected ? '2px solid #C49A6C' : 'none',
                  padding: 0,
                }}
              >
                {piece ? PIECE_CHARS[piece] : ''}
              </button>
            )
          })
        )}
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={reset} style={{ padding: '6px 16px', borderRadius: 6, border: 'none', background: '#C49A6C', color: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>New Game</button>
        <div style={{ fontSize: 11, color: '#aaa', alignSelf: 'center' }}>
          {moveHistory.length > 0 ? `Moves: ${moveHistory.length}` : 'Play as White'}
        </div>
      </div>

      {gameOver && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, borderRadius: 12 }}>
          <Trophy size={48} color="#F5C842" />
          <div style={{ fontSize: 28, fontWeight: 700, color: '#fff' }}>{status}</div>
          <button onClick={reset} style={{ padding: '10px 24px', borderRadius: 8, border: 'none', background: '#C49A6C', color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>Play Again</button>
        </div>
      )}
    </div>
  )
}

function getLegalMoves(board: Board, r: number, c: number): [number, number][] {
  return getMoves(board, r, c).filter(([mr, mc]) => {
    const next = cloneBoard(board)
    next[mr][mc] = next[r][c]
    next[r][c] = ''
    return !isInCheck(next, true)
  })
}
