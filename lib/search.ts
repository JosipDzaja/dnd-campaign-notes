import { Note } from './database.types'

export interface SearchFilters {
  query: string
  category: string | 'all'
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

  // Category filter
  if (filters.category !== 'all') {
    filteredNotes = filteredNotes.filter(note => note.category_id === filters.category)
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