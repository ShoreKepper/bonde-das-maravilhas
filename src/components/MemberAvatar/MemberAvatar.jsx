import { motion } from 'framer-motion'
import styles from './MemberAvatar.module.css'

export default function MemberAvatar({
  member,
  size = 48,
  onClick,
  selected = false,
  bounce = false,
  showName = false,
  dimmed = false,
}) {
  return (
    <motion.div
      className={`${styles.wrapper} ${selected ? styles.selected : ''} ${dimmed ? styles.dimmed : ''}`}
      style={{
        '--member-color': member.color,
        '--member-glow':  member.colorGlow,
        width:  size,
        height: size,
      }}
      onClick={onClick}
      whileTap={{ scale: 0.9 }}
      animate={bounce ? { y: [0, -10, 0] } : {}}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      title={`${member.name} (${member.character})`}
    >
      <div className={styles.ring}>
        <img
          src={member.avatar}
          alt={member.character}
          className={styles.avatar}
          draggable={false}
        />
      </div>
      {selected && <div className={styles.selectedDot} />}
      {showName && (
        <span className={styles.name}>{member.name.split(' ')[0]}</span>
      )}
    </motion.div>
  )
}
