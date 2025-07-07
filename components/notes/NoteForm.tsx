'use client'

import { useState, useRef } from 'react'
import { Note } from '@/lib/database.types'
import { insertLinkAtCursor } from '@/lib/noteLinks'
import NoteLinkHelper from './NoteLinkHelper'

interface NoteFormProps {
  onSubmit: (noteData: {
    title: string
    content: string
    note_type: Note['note_type']
    tags: string[]
  }) => Promise<void>
  onCancel: () => void
  initialData?: Partial<Note>
  isLoading?: boolean
  allNotes: Note[]
}

const NOTE_TYPES = [
  { value: 'general', label: '📝 General', description: 'General notes and ideas' },
  { value: 'npc', label: '🧙‍♂️ NPC', description: 'Non-player characters' },
  { value: 'location', label: '🏰 Location', description: 'Places and areas' },
  { value: 'quest', label: '⚔️ Quest', description: 'Adventures and missions' },
  { value: 'session', label: '🎲 Session', description: 'Game session notes' },
  { value: 'item', label: '⚡ Item', description: 'Magical items and equipment' },
  { value: 'lore', label: '📚 Lore', description: 'World building and history' }
] as const

export default function NoteForm({ 
  onSubmit, 
  onCancel, 
  initialData, 
  isLoading, 
  allNotes 
}: NoteFormProps) {
  const [title, setTitle] = useState(initialData?.title || '')
  const [content, setContent] = useState(initialData?.content || '')
  const [noteType, setNoteType] = useState<Note['note_type']>(initialData?.note_type || 'general')
  const [tagsInput, setTagsInput] = useState(initialData?.tags?.join(', ') || '')
  const [showLinkHelper, setShowLinkHelper] = useState(false)
  
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const tags = tagsInput
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0)

    await onSubmit({
      title,
      content,
      note_type: noteType,
      tags
    })
  }

  const handleInsertLink = (noteTitle: string, displayText?: string) => {
    if (textareaRef.current) {
      const cursorPosition = textareaRef.current.selectionStart
      const { newContent, newCursorPosition } = insertLinkAtCursor(
        content,
        cursorPosition,
        noteTitle,
        displayText
      )
      
      setContent(newContent)
      
      // Set cursor position after link insertion
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.setSelectionRange(newCursorPosition, newCursorPosition)
          textareaRef.current.focus()
        }
      }, 0)
    }
  }

  return (
    <div className="bg-slate-800/90 backdrop-blur-sm rounded-xl shadow-2xl p-8 border border-slate-700">
      <h2 className="text-2xl font-bold mb-8 text-white">
        {initialData ? 'Edit Note' : 'Create New Note'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium mb-3 text-slate-300">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-4 bg-slate-700/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-slate-400 transition-all duration-200"
            placeholder="Enter note title..."
            required
          />
        </div>

        {/* Note Type */}
        <div>
          <label className="block text-sm font-medium mb-3 text-slate-300">Note Type</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {NOTE_TYPES.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => setNoteType(type.value)}
                className={`p-4 text-left border rounded-lg transition-all duration-200 ${
                  noteType === type.value
                    ? 'border-blue-500 bg-blue-500/20 text-blue-400'
                    : 'border-slate-600 bg-slate-700/30 text-slate-300 hover:border-slate-500 hover:bg-slate-700/50'
                }`}
              >
                <div className="font-medium text-sm">{type.label}</div>
                <div className="text-xs text-slate-400 mt-1">{type.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <label className="text-sm font-medium text-slate-300">Content</label>
            <button
              type="button"
              onClick={() => setShowLinkHelper(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              <span>Add Link</span>
            </button>
          </div>
          
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={12}
            className="w-full p-4 bg-slate-700/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-slate-400 transition-all duration-200 resize-none"
            placeholder="Write your note content... Use [[Note Title]] to link to other notes."
          />
          
          <div className="mt-2 text-xs text-slate-400 space-y-1">
            <p>💡 <strong>Tip:</strong> Use [[Note Title]] to link to other notes</p>
            <p>📝 <strong>Custom text:</strong> [[Note Title|Custom Display Text]]</p>
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium mb-3 text-slate-300">Tags</label>
          <input
            type="text"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            className="w-full p-4 bg-slate-700/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-slate-400 transition-all duration-200"
            placeholder="Enter tags separated by commas (e.g. dragon, combat, important)"
          />
          <p className="text-xs text-slate-400 mt-2">
            Separate multiple tags with commas
          </p>
        </div>

        {/* Buttons */}
        <div className="flex space-x-4 pt-4">
          <button
            type="submit"
            disabled={isLoading || !title.trim()}
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white p-4 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
          >
            {isLoading ? 'Saving...' : (initialData ? 'Update Note' : 'Create Note')}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-slate-600 hover:bg-slate-500 text-white p-4 rounded-lg font-medium transition-all duration-200"
          >
            Cancel
          </button>
        </div>
      </form>

      {/* Note Link Helper Modal */}
      <NoteLinkHelper
        isOpen={showLinkHelper}
        notes={allNotes.filter(note => note.id !== initialData?.id)} // Exclude current note
        onInsertLink={handleInsertLink}
        onClose={() => setShowLinkHelper(false)}
      />
    </div>
  )
}