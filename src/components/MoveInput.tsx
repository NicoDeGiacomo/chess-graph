import { useState, useRef, useCallback } from 'react';
import { Chess } from 'chess.js';
import { useRepertoire } from '../hooks/useRepertoire.tsx';
import { useUndoRedo } from '../hooks/useUndoRedo.tsx';

/** Regex for a pawn move to the promotion rank (1st or 8th) without explicit promotion piece. */
const PROMOTION_RANK_RE = /^[a-h](?:x[a-h])?[18]$/;

export function MoveInput() {
  const { state } = useRepertoire();
  const { addChildNode } = useUndoRedo();
  const { nodesMap, selectedNodeId } = state;

  const selectedNode = selectedNodeId ? nodesMap.get(selectedNodeId) : null;
  const fen = selectedNode?.fen ?? null;

  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const errorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const clearError = useCallback(() => {
    setError(null);
    if (errorTimerRef.current) {
      clearTimeout(errorTimerRef.current);
      errorTimerRef.current = null;
    }
  }, []);

  const showError = useCallback((msg: string) => {
    setError(msg);
    if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
    errorTimerRef.current = setTimeout(() => {
      setError(null);
      errorTimerRef.current = null;
    }, 2000);
  }, []);

  const handleSubmit = useCallback(() => {
    const san = value.trim();
    if (!san || !fen || !selectedNodeId) return;

    const chess = new Chess(fen);

    // First attempt: try the move as-is
    try {
      const result = chess.move(san);
      if (result) {
        addChildNode(selectedNodeId, result.san, chess.fen());
        setValue('');
        clearError();
        return;
      }
    } catch {
      // move threw — fall through to promotion retry
    }

    // Second attempt: if it looks like a pawn reaching the back rank, retry with queen promotion
    if (PROMOTION_RANK_RE.test(san)) {
      try {
        chess.load(fen);
        const result = chess.move(san + '=Q');
        if (result) {
          addChildNode(selectedNodeId, result.san, chess.fen());
          setValue('');
          clearError();
          return;
        }
      } catch {
        // still invalid
      }
    }

    showError('Invalid move');
  }, [value, fen, selectedNodeId, addChildNode, clearError, showError]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit],
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setValue(e.target.value);
      if (error) clearError();
    },
    [error, clearError],
  );

  const disabled = !selectedNodeId;

  // Determine turn from FEN
  let turnLabel: string | null = null;
  if (fen) {
    const turn = fen.split(' ')[1];
    turnLabel = turn === 'w' ? 'White to move' : 'Black to move';
  }

  return (
    <div className="border-t border-border-subtle px-3 py-2" data-testid="move-input-container">
      {turnLabel && (
        <span className="text-xs text-tertiary mb-1 block" data-testid="turn-indicator">
          {turnLabel}
        </span>
      )}
      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={disabled ? 'Select a node' : 'Type a move…'}
          className={`flex-1 px-2 py-1 text-sm font-mono rounded border bg-input text-primary placeholder:text-tertiary focus:outline-none focus:ring-1 focus:ring-accent ${
            error ? 'border-red-500' : 'border-border-subtle'
          }`}
          data-testid="move-input"
          autoComplete="off"
          spellCheck={false}
        />
      </div>
      {error && (
        <span className="text-xs text-red-500 mt-1 block" data-testid="move-input-error">
          {error}
        </span>
      )}
    </div>
  );
}
