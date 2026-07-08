import { useEffect, useRef } from 'react';
import type { Folder } from '../types/index.ts';

interface FolderContextMenuProps {
  x: number;
  y: number;
  currentFolderId: string | null;
  folders: Folder[];
  onMove: (folderId: string | null) => void;
  onClose: () => void;
}

export function FolderContextMenu({ x, y, currentFolderId, folders, onMove, onClose }: FolderContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  // Clamp to viewport
  const menuX = Math.min(x, window.innerWidth - 220);
  const menuY = Math.min(y, window.innerHeight - 200);

  return (
    <div
      ref={menuRef}
      role="menu"
      className="fixed z-50 bg-elevated border border-border rounded-lg shadow-xl py-1 min-w-[180px] text-sm"
      style={{ top: menuY, left: menuX }}
    >
      <div className="px-3 py-1.5 text-xs text-muted">Move to</div>

      <button
        role="menuitem"
        className="w-full text-left px-3 py-1.5 hover:bg-input text-primary flex items-center justify-between"
        onClick={() => onMove(null)}
      >
        Uncategorized
        {currentFolderId === null && <span className="text-blue-400">&#10003;</span>}
      </button>

      {folders.map((folder) => (
        <button
          key={folder.id}
          role="menuitem"
          className="w-full text-left px-3 py-1.5 hover:bg-input text-primary flex items-center justify-between"
          onClick={() => onMove(folder.id)}
        >
          <span className="truncate">{folder.name}</span>
          {currentFolderId === folder.id && <span className="text-blue-400">&#10003;</span>}
        </button>
      ))}
    </div>
  );
}
