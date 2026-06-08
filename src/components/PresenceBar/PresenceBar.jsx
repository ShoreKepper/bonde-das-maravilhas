import { motion } from 'framer-motion'
import { MEMBERS } from '../../data/members'
import styles from './PresenceBar.module.css'

export default function PresenceBar({ presences = [], size = 20 }) {
  const confirmedIds = presences.map((p) => p.member_id)

  return (
    <div className={styles.bar}>
      {MEMBERS.map((member, i) => {
        const confirmed = confirmedIds.includes(member.id)
        return (
          <motion.div
            key={member.id}
            className={`${styles.slot} ${confirmed ? styles.confirmed : styles.empty}`}
            style={{ '--color': member.color, '--glow': member.colorGlow }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: i * 0.04, type: 'spring', stiffness: 400 }}
            title={confirmed ? `${member.name} vai! ✓` : `${member.name} não confirmou`}
          >
            {confirmed ? (
              <img
                src={member.avatar}
                alt={member.name}
                className={styles.avatarImg}
                style={{ width: size, height: size }}
              />
            ) : (
              <div className={styles.emptyDot} style={{ width: size, height: size }} />
            )}
          </motion.div>
        )
      })}
    </div>
  )
}
