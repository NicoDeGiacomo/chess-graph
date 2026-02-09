import { useState } from 'react';
import { useRepertoire } from '../hooks/useRepertoire.tsx';
import { NODE_COLOR_LABELS, type NodeColor } from '../types/index.ts';

export function NodeDetails() {
  const { state, updateNode } = useRepertoire();
  const { nodesMap, selectedNodeId } = state;
  const [isEditingComment, setIsEditingComment] = useState(false);
  const [commentDraft, setCommentDraft] = useState('');

  const selectedNode = selectedNodeId ? nodesMap.get(selectedNodeId) : null;

  if (!selectedNode) {
    return (
      <div className="p-3 text-zinc-500 text-sm">
        Select a node to view details
      </div>
    );
  }

  // Build move path from root to selected node
  const movePath: string[] = [];
  let current = selectedNode;
  while (current.parentId) {
    if (current.move) movePath.unshift(current.move);
    const parent = nodesMap.get(current.parentId);
    if (!parent) break;
    current = parent;
  }

  const startEditComment = () => {
    setCommentDraft(selectedNode.comment);
    setIsEditingComment(true);
  };

  const saveComment = () => {
    updateNode(selectedNode.id, { comment: commentDraft });
    setIsEditingComment(false);
  };

  return (
    <div className="p-3 space-y-3 text-sm overflow-y-auto">
      {/* Move path */}
      {movePath.length > 0 && (
        <div className="flex flex-wrap gap-1 items-center">
          {movePath.map((move, i) => (
            <span key={i} className="flex items-center gap-1">
              {i > 0 && <span className="text-zinc-600">→</span>}
              <span className="bg-zinc-800 rounded px-1.5 py-0.5 text-xs font-mono text-zinc-300">
                {move}
              </span>
            </span>
          ))}
        </div>
      )}

      {/* FEN */}
      <div>
        <div className="text-zinc-500 text-xs mb-0.5">FEN</div>
        <div className="font-mono text-[10px] text-zinc-400 bg-zinc-900 rounded p-1.5 break-all select-all">
          {selectedNode.fen}
        </div>
      </div>

      {/* Color indicator */}
      <div className="flex items-center gap-2">
        <div className="text-zinc-500 text-xs">Color</div>
        <div
          className="w-4 h-4 rounded border border-zinc-600"
          style={{ backgroundColor: selectedNode.color }}
        />
        <span className="text-xs text-zinc-400">
          {NODE_COLOR_LABELS[selectedNode.color as NodeColor] || 'Custom'}
        </span>
      </div>

      {/* Tags */}
      {selectedNode.tags.length > 0 && (
        <div>
          <div className="text-zinc-500 text-xs mb-1">Tags</div>
          <div className="flex flex-wrap gap-1">
            {selectedNode.tags.map((tag) => (
              <span key={tag} className="bg-zinc-800 text-zinc-300 rounded px-2 py-0.5 text-xs">
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Comment */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <div className="text-zinc-500 text-xs">Comment</div>
          {!isEditingComment && (
            <button
              className="text-xs text-blue-400 hover:text-blue-300"
              onClick={startEditComment}
            >
              {selectedNode.comment ? 'Edit' : 'Add'}
            </button>
          )}
        </div>
        {isEditingComment ? (
          <div className="space-y-1">
            <textarea
              autoFocus
              className="w-full bg-zinc-900 border border-zinc-600 rounded p-2 text-xs text-zinc-100 outline-none focus:border-blue-500 resize-none"
              rows={3}
              value={commentDraft}
              onChange={(e) => setCommentDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) saveComment();
                if (e.key === 'Escape') setIsEditingComment(false);
              }}
            />
            <div className="flex gap-1 justify-end">
              <button
                className="text-xs text-zinc-400 hover:text-zinc-300 px-2 py-0.5"
                onClick={() => setIsEditingComment(false)}
              >
                Cancel
              </button>
              <button
                className="text-xs bg-blue-600 hover:bg-blue-500 text-white rounded px-2 py-0.5"
                onClick={saveComment}
              >
                Save
              </button>
            </div>
          </div>
        ) : selectedNode.comment ? (
          <p className="text-zinc-300 text-xs bg-zinc-900 rounded p-2 whitespace-pre-wrap">
            {selectedNode.comment}
          </p>
        ) : (
          <p className="text-zinc-600 text-xs italic">No comment</p>
        )}
      </div>

      {/* Transposition link info */}
      {selectedNode.transposesTo && (
        <div>
          <div className="text-zinc-500 text-xs mb-0.5">Transposition</div>
          <div className="text-yellow-400 text-xs">
            Links to: {nodesMap.get(selectedNode.transposesTo)?.move || 'root'}
          </div>
        </div>
      )}
    </div>
  );
}
