// lib/images.ts - Complete file with debug functions

import { supabase } from './supabase'
import { NoteImage, ImageUploadResult } from './database.types'

// Constants - adjust these based on your Supabase setup
const STORAGE_BUCKET = 'images' // Change this to your actual bucket name
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB (Supabase default)
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']

// DEBUG FUNCTION - Call this to test your Supabase connection
export const debugSupabaseConnection = async () => {
  console.log('🔍 Debug: Checking Supabase connection...')
  
  // Check Supabase client configuration test git
  //console.log('⚙️ Supabase URL:', supabase.supabaseUrl)
  //console.log('⚙️ Supabase Key starts with:', supabase.supabaseKey?.substring(0, 20) + '...')
  
  // Check auth
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    console.log('👤 User:', user?.id || 'No user', 'Auth Error:', authError)
    
    if (user) {
      console.log('👤 User email:', user.email)
      console.log('👤 User role:', user.role)
    }
  } catch (e) {
    console.log('👤 Auth check failed:', e)
  }
  
  // Check database connection
  try {
    const { data: notes, error: notesError } = await supabase
      .from('notes')
      .select('id')
      .limit(1)
    console.log('📝 Notes query result:', notes?.length || 0, 'notes found')
    if (notesError) console.log('📝 Notes error:', notesError)
  } catch (e) {
    console.log('📝 Notes query failed:', e)
  }
  
  // Check storage buckets with detailed logging
  try {
    console.log('🪣 Attempting to list storage buckets...')
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
    
    console.log('🪣 Buckets response:', { data: buckets, error: bucketsError })
    console.log('🪣 Number of buckets:', buckets?.length || 0)
    
    if (buckets && buckets.length > 0) {
      console.log('🪣 Bucket names:', buckets.map(b => b.name))
      console.log('🪣 Bucket details:', buckets)
    } else {
      console.log('🪣 No buckets found or buckets is null/undefined')
    }
    
    if (bucketsError) {
      console.log('🪣 Buckets error details:', bucketsError)
    }
  } catch (e) {
    console.log('🪣 Storage query failed with exception:', e)
  }
  
  // Test storage permissions
  try {
    console.log('🔐 Testing storage permissions...')
    const testBucketName = `test-${Date.now()}`
    
    const { data: createResult, error: createError } = await supabase.storage
      .createBucket(testBucketName, { 
        public: true,
        allowedMimeTypes: ['image/*']
      })
    
    console.log('🆕 Create bucket test:', { data: createResult, error: createError })
    
    // If bucket was created successfully, clean it up
    if (!createError && createResult) {
      console.log('🧹 Cleaning up test bucket...')
      const { error: deleteError } = await supabase.storage.deleteBucket(testBucketName)
      console.log('🧹 Delete test bucket result:', deleteError || 'Success')
    }
  } catch (e) {
    console.log('🆕 Create bucket test failed with exception:', e)
  }
  
  // Check if note_images table exists
  try {
    console.log('🗄️ Checking note_images table...')
    const { data: tableCheck, error: tableError } = await supabase
      .from('note_images')
      .select('id')
      .limit(1)
    
    console.log('🗄️ Table check result:', { data: tableCheck, error: tableError })
  } catch (e) {
    console.log('🗄️ Table check failed:', e)
  }
  
  console.log('🔍 Debug check complete!')
}

// Upload image to Supabase Storage and create database record
export const uploadNoteImage = async (
  noteId: string, 
  file: File,
  onProgress?: (progress: number) => void
): Promise<ImageUploadResult> => {
  console.log('🔄 Starting upload for file:', file.name, 'to note:', noteId)
  
  try {
    // Validate file
    if (!ALLOWED_TYPES.includes(file.type)) {
      console.log('❌ File type validation failed:', file.type)
      return { success: false, error: 'Invalid file type. Please upload an image.' }
    }

    if (file.size > MAX_FILE_SIZE) {
      console.log('❌ File size validation failed:', file.size)
      return { success: false, error: 'File too large. Maximum size is 10MB.' }
    }

    console.log('✅ File validation passed')

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError) {
      console.error('❌ Auth error:', authError)
      return { success: false, error: `Authentication error: ${authError.message}` }
    }
    
    if (!user) {
      console.log('❌ No user found')
      return { success: false, error: 'User not authenticated' }
    }

    console.log('✅ User authenticated:', user.id)

    // Generate unique filename with proper folder structure
    const fileExt = file.name.split('.').pop()
    const timestamp = Date.now()
    const randomId = Math.random().toString(36).substring(2)
    const fileName = `notes/${noteId}/${timestamp}-${randomId}.${fileExt}`
    
    console.log('📁 Generated filename:', fileName)

    // Check if bucket exists first
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
    if (bucketsError) {
      console.error('❌ Error listing buckets:', bucketsError)
      return { success: false, error: `Storage error: ${bucketsError.message}` }
    }
    
    console.log('📋 Available buckets:', buckets)
    
    const bucketExists = buckets.some(bucket => bucket.name === STORAGE_BUCKET)
    if (!bucketExists) {
      console.error('❌ Bucket does not exist:', STORAGE_BUCKET)
      console.log('Available buckets:', buckets.map(b => b.name))
      return { success: false, error: `Storage bucket '${STORAGE_BUCKET}' not found. Available buckets: ${buckets.map(b => b.name).join(', ') || 'None'}` }
    }

    console.log('✅ Storage bucket exists:', STORAGE_BUCKET)

    // Upload to Supabase Storage
    console.log('📤 Starting file upload to storage...')
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type
      })

    if (uploadError) {
      console.error('❌ Upload to storage failed:', uploadError)
      return { success: false, error: `Storage upload failed: ${uploadError.message}` }
    }

    console.log('✅ File uploaded to storage successfully:', uploadData)

    // Get the public URL
    const { data: urlData } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(fileName)

    if (!urlData.publicUrl) {
      console.error('❌ Failed to get public URL')
      return { success: false, error: 'Failed to get image URL' }
    }

    console.log('✅ Got public URL:', urlData.publicUrl)

    // Check if note_images table exists
    const { data: tableCheck, error: tableError } = await supabase
      .from('note_images')
      .select('id')
      .limit(1)

    if (tableError) {
      console.error('❌ Table check failed:', tableError)
      return { success: false, error: `Database table error: ${tableError.message}. Did you run the database migration?` }
    }

    console.log('✅ note_images table exists')

    // Get next display order
    const displayOrder = await getNextDisplayOrder(noteId)
    console.log('📊 Next display order:', displayOrder)

    // Create database record
    console.log('💾 Creating database record...')
    const { data: imageRecord, error: dbError } = await supabase
      .from('note_images')
      .insert({
        note_id: noteId,
        image_url: urlData.publicUrl,
        image_name: file.name,
        image_size: file.size,
        image_type: file.type,
        uploaded_by: user.id,
        display_order: displayOrder
      })
      .select()
      .single()

    if (dbError) {
      console.error('❌ Database insert failed:', dbError)
      // Try to cleanup uploaded file
      await supabase.storage.from(STORAGE_BUCKET).remove([fileName])
      return { success: false, error: `Database error: ${dbError.message}` }
    }

    console.log('✅ Database record created:', imageRecord)

    return { 
      success: true, 
      imageId: imageRecord.id,
      imageUrl: imageRecord.image_url 
    }

  } catch (error) {
    console.error('❌ Unexpected error in uploadNoteImage:', error)
    return { success: false, error: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}` }
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
    const url = new URL(imageRecord.image_url)
    const pathParts = url.pathname.split('/')
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