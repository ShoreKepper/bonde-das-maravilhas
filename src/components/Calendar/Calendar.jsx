import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MEMBERS } from '../../data/members'
import styles from './Calendar.module.css'

const MONTHS_PT = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho',
                   'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']
const DAYS_PT   = ['D','S','T','Q','Q','S','S']

function getDaysInMonth(y, m) { return new Date(y, m + 1, 0).getDate() }
function getFirstDay(y, m)    { return new Date(y, m, 1).getDay() }

export default function Calendar({ year, month, onMonthChange, daysWithEvents, onDayClick }) {
  const [direction, setDirection] = useState(0)
  const today = new Date()

  const navigate = (dir) => {
    setDirection(dir)
    let m = month + dir
    let y = year
    if (m < 0)  { m = 11; y-- }
    if (m > 11) { m = 0;  y++ }
    onMonthChange(y, m)
  }

  const daysInMonth = getDaysInMonth(year, month)
  const firstDay    = getFirstDay(year, month)

  const isToday = (day) =>
    day === today.getDate() &&
    month === today.getMonth() &&
    year  === today.getFullYear()

  const variants = {
    enter: (dir) => ({ x: dir > 0 ? '60%' : '-60%', opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit:   (dir) => ({ x: dir > 0 ? '-60%' : '60%', opacity: 0 }),
  }

  return (
    <div className={styles.calendar}>
      {/* Navigation */}
      <div className={styles.nav}>
        <button className={styles.navBtn} onClick={() => navigate(-1)}>‹</button>
        <AnimatePresence mode="wait" custom={direction}>
          <motion.h2
            key={`${year}-${month}`}
            className={styles.monthLabel}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.22, ease: 'easeInOut' }}
          >
            {MONTHS_PT[month]} {year}
          </motion.h2>
        </AnimatePresence>
        <button className={styles.navBtn} onClick={() => navigate(1)}>›</button>
      </div>

      {/* Day headers */}
      <div className={styles.dayHeaders}>
        {DAYS_PT.map((d, i) => (
          <div key={i} className={styles.dayHeader}>{d}</div>
        ))}
      </div>

      {/* Days grid */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={`${year}-${month}-grid`}
          className={styles.grid}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.22, ease: 'easeInOut' }}
        >
          {/* Empty slots */}
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`e${i}`} className={styles.emptyCell} />
          ))}

          {/* Day cells */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1
            const dayEvents = daysWithEvents[day] || []
            const hasEvents = dayEvents.length > 0

            // All presences across all events today
            const allPresences = [...new Set(dayEvents.flatMap(e =>
              (e.presences || []).map(p => p.member_id)
            ))]

            return (
              <motion.button
                key={day}
                className={`${styles.dayCell} ${isToday(day) ? styles.today : ''} ${hasEvents ? styles.hasEvents : ''}`}
                onClick={() => onDayClick(day)}
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.94 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              >
                <span className={styles.dayNum}>{day}</span>

                {hasEvents && (
                  <div className={styles.eventCount}>
                    {dayEvents.length}
                  </div>
                )}

                {/* Mini avatar strip */}
                {allPresences.length > 0 && (
                  <div className={styles.miniAvatars}>
                    {MEMBERS.filter(m => allPresences.includes(m.id))
                            .slice(0, 3)
                            .map(m => (
                      <img
                        key={m.id}
                        src={m.avatar}
                        alt={m.name}
                        className={styles.miniAvatar}
                        style={{ borderColor: m.color }}
                      />
                    ))}
                    {allPresences.length > 3 && (
                      <div className={styles.miniMore}>+{allPresences.length - 3}</div>
                    )}
                  </div>
                )}
              </motion.button>
            )
          })}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
