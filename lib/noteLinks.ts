import React from 'react'
import { Note } from './database.types'

// Format: [[Note Title]] or [[Note Title|Display Text]]
const LINK_REGEX = /\[\[([^\]|]+)(\|([^\]]+))?\]\]/g

export interface ParsedLink {
  fullMatch: string
  noteTitle: string
  displayText: string
  startIndex: number
  endIndex: number
}

export const parseNoteLinks = (content: string): ParsedLink[] => {
  const links: ParsedLink[] = []
  let match

  while ((match = LINK_REGEX.exec(content)) !== null) {
    const fullMatch = match[0]
    const noteTitle = match[1].trim()
    const displayText = match[3] ? match[3].trim() : noteTitle
    
    links.push({
      fullMatch,
      noteTitle,
      displayText,
      startIndex: match.index,
      endIndex: match.index + fullMatch.length
    })
  }

  return links
}

export const findNoteByTitle = (notes: Note[], title: string): Note | null => {
  return notes.find(note => 
    note.title.toLowerCase() === title.toLowerCase()
  ) || null
}

export const renderContentWithLinks = (
  content: string,
  notes: Note[],
  onNoteClick: (note: Note) => void
): React.ReactNode[] => {
  const links = parseNoteLinks(content)
  
  if (links.length === 0) {
    return [content]
  }

  const elements: React.ReactNode[] = []
  let lastIndex = 0

  links.forEach((link, index) => {
    // Add text before the link
    if (link.startIndex > lastIndex) {
      elements.push(
        React.createElement('span', { key: `text-${index}` }, content.slice(lastIndex, link.startIndex))
      )
    }

    // Find the referenced note
    const referencedNote = findNoteByTitle(notes, link.noteTitle)
    
    if (referencedNote) {
      // Create clickable link
      elements.push(
        React.createElement(
          'button',
          {
            key: `link-${index}`,
            onClick: () => onNoteClick(referencedNote),
            className: "text-blue-400 hover:text-blue-300 underline decoration-dotted hover:decoration-solid transition-all duration-200 font-medium",
            title: `Go to: ${referencedNote.title} (${referencedNote.note_type})`
          },
          link.displayText
        )
      )
    } else {
      // Show as broken link
      elements.push(
        React.createElement(
          'span',
          {
            key: `broken-link-${index}`,
            className: "text-red-400 line-through",
            title: `Note not found: ${link.noteTitle}`
          },
          link.displayText
        )
      )
    }

    lastIndex = link.endIndex
  })

  // Add remaining text after the last link
  if (lastIndex < content.length) {
    elements.push(
      React.createElement('span', { key: 'text-end' }, content.slice(lastIndex))
    )
  }

  return elements
}

export const insertLinkAtCursor = (
  content: string,
  cursorPosition: number,
  noteTitle: string,
  displayText?: string
): { newContent: string; newCursorPosition: number } => {
  const linkText = displayText && displayText !== noteTitle 
    ? `[[${noteTitle}|${displayText}]]`
    : `[[${noteTitle}]]`
  
  const newContent = 
    content.slice(0, cursorPosition) + 
    linkText + 
    content.slice(cursorPosition)
  
  return {
    newContent,
    newCursorPosition: cursorPosition + linkText.length
  }
}