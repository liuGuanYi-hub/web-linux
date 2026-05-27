import { useState, useCallback } from 'react'
import { Trophy } from 'lucide-react'

type PieceType = 'K' | 'Q' | 'R' | 'B' | 'N' | 'P' | 'k' | 'q' | 'r' | 'b' | 'n' | 'p' | ''
type Board = PieceType[][]

const PIECE_CHARS: Record<string, string> = {
  K: '♔', Q: '♕', R: '♖', B: '♗', N: '♘', P: '♙',
  k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟',
}

function isWhite(p: PieceType) { return p !== '' && p === p.toUpperCase() }

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

function cloneBoard(b: Board): Board {
  return b.map(r => [...r])
}

function findKing(b: Board, white: boolean): [number, number] {
  const k = white ? 'K' : 'k'
  for (let r = 0; r < 8; r++)
    for (let c = 0; c < 8; c++)
      if (b[r][c] === k) return [r, c]
  return [-1, -1]
}

function inBounds(r: number, c: number) { return r >= 0 && r < 8 && c >= 0 && c < 8 }

function getMoves(board: Board, r: number, c: number): [number, number][] {
  const piece = board[r][c]
  if (!piece) return []
  const white = isWhite(piece)
  const moves: [number, number][] = []
  const addIf = (nr: number, nc: number) => {
    if (!inBounds(nr, nc)) return
    const target = board[nr][nc]
    if (target === '') moves.push([nr, nc])
    else if (white !== isWhite(target as PieceType)) moves.push([nr, nc])
  }
  const type = piece.toUpperCase()

  if (type === 'P') {
    const dir = white ? -1 : 1
    if (inBounds(r + dir, c) && board[r + dir][c] === '') {
      moves.push([r + dir, c])
      if ((white && r === 6 || !white && r === 1) && board[r + 2 * dir][c] === '') moves.push([r + 2 * dir, c])
    }
    for (const dc of [-1, 1]) {
      if (inBounds(r + dir, c + dc)) {
        const target = board[r + dir][c + dc]
        if (target && white !== isWhite(target as PieceType)) moves.push([r + dir, c + dc])
      }
    }
  } else if (type === 'N') {
    for (const [dr, dc] of [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]]) {
      const nr = r + dr, nc = c + dc
      if (inBounds(nr, nc) && white !== isWhite(board[nr][nc] as PieceType)) moves.push([nr, nc])
    }
  } else if (type === 'B') {
    for (const [dr, dc] of [[-1,-1],[-1,1],[1,-1],[1,1]]) {
      for (let i = 1; i < 8; i++) {
        const nr = r + dr * i, nc = c + dc * i
        if (!inBounds(nr, nc)) break
        if (board[nr][nc] === '') moves.push([nr, nc])
        else { if (white !== isWhite(board[nr][nc] as PieceType)) moves.push([nr, nc]); break }
      }
    }
  } else if (type === 'R') {
    for (const [dr, dc] of [[-1,0],[1,0],[0,-1],[0,1]]) {
      for (let i = 1; i < 8; i++) {
        const nr = r + dr * i, nc = c + dc * i
        if (!inBounds(nr, nc)) break
        if (board[nr][nc] === '') moves.push([nr, nc])
        else { if (white !== isWhite(board[nr][nc] as PieceType)) moves.push([nr, nc]); break }
      }
    }
  } else if (type === 'Q') {
    for (const [dr, dc] of [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]]) {
      for (let i = 1; i < 8; i++) {
        const nr = r + dr * i, nc = c + dc * i
        if (!inBounds(nr, nc)) break
        if (board[nr][nc] === '') moves.push([nr, nc])
        else { if (white !== isWhite(board[nr][nc] as PieceType)) moves.push([nr, nc]); break }
      }
    }
  } else if (type === 'K') {
    for (let dr = -1; dr <= 1; dr++)
      for (let dc = -1; dc <= 1; dc++)
        if (dr !== 0 || dc !== 0) addIf(r + dr, c + dc)
  }
  return moves
}

function isInCheck(board: Board, white: boolean): boolean {
  const [kr, kc] = findKing(board, white)
  if (kr < 0) return false
  for (let r = 0; r < 8; r++)
    for (let c = 0; c < 8; c++) {
      const p = board[r][c]
      if (p && white !== isWhite(p)) {
        const moves = getMoves(board, r, c)
        if (moves.some(([mr, mc]) => mr === kr && mc === kc)) return true
      }
    }
  return false
}

function getAllMoves(board: Board, white: boolean): { from: [number, number]; to: [number, number] }[] {
  const result: { from: [number, number]; to: [number, number] }[] = []
  for (let r = 0; r < 8; r++)
    for (let c = 0; c < 8; c++) {
      const p = board[r][c]
      if (p && white === isWhite(p)) {
        for (const [mr, mc] of getMoves(board, r, c)) {
          const nb = cloneBoard(board)
          nb[mr][mc] = nb[r][c]
          nb[r][c] = ''
          if (!isInCheck(nb, white)) result.push({ from: [r, c], to: [mr, mc] })
        }
      }
    }
  return result
}

