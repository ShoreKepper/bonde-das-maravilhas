import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useEvents } from './hooks/useEvents'
import { useMember } from './hooks/useMember'
import { MEMBERS } from './data/members'
import Calendar from './components/Calendar/Calendar'
import MemberAvatar from './components/MemberAvatar/MemberAvatar'
import {
  MemberSelectModal,
  DayModal,
  AddEventModal,
} from './components/Modals/Modals'
import './styles/global.css'
import styles from './App.module.css'

export default function App() {
  const today = new Date()
  const [year, setYear]       = useState(today.getFullYear())
  const [month, setMonth]     = useState(today.getMonth())
  const [selectedDay, setSelectedDay] = useState(null)
  const [showAdd, setShowAdd]         = useState(false)

  const { currentMember, selectMember, logout } = useMember()
  const { loading, getEventsForDay, daysWithEvents, fetchEvents } = useEvents(year, month)

  const handleMonthChange = (y, m) => { setYear(y); setMonth(m) }

  const dayEvents = selectedDay ? getEventsForDay(selectedDay) : []

  return (
    <div className={styles.app}>
      {/* Member Select */}
      <AnimatePresence>
        {!currentMember && (
          <MemberSelectModal onSelect={selectMember} />
        )}
      </AnimatePresence>

      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.logo}>Bonde 🎉</h1>
        </div>
        {currentMember && (
          <div className={styles.headerRight}>
            <span className={styles.greeting}>
              Oi, {currentMember.name.split(' ')[0]}!
            </span>
            <MemberAvatar
              member={currentMember}
              size={38}
              onClick={logout}
              selected
            />
          </div>
        )}
      </header>

      {/* Calendar */}
      <main className={styles.main}>
        {loading ? (
          <div className={styles.loading}>
            <div className={styles.spinner} />
          </div>
        ) : (
          <Calendar
            year={year}
            month={month}
            onMonthChange={handleMonthChange}
            daysWithEvents={daysWithEvents}
            onDayClick={(day) => setSelectedDay(day)}
          />
        )}
      </main>

      {/* Legend */}
      <div className={styles.legend}>
        {MEMBERS.map((m) => (
          <div key={m.id} className={styles.legendItem}>
            <div className={styles.legendDot} style={{ background: m.color }} />
            <span>{m.name.split(' ')[0]}</span>
          </div>
        ))}
      </div>

      {/* Day Modal */}
      <AnimatePresence>
        {selectedDay && !showAdd && (
          <DayModal
            day={selectedDay}
            month={month}
            year={year}
            events={dayEvents}
            currentMember={currentMember}
            onClose={() => setSelectedDay(null)}
            onAddEvent={() => setShowAdd(true)}
          />
        )}
      </AnimatePresence>

      {/* Add Event Modal */}
      <AnimatePresence>
        {showAdd && selectedDay && (
          <AddEventModal
            day={selectedDay}
            month={month}
            year={year}
            currentMember={currentMember}
            onClose={() => setShowAdd(false)}
            onAdded={fetchEvents}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
