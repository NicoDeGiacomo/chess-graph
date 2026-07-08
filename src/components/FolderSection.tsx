import { useState, useRef, useEffect, useCallback } from 'react';
import type { Folder } from '../types/index.ts';
import type { ReactNode } from 'react';

interface FolderSectionProps {
  folder: Folder | null; // null = Uncategorized
  repertoireCount: number;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  onRename?: (name: string) => void;
  onDelete?: () => void;
  onDrop: (repertoireId: string) => void;
  forceOpen: boolean;
  children: ReactNode;
}

export function FolderSection({
  folder,
  repertoireCount,
  collapsed,
  onToggleCollapsed,
  onRename,
  onDelete,
  onDrop,
  forceOpen,
  children,
}: FolderSectionProps) {
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const isOpen = forceOpen || !collapsed;
  const isUncategorized = folder === null;
  const name = folder?.name ?? 'Uncategorized';

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  useEffect(() => {
    if (!showMenu) return;
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

  const handleStartRename = useCallback(() => {
    setEditName(name);
    setEditing(true);
    setShowMenu(false);
  }, [name]);

  const handleFinishRename = useCallback(() => {
    if (editName.trim() && editName.trim() !== name && onRename) {
      onRename(editName.trim());
    }
    setEditing(false);
  }, [editName, name, onRename]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    if (e.dataTransfer.types.includes('application/x-repertoire-id')) {
      e.preventDefault();
      setDragOver(true);
    }
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const repertoireId = e.dataTransfer.getData('application/x-repertoire-id');
    if (repertoireId) {
      onDrop(repertoireId);
    }
  }, [onDrop]);

  return (
    <div data-testid={`folder-section-${folder?.id ?? 'uncategorized'}`}>
      {/* Header */}
      <div
        className={`flex items-center gap-2 py-2 px-1 rounded-lg mb-1 transition-colors ${dragOver ? 'bg-blue-500/10 ring-1 ring-blue-500/30' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <button
          className="text-muted hover:text-secondary shrink-0"
          onClick={onToggleCollapsed}
          aria-label={isOpen ? 'Collapse folder' : 'Expand folder'}
          data-testid={`folder-toggle-${folder?.id ?? 'uncategorized'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-90' : ''}`}>
            <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
          </svg>
        </button>

        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-muted shrink-0">
          <path d="M3.75 3A1.75 1.75 0 002 4.75v3.26a3.235 3.235 0 011.75-.51h12.5c.644 0 1.245.188 1.75.51V6.75A1.75 1.75 0 0016.25 5h-4.836a.25.25 0 01-.177-.073L9.823 3.513A1.75 1.75 0 008.586 3H3.75zM3.75 9A1.75 1.75 0 002 10.75v4.5c0 .966.784 1.75 1.75 1.75h12.5A1.75 1.75 0 0018 15.25v-4.5A1.75 1.75 0 0016.25 9H3.75z" />
        </svg>

        {editing ? (
          <input
            ref={inputRef}
            className="flex-1 bg-input border border-border rounded px-2 py-0.5 text-sm text-primary outline-none focus:border-blue-500"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onBlur={handleFinishRename}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleFinishRename();
              if (e.key === 'Escape') setEditing(false);
            }}
          />
        ) : (
          <span
            className="text-sm font-medium text-primary truncate cursor-default"
            onDoubleClick={!isUncategorized ? handleStartRename : undefined}
          >
            {name}
          </span>
        )}

        <span className="text-xs text-muted shrink-0">{repertoireCount}</span>

        {!isUncategorized && (
          <div className="relative ml-auto shrink-0">
            <button
              className="text-muted hover:text-secondary p-0.5"
              onClick={() => setShowMenu(!showMenu)}
              aria-label="Folder options"
              data-testid={`folder-menu-${folder?.id}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path d="M3 10a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zM8.5 10a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zM15.5 8.5a1.5 1.5 0 100 3 1.5 1.5 0 000-3z" />
              </svg>
            </button>
            {showMenu && (
              <div ref={menuRef} className="absolute right-0 top-6 z-50 bg-elevated border border-border rounded-lg shadow-xl py-1 min-w-[120px] text-sm">
                <button
                  className="w-full text-left px-3 py-1.5 hover:bg-input text-primary"
                  onClick={handleStartRename}
                >
                  Rename
                </button>
                <button
                  className="w-full text-left px-3 py-1.5 hover:bg-input text-red-400"
                  onClick={() => { setShowMenu(false); onDelete?.(); }}
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Children (cards grid) */}
      {isOpen && children}
    </div>
  );
}
