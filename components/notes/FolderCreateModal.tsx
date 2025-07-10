import { useState, useEffect } from 'react'

const ICONS = [
  { value: 'general', label: '📝 General' },
  { value: 'npc', label: '🧙‍♂️ NPC' },
  { value: 'location', label: '🏰 Location' },
  { value: 'quest', label: '⚔️ Quest' },
  { value: 'session', label: '🎲 Session' },
  { value: 'item', label: '⚡ Item' },
  { value: 'lore', label: '📚 Lore' },
  { value: 'pantheon', label: '🛐 Pantheon' },
  { value: 'custom', label: '📁 Custom' },
]

export default function FolderCreateModal({ isOpen, onClose, onCreate, parentFolder, loading }: {
  isOpen: boolean
  onClose: () => void
  onCreate: (name: string, icon: string) => void
  parentFolder?: { id: string, name: string }
  loading?: boolean
}) {
  const [name, setName] = useState('')
  const [icon, setIcon] = useState('custom')

  useEffect(() => {
    if (isOpen) {
      setName('')
      setIcon('custom')
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-white">Create {parentFolder ? 'Subfolder' : 'Folder'}</h3>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {parentFolder && (
          <div className="mb-4 text-slate-400 text-sm">
            Parent: <span className="font-medium text-white">{parentFolder.name}</span>
          </div>
        )}
        <form
          onSubmit={e => {
            e.preventDefault()
            if (name.trim()) onCreate(name.trim(), icon)
          }}
          className="space-y-6"
        >
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-300">Folder Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full p-3 bg-slate-700/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-white placeholder-slate-400"
              placeholder="Enter folder name..."
              required
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-300">Icon</label>
            <div className="grid grid-cols-3 gap-2">
              {ICONS.map(opt => (
                <button
                  type="button"
                  key={opt.value}
                  className={`flex items-center space-x-2 p-2 rounded-lg border transition-all duration-200 w-full justify-center ${icon === opt.value ? 'border-blue-500 bg-blue-500/20 text-blue-400' : 'border-slate-600 bg-slate-700/30 text-slate-300 hover:border-slate-500 hover:bg-slate-700/50'}`}
                  onClick={() => setIcon(opt.value)}
                >
                  <span className="text-xl">{opt.label.split(' ')[0]}</span>
                  <span className="text-xs">{opt.label.split(' ').slice(1).join(' ')}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="flex space-x-4 pt-2">
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white p-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
            >
              {loading ? 'Creating...' : 'Create'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-600 hover:bg-slate-500 text-white p-3 rounded-lg font-medium transition-all duration-200"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 