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

  const renderParagraphs = (text: string) => {
    return text.split('\n').map((paragraph, index) => {
      if (paragraph.trim() === '') {
        return <br key={index} />
      }
      
      const renderedContent = renderContentWithLinks(paragraph, notes, onNoteClick)
      
      return (
        <p key={index} className="mb-4 last:mb-0 leading-relaxed">
          {renderedContent}
        </p>
      )
    })
  }

  return (
    <div className="prose prose-invert max-w-none">
      <div className="text-slate-200">
        {renderParagraphs(content)}
      </div>
    </div>
  )
}