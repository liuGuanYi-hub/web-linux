import { useState, useCallback } from 'react'
import { Trophy } from 'lucide-react'

type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades'
type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K'

interface Card {
  suit: Suit
  rank: Rank
  faceUp: boolean
  id: string
}

const SUITS: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades']
const RANKS: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']

function createDeck(): Card[] {
  const deck: Card[] = []
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ suit, rank, faceUp: false, id: `${rank}-${suit}` })
    }
  }
  return shuffle(deck)
}

function shuffle(deck: Card[]): Card[] {
  const d = [...deck]
  for (let i = d.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [d[i], d[j]] = [d[j], d[i]]
  }
  return d
}

function canStack(c1: Card, c2: Card): boolean {
  const red = ['hearts', 'diamonds']
  const isRed = (s: Suit) => red.includes(s)
  if (isRed(c1.suit) === isRed(c2.suit)) return false
  const order = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']
  return order.indexOf(c1.rank) === order.indexOf(c2.rank) + 1
}

function getSuitSymbol(suit: Suit): string {
  const m: Record<Suit, string> = { hearts: '♥', diamonds: '♦', clubs: '♣', spades: '♠' }
  return m[suit]
}

function getSuitColor(suit: Suit): string {
  return ['hearts', 'diamonds'].includes(suit) ? '#E85454' : '#4A4540'
}

function dealGame() {
  const deck = createDeck()
  const tableau: Card[][] = []
  for (let i = 0; i < 7; i++) {
    const pile = deck.splice(0, i + 1)
    pile[i].faceUp = true
    tableau.push(pile)
  }
  return { tableau, stock: deck }
}

