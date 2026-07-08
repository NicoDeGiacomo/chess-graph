import { useState, useEffect, useCallback, useRef } from 'react';
import { useRepertoire } from '../hooks/useRepertoire.tsx';
import { useUndoRedo } from '../hooks/useUndoRedo.tsx';
import { importPgn, type ImportStats } from '../utils/pgnImport.ts';

interface ImportPgnDialogProps {
  open: boolean;
  onClose: () => void;
}

function ImportPgnDialogInner({ onClose }: { onClose: () => void }) {
  const { state } = useRepertoire();
  const { replaceNodesMap } = useUndoRedo();
  const [pgnText, setPgnText] = useState('');
  const [result, setResult] = useState<ImportStats | null>(null);
  const [showErrors, setShowErrors] = useState(false);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Focus textarea on mount
    textareaRef.current?.focus();
  }, []);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopImmediatePropagation();
        onClose();
      }
    },
    [onClose],
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleImport = async () => {
    if (!pgnText.trim() || !state.repertoire) return;
    setImporting(true);
    try {
      const importResult = importPgn(
        pgnText,
        state.nodesMap,
        state.repertoire.rootNodeId,
        state.repertoire.id,
      );
      await replaceNodesMap(importResult.nodesMap);
      setResult(importResult.stats);
    } finally {
      setImporting(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    setPgnText(text);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'var(--color-overlay)' }}
      onClick={onClose}
    >
      <div
        className="bg-card border border-border rounded-xl p-6 w-full max-w-lg mx-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="import-pgn-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="import-pgn-title" className="text-lg font-medium text-primary mb-4">Import PGN</h2>

        {!result ? (
          <>
            <textarea
              ref={textareaRef}
              className="w-full bg-page border border-border rounded-lg p-3 text-sm text-primary font-mono resize-none outline-none focus:border-blue-500"
              rows={12}
              placeholder="Paste PGN here..."
              value={pgnText}
              onChange={(e) => setPgnText(e.target.value)}
              data-testid="pgn-textarea"
            />

            <div className="flex items-center gap-3 mt-3">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pgn,.txt"
                className="hidden"
                onChange={handleFileUpload}
                data-testid="pgn-file-input"
              />
              <button
                className="text-sm text-tertiary hover:text-secondary"
                onClick={() => fileInputRef.current?.click()}
              >
                Upload .pgn file
              </button>
              <div className="flex-1" />
              <button
                className="text-sm text-tertiary hover:text-secondary px-3 py-1.5"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                className="text-sm text-white bg-blue-600 hover:bg-blue-500 rounded px-4 py-1.5 disabled:opacity-50"
                onClick={handleImport}
                disabled={!pgnText.trim() || importing}
                data-testid="pgn-import-btn"
              >
                {importing ? 'Importing...' : 'Import'}
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="text-sm text-secondary mb-2" data-testid="pgn-import-result">
              Imported {result.gamesProcessed} {result.gamesProcessed === 1 ? 'game' : 'games'}:{' '}
              {result.nodesCreated} new {result.nodesCreated === 1 ? 'node' : 'nodes'}
              {result.nodesReused > 0 && `, ${result.nodesReused} merged`}
              {result.transpositionsFound > 0 && `, ${result.transpositionsFound} ${result.transpositionsFound === 1 ? 'transposition' : 'transpositions'}`}
            </p>

            {result.errors.length > 0 && (
              <div className="mt-2">
                <button
                  className="text-xs text-yellow-500 hover:text-yellow-400"
                  onClick={() => setShowErrors(!showErrors)}
                  data-testid="pgn-toggle-errors"
                >
                  {result.errors.length} {result.errors.length === 1 ? 'error' : 'errors'} {showErrors ? '(hide)' : '(show)'}
                </button>
                {showErrors && (
                  <ul className="mt-1 text-xs text-muted space-y-1 max-h-32 overflow-y-auto" data-testid="pgn-error-list">
                    {result.errors.map((err, i) => (
                      <li key={i}>
                        {err.game > 0 && `Game ${err.game}: `}{err.message}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            <div className="flex justify-end mt-4">
              <button
                className="text-sm text-white bg-blue-600 hover:bg-blue-500 rounded px-4 py-1.5"
                onClick={onClose}
                data-testid="pgn-done-btn"
              >
                Done
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export function ImportPgnDialog({ open, onClose }: ImportPgnDialogProps) {
  if (!open) return null;
  return <ImportPgnDialogInner onClose={onClose} />;
}
