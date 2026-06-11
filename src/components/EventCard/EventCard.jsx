import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MEMBERS } from '../../data/members'

import { togglePresence, updateEventStatus, deleteEvent } from '../../hooks/useEvents'
import MemberAvatar from '../MemberAvatar/MemberAvatar'
import CommentSection from '../CommentSection/CommentSection'
import styles from './EventCard.module.css'
import confetti from 'canvas-confetti'

const STATUS_LABELS = {
  ideia:      { label: '💡 Ideia' },
  confirmado: { label: '✅ Confirmado' },
  cancelado:  { label: '❌ Cancelado' },
  aconteceu:  { label: '🎉 Aconteceu!' },
}

export default function EventCard({ event, currentMember }) {
  const [expanded, setExpanded] = useState(false)
  const [bouncingMember, setBouncingMember] = useState(null)
  const [confirmingCancel, setConfirmingCancel] = useState(false)

  const members = MEMBERS
  const confirmedIds = (event.presences || []).map((p) => p.member_id)
  const allConfirmed = confirmedIds.length === MEMBERS.length
  const isCreator = currentMember?.id === event.created_by
  const isCanceled = event.status === 'cancelado'

  const handlePresence = async (member) => {
    if (!currentMember || isCanceled) return
    if (member.id !== currentMember.id) return

    const isPresent = confirmedIds.includes(member.id)
    await togglePresence(event.id, member.id, isPresent)

    if (!isPresent) {
      setBouncingMember(member.id)
      setTimeout(() => setBouncingMember(null), 600)

      // Auto-confirmar quando todos votarem
      const newCount = confirmedIds.length + 1
      if (newCount === MEMBERS.length) {
        confetti({
          particleCount: 150,
          spread: 90,
          origin: { y: 0.6 },
          colors: MEMBERS.map((m) => m.color),
        })
        // Auto-confirma o status se ainda era "ideia"
        if (event.status === 'ideia') {
          await updateEventStatus(event.id, 'confirmado')
        }
      }
    }
  }

  const handleMarkHappened = async () => {
    await updateEventStatus(event.id, 'aconteceu')
  }

  const handleCancel = async () => {
    await updateEventStatus(event.id, 'cancelado')
    setConfirmingCancel(false)
  }

  const handleReactivate = async () => {
    await updateEventStatus(event.id, 'ideia')
  }

  const timeStr = event.time ? event.time.slice(0, 5) : null

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
          <div className={`${styles.statusBadge} ${styles[`badge_${event.status}`]}`}>
            {STATUS_LABELS[event.status]?.label}
          </div>
          <h3 className={`${styles.title} ${isCanceled ? styles.titleCanceled : ''}`}>
            {event.title}
          </h3>
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

      {/* Presence strip */}
      {!isCanceled && (
        <div className={styles.presenceStrip}>
          {members.map((member) => {
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
      )}

      {isCanceled && (
        <div className={styles.canceledBanner}>😔 Este rolê foi cancelado</div>
      )}

      {allConfirmed && !isCanceled && (
        <motion.div
          className={styles.allIn}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 500 }}
        >
          🎊 Todo mundo vai!!
        </motion.div>
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
                {/* Marcar como aconteceu */}
                {event.status === 'confirmado' && isCreator && (
                  <button className={styles.advanceBtn} onClick={handleMarkHappened}>
                    🎉 Marcar como aconteceu
                  </button>
                )}

                {/* Confirmar manualmente se ainda é ideia */}
                {event.status === 'ideia' && isCreator && (
                  <button className={styles.advanceBtn} onClick={() => updateEventStatus(event.id, 'confirmado')}>
                    ✅ Confirmar rolê
                  </button>
                )}

                {/* Reativar se cancelado */}
                {isCanceled && isCreator && (
                  <button className={styles.reactivateBtn} onClick={handleReactivate}>
                    🔄 Reativar rolê
                  </button>
                )}

                {/* Cancelar */}
                {!isCanceled && isCreator && event.status !== 'aconteceu' && (
                  <>
                    {confirmingCancel ? (
                      <div className={styles.confirmCancel}>
                        <span>Tem certeza?</span>
                        <button className={styles.confirmYes} onClick={handleCancel}>Sim, cancelar</button>
                        <button className={styles.confirmNo} onClick={() => setConfirmingCancel(false)}>Não</button>
                      </div>
                    ) : (
                      <button className={styles.cancelBtn} onClick={() => setConfirmingCancel(true)}>
                        ❌ Cancelar rolê
                      </button>
                    )}
                  </>
                )}

                {/* Apagar */}
                {isCreator && (
                  <button className={styles.deleteBtn} onClick={() => deleteEvent(event.id)}>
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
