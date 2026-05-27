import { useState, useEffect, useCallback, useRef } from 'react'
import { PlayCircle } from 'lucide-react'

const CELL_SIZE = 16
const GRID_W = 30
const GRID_H = 20
const INITIAL_SPEED = 120

type Direction = 'up' | 'down' | 'left' | 'right'
type Position = { x: number; y: number }

function randomFood(snake: Position[]): Position {
  let food: Position
  do {
    food = {
      x: Math.floor(Math.random() * GRID_W),
      y: Math.floor(Math.random() * GRID_H),
    }
  } while (snake.some(s => s.x === food.x && s.y === food.y))
  return food
}

export function SnakeGame() {
  const [snake, setSnake] = useState<Position[]>([{ x: 15, y: 10 }])
  const [food, setFood] = useState<Position>(() => randomFood([{ x: 15, y: 10 }]))
  const [direction, setDirection] = useState<Direction>('right')
  const [nextDirection, setNextDirection] = useState<Direction>('right')
  const [gameState, setGameState] = useState<'playing' | 'paused' | 'gameover'>('paused')
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(() => parseInt(localStorage.getItem('snake-highscore') || '0'))
  const [speed, setSpeed] = useState(INITIAL_SPEED)
  const [showOverlay, setShowOverlay] = useState(true)
  const intervalRef = useRef<number | null>(null)
  const bestScore = Math.max(highScore, score)

  const startGame = useCallback(() => {
    setHighScore(current => Math.max(current, score))
    const head = { x: Math.floor(GRID_W / 2), y: Math.floor(GRID_H / 2) }
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
    setSnake(prev => {
      const head = { ...prev[0] }
      switch (nextDirection) {
        case 'up': head.y--; break
        case 'down': head.y++; break
        case 'left': head.x--; break
        case 'right': head.x++; break
      }

      // 撞墙
      if (head.x < 0 || head.x >= GRID_W || head.y < 0 || head.y >= GRID_H) {
        setGameState('gameover')
        return prev
      }

      // 撞自己
      if (prev.some(s => s.x === head.x && s.y === head.y)) {
        setGameState('gameover')
        return prev
      }

      const newSnake = [head, ...prev]

      // 吃食物
      if (head.x === food.x && head.y === food.y) {
        setScore(s => s + 10)
        setFood(randomFood(newSnake))
        // 每50分加速
        setSpeed(s => Math.max(50, s - 2))
      } else {
        newSnake.pop()
      }

      return newSnake
    })
  }, [nextDirection, food, gameState])

  // 游戏循环
  useEffect(() => {
    if (gameState === 'playing') {
      intervalRef.current = window.setInterval(moveSnake, speed)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [gameState, speed, moveSnake])

  // 键盘控制
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (gameState === 'gameover') return
      const dirMap: Record<string, Direction> = {
        ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
        w: 'up', s: 'down', a: 'left', d: 'right',
      }
      const dir = dirMap[e.key]
      if (!dir) return
      e.preventDefault()

      // 不能直接掉头
      const opposites: Record<Direction, Direction> = { up: 'down', down: 'up', left: 'right', right: 'left' }
      if (opposites[dir] === direction) return

      if (gameState === 'paused' && showOverlay) {
        startGame()
      }

      setNextDirection(dir)
      if (gameState === 'paused') {
        setGameState('playing')
        setShowOverlay(false)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [direction, gameState, showOverlay, startGame])

  // 结束时保存最高分
  useEffect(() => {
    if (gameState === 'gameover' && score > highScore) {
      localStorage.setItem('snake-highscore', String(score))
    }
  }, [gameState, score, highScore])

  const containerW = CELL_SIZE * GRID_W + 2
  const containerH = CELL_SIZE * GRID_H + 2

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--color-window-bg)', gap: 10 }}>
      {/* 分数 */}
      <div style={{ display: 'flex', gap: 24, fontSize: 14, fontFamily: 'var(--font-mono)' }}>
        <span style={{ color: 'var(--color-text)' }}>Score: <strong>{score}</strong></span>
        <span style={{ color: 'var(--color-text-secondary)' }}>Best: {bestScore}</span>
      </div>

      {/* 游戏区 */}
      <div style={{
        position: 'relative',
        width: containerW,
        height: containerH,
        background: '#1a1a1a',
        borderRadius: 'var(--radius-md)',
        border: '2px solid #333',
        overflow: 'hidden',
      }}>
        {/* 食物 */}
        <div style={{
          position: 'absolute',
          left: food.x * CELL_SIZE + 1,
          top: food.y * CELL_SIZE + 1,
          width: CELL_SIZE - 2,
          height: CELL_SIZE - 2,
          background: '#E85454',
          borderRadius: '50%',
        }} />

        {/* 蛇 */}
        {snake.map((seg, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: seg.x * CELL_SIZE + 1,
              top: seg.y * CELL_SIZE + 1,
              width: CELL_SIZE - 2,
              height: CELL_SIZE - 2,
              background: i === 0 ? '#5AC05A' : '#7ED67D',
              borderRadius: i === 0 ? '4px' : '2px',
              transition: `left ${speed * 0.8}ms linear, top ${speed * 0.8}ms linear`,
            }}
          />
        ))}

        {/* 覆盖层 */}
        {showOverlay && (
          <div
            onClick={startGame}
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(0,0,0,0.75)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              gap: 12,
            }}
          >
            <PlayCircle size={40} color="var(--color-accent)" />
            <div style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>Snake</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', textAlign: 'center' }}>
              Click or press any arrow key to start
            </div>
          </div>
        )}

        {/* 游戏结束 */}
        {gameState === 'gameover' && (
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0,0,0,0.8)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
          }}>
            <div style={{ fontSize: 36, fontWeight: 700, color: '#E85454' }}>Game Over</div>
            <div style={{ fontSize: 16, color: '#fff' }}>Score: {score}</div>
            <button
              onClick={startGame}
              style={{ padding: '10px 24px', borderRadius: 'var(--radius-md)', border: 'none', background: 'var(--color-accent)', color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 600, marginTop: 4 }}
            >
              Play Again
            </button>
          </div>
        )}
      </div>

      {/* 操作提示 */}
      <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
        Arrow Keys or WASD to move
      </div>
    </div>
  )
}
