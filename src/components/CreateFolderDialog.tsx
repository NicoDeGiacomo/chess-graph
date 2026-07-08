import { useState, useCallback } from 'react';

interface CreateFolderDialogProps {
  open: boolean;
  onClose: () => void;
  onCreate: (name: string) => void;
}

function CreateFolderDialogInner({ onClose, onCreate }: Omit<CreateFolderDialogProps, 'open'>) {
  const [name, setName] = useState('');

  const inputRef = useCallback((el: HTMLInputElement | null) => {
    el?.focus();
  }, []);

  const handleCreate = () => {
    if (!name.trim()) return;
    onCreate(name.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'var(--color-overlay)' }} onClick={onClose}>
      <div
        className="bg-card border border-border rounded-xl p-6 w-full max-w-sm mx-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-folder-dialog-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="create-folder-dialog-title" className="text-lg font-medium text-primary mb-4">New Folder</h2>

        <div>
          <label htmlFor="create-folder-name" className="block text-xs text-tertiary mb-1">Name</label>
          <input
            id="create-folder-name"
            ref={inputRef}
            className="w-full bg-input border border-border rounded px-3 py-2 text-sm text-primary outline-none focus:border-blue-500"
            placeholder="Folder name..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreate();
              if (e.key === 'Escape') onClose();
            }}
          />
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

export function CreateFolderDialog({ open, ...rest }: CreateFolderDialogProps) {
  if (!open) return null;
  return <CreateFolderDialogInner {...rest} />;
}
