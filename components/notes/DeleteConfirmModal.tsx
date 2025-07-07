'use client'

interface DeleteConfirmModalProps {
  isOpen: boolean
  noteTitle: string
  onConfirm: () => void
  onCancel: () => void
  isDeleting: boolean
}

export default function DeleteConfirmModal({ 
  isOpen, 
  noteTitle, 
  onConfirm, 
  onCancel, 
  isDeleting 
}: DeleteConfirmModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 max-w-md w-full shadow-2xl">
        <div className="flex items-center space-x-3 mb-4">
          <div className="text-3xl">⚠️</div>
          <h3 className="text-xl font-bold text-white">Delete Note: 'noteTitle'</h3>
        </div>
        
        <p className="text-slate-300 mb-2">
          Are you sure you want to delete this note?
        </p>
        
        <p className="text-slate-400 text-sm mb-6 bg-slate-700/50 p-3 rounded border-l-4 border-red-500">
          <strong className="text-slate-200">"{noteTitle}"</strong><br />
          This action cannot be undone.
        </p>
        
        <div className="flex space-x-3">
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="flex-1 bg-slate-600 hover:bg-slate-500 text-white p-3 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white p-3 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50"
          >
            {isDeleting ? 'Deleting...' : 'Delete Note'}
          </button>
        </div>
      </div>
    </div>
  )
}