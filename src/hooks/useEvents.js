import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useEvents(year, month) {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  const dateFrom = `${year}-${String(month + 1).padStart(2, '0')}-01`
  const dateTo   = `${year}-${String(month + 1).padStart(2, '0')}-31`

  const fetchEvents = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('events')
      .select(`
        *,
        presences ( member_id ),
        comments (
          id, member_id, text, created_at,
          reactions ( id, member_id, emoji )
        )
      `)
      .gte('date', dateFrom)
      .lte('date', dateTo)
      .order('date')
      .order('time')

    if (!error && data) setEvents(data)
    setLoading(false)
  }, [dateFrom, dateTo])

  useEffect(() => { fetchEvents() }, [fetchEvents])

  // Realtime subscriptions
  useEffect(() => {
    const channel = supabase
      .channel('bonde-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, fetchEvents)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'presences' }, fetchEvents)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'comments' }, fetchEvents)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reactions' }, fetchEvents)
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [fetchEvents])

  // Retorna eventos de um dia específico
  const getEventsForDay = (day) => {
    const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return events.filter((e) => e.date === key)
  }

  // Dias com eventos no mês
  const daysWithEvents = events.reduce((acc, ev) => {
    const day = parseInt(ev.date.split('-')[2])
    if (!acc[day]) acc[day] = []
    acc[day].push(ev)
    return acc
  }, {})

  return { events, loading, fetchEvents, getEventsForDay, daysWithEvents }
}

// ---- CRUD ----

export async function createEvent({ title, date, time, location, notes, status, created_by }) {
  const { data, error } = await supabase
    .from('events')
    .insert([{ title, date, time, location, notes, status, created_by }])
    .select()
  return { data, error }
}

export async function deleteEvent(eventId) {
  const { error } = await supabase.from('events').delete().eq('id', eventId)
  return { error }
}

export async function updateEventStatus(eventId, status) {
  const { error } = await supabase.from('events').update({ status }).eq('id', eventId)
  return { error }
}

export async function togglePresence(eventId, memberId, isPresent) {
  if (isPresent) {
    const { error } = await supabase
      .from('presences')
      .delete()
      .eq('event_id', eventId)
      .eq('member_id', memberId)
    return { error }
  } else {
    const { error } = await supabase
      .from('presences')
      .insert([{ event_id: eventId, member_id: memberId }])
    return { error }
  }
}

export async function addComment(eventId, memberId, text) {
  const { data, error } = await supabase
    .from('comments')
    .insert([{ event_id: eventId, member_id: memberId, text }])
    .select()
  return { data, error }
}

export async function deleteComment(commentId) {
  const { error } = await supabase.from('comments').delete().eq('id', commentId)
  return { error }
}

export async function toggleReaction(commentId, memberId, emoji) {
  // Verifica se já existe
  const { data: existing } = await supabase
    .from('reactions')
    .select('id')
    .eq('comment_id', commentId)
    .eq('member_id', memberId)
    .eq('emoji', emoji)
    .maybeSingle()

  if (existing) {
    const { error } = await supabase.from('reactions').delete().eq('id', existing.id)
    return { error }
  } else {
    const { error } = await supabase
      .from('reactions')
      .insert([{ comment_id: commentId, member_id: memberId, emoji }])
    return { error }
  }
}
