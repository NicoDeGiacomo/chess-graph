import { useMemo, useRef, useState } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import { useRepertoire } from '../hooks/useRepertoire.tsx';
import { outlinePieces } from './outlinePieces.tsx';

function isOwnPiece(pieceType: string, turn: 'w' | 'b'): boolean {
  return pieceType.startsWith(turn);
}

export function ChessboardPanel() {
  const { state, addChildNode } = useRepertoire();
  const { repertoire, nodesMap, selectedNodeId } = state;

  const selectedNode = selectedNodeId ? nodesMap.get(selectedNodeId) : null;
  const fen = selectedNode?.fen || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

  const [selection, setSelection] = useState<{ square: string; fen: string } | null>(null);
  const selectedSquare = selection?.fen === fen ? selection.square : null;
  const handledByPieceClick = useRef(false);

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

  const squareStyles: Record<string, React.CSSProperties> = selectedSquare
    ? { [selectedSquare]: { backgroundColor: 'rgba(59, 130, 246, 0.4)' } }
    : {};

  return (
    <div className="p-3">
      <div className="aspect-square w-full max-w-[400px] mx-auto">
        <Chessboard
          options={{
            position: fen,
            onPieceDrop,
            onPieceClick,
            onSquareClick,
            squareStyles,
            boardOrientation: repertoire?.side || 'white',
            pieces: outlinePieces,
            animationDurationInMs: 200,
            darkSquareStyle: { backgroundColor: '#52525b' },
            lightSquareStyle: { backgroundColor: '#a1a1aa' },
            boardStyle: {
              borderRadius: '4px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
            },
          }}
        />
      </div>
      {selectedNodeId && (
        <div className="flex justify-center gap-4 mt-2 max-w-[400px] mx-auto">
          <a
            href={`https://www.chess.com/analysis?fen=${encodeURIComponent(fen)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-zinc-400 hover:text-zinc-200 flex items-center gap-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5" aria-hidden="true">
              <path fillRule="evenodd" d="M4.25 5.5a.75.75 0 00-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 00.75-.75v-4a.75.75 0 011.5 0v4A2.25 2.25 0 0112.75 17h-8.5A2.25 2.25 0 012 14.75v-8.5A2.25 2.25 0 014.25 4h5a.75.75 0 010 1.5h-5zm7.25-.75a.75.75 0 01.75-.75h3.5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0V6.31l-5.47 5.47a.75.75 0 01-1.06-1.06l5.47-5.47H12.25a.75.75 0 01-.75-.75z" clipRule="evenodd" />
            </svg>
            Chess.com
          </a>
          <a
            href={`https://lichess.org/analysis/${fen.replace(/ /g, '_')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-zinc-400 hover:text-zinc-200 flex items-center gap-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5" aria-hidden="true">
              <path fillRule="evenodd" d="M4.25 5.5a.75.75 0 00-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 00.75-.75v-4a.75.75 0 011.5 0v4A2.25 2.25 0 0112.75 17h-8.5A2.25 2.25 0 012 14.75v-8.5A2.25 2.25 0 014.25 4h5a.75.75 0 010 1.5h-5zm7.25-.75a.75.75 0 01.75-.75h3.5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0V6.31l-5.47 5.47a.75.75 0 01-1.06-1.06l5.47-5.47H12.25a.75.75 0 01-.75-.75z" clipRule="evenodd" />
            </svg>
            Lichess
          </a>
        </div>
      )}
    </div>
  );
}
