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
    </div>
  );
}
