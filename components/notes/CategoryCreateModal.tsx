import { useState, useEffect } from 'react'
import { ICON_OPTIONS } from '@/lib/icons';

export default function CategoryCreateModal({ isOpen, onClose, onCreate, loading }: {
  isOpen: boolean
  onClose: () => void
  onCreate: (name: string, icon: string) => void
  loading?: boolean
}) {
  const [name, setName] = useState('')
  const [icon, setIcon] = useState(ICON_OPTIONS[0].key)

  useEffect(() => {
    if (isOpen) {
      setName('')
      setIcon(ICON_OPTIONS[0].key)
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-slate-800 rounded-lg shadow-xl p-8 w-full max-w-md border border-slate-700">
        <h2 className="text-xl font-bold mb-4 text-white">Create Category</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-300 mb-2">Name</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full p-2 rounded bg-slate-700 border border-slate-600 text-white focus:ring-2 focus:ring-blue-500"
            placeholder="Category name"
            disabled={loading}
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-300 mb-2">Icon</label>
          <div className="grid grid-cols-6 gap-2">
            {ICON_OPTIONS.map(opt => (
              <button
                key={opt.key}
                type="button"
                className={`flex flex-col items-center justify-center p-2 rounded border transition-all duration-200 ${icon === opt.key ? 'border-blue-500 bg-blue-500/20 text-blue-400' : 'border-slate-600 bg-slate-700/30 text-slate-300 hover:border-slate-500 hover:bg-slate-700/50'}`}
                onClick={() => setIcon(opt.key)}
                disabled={loading}
                tabIndex={0}
              >
                <opt.icon className="text-xl mb-1" />
                <span className="text-xs">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-slate-600 text-white hover:bg-slate-700 transition-colors"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={() => onCreate(name, icon)}
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition-colors font-semibold"
            disabled={loading || !name}
          >
            Create
          </button>
        </div>
      </div>
    </div>
  )
} 