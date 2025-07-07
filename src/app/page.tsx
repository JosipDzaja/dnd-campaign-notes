'use client'

import { useEffect, useState, useMemo } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from 'lib/supabase'
import { Note } from 'lib/database.types'
import { 
  createNote, 
  getNotes, 
  updateNote, 
  deleteNote
} from 'lib/notes'
import { searchAndFilterNotes, getAvailableTags, SearchFilters } from 'lib/search'
import LoginForm from 'components/auth/LoginForm'
import NoteForm from 'components/notes/NoteForm'
import NotesList from 'components/notes/NotesList'
import SearchAndFilter from 'components/notes/SearchAndFilter'
import DeleteConfirmModal from 'components/notes/DeleteConfirmModal'
import NoteContentRenderer from 'components/notes/NoteContentRenderer'

export default function Home() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [allNotes, setAllNotes] = useState<Note[]>([])
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [noteToDelete, setNoteToDelete] = useState<Note | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Search and filter state
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    query: '',
    type: 'all',
    tag: 'all'
  })

  // Computed values with safe defaults
  const filteredNotes = useMemo(() => {
    if (!allNotes || allNotes.length === 0) return []
    return searchAndFilterNotes(allNotes, searchFilters)
  }, [allNotes, searchFilters])

  const availableTags = useMemo(() => {
    if (!allNotes || allNotes.length === 0) return []
    return getAvailableTags(allNotes)
  }, [allNotes])

  const isFiltered = searchFilters.query !== '' || searchFilters.type !== 'all' || searchFilters.tag !== 'all'

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      setLoading(false)
    }

    checkUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (user) {
      loadNotes()
    }
  }, [user])

  const loadNotes = async () => {
    try {
      const notesData = await getNotes()
      setAllNotes(notesData || [])
    } catch (error) {
      console.error('Error loading notes:', error)
      setAllNotes([])
    }
  }

  const handleSelectNote = (note: Note) => {
    setSelectedNote(note)
  }

  const handleNavigateToNote = (note: Note) => {
    setSelectedNote(note)
  }

  const handleCreateNote = async (noteData: {
    title: string
    content: string
    note_type: Note['note_type']
    tags: string[]
  }) => {
    setIsCreating(true)
    try {
      await createNote(noteData)
      await loadNotes()
      setShowCreateForm(false)
    } catch (error) {
      console.error('Error creating note:', error)
      alert('Failed to create note. Please try again.')
    } finally {
      setIsCreating(false)
    }
  }

  const handleEditNote = (note: Note) => {
    setEditingNote(note)
    setSelectedNote(null)
    setShowCreateForm(false)
  }

  const handleUpdateNote = async (noteData: {
    title: string
    content: string
    note_type: Note['note_type']
    tags: string[]
  }) => {
    if (!editingNote) return

    setIsUpdating(true)
    try {
      await updateNote(editingNote.id, noteData)
      await loadNotes()
      setEditingNote(null)
    } catch (error) {
      console.error('Error updating note:', error)
      alert('Failed to update note. Please try again.')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDeleteNote = (note: Note) => {
    setNoteToDelete(note)
    setShowDeleteModal(true)
  }

  const confirmDeleteNote = async () => {
    if (!noteToDelete) return

    setIsDeleting(true)
    try {
      await deleteNote(noteToDelete.id)
      await loadNotes()
      setShowDeleteModal(false)
      setNoteToDelete(null)
      if (selectedNote?.id === noteToDelete.id) {
        setSelectedNote(null)
      }
    } catch (error) {
      console.error('Error deleting note:', error)
      alert('Failed to delete note. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleSearch = (query: string) => {
    setSearchFilters(prev => ({ ...prev, query }))
  }

  const handleFilterType = (type: Note['note_type'] | 'all') => {
    setSearchFilters(prev => ({ ...prev, type }))
  }

  const handleFilterTag = (tag: string) => {
    setSearchFilters(prev => ({ ...prev, tag }))
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 py-8">
        <LoginForm />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="bg-slate-800/90 backdrop-blur-sm border-b border-slate-700 shadow-xl">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-white">🎲 D&D Campaign Notes</h1>
            <div className="flex items-center space-x-4">
              <span className="text-slate-300">Welcome, {user.email}</span>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {showCreateForm ? (
          <NoteForm
            onSubmit={handleCreateNote}
            onCancel={() => setShowCreateForm(false)}
            isLoading={isCreating}
            allNotes={allNotes}
          />
        ) : editingNote ? (
          <NoteForm
            onSubmit={handleUpdateNote}
            onCancel={() => setEditingNote(null)}
            initialData={editingNote}
            isLoading={isUpdating}
            allNotes={allNotes}
          />
        ) : selectedNote ? (
          <div className="bg-slate-800/90 backdrop-blur-sm rounded-xl shadow-2xl p-8 border border-slate-700">
            <div className="flex justify-between items-start mb-6">
              <button
                onClick={() => setSelectedNote(null)}
                className="text-blue-400 hover:text-blue-300 font-medium transition-colors duration-200"
              >
                ← Back to notes
              </button>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEditNote(selectedNote)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDeleteNote(selectedNote)}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <span>Delete</span>
                </button>
              </div>
            </div>
            
            {/* Note Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2 text-white">{selectedNote.title}</h1>
              <div className="flex items-center space-x-4 text-sm text-slate-400">
                <span className="capitalize bg-slate-700/50 px-3 py-1 rounded-full">
                  {selectedNote.note_type}
                </span>
                <span>Updated {new Date(selectedNote.updated_at).toLocaleDateString()}</span>
                {selectedNote.tags && selectedNote.tags.length > 0 && (
                  <div className="flex space-x-2">
                    {selectedNote.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-xs border border-blue-500/30"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Note Content with Links */}
            <div className="mb-8">
              <NoteContentRenderer
                content={selectedNote.content || ''}
                notes={allNotes}
                onNoteClick={handleNavigateToNote}
              />
            </div>

            {/* Linking Guide */}
            {selectedNote.content && selectedNote.content.includes('[[') && (
              <div className="mt-8 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-blue-400">🔗</span>
                  <span className="text-blue-400 font-medium">Note Links</span>
                </div>
                <p className="text-slate-300 text-sm">
                  Click on any highlighted links in the text above to navigate to referenced notes.
                </p>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Search and Filter */}
            <SearchAndFilter
              onSearch={handleSearch}
              onFilterType={handleFilterType}
              onFilterTag={handleFilterTag}
              searchQuery={searchFilters.query}
              selectedType={searchFilters.type}
              availableTags={availableTags}
              selectedTag={searchFilters.tag}
            />

            {/* Notes List */}
            <NotesList
              notes={filteredNotes}
              allNotes={allNotes}
              onSelectNote={handleSelectNote}
              onEditNote={handleEditNote}
              onDeleteNote={handleDeleteNote}
              onCreateNote={() => setShowCreateForm(true)}
              searchQuery={searchFilters.query}
              isFiltered={isFiltered}
            />
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        noteTitle={noteToDelete?.title || ''}
        onConfirm={confirmDeleteNote}
        onCancel={() => {
          setShowDeleteModal(false)
          setNoteToDelete(null)
        }}
        isDeleting={isDeleting}
      />
    </div>
  )
}