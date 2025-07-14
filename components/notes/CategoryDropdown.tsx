import { useState, useRef, useEffect } from 'react'
import { NoteCategory } from '@/lib/database.types'
import { ICON_MAP } from '@/lib/icons';
import React from 'react';

interface CategoryDropdownProps {
  categories: NoteCategory[]
  value: string | null
  onChange: (categoryId: string | null) => void
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

export default function CategoryDropdown({ categories, value, onChange, placeholder = 'Select a category...' }: CategoryDropdownProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  const filteredCategories = categories.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  )

  const selected = categories.find(c => c.id === value)

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        className="w-full flex items-center justify-between px-3 py-2 bg-slate-700/50 border border-slate-600 rounded text-white focus:ring-2 focus:ring-blue-500"
        onClick={() => setOpen(o => !o)}
      >
        <span className="inline-flex items-center gap-2">
          <span className="text-xl">
            {selected && selected.icon && ICON_MAP[selected.icon]
              ? React.createElement(ICON_MAP[selected.icon])
              : '📂'}
          </span>
          <span>{selected ? selected.name : placeholder}</span>
        </span>
        <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              placeholder="Search categories..."
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
                <span className="truncate">No Category (Unsorted)</span>
              </div>
              {filteredCategories.map(category => (
                <div
                  key={category.id}
                  className={`flex items-center px-3 py-2 cursor-pointer rounded transition-colors ${value === category.id ? 'bg-blue-600/30 text-blue-300' : 'hover:bg-slate-700/50 text-slate-200'}`}
                  onClick={() => { onChange(category.id); setOpen(false) }}
                >
                  <span className="mr-2 text-xl">
                    {category.icon && ICON_MAP[category.icon]
                      ? React.createElement(ICON_MAP[category.icon])
                      : '📁'}
                  </span>
                  <span className="truncate">{category.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 