// components/images/ImageGallery.tsx - Display and manage note images

'use client'

import { useState } from 'react'
import { NoteImage } from '@/lib/database.types'
import { deleteNoteImage, formatFileSize } from '@/lib/images'

interface ImageGalleryProps {
  images: NoteImage[]
  onImageDeleted: () => void
  canEdit?: boolean
  compact?: boolean
}

export default function ImageGallery({ 
  images, 
  onImageDeleted, 
  canEdit = false,
  compact = false 
}: ImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<NoteImage | null>(null)
  const [deletingImageId, setDeletingImageId] = useState<string | null>(null)

  const handleDeleteImage = async (imageId: string) => {
    if (!canEdit) return

    const confirmed = window.confirm('Are you sure you want to delete this image?')
    if (!confirmed) return

    setDeletingImageId(imageId)
    try {
      const success = await deleteNoteImage(imageId)
      if (success) {
        onImageDeleted()
      } else {
        alert('Failed to delete image. Please try again.')
      }
    } catch (error) {
      console.error('Delete error:', error)
      alert('Failed to delete image. Please try again.')
    } finally {
      setDeletingImageId(null)
    }
  }

  if (images.length === 0) {
    return null
  }

  return (
    <>
      {/* Image Grid */}
      <div className={`grid gap-4 ${compact ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
        {images.map((image) => (
          <div
            key={image.id}
            className="group relative bg-slate-700/30 border border-slate-600 rounded-lg overflow-hidden hover:border-slate-500 transition-colors"
          >
            {/* Image */}
            <div 
              className="aspect-video w-full cursor-pointer"
              onClick={() => setSelectedImage(image)}
            >
              <img
                src={image.image_url}
                alt={image.image_name}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                loading="lazy"
              />
            </div>

            {/* Image Info */}
            <div className="p-3">
              <h4 className="text-sm font-medium text-white truncate" title={image.image_name}>
                {image.image_name}
              </h4>
              <div className="flex justify-between items-center mt-1 text-xs text-slate-400">
                <span>{image.image_size && formatFileSize(image.image_size)}</span>
                <span>{new Date(image.created_at).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Delete Button */}
            {canEdit && (
              <button
                onClick={() => handleDeleteImage(image.id)}
                disabled={deletingImageId === image.id}
                className="absolute top-2 right-2 p-1.5 bg-red-600/80 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 disabled:opacity-50"
                title="Delete image"
              >
                {deletingImageId === image.id ? (
                  <div className="w-4 h-4 border border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            {/* Close Button */}
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300 transition-colors"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Image */}
            <img
              src={selectedImage.image_url}
              alt={selectedImage.image_name}
              className="max-w-full max-h-full object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />

            {/* Image Info */}
            <div className="absolute bottom-0 left-0 right-0 bg-black/80 text-white p-4 rounded-b-lg">
              <h3 className="font-medium">{selectedImage.image_name}</h3>
              <div className="flex justify-between items-center mt-1 text-sm text-gray-300">
                <span>
                  {selectedImage.image_size && formatFileSize(selectedImage.image_size)}
                  {selectedImage.image_type && ` • ${selectedImage.image_type}`}
                </span>
                <span>{new Date(selectedImage.created_at).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}