function aiMove(board: Board): Board {
  const moves = getAllMoves(board, false)
  if (moves.length === 0) return board
  const move = moves[Math.floor(Math.random() * moves.length)]
  const nb = cloneBoard(board)
  nb[move.to[0]][move.to[1]] = nb[move.from[0]][move.from[1]]
  nb[move.from[0]][move.from[1]] = ''
  return nb
}

export function ChessGame() {
  const [board, setBoard] = useState<Board>(() => cloneBoard(INIT_BOARD))
  const [selected, setSelected] = useState<[number, number] | null>(null)
  const [turn, setTurn] = useState<'white' | 'black'>('white')
  const [status, setStatus] = useState('')
  const [gameOver, setGameOver] = useState(false)
  const [moveHistory, setMoveHistory] = useState<string[]>([])

  const checkGameOver = useCallback((b: Board, whiteTurn: boolean) => {
    const moves = getAllMoves(b, whiteTurn)
    if (moves.length === 0) {
      setGameOver(true)
      setStatus(whiteTurn ? 'Black wins!' : 'White wins!')
    }
  }, [])

  const handleClick = (r: number, c: number) => {
    if (gameOver || turn === 'black') return
    if (!selected) {
      const p = board[r][c]
      if (p && isWhite(p)) {
        const moves = getMoves(board, r, c).filter(([mr, mc]) => {
          const nb = cloneBoard(board)
          nb[mr][mc] = nb[r][c]
          nb[r][c] = ''
          return !isInCheck(nb, true)
        })
        if (moves.length > 0) {
          setSelected([r, c])
        }
      }
      return
    }

    const [sr, sc] = selected
    if (sr === r && sc === c) { setSelected(null); return }

    const moves = getMoves(board, sr, sc).filter(([mr, mc]) => {
      const nb = cloneBoard(board)
      nb[mr][mc] = nb[sr][sc]
      nb[sr][sc] = ''
      return !isInCheck(nb, true)
    })

    if (moves.some(([mr, mc]) => mr === r && mc === c)) {
      const nb = cloneBoard(board)
      nb[r][c] = nb[sr][sc]
      nb[sr][sc] = ''
      const piece = nb[r][c]
      const notation = `${piece}${(String.fromCharCode(97 + sc))}${8 - sr}→${String.fromCharCode(97 + c)}${8 - r}`
      setMoveHistory(h => [...h, notation])
      setBoard(nb)
      setSelected(null)
      const opponentMoves = getAllMoves(nb, false)
      if (opponentMoves.length === 0) {
        setGameOver(true)
        setStatus('White wins!')
        return
      }
      if (isInCheck(nb, false)) setStatus('Check!')
      else setStatus('')
      setTurn('black')
      setTimeout(() => {
        const aiBoard = aiMove(nb)
        setBoard(aiBoard)
        setTurn('white')
        if (isInCheck(aiBoard, true)) setStatus('Check!')
        else setStatus('')
        checkGameOver(aiBoard, false)
      }, 400)
    } else {
      const p = board[r][c]
      if (p && isWhite(p)) {
        const moves = getMoves(board, r, c).filter(([mr, mc]) => {
          const nb = cloneBoard(board)
          nb[mr][mc] = nb[r][c]
          nb[r][c] = ''
          return !isInCheck(nb, true)
        })
        if (moves.length > 0) setSelected([r, c])
        else setSelected(null)
      } else {
        setSelected(null)
      }
    }
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
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#2a2a2a', gap: 12, padding: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>Chess</span>
        <span style={{ fontSize: 14, color: turn === 'white' ? '#fff' : '#aaa' }}>
          {turn === 'white' ? 'White' : 'Black'}'s turn
        </span>
        {status && <span style={{ fontSize: 14, color: '#F5C842' }}>{status}</span>}
      </div>

      {/* Board */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 0, border: '3px solid #8B7355', borderRadius: 4, overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.4)' }}>
        {board.map((row, ri) =>
          row.map((piece, ci) => {
            const isLight = (ri + ci) % 2 === 0
            const isSelected = selected?.[0] === ri && selected?.[1] === ci
            return (
              <div
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
                }}
              >
                {piece ? PIECE_CHARS[piece] : ''}
              </div>
            )
          })
        )}
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={reset} style={{ padding: '6px 16px', borderRadius: 6, border: 'none', background: '#C49A6C', color: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>New Game</button>
        <div style={{ fontSize: 11, color: '#888', alignSelf: 'center' }}>
          {moveHistory.length > 0 ? `Moves: ${moveHistory.length}` : ''}
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
