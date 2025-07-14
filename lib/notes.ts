// lib/notes.ts - Complete notes operations with image support

import { supabase } from './supabase'
import { Note, NoteWithImages, NoteWithAll, NoteCategory } from './database.types'

export const createNote = async (noteData: {
  title: string
  content: string
  tags?: string[]
  category_id?: string | null
}) => {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error('User not authenticated')

  const { data: note, error: noteError } = await supabase
    .from('notes')
    .insert([
      {
        title: noteData.title,
        content: noteData.content,
        tags: noteData.tags || [],
        category_id: noteData.category_id || null,
        created_by: user.id
      }
    ])
    .select('*, category:note_categories(*)')
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

export const getNotes = async (): Promise<Note[]> => {
  const { data, error } = await supabase
    .from('notes')
    .select('*, category:note_categories(*)')
    .order('updated_at', { ascending: false })

  if (error) {
    console.error('Get notes error:', error)
    throw error
  }
  return data || []
}

// Get notes with image counts for list view
export const getNotesWithImageCounts = async () => {
  const { data, error } = await supabase
    .from('notes')
    .select(`
      *,
      category:note_categories(*),
      image_count:note_images(count)
    `)
    .order('updated_at', { ascending: false })

  if (error) {
    console.error('Get notes with images error:', error)
    throw error
  }
  
  // Transform the data to include image count as a number
  const notesWithCounts = data?.map(note => ({
    ...note,
    image_count: note.image_count?.[0]?.count || 0
  })) || []
  
  return notesWithCounts
}

// Get single note with all related data (references + images)
export const getNoteWithAll = async (id: string): Promise<NoteWithAll | null> => {
  const { data, error } = await supabase
    .from('notes')
    .select(`
      *,
      category:note_categories(*),
      references_from:note_references!source_note_id (
        target_note_id,
        target_note:notes!target_note_id (
          id,
          title,
          category:note_categories(*)
        )
      ),
      references_to:note_references!target_note_id (
        source_note_id,
        source_note:notes!source_note_id (
          id,
          title,
          category:note_categories(*)
        )
      ),
      images:note_images (
        id,
        image_url,
        image_name,
        image_size,
        image_type,
        display_order,
        created_at,
        uploaded_by
      )
    `)
    .eq('id', id)
    .single()

  if (error) {
    console.error('Get note with all data error:', error)
    throw error
  }
  
  return data
}

// Get note with just images
export const getNoteWithImages = async (id: string): Promise<NoteWithImages | null> => {
  const { data, error } = await supabase
    .from('notes')
    .select(`
      *,
      category:note_categories(*),
      images:note_images (
        id,
        image_url,
        image_name,
        image_size,
        image_type,
        display_order,
        created_at,
        uploaded_by
      )
    `)
    .eq('id', id)
    .single()

  if (error) {
    console.error('Get note with images error:', error)
    throw error
  }
  
  return data
}

// Original getNote function (for backward compatibility)
export const getNote = async (id: string) => {
  const { data, error } = await supabase
    .from('notes')
    .select(`
      *,
      category:note_categories(*),
      references_from:note_references!source_note_id (
        target_note_id,
        target_note:notes!target_note_id (
          id,
          title,
          category:note_categories(*)
        )
      ),
      references_to:note_references!target_note_id (
        source_note_id,
        source_note:notes!source_note_id (
          id,
          title,
          category:note_categories(*)
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
      tags: updates.tags,
      category_id: updates.category_id || null,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select('*, category:note_categories(*)')
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

// Reference functions (existing)
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

// Fetch all categories
export const getNoteCategories = async () => {
  const { data, error } = await supabase
    .from('note_categories')
    .select('*')
    .order('sort_order', { ascending: true })
  if (error) {
    console.error('Get categories error:', error)
    throw error
  }
  return data as NoteCategory[] || []
}

// No category tree logic needed (flat list)

export const createNoteCategory = async ({ name, icon, color, category_type, sort_order, is_active }: { name: string, icon?: string, color?: string, category_type?: string, sort_order?: number, is_active?: boolean }) => {
  const { data, error } = await supabase
    .from('note_categories')
    .insert([
      {
        name,
        icon: icon || null,
        color: color || null,
        category_type: category_type || 'custom',
        sort_order: sort_order || 0,
        is_active: is_active ?? true,
      }
    ])
    .select()
    .single()
  if (error) {
    console.error('Create category error:', error)
    throw error
  }
  return data as NoteCategory
}