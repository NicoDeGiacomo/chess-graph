import { useCallback, useMemo, useRef, useState } from 'react';
import { Chessboard } from 'react-chessboard';
import type { Arrow } from 'react-chessboard';
import { Chess } from 'chess.js';
import { useRepertoire } from '../hooks/useRepertoire.tsx';
import { useUndoRedo } from '../hooks/useUndoRedo.tsx';
import { useTheme } from '../hooks/useTheme.tsx';
import type { HighlightedSquare } from '../types/index.ts';
import chesscomLogo from '../../logos/chesscom.png';
import lichessLogo from '../../logos/lichess.png';

const HIGHLIGHT_COLORS = {
  orange: 'rgba(255, 170, 0, 0.8)',
  green: 'rgba(76, 175, 80, 0.8)',
  red: 'rgba(244, 67, 54, 0.8)',
} as const;

function getHighlightColor(shift: boolean, ctrl: boolean): string {
  if (ctrl) return HIGHLIGHT_COLORS.red;
  if (shift) return HIGHLIGHT_COLORS.green;
  return HIGHLIGHT_COLORS.orange;
}

function isOwnPiece(pieceType: string, turn: 'w' | 'b'): boolean {
  return pieceType.startsWith(turn);
}

export function ChessboardPanel() {
  const { state, updateNode, flipBoardSide } = useRepertoire();
  const { addChildNode } = useUndoRedo();
  const { repertoire, nodesMap, selectedNodeId } = state;
  const { theme } = useTheme();

  const selectedNode = selectedNodeId ? nodesMap.get(selectedNodeId) : null;
  const fen = selectedNode?.fen || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

  const [selection, setSelection] = useState<{ square: string; fen: string } | null>(null);
  const [clearKey, setClearKey] = useState(0);
  const selectedSquare = selection?.fen === fen ? selection.square : null;
  const handledByPieceClick = useRef(false);
  const lastRightClickModifiers = useRef({ shift: false, ctrl: false });

  const chess = useMemo(() => {
    try {
      return new Chess(fen);
    } catch {
      return new Chess();
    }
  }, [fen]);

  const tryMove = (from: string, to: string): boolean => {
    if (!selectedNodeId) return false;
    try {
      chess.load(fen);
      const move = chess.move({ from, to, promotion: 'q' });
      if (!move) return false;
      addChildNode(selectedNodeId, move.san, chess.fen());
      return true;
    } catch {
      return false;
    }
  };

  const handleClickAction = (square: string, pieceType: string | null) => {
    if (selectedSquare) {
      if (pieceType && isOwnPiece(pieceType, chess.turn())) {
        setSelection({ square, fen });
      } else {
        tryMove(selectedSquare, square);
        setSelection(null);
      }
    } else {
      if (pieceType && isOwnPiece(pieceType, chess.turn())) {
        setSelection({ square, fen });
      }
    }
  };

  const onPieceDrop = ({ sourceSquare, targetSquare }: { piece: unknown; sourceSquare: string; targetSquare: string | null }): boolean => {
    if (!targetSquare) return false;
    return tryMove(sourceSquare, targetSquare);
  };

  const onPieceClick = ({ piece, square }: { isSparePiece: boolean; piece: { pieceType: string }; square: string | null }) => {
    if (!square) return;
    handledByPieceClick.current = true;
    requestAnimationFrame(() => { handledByPieceClick.current = false; });
    handleClickAction(square, piece.pieceType);
  };

  const onSquareClick = ({ piece, square }: { piece: { pieceType: string } | null; square: string }) => {
    if (handledByPieceClick.current) return;
    handleClickAction(square, piece?.pieceType ?? null);
  };

  // react-chessboard fires onArrowsChange on mount with [] (internal arrows only).
  // Only save when user actually draws (non-empty internal arrows).
  const onArrowsChange = useCallback(({ arrows: internalArrows }: { arrows: Arrow[] }) => {
    if (!selectedNodeId || internalArrows.length === 0) return;
    // Merge prop arrows (saved) + new internal arrows, deduplicating
    const saved = nodesMap.get(selectedNodeId)?.arrows || [];
    const merged = [...saved];
    for (const arrow of internalArrows) {
      if (!saved.some((a) => a.startSquare === arrow.startSquare && a.endSquare === arrow.endSquare)) {
        merged.push(arrow);
      }
    }
    if (merged.length !== saved.length) {
      updateNode(selectedNodeId, { arrows: merged });
    }
  }, [selectedNodeId, nodesMap, updateNode]);

  const onSquareRightClick = useCallback(({ square }: { piece: { pieceType: string } | null; square: string }) => {
    setSelection(null);
    if (!selectedNodeId || !selectedNode) return;
    const { shift, ctrl } = lastRightClickModifiers.current;
    const color = getHighlightColor(shift, ctrl);
    const existing = selectedNode.highlightedSquares;
    const match = existing.find((h) => h.square === square);
    let updated: HighlightedSquare[];
    if (match && match.color === color) {
      updated = existing.filter((h) => h.square !== square);
    } else {
      updated = [...existing.filter((h) => h.square !== square), { square, color }];
    }
    updateNode(selectedNodeId, { highlightedSquares: updated });
  }, [selectedNodeId, selectedNode, updateNode]);

  // Build square styles: highlights first, then selection on top
  const squareStyles: Record<string, React.CSSProperties> = {};
  if (selectedNode) {
    for (const h of selectedNode.highlightedSquares) {
      squareStyles[h.square] = { backgroundColor: h.color };
    }
  }
  if (selectedSquare) {
    squareStyles[selectedSquare] = { backgroundColor: 'rgba(59, 130, 246, 0.4)' };
  }

  return (
    <div className="p-3">
      <div
        className="aspect-square w-full max-w-[400px] mx-auto"
        onContextMenuCapture={(e) => {
          e.preventDefault();
          lastRightClickModifiers.current = { shift: e.shiftKey, ctrl: e.ctrlKey || e.metaKey };
        }}
      >
        <Chessboard
          key={clearKey}
          options={{
            position: fen,
            onPieceDrop,
            onPieceClick,
            onSquareClick,
            onSquareRightClick,
            squareStyles,
            boardOrientation: repertoire?.side || 'white',
            animationDurationInMs: 200,
            darkSquareStyle: { backgroundColor: 'var(--color-board-dark)' },
            lightSquareStyle: { backgroundColor: 'var(--color-board-light)' },
            darkSquareNotationStyle: { color: 'var(--color-board-notation-dark)', pointerEvents: 'none' as const },
            lightSquareNotationStyle: { color: 'var(--color-board-notation-light)', pointerEvents: 'none' as const },
            boardStyle: {
              borderRadius: '4px',
              boxShadow: '0 4px 6px -1px var(--color-board-shadow)',
            },
            arrows: selectedNode?.arrows || [],
            allowDrawingArrows: true,
            clearArrowsOnClick: false,
            clearArrowsOnPositionChange: true,
            onArrowsChange,
          }}
        />
      </div>
      {selectedNodeId && (
        <div className="flex justify-center items-center gap-2 mt-2 max-w-[400px] mx-auto">
          <button
            onClick={() => repertoire && flipBoardSide(repertoire.id)}
            className="p-1 text-tertiary hover:text-secondary transition-colors"
            aria-label="Flip board"
            title="Flip board"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 16V4m0 0L3 8m4-4l4 4" />
              <path d="M17 8v12m0 0l4-4m-4 4l-4-4" />
            </svg>
          </button>
          <a
            href={`https://www.chess.com/analysis?fen=${encodeURIComponent(fen)}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chess.com"
            className="inline-flex h-5 rounded overflow-hidden hover:brightness-110 transition"
          >
            <span className="flex items-center bg-input px-1.5">
              <img src={chesscomLogo} alt="" width="12" height="12" />
            </span>
            <span className="flex items-center px-1.5 text-[11px] font-medium text-white" style={{ backgroundColor: '#81b64c' }}>
              Chess.com
            </span>
          </a>
          <a
            href={`https://lichess.org/analysis/${fen.replace(/ /g, '_')}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Lichess"
            className="inline-flex h-5 rounded overflow-hidden hover:brightness-110 transition"
          >
            <span className="flex items-center bg-input px-1.5">
              <img src={lichessLogo} alt="" width="12" height="12" className={theme === 'dark' ? 'invert' : ''} />
            </span>
            <span className="flex items-center px-1.5 text-[11px] font-medium text-white" style={{ backgroundColor: '#312e2b' }}>
              Lichess
            </span>
          </a>
          {(() => {
            const hasAnnotations = (selectedNode?.arrows?.length ?? 0) > 0 || (selectedNode?.highlightedSquares?.length ?? 0) > 0;
            return (
              <button
                onClick={hasAnnotations ? () => {
                  updateNode(selectedNodeId!, { arrows: [], highlightedSquares: [] });
                  setClearKey(k => k + 1);
                } : undefined}
                className={`p-1 transition-colors ${hasAnnotations ? 'text-tertiary hover:text-secondary' : 'text-tertiary opacity-30 cursor-default'}`}
                aria-label="Clear annotations"
                title="Clear annotations"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21" />
                  <path d="M22 21H7" />
                  <path d="m5 11 9 9" />
                </svg>
              </button>
            );
          })()}
        </div>
      )}
    </div>
  );
}
