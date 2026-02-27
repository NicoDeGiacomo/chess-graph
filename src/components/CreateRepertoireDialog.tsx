import { useState, useCallback } from 'react';
import type { RepertoireSide } from '../types/index.ts';

interface CreateRepertoireDialogProps {
  open: boolean;
  onClose: () => void;
  onCreate: (name: string, side: RepertoireSide) => void;
}

function CreateRepertoireDialogInner({ onClose, onCreate }: Omit<CreateRepertoireDialogProps, 'open'>) {
  const [name, setName] = useState('');
  const [side, setSide] = useState<RepertoireSide>('white');

  const inputRef = useCallback((el: HTMLInputElement | null) => {
    el?.focus();
  }, []);

  const handleCreate = () => {
    if (!name.trim()) return;
    onCreate(name.trim(), side);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'var(--color-overlay)' }} onClick={onClose}>
      <div
        className="bg-card border border-border rounded-xl p-6 w-full max-w-sm mx-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-repertoire-dialog-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="create-repertoire-dialog-title" className="text-lg font-medium text-primary mb-4">New Graph</h2>

        <div className="space-y-3">
          <div>
            <label htmlFor="create-graph-name" className="block text-xs text-tertiary mb-1">Name</label>
            <input
              id="create-graph-name"
              ref={inputRef}
              className="w-full bg-input border border-border rounded px-3 py-2 text-sm text-primary outline-none focus:border-blue-500"
              placeholder="Graph name..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreate();
                if (e.key === 'Escape') onClose();
              }}
            />
          </div>

          <div>
            <label htmlFor="create-graph-side" className="block text-xs text-tertiary mb-1">Side</label>
            <select
              id="create-graph-side"
              className="w-full bg-input border border-border rounded px-3 py-2 text-sm text-primary outline-none focus:border-blue-500"
              value={side}
              onChange={(e) => setSide(e.target.value as RepertoireSide)}
            >
              <option value="white">White</option>
              <option value="black">Black</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-5">
          <button
            className="text-sm text-tertiary hover:text-secondary px-3 py-1.5"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="text-sm bg-blue-600 hover:bg-blue-500 text-white rounded px-4 py-1.5"
            onClick={handleCreate}
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}

// Conditionally rendering inner component resets state each time dialog opens
export function CreateRepertoireDialog({ open, onClose, onCreate }: CreateRepertoireDialogProps) {
  if (!open) return null;
  return <CreateRepertoireDialogInner onClose={onClose} onCreate={onCreate} />;
}
