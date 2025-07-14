'use client'

import { useState, useEffect } from 'react'
import { Note } from '@/lib/database.types'

interface NoteLinkHelperProps {
  isOpen: boolean
  notes: Note[]
  onInsertLink: (noteTitle: string, displayText?: string) => void
  onClose: () => void
}

export default function NoteLinkHelper({ 
  isOpen, 
  notes, 
  onInsertLink, 
  onClose 
}: NoteLinkHelperProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [displayText, setDisplayText] = useState('')
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)

  useEffect(() => {
    if (isOpen) {
      setSearchQuery('')
      setDisplayText('')
      setSelectedNote(null)
    }
  }, [isOpen])

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleInsert = () => {
    if (selectedNote) {
      onInsertLink(selectedNote.title, displayText || undefined)
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-white">Insert Note Link</h3>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search for note */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2 text-slate-300">Search Notes</label>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for a note to link..."
            className="w-full p-3 bg-slate-700/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-white placeholder-slate-400"
          />
        </div>

        {/* Note selection */}
        <div className="mb-4 max-h-60 overflow-y-auto">
          {filteredNotes.length === 0 ? (
            <div className="text-center py-4 text-slate-400">
              {searchQuery ? 'No notes found' : 'Start typing to search notes'}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredNotes.map((note) => (
                <button
                  key={note.id}
                  onClick={() => setSelectedNote(note)}
                  className={`w-full p-3 text-left border rounded-lg transition-all duration-200 ${
                    selectedNote?.id === note.id
                      ? 'border-blue-500 bg-blue-500/20'
                      : 'border-slate-600 hover:border-slate-500 hover:bg-slate-700/50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">{note.category?.icon ?? '📘'}</span>
                    <div>
                      <h4 className="font-medium text-white">{note.title}</h4>
                      <p className="text-sm text-slate-400 capitalize">
                        <span className="inline-flex items-center gap-1">
                          <span>{note.category?.icon ?? '📘'}</span>
                          <span>{note.category?.name ?? 'General'}</span>
                        </span>
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Custom display text */}
        {selectedNote && (
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2 text-slate-300">
              Display Text (optional)
            </label>
            <input
              type="text"
              value={displayText}
              onChange={(e) => setDisplayText(e.target.value)}
              placeholder={selectedNote.title}
              className="w-full p-3 bg-slate-700/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-white placeholder-slate-400"
            />
            <p className="text-xs text-slate-400 mt-1">
              Leave empty to use the note title as display text
            </p>
          </div>
        )}

        {/* Preview */}
        {selectedNote && (
          <div className="mb-6 p-3 bg-slate-700/30 border border-slate-600 rounded-lg">
            <p className="text-sm text-slate-300 mb-2">Preview:</p>
            <code className="text-blue-400">
              [[{selectedNote.title}{displayText ? `|${displayText}` : ''}]]
            </code>
          </div>
        )}

        {/* Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 bg-slate-600 hover:bg-slate-500 text-white p-3 rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleInsert}
            disabled={!selectedNote}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white p-3 rounded-lg font-medium transition-colors"
          >
            Insert Link
          </button>
        </div>
      </div>
    </div>
  )
}