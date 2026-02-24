import { useState, useCallback } from 'react';
import { useRepertoire } from '../hooks/useRepertoire.tsx';

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [text]);

  return (
    <button
      className="text-xs text-zinc-400 hover:text-zinc-200 flex items-center gap-1"
      onClick={handleCopy}
      aria-label={`Copy ${label}`}
    >
      {copied ? (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-green-400" aria-hidden="true">
          <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5" aria-hidden="true">
          <path d="M7 3.5A1.5 1.5 0 018.5 2h3.879a1.5 1.5 0 011.06.44l3.122 3.12A1.5 1.5 0 0117 6.622V12.5a1.5 1.5 0 01-1.5 1.5h-1v-3.379a3 3 0 00-.879-2.121L10.5 5.379A3 3 0 008.379 4.5H7v-1z" />
          <path d="M4.5 6A1.5 1.5 0 003 7.5v9A1.5 1.5 0 004.5 18h7a1.5 1.5 0 001.5-1.5v-5.879a1.5 1.5 0 00-.44-1.06L9.44 6.439A1.5 1.5 0 008.378 6H4.5z" />
        </svg>
      )}
      {copied ? 'Copied' : label}
    </button>
  );
}

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

  // Build PGN from move path (e.g. "1. e4 e5 2. Nf3")
  const pgn = movePath.reduce((acc, move, i) => {
    if (i % 2 === 0) {
      return acc + (acc ? ' ' : '') + `${Math.floor(i / 2) + 1}. ${move}`;
    }
    return acc + ' ' + move;
  }, '');

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
      <div className="flex flex-wrap gap-1 items-center min-h-[28px]">
        {movePath.length > 0 ? (
          movePath.map((move, i) => (
            <span key={i} className="flex items-center gap-1">
              {i > 0 && <span className="text-zinc-600">→</span>}
              <span className="bg-zinc-800 rounded px-1.5 py-0.5 text-xs font-mono text-zinc-300">
                {move}
              </span>
            </span>
          ))
        ) : (
          <span className="text-zinc-600 text-xs italic">Starting position</span>
        )}
      </div>

      {/* FEN */}
      <div>
        <div className="flex items-center justify-between mb-0.5">
          <div className="text-zinc-500 text-xs">FEN</div>
          <CopyButton text={selectedNode.fen} label="FEN" />
        </div>
        <div className="font-mono text-[10px] text-zinc-400 bg-zinc-900 rounded p-1.5 break-all select-all">
          {selectedNode.fen}
        </div>
      </div>

      {/* PGN */}
      <div>
        <div className="flex items-center justify-between mb-0.5">
          <div className="text-zinc-500 text-xs">PGN</div>
          <CopyButton text={pgn} label="PGN" />
        </div>
        <div className="font-mono text-[10px] text-zinc-400 bg-zinc-900 rounded p-1.5 truncate">
          {pgn || <span className="text-zinc-600 italic">—</span>}
        </div>
      </div>

      {/* Tags */}
      <div>
        <div className="text-zinc-500 text-xs mb-1">Tags</div>
        {selectedNode.tags.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {selectedNode.tags.map((tag) => (
              <span key={tag} className="bg-zinc-800 text-zinc-300 rounded px-2 py-0.5 text-xs">
                {tag}
              </span>
            ))}
          </div>
        ) : (
          <div className="text-zinc-600 text-xs italic">No tags</div>
        )}
      </div>

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
