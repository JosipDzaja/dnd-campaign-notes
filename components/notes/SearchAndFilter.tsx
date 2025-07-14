'use client'

import { useState } from 'react'
import { Note } from '@/lib/database.types'
import { NoteCategory } from '@/lib/database.types'
import { ICON_MAP } from '@/lib/icons';
import React from 'react';

interface SearchAndFilterProps {
  onSearch: (query: string) => void
  onFilterCategory: (category: string | 'all') => void
  onFilterTag: (tag: string) => void
  searchQuery: string
  selectedCategory: string | 'all'
  availableTags: string[]
  selectedTag: string
  categories: NoteCategory[]
}

// Remove NOTE_TYPES and all type-related logic
// Add category filter using categories prop
// Update handlers and UI to use category/category_id

export default function SearchAndFilter({
  onSearch,
  onFilterCategory,
  onFilterTag,
  searchQuery,
  selectedCategory,
  availableTags = [], // Default to empty array
  selectedTag,
  categories = [],
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
        {(selectedCategory !== 'all' || selectedTag !== 'all') && (
          <div className="flex items-center space-x-2">
            <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full border border-blue-500/30">
              {selectedCategory !== 'all' && selectedTag !== 'all' ? '2 filters active' :
               selectedCategory !== 'all' ? 'Category filter' : 'Tag filter'}
            </span>
            <button
              onClick={() => {
                onFilterCategory('all')
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
          {/* Category Filter */}
          <div>
            <h3 className="text-sm font-medium text-slate-300 mb-3">Filter by Category</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => onFilterCategory('all')}
                className={`px-3 py-2 text-sm rounded-lg transition-all duration-200 flex items-center space-x-2 ${
                  selectedCategory === 'all'
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    : 'bg-slate-700/50 text-slate-300 border border-slate-600 hover:border-slate-500'
                }`}
              >
                <span>🔍</span>
                <span>All Categories</span>
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => onFilterCategory(cat.id)}
                  className={`px-3 py-2 text-sm rounded-lg transition-all duration-200 flex items-center space-x-2 ${
                    selectedCategory === cat.id
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      : 'bg-slate-700/50 text-slate-300 border border-slate-600 hover:border-slate-500'
                  }`}
                >
                  <span className="text-xl">
                    {cat.icon && ICON_MAP[cat.icon]
                      ? React.createElement(ICON_MAP[cat.icon])
                      : '📁'}
                  </span>
                  <span>{cat.name}</span>
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