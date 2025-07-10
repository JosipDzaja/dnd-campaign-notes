'use client'

import { NoteWithReferences } from '@/lib/database.types'

interface NoteReferencesProps {
  note: NoteWithReferences
  onNavigateToNote: (noteId: string) => void
  onRemoveReference: (targetNoteId: string) => void
  canEdit: boolean
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

export default function NoteReferences({ 
  note, 
  onNavigateToNote, 
  onRemoveReference, 
  canEdit 
}: NoteReferencesProps) {
  const referencesFrom = note.references_from || []
  const referencesTo = note.references_to || []

  if (referencesFrom.length === 0 && referencesTo.length === 0) {
    return null
  }

  return (
    <div className="mt-8 space-y-6">
      {/* References FROM this note (links this note points to) */}
      {referencesFrom.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
            <span>🔗</span>
            <span>References</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {referencesFrom.map((ref) => (
              <div
                key={ref.target_note_id}
                className="group bg-slate-700/30 border border-slate-600 rounded-lg p-4 hover:bg-slate-700/50 transition-all duration-200"
              >
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => onNavigateToNote(ref.target_note.id)}
                    className="flex items-center space-x-3 flex-1 text-left hover:text-blue-400 transition-colors"
                  >
                    <span className="text-xl">
                      {NOTE_TYPE_ICONS[ref.target_note.note_type]}
                    </span>
                    <div>
                      <h4 className="font-medium text-white group-hover:text-blue-400 transition-colors">
                        {ref.target_note.title}
                      </h4>
                      <p className="text-sm text-slate-400 capitalize">
                        {ref.target_note.note_type}
                      </p>
                    </div>
                  </button>
                  {canEdit && (
                    <button
                      onClick={() => onRemoveReference(ref.target_note_id)}
                      className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/20 rounded-lg transition-all duration-200"
                      title="Remove reference"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* References TO this note (notes that link to this one) */}
      {referencesTo.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
            <span>🔄</span>
            <span>Referenced by</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {referencesTo.map((ref) => (
              <button
                key={ref.source_note_id}
                onClick={() => onNavigateToNote(ref.source_note.id)}
                className="bg-slate-700/30 border border-slate-600 rounded-lg p-4 hover:bg-slate-700/50 transition-all duration-200 text-left group"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-xl">
                    {NOTE_TYPE_ICONS[ref.source_note.note_type]}
                  </span>
                  <div>
                    <h4 className="font-medium text-white group-hover:text-blue-400 transition-colors">
                      {ref.source_note.title}
                    </h4>
                    <p className="text-sm text-slate-400 capitalize">
                      {ref.source_note.note_type}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}