export function SolitaireGame() {
  const [{ tableau: initialTableau, stock: initialStock }] = useState(dealGame)
  const [tableau, setTableau] = useState<Card[][]>(initialTableau)
  const [stock, setStock] = useState<Card[]>(initialStock)
  const [waste, setWaste] = useState<Card[]>([])
  const [foundations, setFoundations] = useState<Record<Suit, Card[]>>({ hearts: [], diamonds: [], clubs: [], spades: [] })
  const [selected, setSelected] = useState<{ pile: number; index: number } | null>(null)
  const [moves, setMoves] = useState(0)
  const won = Object.values(foundations).flat().length === 52

  const init = useCallback(() => {
    const game = dealGame()
    setTableau(game.tableau)
    setStock(game.stock)
    setWaste([])
    setFoundations({ hearts: [], diamonds: [], clubs: [], spades: [] })
    setSelected(null)
    setMoves(0)
  }, [])

  const drawFromStock = () => {
    if (stock.length === 0) {
      if (waste.length > 0) {
        setStock(waste.reverse().map(c => ({ ...c, faceUp: false })))
        setWaste([])
      }
    } else {
      const card = { ...stock[0], faceUp: true }
      setWaste([card, ...waste])
      setStock(stock.slice(1))
      setSelected(null)
      setMoves(m => m + 1)
    }
  }

  const canMoveToFoundation = (card: Card, suit: Suit): boolean => {
    const f = foundations[suit]
    if (card.suit !== suit) return false
    if (f.length === 0) return card.rank === 'A'
    const top = f[f.length - 1]
    const order = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']
    return order.indexOf(card.rank) === order.indexOf(top.rank) + 1
  }

  const moveToFoundation = (pileIdx: number, cardIdx: number, suit: Suit) => {
    const card = tableau[pileIdx][cardIdx]
    if (!card.faceUp || !canMoveToFoundation(card, suit)) return
    const newT = tableau.map((p, i) => {
      if (i !== pileIdx) return p
      const np = [...p]
      if (cardIdx > 0) np[cardIdx - 1] = { ...np[cardIdx - 1], faceUp: true }
      return np.slice(0, cardIdx)
    })
    setTableau(newT)
    setFoundations({ ...foundations, [suit]: [...foundations[suit], card] })
    setSelected(null)
    setMoves(m => m + 1)
  }

  const handleCardClick = (pileIdx: number, cardIdx: number) => {
    if (won) return
    const card = tableau[pileIdx][cardIdx]
    if (!card.faceUp) return

    if (selected) {
      const { pile, index } = selected
      if (pile === pileIdx && index === cardIdx) {
        setSelected(null)
        return
      }
      const fromCard = tableau[pile][index]
      if (canStack(fromCard, card)) {
        const newT = tableau.map((p, i) => {
          if (i === pile) return p.slice(0, index)
          if (i === pileIdx) return [...p, ...tableau[pile].slice(index)]
          return p
        })
        setTableau(newT)
        setSelected(null)
        setMoves(m => m + 1)
        return
      }
    }
    setSelected({ pile: pileIdx, index: cardIdx })
  }

  const handleFoundationClick = (suit: Suit) => {
    if (!selected || won) return
    const { pile, index } = selected
    const card = tableau[pile][index]
    if (canMoveToFoundation(card, suit)) {
      moveToFoundation(pile, index, suit)
    }
  }

  const cardStyle = (card: Card, faceUp: boolean): React.CSSProperties => ({
    width: 44,
    height: 64,
    borderRadius: 6,
    border: '1px solid #C8C0B5',
    background: faceUp ? '#fff' : '#6B8DD6',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: card.rank === '10' ? 11 : 14,
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
    position: 'relative',
    transition: 'transform 100ms ease',
    fontFamily: 'var(--font-mono)',
  })

  const renderCard = (card: Card | null, faceUp?: boolean, onClick?: () => void) => {
    if (!card) return <div style={{ width: 44, height: 64, borderRadius: 6, border: '1px dashed #C8C0B5' }} />
    const up = faceUp !== undefined ? faceUp : card.faceUp
    return (
      <div style={cardStyle(card, up)} onClick={onClick}>
        {up ? (
          <>
            <span style={{ position: 'absolute', top: 2, left: 4, fontSize: 11, color: getSuitColor(card.suit) }}>{card.rank}</span>
            <span style={{ fontSize: 20, color: getSuitColor(card.suit) }}>{getSuitSymbol(card.suit)}</span>
            <span style={{ position: 'absolute', bottom: 2, right: 4, fontSize: 11, color: getSuitColor(card.suit), transform: 'rotate(180deg)' }}>{card.rank}</span>
          </>
        ) : (
          <span style={{ fontSize: 10, color: '#fff', letterSpacing: 1 }}>WEB</span>
        )}
      </div>
    )
  }

  return (
    <div style={{ width: '100%', height: '100%', background: '#2a5a2a', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 12, gap: 10, overflow: 'auto', fontFamily: 'var(--font-mono)' }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: 4 }}>
          <div onClick={drawFromStock} style={{ cursor: 'pointer' }}>
            {renderCard(stock[0] || null, false)}
          </div>
          <div>
            {renderCard(waste[0] || null, true)}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ color: '#fff', fontSize: 12 }}>Moves: {moves}</span>
          <button onClick={init} style={{ padding: '4px 12px', borderRadius: 6, border: 'none', background: '#C49A6C', color: '#fff', cursor: 'pointer', fontSize: 12 }}>New Game</button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        {SUITS.map(suit => (
          <div
            key={suit}
            onClick={() => handleFoundationClick(suit)}
            style={{
              width: 44, height: 64, borderRadius: 6, border: '2px dashed rgba(255,255,255,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: selected ? 'pointer' : 'default',
              background: foundations[suit].length > 0 ? '#fff' : 'rgba(255,255,255,0.1)',
            }}
          >
            {foundations[suit].length > 0 && (
              <span style={{ fontSize: 20 }}>{getSuitSymbol(suit)}</span>
            )}
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 6 }}>
        {tableau.map((pile, pi) => (
          <div key={pi} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {pile.map((card, ci) => {
              const isSelected = selected?.pile === pi && selected?.index === ci
              return (
                <div
                  key={card.id}
                  onClick={() => handleCardClick(pi, ci)}
                  style={{
                    transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                    outline: isSelected ? '2px solid #F5C842' : 'none',
                    outlineOffset: 2,
                    borderRadius: 6,
                  }}
                >
                  {renderCard(card, card.faceUp)}
                </div>
              )
            })}
          </div>
        ))}
      </div>

      {won && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, borderRadius: 12 }}>
          <Trophy size={48} color="#F5C842" />
          <div style={{ fontSize: 28, fontWeight: 700, color: '#fff' }}>You Won!</div>
          <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14 }}>Moves: {moves}</div>
          <button onClick={init} style={{ padding: '10px 24px', borderRadius: 8, border: 'none', background: '#5AC05A', color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>Play Again</button>
        </div>
      )}
    </div>
  )
}
