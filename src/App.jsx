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
  const [year, setYear]               = useState(today.getFullYear())
  const [month, setMonth]             = useState(today.getMonth())
  const [selectedDay, setSelectedDay] = useState(null)
  const [showAdd, setShowAdd]         = useState(false)
  const [choosingMember, setChoosingMember] = useState(false)

  const { currentMember, selectMember, logout } = useMember()
  const { loading, getEventsForDay, daysWithEvents, fetchEvents } = useEvents(year, month)

  const handleMonthChange = (y, m) => { setYear(y); setMonth(m) }
  const dayEvents = selectedDay ? getEventsForDay(selectedDay) : []

  const handleSelectMember = (member) => {
    selectMember(member)
    setChoosingMember(false)
  }

  const showMemberSelect = !currentMember || choosingMember

  return (
    <div className={styles.app}>

      {/* Member Select overlay */}
      <AnimatePresence>
        {showMemberSelect && (
          <MemberSelectModal onSelect={handleSelectMember} />
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
            <button
              className={styles.switchBtn}
              onClick={() => setChoosingMember(true)}
              title="Trocar perfil"
            >
              Trocar perfil
            </button>
            <MemberAvatar
              member={currentMember}
              size={38}
              selected
            />
          </div>
        )}
      </header>

      {/* Desktop layout wrapper */}
      <div className={styles.desktopLayout}>

        {/* Sidebar — só aparece no desktop */}
        <aside className={styles.sidebar}>
          <p className={styles.sidebarTitle}>Membros</p>
          {MEMBERS.map((m) => {
            const isMe = currentMember?.id === m.id
            return (
              <div
                key={m.id}
                className={`${styles.sidebarMember} ${isMe ? styles.active : ''}`}
                style={{ '--color': m.color }}
              >
                <img
                  src={m.avatar}
                  alt={m.name}
                  className={styles.sidebarAvatar}
                  style={{ borderColor: m.color }}
                />
                <div className={styles.sidebarInfo}>
                  <span className={styles.sidebarName}>{m.name}</span>
                  <span className={styles.sidebarChar}>{m.character}</span>
                </div>
                <div className={styles.sidebarPresenceDot} />
              </div>
            )
          })}
        </aside>

        {/* Main calendar area */}
        <div className={styles.mainArea}>
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
        </div>
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
