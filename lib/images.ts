// lib/images.ts - Image upload and management functions for Supabase Storage

import { supabase } from './supabase'
import { NoteImage, ImageUploadResult } from './database.types'

// Constants - adjust these based on your Supabase setup
const STORAGE_BUCKET = 'images' // Change this to your actual bucket name
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB (Supabase default)
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']

// Upload image to Supabase Storage and create database record
export const uploadNoteImage = async (
  noteId: string, 
  file: File,
  onProgress?: (progress: number) => void
): Promise<ImageUploadResult> => {
  try {
    // Validate file
    if (!ALLOWED_TYPES.includes(file.type)) {
      return { success: false, error: 'Invalid file type. Please upload an image.' }
    }

    if (file.size > MAX_FILE_SIZE) {
      return { success: false, error: 'File too large. Maximum size is 10MB.' }
    }

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'User not authenticated' }
    }

    // Generate unique filename with proper folder structure
    const fileExt = file.name.split('.').pop()
    const timestamp = Date.now()
    const randomId = Math.random().toString(36).substring(2)
    const fileName = `notes/${noteId}/${timestamp}-${randomId}.${fileExt}`

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return { success: false, error: uploadError.message || 'Failed to upload image' }
    }

    // Get the public URL
    const { data: urlData } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(fileName)

    if (!urlData.publicUrl) {
      return { success: false, error: 'Failed to get image URL' }
    }

    // Create database record
    const { data: imageRecord, error: dbError } = await supabase
      .from('note_images')
      .insert({
        note_id: noteId,
        image_url: urlData.publicUrl,
        image_name: file.name,
        image_size: file.size,
        image_type: file.type,
        uploaded_by: user.id,
        display_order: await getNextDisplayOrder(noteId)
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      // Try to cleanup uploaded file
      await supabase.storage.from(STORAGE_BUCKET).remove([fileName])
      return { success: false, error: 'Failed to save image record' }
    }

    return { 
      success: true, 
      imageId: imageRecord.id,
      imageUrl: imageRecord.image_url 
    }

  } catch (error) {
    console.error('Upload error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

// Get next display order for image ordering
const getNextDisplayOrder = async (noteId: string): Promise<number> => {
  const { data } = await supabase
    .from('note_images')
    .select('display_order')
    .eq('note_id', noteId)
    .order('display_order', { ascending: false })
    .limit(1)

  return data && data.length > 0 ? data[0].display_order + 1 : 0
}

// Get all images for a note
export const getNoteImages = async (noteId: string): Promise<NoteImage[]> => {
  const { data, error } = await supabase
    .from('note_images')
    .select('*')
    .eq('note_id', noteId)
    .order('display_order', { ascending: true })

  if (error) {
    console.error('Get images error:', error)
    return []
  }

  return data || []
}

// Delete image
export const deleteNoteImage = async (imageId: string): Promise<boolean> => {
  try {
    // Get image record to find the file path
    const { data: imageRecord, error: fetchError } = await supabase
      .from('note_images')
      .select('image_url')
      .eq('id', imageId)
      .single()

    if (fetchError) {
      console.error('Fetch image error:', fetchError)
      return false
    }

    // Extract filename from URL for storage deletion
    // Handle both public URL formats that Supabase might use
    const url = new URL(imageRecord.image_url)
    const pathParts = url.pathname.split('/')
    // Find the part after 'object' in the path
    const objectIndex = pathParts.findIndex(part => part === 'object')
    const fileName = objectIndex !== -1 ? pathParts.slice(objectIndex + 2).join('/') : pathParts.slice(-3).join('/')

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([fileName])

    if (storageError) {
      console.error('Storage deletion error:', storageError)
    }

    // Delete database record
    const { error: dbError } = await supabase
      .from('note_images')
      .delete()
      .eq('id', imageId)

    if (dbError) {
      console.error('Database deletion error:', dbError)
      return false
    }

    return true
  } catch (error) {
    console.error('Delete image error:', error)
    return false
  }
}

// Update image display order
export const updateImageOrder = async (
  images: { id: string; display_order: number }[]
): Promise<boolean> => {
  try {
    const updates = images.map(img => 
      supabase
        .from('note_images')
        .update({ display_order: img.display_order })
        .eq('id', img.id)
    )

    await Promise.all(updates)
    return true
  } catch (error) {
    console.error('Update order error:', error)
    return false
  }
}

// Utility: Validate image file before upload
export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { valid: false, error: 'Invalid file type. Please upload an image.' }
  }

  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: 'File too large. Maximum size is 10MB.' }
  }

  return { valid: true }
}

// Utility: Format file size
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}