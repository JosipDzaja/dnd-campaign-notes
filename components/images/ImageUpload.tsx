// components/images/ImageUpload.tsx - With debug button

'use client'

import { useState, useRef, useCallback } from 'react'
import { uploadNoteImage, validateImageFile, debugSupabaseConnection } from '@/lib/images'

interface ImageUploadProps {
  noteId: string
  onImageUploaded: () => void
  disabled?: boolean
}

export default function ImageUpload({ noteId, onImageUploaded, disabled = false }: ImageUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    setError(null)
    setIsUploading(true)

    try {
      for (const file of Array.from(files)) {
        const validation = validateImageFile(file)
        if (!validation.valid) {
          setError(validation.error || 'Invalid file')
          continue
        }

        const result = await uploadNoteImage(noteId, file, (progress) => {
          setUploadProgress(progress)
        })

        if (!result.success) {
          setError(result.error || 'Upload failed')
        }
      }

      onImageUploaded()
    } catch (error) {
      setError('Upload failed. Please try again.')
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const handleDebug = async () => {
    console.log('🐛 Running Supabase debug check...')
    await debugSupabaseConnection()
    console.log('🐛 Debug check complete - check console above for details')
  }

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!disabled) {
      setIsDragOver(true)
    }
  }, [disabled])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
    
    if (!disabled) {
      handleFileUpload(e.dataTransfer.files)
    }
  }, [disabled, noteId])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileUpload(e.target.files)
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  return (
    <div className="w-full">
      {/* Debug Button */}
      <div className="mb-4 p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
        <div className="flex items-center justify-between">
          <p className="text-sm text-yellow-400">
            🐛 <strong>Debug Mode:</strong> Having upload issues? Run diagnostics first.
          </p>
          <button
            type="button"
            onClick={handleDebug}
            className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded text-sm transition-colors"
          >
            Test Connection
          </button>
        </div>
      </div>

      {/* Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-200
          ${isDragOver 
            ? 'border-blue-400 bg-blue-50/10 text-blue-400' 
            : 'border-slate-600 hover:border-slate-500 text-slate-300 hover:text-slate-200'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          ${isUploading ? 'pointer-events-none' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled || isUploading}
        />

        {isUploading ? (
          <div className="space-y-3">
            <div className="w-8 h-8 mx-auto border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <div className="text-sm text-slate-300">
              Uploading... {uploadProgress > 0 && `${uploadProgress}%`}
            </div>
            {uploadProgress > 0 && (
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <svg className="w-12 h-12 mx-auto text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <div>
              <p className="text-sm font-medium">
                Drop images here or click to upload
              </p>
              <p className="text-xs text-slate-400">
                PNG, JPG, GIF, SVG up to 10MB
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-3 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}
    </div>
  )
}