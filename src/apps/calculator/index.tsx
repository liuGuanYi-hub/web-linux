import { useState } from 'react'

const operatorLabels = ['/', '*', '-', '+', '=']

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

  const calculate = (left: number, op: string, right: number) => {
    if (op === '+') return left + right
    if (op === '-') return left - right
    if (op === '*') return left * right
    if (op === '/') return right !== 0 ? left / right : 0
    return right
  }

  const operation = (op: string) => {
    const current = parseFloat(display)
    if (expression === '') {
      setExpression(display + ' ' + op)
    } else {
      const parts = expression.split(' ')
      const result = calculate(parseFloat(parts[0]), parts[1], current)
      setExpression(result + ' ' + op)
      setDisplay(String(result))
    }
    setWaitingForOperand(true)
  }

  const equals = () => {
    if (expression === '') return
    const parts = expression.split(' ')
    const result = calculate(parseFloat(parts[0]), parts[1], parseFloat(display))
    setExpression('')
    setDisplay(String(result))
    setWaitingForOperand(true)
  }

  const backspace = () => {
    setDisplay(display.length > 1 ? display.slice(0, -1) : '0')
  }

  const toggleSign = () => {
    setDisplay(String(-parseFloat(display)))
  }

  const percent = () => {
    setDisplay(String(parseFloat(display) / 100))
  }

  const buttons = [
    ['C', '+/-', '%', '/'],
    ['7', '8', '9', '*'],
    ['4', '5', '6', '-'],
    ['1', '2', '3', '+'],
    ['0', '.', '<-', '='],
  ]

  const handleButton = (label: string) => {
    if (label === 'C') clear()
    else if (label === '+/-') toggleSign()
    else if (label === '%') percent()
    else if (label === '=') equals()
    else if (operatorLabels.includes(label)) operation(label)
    else if (label === '.') inputDot()
    else if (label === '<-') backspace()
    else inputDigit(label)
  }

  return (
    <div className="calculator-app">
      <div className="calculator-expression">{expression}</div>

      <div className="calculator-display">
        {display}
      </div>

      <div className="calculator-grid">
        {buttons.flat().map(label => {
          const isOperator = operatorLabels.includes(label)
          const isDanger = label === 'C' || label === '<-'
          const className = [
            'calculator-button',
            isOperator ? 'calculator-button--operator' : '',
            isDanger ? 'calculator-button--danger' : '',
          ].filter(Boolean).join(' ')

          return (
            <button
              key={label}
              type="button"
              onClick={() => handleButton(label)}
              className={className}
            >
              {label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
