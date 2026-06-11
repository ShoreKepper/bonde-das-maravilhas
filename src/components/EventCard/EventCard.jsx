import { useState, useEffect } from 'react'
import { MEMBERS } from '../data/members'

const NAMES_KEY = 'bonde_custom_names'

// Carrega nomes customizados do localStorage
export function getCustomNames() {
  try {
    const saved = localStorage.getItem(NAMES_KEY)
    return saved ? JSON.parse(saved) : {}
  } catch { return {} }
}

// Aplica nomes customizados sobre os membros base
export function getMembersWithCustomNames() {
  const custom = getCustomNames()
  return MEMBERS.map((m) => ({
    ...m,
    name: custom[m.id] || m.name,
  }))
}

export function useMember() {
  const [currentMember, setCurrentMember] = useState(null)
  const [customNames, setCustomNames] = useState(getCustomNames)

  useEffect(() => {
    const saved = localStorage.getItem('bonde_member')
    if (saved) {
      const members = MEMBERS
      const found = members.find((m) => m.id === saved)
      if (found) setCurrentMember(found)
    }
  }, [])

  const selectMember = (member) => {
    setCurrentMember(member)
    localStorage.setItem('bonde_member', member.id)
  }

  const logout = () => {
    setCurrentMember(null)
    localStorage.removeItem('bonde_member')
  }

  const updateName = (memberId, newName) => {
    const updated = { ...customNames, [memberId]: newName.trim() || undefined }
    // Remove chaves vazias
    Object.keys(updated).forEach(k => !updated[k] && delete updated[k])
    setCustomNames(updated)
    localStorage.setItem(NAMES_KEY, JSON.stringify(updated))
    // Atualiza membro atual se for ele mesmo
    if (currentMember?.id === memberId) {
      setCurrentMember(prev => ({ ...prev, name: newName.trim() || prev.name }))
    }
  }

  // Membros com nomes customizados aplicados
  const membersWithNames = MEMBERS.map((m) => ({
    ...m,
    name: customNames[m.id] || m.name,
  }))

  return { currentMember, selectMember, logout, updateName, membersWithNames, customNames }
}
