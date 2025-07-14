import React from 'react';
import { Note, NoteCategory } from '@/lib/database.types';
import { FaPlus } from 'react-icons/fa';
import { ICON_MAP } from '@/lib/icons';

function getCategoryIcon(icon: string | undefined | null) {
  const IconComponent = (icon && ICON_MAP[icon]) || ICON_MAP.fallback;
  return <IconComponent />;
}

interface CategorySidebarProps {
  categories: NoteCategory[];
  notes: Note[];
  selectedCategoryId?: string;
  onSelectCategory: (categoryId: string | undefined) => void;
  onSelectNote: (note: Note) => void;
  headerAction?: () => void;
}

const CategorySidebar: React.FC<CategorySidebarProps> = ({
  categories,
  notes,
  selectedCategoryId,
  onSelectCategory,
  onSelectNote,
  headerAction,
}) => {
  // Notes in selected category
  const notesInCategory = selectedCategoryId
    ? notes.filter(n => n.category_id === selectedCategoryId)
    : notes;

  return (
    <aside className="w-full md:w-72 bg-slate-800/90 border-r border-slate-700 h-full flex flex-col overflow-y-auto rounded-xl">
      <div className="p-4 border-b border-slate-700 flex items-center justify-between">
        <span className="text-lg font-bold text-white">Categories</span>
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
        <button
          className={`w-full flex items-center px-2 py-2 mb-2 rounded-lg font-medium transition-colors ${selectedCategoryId == null ? 'bg-blue-600/30 text-blue-300' : 'hover:bg-slate-700/50 text-slate-200'}`}
          onClick={() => onSelectCategory(undefined)}
        >
          <span className="mr-2 text-xl">📂</span>
          <span className="truncate">All Categories</span>
        </button>
        {categories.map(category => (
          <div
            key={category.id}
            className={`flex items-center px-2 py-2 rounded-lg cursor-pointer transition-colors ${selectedCategoryId === category.id ? 'bg-blue-600/30 text-blue-300' : 'hover:bg-slate-700/50 text-slate-200'}`}
            onClick={() => onSelectCategory(category.id)}
          >
            <span className="mr-2 text-xl">{getCategoryIcon(category.icon)}</span>
            <span className="truncate">{category.name}</span>
          </div>
        ))}
      </nav>
    </aside>
  );
}

export default CategorySidebar; 