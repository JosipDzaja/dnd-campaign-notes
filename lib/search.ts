import { Note } from './database.types'

export interface SearchFilters {
  query: string
  type: Note['note_type'] | 'all'
  tag: string
}

export const searchAndFilterNotes = (
  notes: Note[],
  filters: SearchFilters
): Note[] => {
  let filteredNotes = [...notes]

  // Text search
  if (filters.query.trim() !== '') {
    const query = filters.query.toLowerCase().trim()
    filteredNotes = filteredNotes.filter(note =>
      note.title.toLowerCase().includes(query) ||
      (note.content && note.content.toLowerCase().includes(query)) ||
      (note.tags && note.tags.some(tag => tag.toLowerCase().includes(query)))
    )
  }

  // Type filter
  if (filters.type !== 'all') {
    filteredNotes = filteredNotes.filter(note => note.note_type === filters.type)
  }

  // Tag filter
  if (filters.tag !== 'all') {
    filteredNotes = filteredNotes.filter(note =>
      note.tags && note.tags.includes(filters.tag)
    )
  }

  return filteredNotes
}

export const getAvailableTags = (notes: Note[]): string[] => {
  const tagSet = new Set<string>()
  
  notes.forEach(note => {
    if (note.tags) {
      note.tags.forEach(tag => tagSet.add(tag))
    }
  })

  return Array.from(tagSet).sort()
}

export const getNoteCounts = (notes: Note[]) => {
  const counts = {
    all: notes.length,
    general: 0,
    npc: 0,
    location: 0,
    quest: 0,
    session: 0,
    item: 0,
    lore: 0
  }

  notes.forEach(note => {
    counts[note.note_type]++
  })

  return counts
}