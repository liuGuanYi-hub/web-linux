import { useState } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'

const months = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December']
const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

interface Event {
  date: string
  title: string
  color?: string
}

export function CalendarApp() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [events, setEvents] = useState<Event[]>([
    { date: '2024-01-15', title: 'Meeting with team', color: '#C49A6C' },
    { date: '2024-01-20', title: 'Project deadline', color: '#E85454' },
    { date: '2024-01-28', title: 'Team lunch', color: '#5AC05A' },
  ])
  const [newEventTitle, setNewEventTitle] = useState('')

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1))
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1))
  const goToday = () => setCurrentDate(new Date())

  const formatDateKey = (day: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }

  const getEventsForDate = (day: number): Event[] => {
    const key = formatDateKey(day)
    return events.filter(e => e.date === key)
  }

  const isToday = (day: number) => {
    const today = new Date()
    return today.getFullYear() === year && today.getMonth() === month && today.getDate() === day
  }

  const handleAddEvent = () => {
    if (!selectedDate || !newEventTitle.trim()) return
    setEvents([...events, { date: selectedDate, title: newEventTitle.trim(), color: '#C49A6C' }])
    setNewEventTitle('')
  }

  const handleDeleteEvent = (date: string, title: string) => {
    setEvents(events.filter(e => !(e.date === date && e.title === title)))
  }

  const selectedDateEvents = selectedDate ? events.filter(e => e.date === selectedDate) : []
  const calendarDays: (number | null)[] = []

  for (let i = 0; i < firstDay; i++) calendarDays.push(null)
  for (let d = 1; d <= daysInMonth; d++) calendarDays.push(d)

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', background: 'var(--color-window-bg)' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 16, gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button onClick={prevMonth} style={navBtnStyle} title="Previous month"><ChevronLeft size={16} /></button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 18, fontWeight: 600, color: 'var(--color-text)' }}>
              {months[month]} {year}
            </span>
            <button onClick={goToday} style={{ padding: '2px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-window-border)', background: 'var(--color-surface)', fontSize: 11, cursor: 'pointer' }}>
              Today
            </button>
          </div>
          <button onClick={nextMonth} style={navBtnStyle} title="Next month"><ChevronRight size={16} /></button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
          {weekdays.map(day => (
            <div key={day} style={{ textAlign: 'center', fontSize: 11, fontWeight: 600, color: 'var(--color-text-secondary)', padding: '4px 0' }}>
              {day}
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, flex: 1 }}>
          {calendarDays.map((day, idx) => {
            if (day === null) return <div key={`empty-${idx}`} />
            const dayEvents = getEventsForDate(day)
            const dateKey = formatDateKey(day)
            const isSelected = selectedDate === dateKey
            const isTodayDay = isToday(day)

            return (
              <div
                key={day}
                onClick={() => setSelectedDate(dateKey)}
                style={{
                  borderRadius: 'var(--radius-md)',
                  padding: '4px 6px',
                  minHeight: 50,
                  cursor: 'pointer',
                  background: isSelected ? 'var(--color-accent)' : 'var(--color-surface)',
                  border: isTodayDay ? '2px solid var(--color-accent)' : '1px solid var(--color-window-border)',
                  transition: 'all 100ms ease',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                }}
              >
                <span style={{ fontSize: 14, fontWeight: isTodayDay ? 700 : 400, color: isSelected ? '#fff' : 'var(--color-text)' }}>
                  {day}
                </span>
                <div style={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  {dayEvents.slice(0, 2).map((_, i) => (
                    <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: isSelected ? '#fff' : dayEvents[i]?.color || 'var(--color-accent)' }} />
                  ))}
                  {dayEvents.length > 2 && (
                    <span style={{ fontSize: 8, color: isSelected ? '#fff' : 'var(--color-text-muted)' }}>+{dayEvents.length - 2}</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div style={{ width: 200, background: 'var(--color-titlebar)', borderLeft: '1px solid var(--color-window-border)', padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)' }}>
          {selectedDate || 'Select a date'}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <input
            type="text"
            value={newEventTitle}
            onChange={e => setNewEventTitle(e.target.value)}
            placeholder="New event..."
            style={{ padding: '6px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-window-border)', fontSize: 12, outline: 'none' }}
          />
          <button
            onClick={handleAddEvent}
            disabled={!selectedDate || !newEventTitle.trim()}
            style={{
              padding: '6px 10px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: selectedDate && newEventTitle.trim() ? 'var(--color-accent)' : 'var(--color-window-border)',
              color: '#fff',
              fontSize: 12,
              cursor: selectedDate && newEventTitle.trim() ? 'pointer' : 'not-allowed',
            }}
          >
            Add Event
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {selectedDateEvents.map((ev, i) => (
            <div key={i} style={{ padding: '8px 10px', background: 'var(--color-surface)', borderRadius: 'var(--radius-sm)', borderLeft: `3px solid ${ev.color}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: 'var(--color-text)' }}>{ev.title}</span>
              <button onClick={() => handleDeleteEvent(ev.date, ev.title)} title="Delete event" style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 2 }}><X size={13} /></button>
            </div>
          ))}
          {selectedDateEvents.length === 0 && selectedDate && (
            <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>No events</span>
          )}
        </div>
      </div>
    </div>
  )
}

const navBtnStyle: React.CSSProperties = {
  width: 28, height: 28, borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-window-border)', background: 'var(--color-surface)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12,
}
