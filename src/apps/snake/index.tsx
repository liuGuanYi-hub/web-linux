import { useCallback, useEffect, useRef, useState } from 'react'
import { PlayCircle } from 'lucide-react'

const CELL_SIZE = 16
const GRID_W = 30
const GRID_H = 20
const INITIAL_SPEED = 120

type Direction = 'up' | 'down' | 'left' | 'right'
type Position = { x: number; y: number }
type GameState = 'playing' | 'paused' | 'gameover'

function randomFood(snake: Position[]): Position {
  let food: Position
  do {
    food = {
      x: Math.floor(Math.random() * GRID_W),
      y: Math.floor(Math.random() * GRID_H),
    }
  } while (snake.some(segment => segment.x === food.x && segment.y === food.y))
  return food
}

export function SnakeGame() {
  const initialHead = { x: Math.floor(GRID_W / 2), y: Math.floor(GRID_H / 2) }
  const [snake, setSnake] = useState<Position[]>([initialHead])
  const [food, setFood] = useState<Position>(() => randomFood([initialHead]))
  const [direction, setDirection] = useState<Direction>('right')
  const [nextDirection, setNextDirection] = useState<Direction>('right')
  const [gameState, setGameState] = useState<GameState>('paused')
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(() => parseInt(localStorage.getItem('snake-highscore') || '0'))
  const [speed, setSpeed] = useState(INITIAL_SPEED)
  const [showOverlay, setShowOverlay] = useState(true)
  const intervalRef = useRef<number | null>(null)
  const bestScore = Math.max(highScore, score)

  const startGame = useCallback(() => {
    const head = { x: Math.floor(GRID_W / 2), y: Math.floor(GRID_H / 2) }
    setHighScore(current => Math.max(current, score))
    setSnake([head])
    setFood(randomFood([head]))
    setDirection('right')
    setNextDirection('right')
    setScore(0)
    setSpeed(INITIAL_SPEED)
    setGameState('playing')
    setShowOverlay(false)
  }, [score])

  const moveSnake = useCallback(() => {
    if (gameState !== 'playing') return

    setDirection(nextDirection)
    setSnake(current => {
      const head = { ...current[0] }
      if (nextDirection === 'up') head.y -= 1
      if (nextDirection === 'down') head.y += 1
      if (nextDirection === 'left') head.x -= 1
      if (nextDirection === 'right') head.x += 1

      const hitWall = head.x < 0 || head.x >= GRID_W || head.y < 0 || head.y >= GRID_H
      const hitSelf = current.some(segment => segment.x === head.x && segment.y === head.y)
      if (hitWall || hitSelf) {
        setGameState('gameover')
        return current
      }

      const nextSnake = [head, ...current]
      if (head.x === food.x && head.y === food.y) {
        setScore(currentScore => currentScore + 10)
        setFood(randomFood(nextSnake))
        setSpeed(currentSpeed => Math.max(50, currentSpeed - 2))
      } else {
        nextSnake.pop()
      }

      return nextSnake
    })
  }, [nextDirection, food, gameState])

  useEffect(() => {
    if (gameState === 'playing') {
      intervalRef.current = window.setInterval(moveSnake, speed)
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [gameState, speed, moveSnake])

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (gameState === 'gameover') return
      const dirMap: Record<string, Direction> = {
        ArrowUp: 'up',
        ArrowDown: 'down',
        ArrowLeft: 'left',
        ArrowRight: 'right',
        w: 'up',
        s: 'down',
        a: 'left',
        d: 'right',
      }
      const dir = dirMap[event.key]
      if (!dir) return
      event.preventDefault()

      const opposites: Record<Direction, Direction> = { up: 'down', down: 'up', left: 'right', right: 'left' }
      if (opposites[dir] === direction) return

      if (gameState === 'paused' && showOverlay) startGame()

      setNextDirection(dir)
      if (gameState === 'paused') {
        setGameState('playing')
        setShowOverlay(false)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [direction, gameState, showOverlay, startGame])

  useEffect(() => {
    if (gameState === 'gameover' && score > highScore) {
      localStorage.setItem('snake-highscore', String(score))
    }
  }, [gameState, score, highScore])

  const containerW = CELL_SIZE * GRID_W + 2
  const containerH = CELL_SIZE * GRID_H + 2

  return (
    <div className="game-shell snake-game">
      <div className="game-scorebar">
        <span>Score: <strong>{score}</strong></span>
        <span>Best: <strong>{bestScore}</strong></span>
      </div>

      <div className="snake-board" style={{ width: containerW, height: containerH }}>
        <div
          className="snake-food"
          style={{
            left: food.x * CELL_SIZE + 1,
            top: food.y * CELL_SIZE + 1,
            width: CELL_SIZE - 2,
            height: CELL_SIZE - 2,
          }}
        />

        {snake.map((segment, index) => (
          <div
            key={`${segment.x}-${segment.y}-${index}`}
            className={`snake-segment ${index === 0 ? 'snake-segment--head' : ''}`}
            style={{
              left: segment.x * CELL_SIZE + 1,
              top: segment.y * CELL_SIZE + 1,
              width: CELL_SIZE - 2,
              height: CELL_SIZE - 2,
              transitionDuration: `${speed * 0.8}ms`,
            }}
          />
        ))}

        {showOverlay && (
          <div onClick={startGame} className="game-overlay game-overlay--interactive">
            <PlayCircle size={40} color="var(--color-accent)" />
            <div className="game-overlay__title">Snake</div>
            <div className="game-overlay__hint">Click or press any arrow key to start</div>
          </div>
        )}

        {gameState === 'gameover' && (
          <div className="game-overlay">
            <div className="game-overlay__title game-overlay__title--danger">Game Over</div>
            <div className="game-overlay__hint">Score: {score}</div>
            <button type="button" onClick={startGame} className="game-button">Play Again</button>
          </div>
        )}
      </div>

      <div className="game-help">Arrow Keys or WASD to move</div>
    </div>
  )
}
