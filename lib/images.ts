// lib/images.ts - Production ready version

import { supabase } from './supabase'
import { NoteImage, ImageUploadResult } from './database.types'

// Constants
const STORAGE_BUCKET = 'images'
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']

// Utility function to format file sizes
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// File validation utility
export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { valid: false, error: 'Invalid file type. Please upload an image.' }
  }

  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: 'File too large. Maximum size is 10MB.' }
  }

  return { valid: true }
}

// Upload image to Supabase Storage and create database record
export const uploadNoteImage = async (
  noteId: string, 
  file: File,
  onProgress?: (progress: number) => void
): Promise<ImageUploadResult> => {
  try {
    // Validate file
    const validation = validateImageFile(file)
    if (!validation.valid) {
      return { success: false, error: validation.error || 'Invalid file' }
    }

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError) {
      return { success: false, error: `Authentication error: ${authError.message}` }
    }
    
    if (!user) {
      return { success: false, error: 'User not authenticated' }
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const timestamp = Date.now()
    const randomId = Math.random().toString(36).substring(2, 15)
    const fileName = `notes/${noteId}/${timestamp}-${randomId}.${fileExt}`

    // Report initial progress
    onProgress?.(0)

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      return { success: false, error: `Upload failed: ${uploadError.message}` }
    }

    onProgress?.(50)

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(fileName)

    if (!urlData?.publicUrl) {
      return { success: false, error: 'Failed to get image URL' }
    }

    onProgress?.(75)

    // Get next display order
    const { data: existingImages } = await supabase
      .from('note_images')
      .select('display_order')
      .eq('note_id', noteId)
      .order('display_order', { ascending: false })
      .limit(1)

    const displayOrder = existingImages && existingImages.length > 0 ? existingImages[0].display_order + 1 : 0

    // Create database record
    const { data: imageRecord, error: dbError } = await supabase
      .from('note_images')
      .insert({
        note_id: noteId,
        image_url: urlData.publicUrl,
        image_name: file.name,
        image_size: file.size,
        image_type: file.type,
        display_order: displayOrder,
        uploaded_by: user.id
      })
      .select()
      .single()

    if (dbError) {
      // Clean up uploaded file if database insert fails
      try {
        await supabase.storage.from(STORAGE_BUCKET).remove([fileName])
      } catch (cleanupError) {
        // Log cleanup error but don't fail the operation
        console.warn('Failed to clean up uploaded file:', cleanupError)
      }
      return { success: false, error: `Database error: ${dbError.message}` }
    }

    onProgress?.(100)

    return { 
      success: true, 
      imageId: imageRecord.id,
      imageUrl: urlData.publicUrl
    }

  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Upload failed' 
    }
  }
}

// Get images for a specific note
export const getNoteImages = async (noteId: string): Promise<NoteImage[]> => {
  try {
    const { data, error } = await supabase
      .from('note_images')
      .select('*')
      .eq('note_id', noteId)
      .order('display_order', { ascending: true })

    if (error) {
      throw new Error(`Failed to fetch images: ${error.message}`)
    }

    return data || []
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to fetch images')
  }
}

// Delete image from storage and database
export const deleteNoteImage = async (imageId: string): Promise<boolean> => {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return false
    }

    // Get image details first
    const { data: image, error: fetchError } = await supabase
      .from('note_images')
      .select('image_url, uploaded_by')
      .eq('id', imageId)
      .single()

    if (fetchError || !image) {
      return false
    }

    // Check if user owns this image
    if (image.uploaded_by !== user.id) {
      return false
    }

    // Extract filename from URL for storage deletion
    const url = new URL(image.image_url)
    const pathParts = url.pathname.split('/')
    // Get the path after /storage/v1/object/public/{bucket}/
    const bucketIndex = pathParts.findIndex(part => part === STORAGE_BUCKET)
    const fileName = bucketIndex !== -1 && bucketIndex + 1 < pathParts.length 
      ? pathParts.slice(bucketIndex + 1).join('/')
      : null

    // Delete from database first
    const { error: dbError } = await supabase
      .from('note_images')
      .delete()
      .eq('id', imageId)

    // Try to delete from storage (even if database deletion fails)
    if (fileName) {
      await supabase.storage
        .from(STORAGE_BUCKET)
        .remove([fileName])
    }

    return !dbError
  } catch (error) {
    return false
  }
}