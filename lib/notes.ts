import { supabase } from './supabase'
import { Note } from './database.types'

export const createNote = async (noteData: {
  title: string
  content: string
  note_type: Note['note_type']
  tags?: string[]
}) => {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error('User not authenticated')

  const { data: note, error: noteError } = await supabase
    .from('notes')
    .insert([
      {
        title: noteData.title,
        content: noteData.content,
        note_type: noteData.note_type,
        tags: noteData.tags || [],
        created_by: user.id
      }
    ])
    .select()
    .single()

  if (noteError) {
    console.error('Note creation error:', noteError)
    throw noteError
  }

  const { error: permissionError } = await supabase
    .from('note_permissions')
    .insert([
      {
        note_id: note.id,
        user_id: user.id,
        role: 'owner'
      }
    ])

  if (permissionError) {
    console.error('Permission creation error:', permissionError)
  }

  return note
}

export const getNotes = async () => {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .order('updated_at', { ascending: false })

  if (error) {
    console.error('Get notes error:', error)
    throw error
  }
  return data || []
}

export const getNote = async (id: string) => {
  const { data, error } = await supabase
    .from('notes')
    .select(`
      *,
      references_from:note_references!source_note_id (
        target_note_id,
        target_note:notes!target_note_id (
          id,
          title,
          note_type
        )
      ),
      references_to:note_references!target_note_id (
        source_note_id,
        source_note:notes!source_note_id (
          id,
          title,
          note_type
        )
      )
    `)
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export const updateNote = async (id: string, updates: Partial<Note>) => {
  const { data, error } = await supabase
    .from('notes')
    .update({
      title: updates.title,
      content: updates.content,
      note_type: updates.note_type,
      tags: updates.tags,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Update note error:', error)
    throw error
  }
  return data
}

export const deleteNote = async (id: string) => {
  const { error } = await supabase
    .from('notes')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Delete note error:', error)
    throw error
  }
}

// New reference functions
export const addNoteReference = async (sourceNoteId: string, targetNoteId: string) => {
  const { data, error } = await supabase
    .from('note_references')
    .insert([
      {
        source_note_id: sourceNoteId,
        target_note_id: targetNoteId
      }
    ])
    .select()
    .single()

  if (error) {
    console.error('Add reference error:', error)
    throw error
  }
  return data
}

export const removeNoteReference = async (sourceNoteId: string, targetNoteId: string) => {
  const { error } = await supabase
    .from('note_references')
    .delete()
    .eq('source_note_id', sourceNoteId)
    .eq('target_note_id', targetNoteId)

  if (error) {
    console.error('Remove reference error:', error)
    throw error
  }
}

export const getNotesForReference = async (excludeId?: string) => {
  let query = supabase
    .from('notes')
    .select('id, title, note_type')
    .order('title')

  if (excludeId) {
    query = query.neq('id', excludeId)
  }

  const { data, error } = await query

  if (error) {
    console.error('Get notes for reference error:', error)
    throw error
  }
  return data || []
}