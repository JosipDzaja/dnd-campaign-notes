export interface Note {
  id: string
  title: string
  content: string | null
  note_type: 'general' | 'npc' | 'location' | 'quest' | 'session' | 'item' | 'lore'
  tags: string[] | null
  created_by: string
  created_at: string
  updated_at: string
}

export interface NotePermission {
  id: string
  note_id: string
  user_id: string
  role: 'owner' | 'editor' | 'viewer'
  created_at: string
}

export interface NoteReference {
  id: string
  source_note_id: string
  target_note_id: string
  created_at: string
}

export interface NoteImage {
  id: string
  note_id: string
  image_url: string
  image_name: string
  image_size: number | null
  created_at: string
}

// Extended types for queries with references
export interface NoteWithReferences extends Note {
  references_from?: {
    target_note_id: string
    target_note: {
      id: string
      title: string
      note_type: Note['note_type']
    }
  }[]
  references_to?: {
    source_note_id: string
    source_note: {
      id: string
      title: string
      note_type: Note['note_type']
    }
  }[]
}