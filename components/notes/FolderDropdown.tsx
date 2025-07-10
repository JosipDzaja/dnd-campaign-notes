import { useState, useRef, useEffect } from 'react'
import { NoteFolder } from '@/lib/database.types'

interface FolderDropdownProps {
  folders: NoteFolder[]
  value: string | null
  onChange: (folderId: string | null) => void
  placeholder?: string
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

export default function FolderDropdown({ folders, value, onChange, placeholder = 'Select a folder...' }: FolderDropdownProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  // Filter folders by search
  const filteredFolders = folders.filter(f =>
    f.name.toLowerCase().includes(search.toLowerCase())
  )

  // Find selected folder
  const selected = folders.find(f => f.id === value)

  // Render root and subfolders with indentation
  const renderFolders = () =>
    filteredFolders.filter(f => !f.parent_id).map(root => [
      <div
        key={root.id}
        className={`flex items-center px-3 py-2 cursor-pointer rounded transition-colors ${value === root.id ? 'bg-blue-600/30 text-blue-300' : 'hover:bg-slate-700/50 text-slate-200'}`}
        onClick={() => { onChange(root.id); setOpen(false) }}
      >
        <span className="mr-2 text-xl">{root.icon ? getFolderIcon(root.icon) : '📁'}</span>
        <span className="truncate">{root.name}</span>
      </div>,
      ...filteredFolders.filter(f => f.parent_id === root.id).map(sub => (
        <div
          key={sub.id}
          className={`flex items-center pl-8 pr-3 py-2 cursor-pointer rounded transition-colors ${value === sub.id ? 'bg-blue-600/30 text-blue-300' : 'hover:bg-slate-700/50 text-slate-200'}`}
          onClick={() => { onChange(sub.id); setOpen(false) }}
        >
          <span className="mr-2 text-lg">{sub.icon ? getFolderIcon(sub.icon) : '📁'}</span>
          <span className="truncate">{sub.name}</span>
        </div>
      ))
    ])

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        className="w-full p-4 bg-slate-700/50 border border-slate-600 rounded-lg text-left text-white flex items-center justify-between focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
        onClick={() => setOpen(v => !v)}
      >
        <span>
          {selected ? (
            <>
              {selected.icon ? getFolderIcon(selected.icon) + ' ' : ''}{selected.name}
            </>
          ) : (
            <span className="text-slate-400">{placeholder}</span>
          )}
        </span>
        <svg className={`w-4 h-4 ml-2 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="absolute z-50 mt-2 w-full bg-slate-800 border border-slate-700 rounded-lg shadow-xl max-h-64 overflow-y-auto animate-fade-in">
          <div className="p-2">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search folders..."
              className="w-full p-2 bg-slate-700/50 border border-slate-600 rounded focus:ring-2 focus:ring-blue-500 text-white placeholder-slate-400 mb-2"
              autoFocus
            />
          </div>
          <div className="max-h-40 overflow-y-auto custom-scrollbar">
            <div className="flex flex-col gap-1">
              <div
                className={`flex items-center px-3 py-2 cursor-pointer rounded transition-colors ${value === null ? 'bg-blue-600/30 text-blue-300' : 'hover:bg-slate-700/50 text-slate-200'}`}
                onClick={() => { onChange(null); setOpen(false) }}
              >
                <span className="mr-2 text-xl">📂</span>
                <span className="truncate">No Folder (Unsorted)</span>
              </div>
              {renderFolders()}
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 