import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MEMBERS, getMemberById } from '../../data/members'
import { togglePresence, updateEventStatus, deleteEvent } from '../../hooks/useEvents'
import MemberAvatar from '../MemberAvatar/MemberAvatar'
import CommentSection from '../CommentSection/CommentSection'
import styles from './EventCard.module.css'
import confetti from 'canvas-confetti'

const STATUS_LABELS = {
  ideia:      { label: '💡 Ideia',      next: 'confirmado' },
  confirmado: { label: '✅ Confirmado', next: 'aconteceu' },
  aconteceu:  { label: '🎉 Aconteceu!', next: null },
}

export default function EventCard({ event, currentMember }) {
  const [expanded, setExpanded] = useState(false)
  const [bouncingMember, setBouncingMember] = useState(null)

  const confirmedIds = (event.presences || []).map((p) => p.member_id)
  const allConfirmed = confirmedIds.length === MEMBERS.length

  const handlePresence = async (member) => {
    if (!currentMember) return
    // Só pode marcar/desmarcar a si mesmo
    if (member.id !== currentMember.id) return

    const isPresent = confirmedIds.includes(member.id)
    await togglePresence(event.id, member.id, isPresent)

    if (!isPresent) {
      // Animação de bounce ao confirmar
      setBouncingMember(member.id)
      setTimeout(() => setBouncingMember(null), 600)

      // Confetti se todos confirmaram após essa ação
      const newCount = confirmedIds.length + 1
      if (newCount === MEMBERS.length) {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: MEMBERS.map((m) => m.color),
        })
      }
    }
  }

  const handleAdvanceStatus = async () => {
    const next = STATUS_LABELS[event.status]?.next
    if (next) await updateEventStatus(event.id, next)
  }

  const timeStr = event.time
    ? event.time.slice(0, 5)
    : null

  return (
    <motion.div
      className={`${styles.card} ${styles[`status_${event.status}`]}`}
      layout
      initial={{ opacity: 0, y: 12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
    >
      {/* Header */}
      <div className={styles.header} onClick={() => setExpanded((v) => !v)}>
        <div className={styles.headerLeft}>
          <div className={styles.statusBadge}>
            {STATUS_LABELS[event.status]?.label}
          </div>
          <h3 className={styles.title}>{event.title}</h3>
          <div className={styles.meta}>
            {timeStr && <span>🕐 {timeStr}</span>}
            {event.location && <span>📍 {event.location}</span>}
          </div>
        </div>
        <div className={styles.headerRight}>
          <motion.span
            className={styles.chevron}
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >▼</motion.span>
        </div>
      </div>

      {/* Presence strip — always visible */}
      <div className={styles.presenceStrip}>
        {MEMBERS.map((member) => {
          const isPresent = confirmedIds.includes(member.id)
          const isMe = currentMember?.id === member.id
          return (
            <MemberAvatar
              key={member.id}
              member={member}
              size={36}
              selected={isPresent}
              dimmed={!isPresent && !isMe}
              bounce={bouncingMember === member.id}
              onClick={() => handlePresence(member)}
              showName
            />
          )
        })}
      </div>

      {allConfirmed && (
        <div className={styles.allIn}>🎊 Todo mundo vai!!</div>
      )}

      {/* Expanded content */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="expanded"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            <div className={styles.expandedInner}>
              {event.notes && (
                <p className={styles.notes}>{event.notes}</p>
              )}

              <CommentSection event={event} currentMember={currentMember} />

              {/* Actions */}
              <div className={styles.actions}>
                {STATUS_LABELS[event.status]?.next && (
                  <button className={styles.advanceBtn} onClick={handleAdvanceStatus}>
                    {event.status === 'ideia' ? '✅ Confirmar rolê' : '🎉 Marcar como aconteceu'}
                  </button>
                )}
                {currentMember?.id === event.created_by && (
                  <button
                    className={styles.deleteBtn}
                    onClick={() => deleteEvent(event.id)}
                  >
                    🗑 Apagar
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
