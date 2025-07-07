'use client'

import { useState, useEffect } from 'react'
import { Note } from '@/lib/database.types'
import { getNotesForReference } from '@/lib/notes'

interface ReferenceModalProps {
  isOpen: boolean
  currentNoteId: string
  existingReferences: string[]
  onAddReference: (targetNoteId: string) => void
  onClose: () => void
}

const NOTE_TYPE_ICONS = {
  general: '📝',
  npc: '🧙‍♂️',
  location: '🏰',
  quest: '⚔️',
  session: '🎲',
  item: '⚡',
  lore: '📚'
}

export default function ReferenceModal({
  isOpen,
  currentNoteId,
  existingReferences,
  onAddReference,
  onClose
}: ReferenceModalProps) {
  const [availableNotes, setAvailableNotes] = useState<Pick<Note, 'id' | 'title' | 'note_type'>[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      loadAvailableNotes()
    }
  }, [isOpen, currentNoteId])

  const loadAvailableNotes = async () => {
    setLoading(true)
    try {
      const notes = await getNotesForReference(currentNoteId)
      setAvailableNotes(notes)
    } catch (error) {
      console.error('Error loading notes for reference:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredNotes = availableNotes.filter(note => {
    // Exclude already referenced notes
    if (existingReferences.includes(note.id)) return false
    
    // Filter by search query
    if (searchQuery.trim() !== '') {
      return note.title.toLowerCase().includes(searchQuery.toLowerCase())
    }
    
    return true
  })

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-white">Add Reference</h3>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes to reference..."
            className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-slate-400"
          />
        </div>

        {/* Available Notes */}
        {loading ? (
          <div className="text-center py-8 text-slate-400">Loading notes...</div>
        ) : filteredNotes.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            {searchQuery ? 'No notes found matching your search.' : 'No more notes available to reference.'}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredNotes.map((note) => (
              <button
                key={note.id}
                onClick={() => {
                  onAddReference(note.id)
                  onClose()
                }}
                className="w-full p-4 text-left border border-slate-600 rounded-lg hover:border-slate-500 hover:bg-slate-700/50 transition-all duration-200 group"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">
                    {NOTE_TYPE_ICONS[note.note_type]}
                  </span>
                  <div className="flex-1">
                    <h4 className="font-medium text-white group-hover:text-blue-400 transition-colors">
                      {note.title}
                    </h4>
                    <p className="text-sm text-slate-400 capitalize">
                      {note.note_type}
                    </p>
                  </div>
                  <svg className="w-5 h-5 text-slate-400 group-hover:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}