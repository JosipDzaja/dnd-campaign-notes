'use client'

import { Note } from '@/lib/database.types'
import { renderContentWithLinks } from '@/lib/noteLinks'

interface NoteContentRendererProps {
  content: string
  notes: Note[]
  onNoteClick: (note: Note) => void
}

export default function NoteContentRenderer({ 
  content, 
  notes, 
  onNoteClick 
}: NoteContentRendererProps) {
  if (!content) {
    return <div className="text-slate-400 italic">No content</div>
  }

  // Render content as plain text with clickable links, no <p> or <div> wrappers
  const renderLines = (text: string) => {
    return text.split(/\r?\n/).map((line, index) => {
      if (line.trim() === '') return <br key={index} />
      const renderedContent = renderContentWithLinks(line, notes, onNoteClick)
      return <span key={index}>{renderedContent}<br /></span>
    })
  }

  return (
    <span className="text-slate-200">
      {renderLines(content)}
    </span>
  )
}