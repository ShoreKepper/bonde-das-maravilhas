import { useState, useEffect } from 'react'
import { MEMBERS } from '../data/members'

export function useMember() {
  const [currentMember, setCurrentMember] = useState(null)

  useEffect(() => {
    const saved = localStorage.getItem('bonde_member')
    if (saved) {
      const found = MEMBERS.find((m) => m.id === saved)
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

  return { currentMember, selectMember, logout }
}
