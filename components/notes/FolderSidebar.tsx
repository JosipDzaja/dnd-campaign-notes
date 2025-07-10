import React, { useState } from 'react';
import { Note } from '@/lib/database.types';
import { FaFolder, FaEllipsisV, FaPlus, FaEdit, FaTrash, FaChevronDown, FaChevronRight } from 'react-icons/fa';

// Icons for root folders (same as note categories)
const ROOT_ICONS: Record<string, string> = {
  general: '📝',
  npc: '🧙‍♂️',
  location: '🏰',
  quest: '⚔️',
  session: '🎲',
  item: '⚡',
  lore: '📚',
  pantheon: '🛐',
};

interface Folder {
  id: string;
  name: string;
  icon?: string;
  parent_id?: string | null;
  children?: Folder[];
}

interface FolderSidebarProps {
  folders: Folder[];
  notes: Note[];
  selectedFolderId?: string;
  onSelectFolder: (folderId: string | undefined) => void;
  onCreateSubfolder: (parentId: string) => void;
  onEditFolder: (folderId: string) => void;
  onDeleteFolder: (folderId: string) => void;
  onReorder: (sourceId: string, destId: string | null) => void;
  onSelectNote: (note: Note) => void;
  headerAction?: () => void;
}

const FolderSidebar: React.FC<FolderSidebarProps> = ({
  folders,
  notes,
  selectedFolderId,
  onSelectFolder,
  onCreateSubfolder,
  onEditFolder,
  onDeleteFolder,
  onReorder,
  onSelectNote,
  headerAction,
}) => {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const handleToggle = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Recursive render for folder tree
  const renderFolders = (folders: Folder[], depth = 0) => {
    return folders.map((folder) => {
      const isRoot = !folder.parent_id;
      const isExpanded = expanded[folder.id] || false;
      const isSelected = selectedFolderId === folder.id;
      const icon = isRoot ? (ROOT_ICONS[folder.icon || 'general'] || '🗂️') : <FaFolder className="inline mr-1" />;
      return (
        <div key={folder.id} className={`pl-${depth * 4} mb-1`}> {/* Tailwind: pl-0, pl-4, pl-8, ... */}
          <div
            className={`flex items-center rounded-lg px-2 py-2 cursor-pointer transition-colors ${isSelected ? 'bg-blue-600/30 text-blue-300' : 'hover:bg-slate-700/50 text-slate-200'}`}
            onClick={() => onSelectFolder(folder.id)}
          >
            {folder.children && folder.children.length > 0 ? (
              <button
                className="mr-1 text-slate-400 hover:text-blue-400 focus:outline-none"
                onClick={e => { e.stopPropagation(); handleToggle(folder.id); }}
                aria-label={isExpanded ? 'Collapse' : 'Expand'}
              >
                {isExpanded ? <FaChevronDown /> : <FaChevronRight />}
              </button>
            ) : (
              <span className="w-4 inline-block" />
            )}
            <span className="mr-2 text-xl">{icon}</span>
            <span className="flex-1 truncate">{folder.name}</span>
            {/* Folder actions */}
            <div className="flex items-center space-x-1 ml-2">
              <button
                className="p-1 text-slate-400 hover:text-blue-400"
                onClick={e => { e.stopPropagation(); onCreateSubfolder(folder.id); }}
                title="Add subfolder"
              >
                <FaPlus />
              </button>
              <button
                className="p-1 text-slate-400 hover:text-yellow-400"
                onClick={e => { e.stopPropagation(); onEditFolder(folder.id); }}
                title="Rename folder"
              >
                <FaEdit />
              </button>
              {/* Only allow deleting subfolders */}
              {folder.parent_id && (
                <button
                  className="p-1 text-slate-400 hover:text-red-400"
                  onClick={e => { e.stopPropagation(); onDeleteFolder(folder.id); }}
                  title="Delete folder"
                >
                  <FaTrash />
                </button>
              )}
            </div>
          </div>
          {/* Subfolders */}
          {isExpanded && folder.children && folder.children.length > 0 && (
            <div className="ml-4 border-l border-slate-700 pl-2">
              {renderFolders(folder.children, depth + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  // Notes in selected folder
  const notesInFolder = notes.filter(n => n.folder_id === selectedFolderId);

  return (
    <aside className="w-full md:w-72 bg-slate-800/90 border-r border-slate-700 h-full flex flex-col overflow-y-auto">
      <div className="p-4 border-b border-slate-700 flex items-center justify-between">
        <span className="text-lg font-bold text-white">Categories</span>
        {/* Add root folder button if provided */}
        {headerAction && (
          <button
            className="p-2 text-slate-400 hover:text-blue-400 rounded-full hover:bg-slate-700/50 transition-colors"
            onClick={headerAction}
            title="New Category"
          >
            <FaPlus />
          </button>
        )}
      </div>
      <nav className="flex-1 p-2 space-y-1">
        {/* All Categories button */}
        <button
          className={`w-full flex items-center px-2 py-2 mb-2 rounded-lg font-medium transition-colors ${selectedFolderId == null ? 'bg-blue-600/30 text-blue-300' : 'hover:bg-slate-700/50 text-slate-200'}`}
          onClick={() => onSelectFolder(undefined)}
        >
          <span className="mr-2 text-xl">📂</span>
          <span className="truncate">All Categories</span>
        </button>
        {renderFolders(folders)}
      </nav>
      {/* Notes list for selected folder */}
      <div className="border-t border-slate-700 p-2">
        <span className="block text-xs text-slate-400 mb-2">Notes in folder</span>
        {notesInFolder.length === 0 ? (
          <div className="text-slate-500 text-sm italic">No notes in this folder</div>
        ) : (
          <ul className="space-y-1">
            {notesInFolder.map(note => (
              <li key={note.id}>
                <button
                  className="w-full text-left px-2 py-1 rounded hover:bg-blue-500/20 text-slate-200 hover:text-blue-300 transition-colors truncate"
                  onClick={() => onSelectNote(note)}
                >
                  {note.title}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
};

export default FolderSidebar; 