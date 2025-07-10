'use client'

import { Note } from 'lib/database.types'
import { formatDistanceToNow } from 'date-fns'
import { renderContentWithLinks } from 'lib/noteLinks'

interface NotesListProps {
  notes: Note[]
  allNotes: Note[]
  onSelectNote: (note: Note) => void
  onEditNote: (note: Note) => void
  onDeleteNote: (note: Note) => void
  onCreateNote: () => void
  searchQuery?: string
  isFiltered?: boolean
}

const NOTE_TYPE_ICONS = {
  general: '📝',
  npc: '🧙‍♂️',
  location: '🏰',
  quest: '⚔️',
  session: '🎲',
  item: '⚡',
  lore: '📚',
  pantheon: '🛐'
}

export default function NotesList({ 
  notes, 
  allNotes, 
  onSelectNote, 
  onEditNote, 
  onDeleteNote, 
  onCreateNote,
  searchQuery,
  isFiltered 
}: NotesListProps) {
  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text
    
    const regex = new RegExp(`(${query.trim()})`, 'gi')
    const parts = text.split(regex)
    
    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-400/30 text-yellow-300 rounded px-1">
          {part}
        </mark>
      ) : (
        part
      )
    )
  }

  function stripHtmlTags(html: string) {
    // Remove all HTML tags
    return html.replace(/<[^>]+>/g, '')
  }

  const renderPreviewContent = (content: string | null, note: Note) => {
    if (!content) return 'No content'
    // Remove HTML tags
    const plain = stripHtmlTags(content)
    // Get first 150 characters for preview
    const preview = plain.slice(0, 150)
    const truncated = plain.length > 150 ? preview + '...' : preview
    // If there's a search query, highlight it in the raw text
    if (searchQuery) {
      return highlightText(truncated, searchQuery)
    }
    // If there are links in the content, render them properly
    if (truncated.includes('[[')) {
      const linkElements = renderContentWithLinks(
        truncated, 
        allNotes, 
        (linkedNote) => onSelectNote(linkedNote)
      )
      return (
        <span className="inline-flex flex-wrap items-baseline gap-0">
          {linkElements}
        </span>
      )
    }
    return truncated
  }

  return (
    <div className="bg-slate-800/90 backdrop-blur-sm rounded-xl shadow-2xl border border-slate-700">
      <div className="p-6 border-b border-slate-700 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Your Campaign Notes</h2>
          {isFiltered && (
            <p className="text-slate-400 text-sm mt-1">
              Showing {notes.length} of {allNotes.length} notes
              {searchQuery && ` for "${searchQuery}"`}
            </p>
          )}
        </div>
        <button
          onClick={onCreateNote}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          <span className="text-lg">+</span>
          <span>New Note</span>
        </button>
      </div>

      <div className="divide-y divide-slate-700">
        {notes.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            {allNotes.length === 0 ? (
              <>
                <div className="text-6xl mb-6">📝</div>
                <h3 className="text-xl font-medium mb-3 text-slate-300">No notes yet</h3>
                <p className="text-slate-400">Create your first note to start building your campaign!</p>
              </>
            ) : (
              <>
                <div className="text-6xl mb-6">🔍</div>
                <h3 className="text-xl font-medium mb-3 text-slate-300">No notes found</h3>
                <p className="text-slate-400">
                  {searchQuery 
                    ? `No notes match "${searchQuery}". Try different keywords.`
                    : "No notes match your current filters. Try adjusting your selection."
                  }
                </p>
              </>
            )}
          </div>
        ) : (
          notes.map((note) => (
            <div
              key={note.id}
              className="p-6 hover:bg-slate-700/50 transition-all duration-200 group"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 cursor-pointer" onClick={() => onSelectNote(note)}>
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="text-2xl">
                      {NOTE_TYPE_ICONS[note.note_type] || '📝'}
                    </span>
                    <h3 className="font-semibold text-white text-lg truncate">
                      {searchQuery ? highlightText(note.title, searchQuery) : note.title}
                    </h3>
                    <span className="text-xs px-3 py-1 rounded-full bg-green-500/20 text-green-400 border border-green-500/30 font-medium">
                      owner
                    </span>
                  </div>
                  <div className="text-slate-300 mb-3 ml-11 line-clamp-2">
                    {renderPreviewContent(note.content, note)}
                  </div>
                  <div className="flex items-center space-x-6 text-sm text-slate-400 ml-11">
                    <span className="flex items-center space-x-1">
                      <span>🕒</span>
                      <span>{formatDistanceToNow(new Date(note.updated_at), { addSuffix: true })}</span>
                    </span>
                    {note.tags && note.tags.length > 0 && (
                      <div className="flex space-x-2">
                        {note.tags.slice(0, 3).map((tag, index) => (
                          <span
                            key={index}
                            className="bg-slate-600/50 text-slate-300 px-3 py-1 rounded-full text-xs border border-slate-600"
                          >
                            {searchQuery ? highlightText(tag, searchQuery) : tag}
                          </span>
                        ))}
                        {note.tags.length > 3 && (
                          <span className="text-slate-500">+{note.tags.length - 3} more</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex items-center space-x-2 ml-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onEditNote(note)
                    }}
                    className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors duration-200"
                    title="Edit note"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onDeleteNote(note)
                    }}
                    className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/20 rounded-lg transition-colors duration-200"
                    title="Delete note"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}