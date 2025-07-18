// components/notes/NoteForm.tsx - Final working version with images

'use client'

import { useState, useRef, useEffect } from 'react'
import { Note, NoteImage, NoteCategory } from '@/lib/database.types'
import { insertLinkAtCursor } from '@/lib/noteLinks'
import NoteLinkHelper from './NoteLinkHelper'
import ImageUpload from '../images/ImageUpload'
import ImageGallery from '../images/ImageGallery'
import { getNoteImages } from '@/lib/images'
import RichTextEditor from './RichTextEditor'
import CategoryDropdown from './CategoryDropdown'
import { ICON_OPTIONS } from '@/lib/icons';

interface NoteFormProps {
  onSubmit: (noteData: {
    title: string
    content: string
    tags: string[]
    category_id: string | null
  }) => Promise<void>
  onCancel: () => void
  initialData?: Partial<Note>
  isLoading?: boolean
  allNotes: Note[]
  categories: NoteCategory[]
  defaultCategoryId?: string | null
}

export default function NoteForm({ 
  onSubmit, 
  onCancel, 
  initialData, 
  isLoading, 
  allNotes, 
  categories,
  defaultCategoryId
}: NoteFormProps) {
  const [title, setTitle] = useState(initialData?.title || '')
  const [content, setContent] = useState(initialData?.content || '')
  const [tagsInput, setTagsInput] = useState(initialData?.tags?.join(', ') || '')
  const [showLinkHelper, setShowLinkHelper] = useState(false)
  const [images, setImages] = useState<NoteImage[]>([])
  const [loadingImages, setLoadingImages] = useState(false)
  const [categoryId, setCategoryId] = useState<string | null>(
    initialData?.category_id ?? defaultCategoryId ?? null
  )
  
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (initialData?.id) {
      loadImages()
    }
  }, [initialData?.id])

  const loadImages = async () => {
    if (!initialData?.id) return
    
    setLoadingImages(true)
    try {
      const noteImages = await getNoteImages(initialData.id)
      setImages(noteImages)
    } catch (error) {
      console.error('Error loading images:', error)
      setImages([])
    } finally {
      setLoadingImages(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const tags = tagsInput
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0)

    await onSubmit({
      title,
      content,
      tags,
      category_id: categoryId,
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

  function getFolderIcon(icon: string) {
    const ICONS: Record<string, string> = {
      general: '📝',
      npc: '🧙‍♂️',
      location: '🏰',
      quest: '⚔️',
      session: '🎲',
      item: '⚡',
      lore: '📚',
      pantheon: '🛐',
    }
    return ICONS[icon] || '📁'
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

        {/* Category Selection */}
        <div>
          <label className="block text-sm font-medium mb-3 text-slate-300">Category</label>
          <CategoryDropdown
            categories={categories}
            value={categoryId}
            onChange={setCategoryId}
            placeholder="No Category (Unsorted)"
          />
        </div>

        {/* Icon Picker (disabled, icon is set by category) */}
        {/*
        <div>
          <label className="block text-sm font-medium mb-3 text-slate-300">Icon</label>
          <div className="grid grid-cols-6 gap-2">
            {ICON_OPTIONS.map(opt => (
              <button
                key={opt.key}
                type="button"
                className={`flex flex-col items-center justify-center p-2 rounded border transition-all duration-200 ${icon === opt.key ? 'border-blue-500 bg-blue-500/20 text-blue-400' : 'border-slate-600 bg-slate-700/30 text-slate-300 hover:border-slate-500 hover:bg-slate-700/50'}`}
                onClick={() => setIcon(opt.key)}
                tabIndex={0}
              >
                <opt.icon className="text-xl mb-1" />
                <span className="text-xs">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>
        */}

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
          
          <RichTextEditor
            value={content}
            onChange={setContent}
            placeholder="Write your note content... Use [[Note Title]] to link to other notes."
            disabled={isLoading}
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

        {/* Images - Only show for existing notes */}
        {initialData?.id && (
          <div className="space-y-4">
            <label className="block text-sm font-medium text-slate-300">
              Images {loadingImages && <span className="text-xs text-slate-400">(Loading...)</span>}
            </label>
            
            {/* Existing Images */}
            {images.length > 0 && (
              <div className="mb-4">
                <ImageGallery 
                  images={images}
                  onImageDeleted={loadImages}
                  canEdit={true}
                  compact={true}
                />
              </div>
            )}
            
            {/* Upload New Images */}
            <ImageUpload 
              noteId={initialData.id}
              onImageUploaded={loadImages}
              disabled={isLoading}
            />
          </div>
        )}

        {/* Message for new notes */}
        {!initialData?.id && (
          <div className="p-4 bg-blue-500/20 border border-blue-500/30 rounded-lg">
            <p className="text-sm text-blue-400">
              💡 <strong>Tip:</strong> Create the note first, then you can add images when editing it.
            </p>
          </div>
        )}

        {/* Buttons */}
        <div className="flex space-x-4 pt-4">
          <button
            type="submit"
            disabled={isLoading || !title.trim() || !categoryId}
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