import { useState, useRef } from 'react';
import { useRepertoire } from '../hooks/useRepertoire.tsx';
import type { ExportData, RepertoireSide } from '../types/index.ts';

export function TopBar() {
  const {
    state,
    switchRepertoire,
    createRepertoire,
    deleteRepertoire,
    renameRepertoire,
    exportData,
    importData,
  } = useRepertoire();
  const { repertoire, repertoireList } = state;

  const [showNewForm, setShowNewForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newSide, setNewSide] = useState<RepertoireSide>('white');
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameDraft, setRenameDraft] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    await createRepertoire(newName.trim(), newSide);
    setNewName('');
    setShowNewForm(false);
  };

  const handleExport = async () => {
    const data = await exportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chess-graph-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text) as ExportData;
      await importData(data);
    } catch (err) {
      console.error('Import failed:', err);
      alert('Failed to import. Please check the file format.');
    }
    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const startRename = () => {
    if (!repertoire) return;
    setRenameDraft(repertoire.name);
    setIsRenaming(true);
  };

  const handleRename = async () => {
    if (!repertoire || !renameDraft.trim()) return;
    await renameRepertoire(repertoire.id, renameDraft.trim());
    setIsRenaming(false);
  };

  return (
    <div className="h-12 border-b border-zinc-800 flex items-center gap-3 px-4 bg-zinc-950 shrink-0">
      {/* Repertoire selector */}
      <select
        className="bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-sm text-zinc-100 outline-none focus:border-blue-500"
        value={repertoire?.id || ''}
        onChange={(e) => switchRepertoire(e.target.value)}
      >
        {repertoireList.map((r) => (
          <option key={r.id} value={r.id}>{r.name}</option>
        ))}
      </select>

      {/* Rename button */}
      {isRenaming ? (
        <div className="flex items-center gap-1">
          <input
            autoFocus
            className="bg-zinc-900 border border-zinc-700 rounded px-2 py-0.5 text-sm text-zinc-100 outline-none focus:border-blue-500 w-40"
            value={renameDraft}
            onChange={(e) => setRenameDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleRename();
              if (e.key === 'Escape') setIsRenaming(false);
            }}
          />
          <button
            className="text-xs text-blue-400 hover:text-blue-300"
            onClick={handleRename}
          >
            Save
          </button>
        </div>
      ) : (
        <button
          className="text-xs text-zinc-500 hover:text-zinc-300"
          onClick={startRename}
          title="Rename repertoire"
        >
          Rename
        </button>
      )}

      {/* Side indicator */}
      {repertoire && (
        <span className="text-xs text-zinc-500">
          ({repertoire.side})
        </span>
      )}

      <div className="flex-1" />

      {/* New Opening */}
      {showNewForm ? (
        <div className="flex items-center gap-2">
          <input
            autoFocus
            className="bg-zinc-900 border border-zinc-700 rounded px-2 py-0.5 text-sm text-zinc-100 outline-none focus:border-blue-500 w-36"
            placeholder="Opening name..."
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreate();
              if (e.key === 'Escape') setShowNewForm(false);
            }}
          />
          <select
            className="bg-zinc-900 border border-zinc-700 rounded px-1 py-0.5 text-xs text-zinc-100"
            value={newSide}
            onChange={(e) => setNewSide(e.target.value as RepertoireSide)}
          >
            <option value="white">White</option>
            <option value="black">Black</option>
          </select>
          <button
            className="text-xs bg-blue-600 hover:bg-blue-500 text-white rounded px-2 py-0.5"
            onClick={handleCreate}
          >
            Create
          </button>
          <button
            className="text-xs text-zinc-500 hover:text-zinc-300"
            onClick={() => setShowNewForm(false)}
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          className="text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-100 rounded px-3 py-1 border border-zinc-700"
          onClick={() => setShowNewForm(true)}
        >
          + New Opening
        </button>
      )}

      {/* Delete repertoire */}
      {repertoireList.length > 1 && (
        <button
          className="text-xs text-zinc-500 hover:text-red-400"
          onClick={() => {
            if (repertoire && confirm(`Delete "${repertoire.name}"?`)) {
              deleteRepertoire(repertoire.id);
            }
          }}
          title="Delete repertoire"
        >
          Delete
        </button>
      )}

      <div className="h-4 w-px bg-zinc-700" />

      {/* Export */}
      <button
        className="text-xs text-zinc-400 hover:text-zinc-200"
        onClick={handleExport}
      >
        Export
      </button>

      {/* Import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        className="hidden"
        onChange={handleImport}
      />
      <button
        className="text-xs text-zinc-400 hover:text-zinc-200"
        onClick={() => fileInputRef.current?.click()}
      >
        Import
      </button>
    </div>
  );
}
