import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MEMBERS, getMemberById } from '../../data/members'
import { addComment, deleteComment, toggleReaction } from '../../hooks/useEvents'
import styles from './CommentSection.module.css'

const REACTIONS = ['🔥', '😂', '👀', '❤️', '💀', '👏']

export default function CommentSection({ event, currentMember }) {
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [showReactions, setShowReactions] = useState(null) // commentId

  const comments = [...(event.comments || [])].sort(
    (a, b) => new Date(a.created_at) - new Date(b.created_at)
  )

  const handleSend = async () => {
    if (!text.trim() || !currentMember || sending) return
    setSending(true)
    await addComment(event.id, currentMember.id, text.trim())
    setText('')
    setSending(false)
  }

  const handleReaction = async (commentId, emoji) => {
    if (!currentMember) return
    await toggleReaction(commentId, currentMember.id, emoji)
    setShowReactions(null)
  }

  return (
    <div className={styles.section}>
      <p className={styles.label}>
        💬 Comentários {comments.length > 0 && <span className={styles.count}>{comments.length}</span>}
      </p>

      <div className={styles.list}>
        <AnimatePresence initial={false}>
          {comments.map((c) => {
            const member = getMemberById(c.member_id)
            if (!member) return null
            const isOwn = currentMember?.id === c.member_id
            const timeStr = new Date(c.created_at).toLocaleTimeString('pt-BR', {
              hour: '2-digit', minute: '2-digit',
            })

            // Agrupar reações por emoji
            const reactionMap = {}
            ;(c.reactions || []).forEach((r) => {
              if (!reactionMap[r.emoji]) reactionMap[r.emoji] = []
              reactionMap[r.emoji].push(r.member_id)
            })

            return (
              <motion.div
                key={c.id}
                className={styles.commentRow}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <img
                  src={member.avatar}
                  alt={member.name}
                  className={styles.avatar}
                  style={{ borderColor: member.color }}
                />
                <div className={styles.bubble} style={{ '--color': member.color }}>
                  <div className={styles.bubbleHeader}>
                    <span className={styles.authorName} style={{ color: member.color }}>
                      {member.name.split(' ')[0]}
                    </span>
                    <span className={styles.time}>{timeStr}</span>
                    {isOwn && (
                      <button
                        className={styles.deleteBtn}
                        onClick={() => deleteComment(c.id)}
                        title="Apagar"
                      >×</button>
                    )}
                  </div>
                  <p className={styles.bubbleText}>{c.text}</p>

                  {/* Reações existentes */}
                  {Object.keys(reactionMap).length > 0 && (
                    <div className={styles.reactionsRow}>
                      {Object.entries(reactionMap).map(([emoji, memberIds]) => {
                        const iReacted = currentMember && memberIds.includes(currentMember.id)
                        return (
                          <button
                            key={emoji}
                            className={`${styles.reactionPill} ${iReacted ? styles.reacted : ''}`}
                            onClick={() => handleReaction(c.id, emoji)}
                            title={memberIds.map(id => getMemberById(id)?.name).join(', ')}
                          >
                            {emoji} <span>{memberIds.length}</span>
                          </button>
                        )
                      })}
                    </div>
                  )}

                  {/* Botão adicionar reação */}
                  <div className={styles.reactionTriggerRow}>
                    <button
                      className={styles.reactTrigger}
                      onClick={() => setShowReactions(showReactions === c.id ? null : c.id)}
                    >
                      + reagir
                    </button>
                    <AnimatePresence>
                      {showReactions === c.id && (
                        <motion.div
                          className={styles.reactionPicker}
                          initial={{ opacity: 0, scale: 0.8, y: 4 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.8, y: 4 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        >
                          {REACTIONS.map((emoji) => (
                            <button
                              key={emoji}
                              className={styles.reactionOption}
                              onClick={() => handleReaction(c.id, emoji)}
                            >
                              {emoji}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>

        {comments.length === 0 && (
          <p className={styles.empty}>Nenhum comentário ainda. Seja o primeiro! 👇</p>
        )}
      </div>

      {/* Input */}
      {currentMember && (
        <div className={styles.inputRow}>
          <img
            src={currentMember.avatar}
            alt={currentMember.name}
            className={styles.inputAvatar}
            style={{ borderColor: currentMember.color }}
          />
          <input
            className={styles.input}
            placeholder="Escreva algo..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            maxLength={300}
          />
          <button
            className={styles.sendBtn}
            style={{ background: currentMember.color }}
            onClick={handleSend}
            disabled={!text.trim() || sending}
          >
            {sending ? '...' : '→'}
          </button>
        </div>
      )}
    </div>
  )
}
