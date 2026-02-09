import { useMemo } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import { useRepertoire } from '../hooks/useRepertoire.tsx';

export function ChessboardPanel() {
  const { state, addChildNode } = useRepertoire();
  const { repertoire, nodesMap, selectedNodeId } = state;

  const selectedNode = selectedNodeId ? nodesMap.get(selectedNodeId) : null;
  const fen = selectedNode?.fen || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

  const chess = useMemo(() => {
    try {
      return new Chess(fen);
    } catch {
      return new Chess();
    }
  }, [fen]);

  const onPieceDrop = ({ sourceSquare, targetSquare }: { piece: unknown; sourceSquare: string; targetSquare: string | null }): boolean => {
    if (!selectedNodeId || !targetSquare) return false;

    try {
      chess.load(fen);
      const move = chess.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q',
      });

      if (!move) return false;

      addChildNode(selectedNodeId, move.san, chess.fen());
      return true;
    } catch {
      return false;
    }
  };

  return (
    <div className="p-3">
      <div className="aspect-square w-full max-w-[400px] mx-auto">
        <Chessboard
          options={{
            position: fen,
            onPieceDrop,
            boardOrientation: repertoire?.side || 'white',
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
