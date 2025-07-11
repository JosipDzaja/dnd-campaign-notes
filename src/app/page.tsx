// src/app/page.tsx - Complete file with image support

'use client'

import { useEffect, useState, useMemo } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from 'lib/supabase'
import { Note } from 'lib/database.types'
import { 
  createNote, 
  getNotes, 
  updateNote, 
  deleteNote,
  getNoteFolders,
  buildFolderTree,
  getNotesForUser,
  createNoteFolder
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
import FolderSidebar from 'components/notes/FolderSidebar'
import { NoteFolder } from 'lib/database.types'
import FolderCreateModal from 'components/notes/FolderCreateModal'

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
  const [folders, setFolders] = useState<NoteFolder[]>([])
  const [folderTree, setFolderTree] = useState<any[]>([])
  const [selectedFolderId, setSelectedFolderId] = useState<string | undefined>(undefined)
  const [showFolderModal, setShowFolderModal] = useState(false)
  const [folderModalParent, setFolderModalParent] = useState<{ id: string, name: string } | null>(null)
  const [isCreatingFolder, setIsCreatingFolder] = useState(false)

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

  // Filter notes by selected folder
  const notesInSelectedFolder = useMemo(() => {
    if (!selectedFolderId) return filteredNotes
    return filteredNotes.filter(note => note.folder_id === selectedFolderId)
  }, [filteredNotes, selectedFolderId])

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
      loadFolders()
    }
  }, [user])

  useEffect(() => {
    if (selectedNote) {
      loadSelectedNoteImages()
    } else {
      setSelectedNoteImages([])
    }
  }, [selectedNote])

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

  const loadFolders = async () => {
    try {
      const folderData = await getNoteFolders(user!.id)
      // Inject default root folders if missing
      const rootFolders = folderData.filter(f => !f.parent_id)
      const missingDefaults = NOTE_CATEGORIES.filter(cat => !rootFolders.some(f => f.icon === cat.icon))
      let allFolders = [...folderData]
      if (missingDefaults.length > 0) {
        // Add missing default folders (not persisted, just for UI)
        const tempDefaults = missingDefaults.map(cat => ({
          id: `default-${cat.key}`,
          name: cat.name,
          icon: cat.icon,
          parent_id: null,
          created_by: user!.id,
          created_at: '',
          isDefault: true,
        }))
        allFolders = [...allFolders, ...tempDefaults]
      }
      setFolders(allFolders)
      setFolderTree(buildFolderTree(allFolders))
    } catch (error) {
      console.error('Error loading folders:', error)
      setFolders([])
      setFolderTree([])
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

  // FolderSidebar handlers
  const handleSelectFolder = (folderId: string) => {
    setSelectedFolderId(folderId)
    setSelectedNote(null)
    setEditingNote(null)
    setShowCreateForm(false)
  }
  const handleCreateRootFolder = () => {
    setFolderModalParent(null)
    setShowFolderModal(true)
  }
  const handleCreateSubfolder = (parentId: string) => {
    const parent = folders.find(f => f.id === parentId)
    if (parent) {
      setFolderModalParent({ id: parent.id, name: parent.name })
      setShowFolderModal(true)
    }
  }
  const handleEditFolder = (folderId: string) => {
    // TODO: Implement folder rename modal
    alert('Edit folder: ' + folderId)
  }
  const handleDeleteFolder = (folderId: string) => {
    // TODO: Implement folder delete confirmation
    alert('Delete folder: ' + folderId)
  }
  const handleReorderFolders = (sourceId: string, destId: string | null) => {
    // TODO: Implement drag-and-drop reorder
    alert(`Move folder ${sourceId} to ${destId}`)
  }

  const handleCreateFolder = async (name: string, icon: string) => {
    if (!user) return
    setIsCreatingFolder(true)
    try {
      await createNoteFolder({
        name,
        icon,
        parent_id: folderModalParent?.id || null,
        userId: user.id
      })
      setShowFolderModal(false)
      setFolderModalParent(null)
      await loadFolders()
    } catch (error) {
      alert('Failed to create folder. Please try again.')
    } finally {
      setIsCreatingFolder(false)
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
            <h1 className="text-3xl font-bold text-white">🎲 Arcane Archives</h1>
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

      {/* Main Content with Sidebar */}
      <div className="max-w-6xl mx-auto px-4 py-8 flex gap-6">
        {/* Folder Sidebar */}
        <div className="hidden md:block w-72 flex-shrink-0">
          <FolderSidebar
            folders={folderTree}
            notes={allNotes}
            selectedFolderId={selectedFolderId}
            onSelectFolder={handleSelectFolder}
            onCreateSubfolder={handleCreateSubfolder}
            onEditFolder={handleEditFolder}
            onDeleteFolder={handleDeleteFolder}
            onReorder={handleReorderFolders}
            onSelectNote={handleSelectNote}
            // Add root folder button below
            headerAction={handleCreateRootFolder}
          />
        </div>
        {/* Main Area */}
        <div className="flex-1 min-w-0">
          {showCreateForm ? (
            <NoteForm
              onSubmit={handleCreateNote}
              onCancel={() => setShowCreateForm(false)}
              isLoading={isCreating}
              allNotes={allNotes}
              folders={folders}
              defaultFolderId={selectedFolderId || null}
            />
          ) : editingNote ? (
            <NoteForm
              onSubmit={handleUpdateNote}
              onCancel={() => setEditingNote(null)}
              initialData={editingNote}
              isLoading={isUpdating}
              allNotes={allNotes}
              folders={folders}
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
                onFilterType={handleFilterType}
                onFilterTag={handleFilterTag}
                searchQuery={searchFilters.query}
                selectedType={searchFilters.type}
                availableTags={availableTags}
                selectedTag={searchFilters.tag}
              />
              {/* Notes List (filtered by folder) */}
              <NotesList
                notes={notesInSelectedFolder}
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
      {/* Folder Create Modal */}
      <FolderCreateModal
        isOpen={showFolderModal}
        onClose={() => { setShowFolderModal(false); setFolderModalParent(null) }}
        onCreate={handleCreateFolder}
        parentFolder={folderModalParent || undefined}
        loading={isCreatingFolder}
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