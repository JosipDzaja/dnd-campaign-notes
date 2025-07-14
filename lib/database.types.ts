// lib/database.types.ts - Enhanced with better image support

export interface Note {
  id: string
  title: string
  content: string | null
  tags: string[] | null
  created_by: string
  created_at: string
  updated_at: string
  category_id: string | null
  category?: NoteCategory | null
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
  image_type: string | null
  display_order: number
  created_at: string
  uploaded_by: string | null
}

export interface NoteCategory {
  id: string
  name: string
  description?: string | null
  icon?: string | null
  color?: string | null
  category_type?: string | null
  sort_order?: number | null
  is_active?: boolean | null
  created_at?: string | null
  updated_at?: string | null
}

// Extended types for queries with references and images
export interface NoteWithReferences extends Note {
  references_from?: {
    target_note_id: string
    target_note: {
      id: string
      title: string
      category: NoteCategory | null
    }
  }[]
  references_to?: {
    source_note_id: string
    source_note: {
      id: string
      title: string
      category: NoteCategory | null
    }
  }[]
}

export interface NoteWithImages extends Note {
  images?: NoteImage[]
}

export interface NoteWithAll extends Note {
  references_from?: {
    target_note_id: string
    target_note: {
      id: string
      title: string
      category: NoteCategory | null
    }
  }[]
  references_to?: {
    source_note_id: string
    source_note: {
      id: string
      title: string
      category: NoteCategory | null
    }
  }[]
  images?: NoteImage[]
}

// Utility types for file handling
export interface ImageUploadResult {
  success: boolean
  imageId?: string
  imageUrl?: string
  error?: string
}

export interface ImageUploadProgress {
  loaded: number
  total: number
  percentage: number
}