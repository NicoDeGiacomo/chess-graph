import { useEffect, useRef, useState } from 'react';
import { useRepertoire } from '../hooks/useRepertoire.tsx';
import { NODE_COLORS, NODE_COLOR_LABELS, type NodeColor } from '../types/index.ts';

export function ContextMenu() {
  const { state, deleteNode, updateNode, setContextMenu, setEditingNodeId, setLinkingNodeId } = useRepertoire();
  const { contextMenu, nodesMap } = state;
  const menuRef = useRef<HTMLDivElement>(null);
  const prevNodeIdRef = useRef<string | null>(null);

  // Reset sub-state when context menu target changes
  const contextNodeId = contextMenu?.nodeId ?? null;
  let resetSubState = false;
  if (contextNodeId !== prevNodeIdRef.current) {
    prevNodeIdRef.current = contextNodeId;
    resetSubState = true;
  }

  const [showColors, setShowColors] = useState(false);
  const [tagInput, setTagInput] = useState<string | null>(null);
  if (resetSubState && (showColors || tagInput !== null)) {
    setShowColors(false);
    setTagInput(null);
  }

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setContextMenu(null);
      }
    }
    if (contextMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [contextMenu, setContextMenu]);

  if (!contextMenu) return null;

  const node = nodesMap.get(contextMenu.nodeId);
  if (!node) return null;

  const isRoot = node.parentId === null;

  // Clamp menu position to viewport
  const x = Math.min(contextMenu.x, window.innerWidth - 200);
  const y = Math.min(contextMenu.y, window.innerHeight - 300);

  const handleColorChange = (color: NodeColor) => {
    updateNode(contextMenu.nodeId, { color });
    setContextMenu(null);
  };

  const handleAddTag = () => {
    if (tagInput === null) {
      setTagInput('');
      return;
    }
    if (tagInput.trim()) {
      const newTags = [...node.tags, tagInput.trim()];
      updateNode(contextMenu.nodeId, { tags: newTags });
      setContextMenu(null);
    }
  };

  const handleRemoveTag = (tag: string) => {
    const newTags = node.tags.filter((t) => t !== tag);
    updateNode(contextMenu.nodeId, { tags: newTags });
  };

  return (
    <div
      ref={menuRef}
      className="fixed z-50 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl py-1 min-w-[180px] text-sm"
      style={{ top: y, left: x }}
    >
      <button
        className="w-full text-left px-3 py-1.5 hover:bg-zinc-700 text-zinc-100"
        onClick={() => setEditingNodeId(contextMenu.nodeId)}
      >
        Edit Comment
      </button>

      {!isRoot && (
        <button
          className="w-full text-left px-3 py-1.5 hover:bg-zinc-700 text-red-400"
          onClick={() => deleteNode(contextMenu.nodeId)}
        >
          Delete
        </button>
      )}

      <div className="border-t border-zinc-700 my-1" />

      <div className="relative">
        <button
          className="w-full text-left px-3 py-1.5 hover:bg-zinc-700 text-zinc-100 flex justify-between items-center"
          onClick={() => setShowColors(!showColors)}
        >
          Change Color
          <span className="text-zinc-500 text-xs">{showColors ? '▼' : '▶'}</span>
        </button>
        {showColors && (
          <div className="px-2 pb-1">
            <div className="flex gap-1 flex-wrap">
              {(Object.entries(NODE_COLORS) as [string, NodeColor][]).map(([key, color]) => (
                <button
                  key={key}
                  className="w-6 h-6 rounded border border-zinc-600 hover:ring-1 hover:ring-zinc-400"
                  style={{ backgroundColor: color }}
                  title={NODE_COLOR_LABELS[color]}
                  onClick={() => handleColorChange(color)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-zinc-700 my-1" />

      {tagInput !== null ? (
        <div className="px-3 py-1.5 flex gap-1">
          <input
            autoFocus
            className="flex-1 bg-zinc-900 border border-zinc-600 rounded px-2 py-0.5 text-xs text-zinc-100 outline-none focus:border-blue-500"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAddTag();
              if (e.key === 'Escape') setTagInput(null);
            }}
            placeholder="Tag name..."
          />
          <button
            className="text-xs text-blue-400 hover:text-blue-300"
            onClick={handleAddTag}
          >
            Add
          </button>
        </div>
      ) : (
        <button
          className="w-full text-left px-3 py-1.5 hover:bg-zinc-700 text-zinc-100"
          onClick={() => setTagInput('')}
        >
          Add Tag
        </button>
      )}

      {node.tags.length > 0 && (
        <div className="px-3 py-1 flex gap-1 flex-wrap">
          {node.tags.map((tag) => (
            <span key={tag} className="text-[10px] bg-zinc-700 rounded px-1.5 py-0.5 flex items-center gap-1 text-zinc-300">
              {tag}
              <button
                className="text-zinc-500 hover:text-red-400"
                onClick={() => handleRemoveTag(tag)}
              >
                x
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="border-t border-zinc-700 my-1" />

      <button
        className="w-full text-left px-3 py-1.5 hover:bg-zinc-700 text-zinc-100"
        onClick={() => setLinkingNodeId(contextMenu.nodeId)}
      >
        Link Transposition
      </button>

      {node.transposesTo && (
        <div className="px-3 py-1 text-yellow-400 text-[10px]">
          Has transposition link
        </div>
      )}
    </div>
  );
}
