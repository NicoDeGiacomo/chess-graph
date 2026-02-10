import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router';
import { useRepertoire } from '../hooks/useRepertoire.tsx';
import type { ExportData } from '../types/index.ts';

export function EditorTopBar() {
  const {
    state,
    deleteRepertoire,
    renameRepertoire,
    exportData,
    importData,
  } = useRepertoire();
  const { repertoire } = state;
  const navigate = useNavigate();

  const [isRenaming, setIsRenaming] = useState(false);
  const [renameDraft, setRenameDraft] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      navigate('/');
    } catch (err) {
      console.error('Import failed:', err);
      alert('Failed to import. Please check the file format.');
    }
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

  const handleDelete = async () => {
    if (!repertoire) return;
    if (confirm(`Delete "${repertoire.name}"?`)) {
      await deleteRepertoire(repertoire.id);
      navigate('/');
    }
  };

  return (
    <div className="h-12 border-b border-zinc-800 flex items-center gap-3 px-4 bg-zinc-950 shrink-0">
      {/* Back button */}
      <Link
        to="/"
        className="text-zinc-400 hover:text-zinc-100 text-sm flex items-center gap-1"
        title="All Repertoires"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
          <path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" />
        </svg>
        Back
      </Link>

      <div className="h-4 w-px bg-zinc-700" />

      {/* Repertoire name + side */}
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
        <>
          {repertoire && (
            <span className="text-sm text-zinc-100 font-medium">{repertoire.name}</span>
          )}
          {repertoire && (
            <span className="text-xs text-zinc-500">({repertoire.side})</span>
          )}
        </>
      )}

      {/* Rename button */}
      {!isRenaming && (
        <button
          className="text-xs text-zinc-500 hover:text-zinc-300"
          onClick={startRename}
          title="Rename repertoire"
        >
          Rename
        </button>
      )}

      <div className="flex-1" />

      {/* Delete */}
      <button
        className="text-xs text-zinc-500 hover:text-red-400"
        onClick={handleDelete}
        title="Delete repertoire"
      >
        Delete
      </button>

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
