import { useState } from 'react'

export function CalculatorApp() {
  const [display, setDisplay] = useState('0')
  const [expression, setExpression] = useState('')
  const [waitingForOperand, setWaitingForOperand] = useState(false)

  const inputDigit = (digit: string) => {
    if (waitingForOperand) {
      setDisplay(digit)
      setWaitingForOperand(false)
    } else {
      setDisplay(display === '0' ? digit : display + digit)
    }
  }

  const inputDot = () => {
    if (waitingForOperand) {
      setDisplay('0.')
      setWaitingForOperand(false)
    } else if (!display.includes('.')) {
      setDisplay(display + '.')
    }
  }

  const clear = () => {
    setDisplay('0')
    setExpression('')
    setWaitingForOperand(false)
  }

  const operation = (op: string) => {
    const current = parseFloat(display)
    if (expression === '') {
      setExpression(display + ' ' + op)
    } else {
      const parts = expression.split(' ')
      const lastOp = parts[1]
      const prev = parseFloat(parts[0])
      let result = 0
      if (lastOp === '+') result = prev + current
      else if (lastOp === '-') result = prev - current
      else if (lastOp === '×') result = prev * current
      else if (lastOp === '÷') result = current !== 0 ? prev / current : 0
      setExpression(result + ' ' + op)
      setDisplay(String(result))
    }
    setWaitingForOperand(true)
  }

  const equals = () => {
    if (expression === '') return
    const parts = expression.split(' ')
    const lastOp = parts[1]
    const prev = parseFloat(parts[0])
    const current = parseFloat(display)
    let result = 0
    if (lastOp === '+') result = prev + current
    else if (lastOp === '-') result = prev - current
    else if (lastOp === '×') result = prev * current
    else if (lastOp === '÷') result = current !== 0 ? prev / current : 0
    setExpression('')
    setDisplay(String(result))
    setWaitingForOperand(true)
  }

  const backspace = () => {
    if (display.length > 1) {
      setDisplay(display.slice(0, -1))
    } else {
      setDisplay('0')
    }
  }

  const toggleSign = () => {
    setDisplay(String(-parseFloat(display)))
  }

  const percent = () => {
    setDisplay(String(parseFloat(display) / 100))
  }

  // 按钮布局
  const buttons = [
    ['C', '±', '%', '÷'],
    ['7', '8', '9', '×'],
    ['4', '5', '6', '-'],
    ['1', '2', '3', '+'],
    ['0', '.', '⌫', '='],
  ]

  const getBtnStyle = (label: string): React.CSSProperties => {
    const isOp = ['÷', '×', '-', '+', '='].includes(label)
    const isWide = label === '0'
    return {
      flex: isWide ? 1 : 1,
      height: 52,
      border: 'none',
      borderRadius: 'var(--radius-md)',
      fontSize: 18,
      fontWeight: isOp ? 600 : 400,
      cursor: 'pointer',
      transition: 'all 100ms ease',
      background: isOp ? 'var(--color-accent)' : 'var(--color-titlebar)',
      color: isOp ? '#fff' : 'var(--color-text)',
    }
  }

  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--color-window-bg)',
      padding: 16,
      gap: 8,
    }}>
      {/* 表达式 */}
      <div style={{
        textAlign: 'right',
        fontSize: 14,
        color: 'var(--color-text-secondary)',
        minHeight: 20,
        fontFamily: 'var(--font-mono)',
      }}>
        {expression}
      </div>

      {/* 显示 */}
      <div style={{
        background: 'var(--color-titlebar)',
        borderRadius: 'var(--radius-md)',
        padding: '16px 20px',
        textAlign: 'right',
        fontSize: 36,
        fontFamily: 'var(--font-mono)',
        color: 'var(--color-text)',
        marginBottom: 8,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}>
        {display}
      </div>

      {/* 按钮 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
        {buttons.map((row, i) => (
          <div key={i} style={{ display: 'flex', gap: 6 }}>
            {row.map(label => (
              <button
                key={label}
                onClick={() => {
                  if (label === 'C') clear()
                  else if (label === '±') toggleSign()
                  else if (label === '%') percent()
                  else if (label === '÷') operation('÷')
                  else if (label === '×') operation('×')
                  else if (label === '-') operation('-')
                  else if (label === '+') operation('+')
                  else if (label === '=') equals()
                  else if (label === '.') inputDot()
                  else if (label === '⌫') backspace()
                  else inputDigit(label)
                }}
                style={getBtnStyle(label)}
                onMouseEnter={e => {
                  if (label === 'C' || label === '⌫') {
                    e.currentTarget.style.background = 'var(--color-btn-close)'
                    e.currentTarget.style.color = '#fff'
                  } else if (['÷', '×', '-', '+', '='].includes(label)) {
                    e.currentTarget.style.background = 'var(--color-accent-hover)'
                  } else {
                    e.currentTarget.style.background = 'var(--color-window-border)'
                  }
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = (['÷', '×', '-', '+', '='].includes(label)) ? 'var(--color-accent)' : 'var(--color-titlebar)'
                  e.currentTarget.style.color = (['÷', '×', '-', '+', '='].includes(label)) ? '#fff' : 'var(--color-text)'
                  if (label === 'C') e.currentTarget.style.background = 'var(--color-titlebar)'
                }}
              >
                {label}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}