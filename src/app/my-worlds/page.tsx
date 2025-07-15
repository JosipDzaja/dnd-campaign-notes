// src/app/my-worlds/page.tsx

'use client'

import { useEffect, useState, useMemo, useRef } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from 'lib/supabase'
import { Note } from 'lib/database.types'
import { 
  createNote, 
  getNotes, 
  updateNote, 
  deleteNote,
  getNoteCategories,
  createNoteCategory
} from 'lib/notes'
import { searchAndFilterNotes, getAvailableTags, SearchFilters } from 'lib/search'
import LoginForm from 'components/auth/LoginForm'
import NoteForm from 'components/notes/NoteForm'
import NotesList from 'components/notes/NotesList'
import SearchAndFilter from 'components/notes/SearchAndFilter'
import DeleteConfirmModal from 'components/notes/DeleteConfirmModal'
import NoteContentRenderer from 'components/notes/NoteContentRenderer'
import ImageGallery from 'components/images/ImageGallery'
import { getNoteImages } from 'lib/images'
import { NoteImage } from 'lib/database.types'
import CategorySidebar from 'components/notes/CategorySidebar'
import { NoteCategory } from 'lib/database.types'
import CategoryCreateModal from 'components/notes/CategoryCreateModal'
import { ICON_MAP } from 'lib/icons';
import React from 'react';
import { useRouter } from 'next/navigation';

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
  const [selectedNoteImages, setSelectedNoteImages] = useState<NoteImage[]>([])
  const [categories, setCategories] = useState<NoteCategory[]>([])
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>(undefined)
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [isCreatingCategory, setIsCreatingCategory] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false);
  // Replace profileButtonRef with profileRef for the header div
  const profileRef = useRef<HTMLDivElement>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Search and filter state
  const [searchFilters, setSearchFilters] = useState({
    query: '',
    category: 'all',
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

  const isFiltered = searchFilters.query !== '' || searchFilters.category !== 'all' || searchFilters.tag !== 'all'

  // Filter notes by selected category
  const notesInSelectedCategory = useMemo(() => {
    if (!selectedCategoryId) return filteredNotes
    return filteredNotes.filter(note => note.category_id === selectedCategoryId)
  }, [filteredNotes, selectedCategoryId])

  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      setLoading(false)
    }

    checkUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        console.log('onAuthStateChange fired:', _event, session);
        setUser(session?.user ?? null)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (user) {
      loadNotes()
      loadCategories()
    }
  }, [user])

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (selectedNote) {
      loadSelectedNoteImages()
    } else {
      setSelectedNoteImages([])
    }
  }, [selectedNote])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    if (profileOpen) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [profileOpen]);

  const loadNotes = async () => {
    try {
      const notesData = await getNotes()
      setAllNotes(notesData || [])
    } catch (error) {
      console.error('Error loading notes:', error)
      setAllNotes([])
    }
  }

  const NOTE_CATEGORIES = [
    { key: 'general', name: 'General', icon: 'general' },
    { key: 'npc', name: 'NPCs', icon: 'npc' },
    { key: 'location', name: 'Locations', icon: 'location' },
    { key: 'quest', name: 'Quests', icon: 'quest' },
    { key: 'session', name: 'Sessions', icon: 'session' },
    { key: 'item', name: 'Items', icon: 'item' },
    { key: 'lore', name: 'Lore', icon: 'lore' },
    { key: 'pantheon', name: 'Pantheon', icon: 'pantheon' },
  ]

  const loadCategories = async () => {
    try {
      const categoryData = await getNoteCategories()
      setCategories(categoryData)
    } catch (error) {
      console.error('Error loading categories:', error)
      setCategories([])
    }
  }

  const loadSelectedNoteImages = async () => {
    if (selectedNote) {
      const images = await getNoteImages(selectedNote.id)
      setSelectedNoteImages(images)
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
    tags: string[]
    category_id: string | null
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
    tags: string[]
    category_id: string | null
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

  const handleFilterCategory = (category: string | 'all') => {
    setSearchFilters(prev => ({ ...prev, category }))
  }

  const handleFilterTag = (tag: string) => {
    setSearchFilters(prev => ({ ...prev, tag }))
  }

  const handleLogout = async () => {
    try {
      const sessionBefore = await supabase.auth.getSession();
      console.log('Before signOut, session:', sessionBefore);
      const { error } = await supabase.auth.signOut();
      const sessionAfter = await supabase.auth.getSession();
      console.log('After signOut, session:', sessionAfter);
      if (error) {
        alert('Logout failed: ' + error.message);
        console.error('Supabase signOut error:', error);
      } else {
        console.log('User logged out successfully');
        window.location.reload();
      }
    } catch (err) {
      alert('Logout failed: ' + (err instanceof Error ? err.message : String(err)));
      console.error('Logout exception:', err);
    }
  }

  // CategorySidebar handlers
  const handleSelectCategory = (categoryId: string | undefined) => {
    setSelectedCategoryId(categoryId)
    setSelectedNote(null)
    setEditingNote(null)
    setShowCreateForm(false)
  }
  const handleCreateCategory = async (name: string, icon: string) => {
    setIsCreatingCategory(true)
    try {
      await createNoteCategory({ name, icon })
      setShowCategoryModal(false)
      await loadCategories()
    } catch (error) {
      alert('Failed to create category. Please try again.')
    } finally {
      setIsCreatingCategory(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Main Content with Sidebar */}
      <div className="max-w-6xl mx-auto px-4 py-8 flex gap-6 z-0">
        {/* Category Sidebar */}
        <div className="hidden md:block w-72 flex-shrink-0 z-0">
          <CategorySidebar
            categories={categories}
            notes={allNotes}
            selectedCategoryId={selectedCategoryId}
            onSelectCategory={handleSelectCategory}
            onSelectNote={handleSelectNote}
            headerAction={() => setShowCategoryModal(true)}
          />
        </div>
        {/* Mobile Slide-over Sidebar (now includes profile) */}
        {mobileSidebarOpen && (
          <>
            <div
              className="fixed inset-0 bg-black/50 z-[9998] transition-opacity md:hidden"
              onClick={() => setMobileSidebarOpen(false)}
              aria-label="Close menu overlay"
            />
            <aside className="fixed inset-y-0 left-0 w-80 max-w-full bg-slate-800/90 border-r border-slate-700 z-[9999] shadow-2xl flex flex-col md:hidden animate-slide-in">
              <div className="flex-1 overflow-y-auto">
                <CategorySidebar
                  categories={categories}
                  notes={allNotes}
                  selectedCategoryId={selectedCategoryId}
                  onSelectCategory={(id) => { setMobileSidebarOpen(false); handleSelectCategory(id); }}
                  onSelectNote={handleSelectNote}
                  headerAction={() => { setShowCategoryModal(true); setMobileSidebarOpen(false); }}
                />
              </div>
            </aside>
          </>
        )}
        {/* Main Area */}
        <div className="flex-1 min-w-0 z-0">
          {showCreateForm ? (
            <NoteForm
              onSubmit={handleCreateNote}
              onCancel={() => setShowCreateForm(false)}
              isLoading={isCreating}
              allNotes={allNotes}
              categories={categories}
              defaultCategoryId={selectedCategoryId || null}
            />
          ) : editingNote ? (
            <NoteForm
              onSubmit={handleUpdateNote}
              onCancel={() => setEditingNote(null)}
              initialData={editingNote}
              isLoading={isUpdating}
              allNotes={allNotes}
              categories={categories}
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

              <NoteContentRenderer 
                content={selectedNote.content || ''} 
                notes={allNotes}
                onNoteClick={handleNavigateToNote}
              />

              {/* Image Gallery */}
              {selectedNoteImages.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2z" />
                    </svg>
                    <span>Images</span>
                  </h3>
                  <ImageGallery 
                    images={selectedNoteImages}
                    onImageDeleted={loadSelectedNoteImages}
                    canEdit={true}
                  />
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Search and Filter */}
              <SearchAndFilter
                onSearch={handleSearch}
                onFilterCategory={handleFilterCategory}
                onFilterTag={handleFilterTag}
                searchQuery={searchFilters.query}
                selectedCategory={searchFilters.category}
                availableTags={availableTags}
                selectedTag={searchFilters.tag}
                categories={categories}
              />
              {/* Notes List (filtered by folder) */}
              <NotesList
                notes={notesInSelectedCategory}
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
      </div>
      {/* Category Create Modal */}
      <CategoryCreateModal
        isOpen={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        onCreate={handleCreateCategory}
        loading={isCreatingCategory}
      />
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