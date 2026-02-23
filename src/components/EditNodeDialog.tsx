import { useState } from 'react';
import { useRepertoire } from '../hooks/useRepertoire.tsx';
import type { RepertoireNode } from '../types/index.ts';

function EditNodeForm({ node, onSave, onClose }: { node: RepertoireNode; onSave: (comment: string) => void; onClose: () => void }) {
  const [comment, setComment] = useState(node.comment);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-4 w-[400px] max-w-[90vw] shadow-xl" role="dialog" aria-modal="true" aria-labelledby="edit-node-dialog-title" onClick={(e) => e.stopPropagation()}>
        <h3 id="edit-node-dialog-title" className="text-sm font-medium text-zinc-100 mb-2">
          Edit Comment — {node.move || 'Start'}
        </h3>
        <textarea
          autoFocus
          className="w-full bg-zinc-950 border border-zinc-700 rounded p-2 text-sm text-zinc-100 outline-none focus:border-blue-500 resize-none"
          rows={4}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) onSave(comment);
            if (e.key === 'Escape') onClose();
          }}
          placeholder="Add a comment about this position..."
        />
        <div className="flex justify-end gap-2 mt-3">
          <button
            className="text-sm text-zinc-400 hover:text-zinc-200 px-3 py-1"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="text-sm bg-blue-600 hover:bg-blue-500 text-white rounded px-3 py-1"
            onClick={() => onSave(comment)}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

export function EditNodeDialog() {
  const { state, updateNode, setEditingNodeId } = useRepertoire();
  const { editingNodeId, nodesMap } = state;

  const node = editingNodeId ? nodesMap.get(editingNodeId) : null;
  if (!editingNodeId || !node) return null;

  return (
    <EditNodeForm
      key={editingNodeId}
      node={node}
      onSave={(comment) => {
        updateNode(editingNodeId, { comment });
        setEditingNodeId(null);
      }}
      onClose={() => setEditingNodeId(null)}
    />
  );
}
