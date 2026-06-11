import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MEMBERS } from '../../data/members'
import { getCustomNames } from '../../hooks/useMember'
import { createEvent } from '../../hooks/useEvents'
import EventCard from '../EventCard/EventCard'
import MemberAvatar from '../MemberAvatar/MemberAvatar'
import styles from './Modals.module.css'

// ─── Overlay wrapper ───────────────────────────────────────────
function Overlay({ onClose, children }) {
  return (
    <motion.div
      className={styles.overlay}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <div onClick={(e) => e.stopPropagation()}>{children}</div>
    </motion.div>
  )
}

// ─── Bottom sheet wrapper ──────────────────────────────────────
function Sheet({ children, onClose, tall = false }) {
  return (
    <Overlay onClose={onClose}>
      <motion.div
        className={`${styles.sheet} ${tall ? styles.sheetTall : ''}`}
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 380, damping: 38 }}
      >
        <div className={styles.handle} />
        {children}
      </motion.div>
    </Overlay>
  )
}

// ─── Member Select Screen ──────────────────────────────────────
export function MemberSelectModal({ onSelect, onUpdateName }) {
  const [editingId, setEditingId] = useState(null)
  const [editValue, setEditValue] = useState('')
  const [customNames, setCustomNames] = useState(getCustomNames)

  const getDisplayName = (m) => customNames[m.id] || m.name

  const startEdit = (e, m) => {
    e.stopPropagation()
    setEditingId(m.id)
    setEditValue(getDisplayName(m))
  }

  const saveEdit = (m) => {
    const trimmed = editValue.trim()
    if (trimmed) {
      const updated = { ...customNames, [m.id]: trimmed }
      setCustomNames(updated)
      localStorage.setItem('bonde_custom_names', JSON.stringify(updated))
      if (onUpdateName) onUpdateName(m.id, trimmed)
    }
    setEditingId(null)
  }

  const handleSelect = (m) => {
    if (editingId) return
    const memberWithName = { ...m, name: getDisplayName(m) }
    onSelect(memberWithName)
  }

  return (
    <motion.div
      className={styles.memberScreen}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className={styles.memberScreenInner}>
        <h1 className={styles.bondTitle}>Bonde das<br />Maravilhas</h1>
        <p className={styles.bondSub}>Quem é você? <span className={styles.bondHint}>✏️ segura pra editar o nome</span></p>
        <div className={styles.memberGrid}>
          {MEMBERS.map((m, i) => (
            <motion.div
              key={m.id}
              className={styles.memberOption}
              style={{ '--color': m.color, '--glow': m.colorGlow }}
              onClick={() => handleSelect(m)}
              onContextMenu={(e) => { e.preventDefault(); startEdit(e, m) }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07, type: 'spring', stiffness: 400 }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
            >
              <div className={styles.memberOptionAvatar}>
                <img src={m.avatar} alt={m.character} className={styles.memberOptionImg} />
              </div>

              {editingId === m.id ? (
                <input
                  className={styles.nameInput}
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onBlur={() => saveEdit(m)}
                  onKeyDown={(e) => {
                    e.stopPropagation()
                    if (e.key === 'Enter') saveEdit(m)
                    if (e.key === 'Escape') setEditingId(null)
                  }}
                  onClick={(e) => e.stopPropagation()}
                  autoFocus
                  maxLength={20}
                />
              ) : (
                <>
                  <span className={styles.memberOptionName}>
                    {getDisplayName(m).split(' ')[0]}
                  </span>
                  <span className={styles.memberOptionChar}>{m.character}</span>
                  <button
                    className={styles.editNameBtn}
                    onClick={(e) => startEdit(e, m)}
                    title="Editar nome"
                  >✏️</button>
                </>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

// ─── Day Modal ─────────────────────────────────────────────────
export function DayModal({ day, month, year, events, currentMember, onClose, onAddEvent }) {
  const MONTHS_PT = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']

  return (
    <AnimatePresence>
      <Sheet onClose={onClose} tall>
        <div className={styles.sheetHeader}>
          <div>
            <h2 className={styles.sheetTitle}>
              {day} de {MONTHS_PT[month]}
            </h2>
            <p className={styles.sheetSub}>{year}</p>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>×</button>
        </div>

        <div className={styles.sheetScroll}>
          {events.length === 0 && (
            <div className={styles.emptyDay}>
              <span className={styles.emptyEmoji}>🎲</span>
              <p>Nenhum rolê marcado ainda</p>
            </div>
          )}

          <AnimatePresence>
            {events.map((ev) => (
              <EventCard
                key={ev.id}
                event={ev}
                currentMember={currentMember}
              />
            ))}
          </AnimatePresence>
        </div>

        <div className={styles.sheetFooter}>
          <button
            className={styles.addEventBtn}
            onClick={onAddEvent}
          >
            + Adicionar rolê
          </button>
        </div>
      </Sheet>
    </AnimatePresence>
  )
}

// ─── Add Event Modal ───────────────────────────────────────────
export function AddEventModal({ day, month, year, currentMember, onClose, onAdded }) {
  const MONTHS_PT = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']

  const [form, setForm] = useState({
    title: '', time: '', location: '', notes: '', status: 'ideia',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const handleSave = async () => {
    if (!form.title.trim()) { setError('Nome do rolê é obrigatório!'); return }
    setSaving(true)
    const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const { error: err } = await createEvent({
      ...form,
      date,
      created_by: currentMember.id,
    })
    if (err) { setError('Erro ao salvar. Tente novamente.'); setSaving(false); return }
    onAdded()
    onClose()
  }

  return (
    <AnimatePresence>
      <Sheet onClose={onClose} tall>
        <div className={styles.sheetHeader}>
          <div>
            <h2 className={styles.sheetTitle}>Novo rolê</h2>
            <p className={styles.sheetSub}>{day} de {MONTHS_PT[month]} · {year}</p>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>×</button>
        </div>

        <div className={styles.sheetScroll}>
          <div className={styles.form}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Nome do rolê *</label>
              <input
                className={styles.formInput}
                placeholder="ex: Churrasco do fim de semana"
                value={form.title}
                onChange={(e) => set('title', e.target.value)}
                autoFocus
              />
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Horário</label>
                <input
                  className={styles.formInput}
                  type="time"
                  value={form.time}
                  onChange={(e) => set('time', e.target.value)}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Status</label>
                <select
                  className={styles.formSelect}
                  value={form.status}
                  onChange={(e) => set('status', e.target.value)}
                >
                  <option value="ideia">💡 Ideia</option>
                  <option value="confirmado">✅ Confirmado</option>
                </select>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Local</label>
              <input
                className={styles.formInput}
                placeholder="ex: Casa da Nauane, Shopping..."
                value={form.location}
                onChange={(e) => set('location', e.target.value)}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Observações</label>
              <textarea
                className={`${styles.formInput} ${styles.formTextarea}`}
                placeholder="Detalhes, link, endereço completo..."
                value={form.notes}
                onChange={(e) => set('notes', e.target.value)}
              />
            </div>

            {error && <p className={styles.errorMsg}>{error}</p>}
          </div>
        </div>

        <div className={styles.sheetFooter}>
          <button
            className={styles.saveBtn}
            style={{ '--color': currentMember?.color || '#a78bfa' }}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Salvando...' : '🎉 Salvar rolê'}
          </button>
        </div>
      </Sheet>
    </AnimatePresence>
  )
}
