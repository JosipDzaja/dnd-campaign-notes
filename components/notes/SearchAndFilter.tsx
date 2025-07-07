'use client'

import { useState } from 'react'
import { Note } from '@/lib/database.types'

interface SearchAndFilterProps {
  onSearch: (query: string) => void
  onFilterType: (type: Note['note_type'] | 'all') => void
  onFilterTag: (tag: string) => void
  searchQuery: string
  selectedType: Note['note_type'] | 'all'
  availableTags: string[]
  selectedTag: string
}

const NOTE_TYPES = [
  { value: 'all', label: '🔍 All Types', icon: '🔍' },
  { value: 'general', label: '📝 General', icon: '📝' },
  { value: 'npc', label: '🧙‍♂️ NPCs', icon: '🧙‍♂️' },
  { value: 'location', label: '🏰 Locations', icon: '🏰' },
  { value: 'quest', label: '⚔️ Quests', icon: '⚔️' },
  { value: 'session', label: '🎲 Sessions', icon: '🎲' },
  { value: 'item', label: '⚡ Items', icon: '⚡' },
  { value: 'lore', label: '📚 Lore', icon: '📚' }
] as const

export default function SearchAndFilter({
  onSearch,
  onFilterType,
  onFilterTag,
  searchQuery,
  selectedType,
  availableTags = [], // Default to empty array
  selectedTag
}: SearchAndFilterProps) {
  const [showFilters, setShowFilters] = useState(false)

  return (
    <div className="bg-slate-800/90 backdrop-blur-sm rounded-xl shadow-2xl border border-slate-700 p-6 mb-6">
      {/* Search Bar */}
      <div className="relative mb-4">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Search your campaign notes..."
          className="w-full pl-12 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-slate-400 transition-all duration-200"
        />
      </div>

      {/* Filter Toggle */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center space-x-2 text-slate-300 hover:text-white transition-colors duration-200"
        >
          <svg className={`w-4 h-4 transition-transform duration-200 ${showFilters ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
          <span>Filters</span>
        </button>

        {/* Active Filters Count */}
        {(selectedType !== 'all' || selectedTag !== 'all') && (
          <div className="flex items-center space-x-2">
            <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full border border-blue-500/30">
              {selectedType !== 'all' && selectedTag !== 'all' ? '2 filters active' :
               selectedType !== 'all' ? 'Type filter' : 'Tag filter'}
            </span>
            <button
              onClick={() => {
                onFilterType('all')
                onFilterTag('all')
              }}
              className="text-xs text-slate-400 hover:text-slate-300 underline"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Filter Options */}
      {showFilters && (
        <div className="mt-6 space-y-6 border-t border-slate-700 pt-6">
          {/* Note Type Filter */}
          <div>
            <h3 className="text-sm font-medium text-slate-300 mb-3">Filter by Type</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {NOTE_TYPES.map((type) => (
                <button
                  key={type.value}
                  onClick={() => onFilterType(type.value as Note['note_type'] | 'all')}
                  className={`p-3 text-left border rounded-lg transition-all duration-200 flex items-center space-x-2 ${
                    selectedType === type.value
                      ? 'border-blue-500 bg-blue-500/20 text-blue-400'
                      : 'border-slate-600 bg-slate-700/30 text-slate-300 hover:border-slate-500 hover:bg-slate-700/50'
                  }`}
                >
                  <span>{type.icon}</span>
                  <span className="text-sm font-medium truncate">{type.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tag Filter */}
          {availableTags && availableTags.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-slate-300 mb-3">Filter by Tag</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => onFilterTag('all')}
                  className={`px-3 py-2 text-sm rounded-lg transition-all duration-200 ${
                    selectedTag === 'all'
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      : 'bg-slate-700/50 text-slate-300 border border-slate-600 hover:border-slate-500'
                  }`}
                >
                  All Tags
                </button>
                {availableTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => onFilterTag(tag)}
                    className={`px-3 py-2 text-sm rounded-lg transition-all duration-200 ${
                      selectedTag === tag
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        : 'bg-slate-700/50 text-slate-300 border border-slate-600 hover:border-slate-500'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}