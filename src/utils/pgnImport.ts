import { Chess } from 'chess.js';
import { v4 as uuidv4 } from 'uuid';
import type { RepertoireNode } from '../types/index.ts';
import { NODE_COLORS } from '../types/index.ts';
import { positionKey, findTransposition } from './fen.ts';
import { parsePgn, type PgnMove } from './pgn.ts';

export interface ImportError {
  game: number;
  move: string;
  message: string;
}

export interface ImportStats {
  gamesProcessed: number;
  nodesCreated: number;
  nodesReused: number;
  transpositionsFound: number;
  errors: ImportError[];
}

export interface ImportResult {
  nodesMap: Map<string, RepertoireNode>;
  stats: ImportStats;
}

export function importPgn(
  pgn: string,
  existingNodesMap: Map<string, RepertoireNode>,
  rootNodeId: string,
  repertoireId: string,
): ImportResult {
  const nodesMap = new Map(existingNodesMap);
  const stats: ImportStats = {
    gamesProcessed: 0,
    nodesCreated: 0,
    nodesReused: 0,
    transpositionsFound: 0,
    errors: [],
  };

  // Build position key → nodeId index from existing nodes
  const positionIndex = new Map<string, string>();
  for (const [id, node] of nodesMap) {
    const key = positionKey(node.fen);
    if (!positionIndex.has(key)) {
      positionIndex.set(key, id);
    }
  }

  const { games, errors: parseErrors } = parsePgn(pgn);

  for (const err of parseErrors) {
    stats.errors.push({ game: 0, move: '', message: err.message });
  }

  for (let gameIdx = 0; gameIdx < games.length; gameIdx++) {
    const game = games[gameIdx];
    stats.gamesProcessed++;
    walkMoves(game.moves, rootNodeId, gameIdx + 1);
  }

  function walkMoves(moves: PgnMove[], parentNodeId: string, gameNum: number) {
    let currentParentId = parentNodeId;

    for (const pgnMove of moves) {
      const parentNode = nodesMap.get(currentParentId);
      if (!parentNode) break;

      // Validate move
      const chess = new Chess(parentNode.fen);
      let result;
      try {
        result = chess.move(pgnMove.san);
      } catch {
        // chess.js throws on invalid moves
      }

      if (!result) {
        stats.errors.push({
          game: gameNum,
          move: pgnMove.san,
          message: `Invalid move "${pgnMove.san}" in position ${parentNode.fen}`,
        });
        break; // Skip rest of this line
      }

      const newFen = chess.fen();
      const newPosKey = positionKey(newFen);

      // Check for existing child with same move
      const existingChildId = parentNode.childIds.find((cid) => {
        const child = nodesMap.get(cid);
        return child && child.move === result.san;
      });

      if (existingChildId) {
        // Reuse existing node
        stats.nodesReused++;
        const existingChild = nodesMap.get(existingChildId)!;
        // Merge comment if existing is empty and PGN has one
        if (!existingChild.comment && pgnMove.comment) {
          nodesMap.set(existingChildId, { ...existingChild, comment: pgnMove.comment });
        }
        // Process RAVs from parent perspective
        for (const variation of pgnMove.variations) {
          walkMoves(variation, currentParentId, gameNum);
        }
        currentParentId = existingChildId;
        continue;
      }

      // Check existing transposition edges
      const existingTransEdge = parentNode.transpositionEdges.find((te) => te.move === result.san);
      if (existingTransEdge) {
        stats.nodesReused++;
        // Process RAVs from parent perspective
        for (const variation of pgnMove.variations) {
          walkMoves(variation, currentParentId, gameNum);
        }
        currentParentId = existingTransEdge.targetId;
        continue;
      }

      // Transposition detection — check position index first, then fallback
      const existingPosNodeId = positionIndex.get(newPosKey);
      let transpositionNode: RepertoireNode | null = null;
      if (existingPosNodeId) {
        const candidate = nodesMap.get(existingPosNodeId);
        if (candidate && positionKey(candidate.fen) === newPosKey) {
          // Verify it's not already a direct child
          if (!parentNode.childIds.includes(existingPosNodeId)) {
            transpositionNode = candidate;
          }
        }
      }
      if (!transpositionNode) {
        transpositionNode = findTransposition(newFen, nodesMap);
        // Make sure we're not linking to a direct child
        if (transpositionNode && parentNode.childIds.includes(transpositionNode.id)) {
          transpositionNode = null;
        }
      }

      if (transpositionNode) {
        // Add transposition edge
        stats.transpositionsFound++;
        const newEdge = { targetId: transpositionNode.id, move: result.san };
        const updatedParent = {
          ...parentNode,
          transpositionEdges: [...parentNode.transpositionEdges, newEdge],
        };
        nodesMap.set(currentParentId, updatedParent);

        // Process RAVs from parent perspective
        for (const variation of pgnMove.variations) {
          walkMoves(variation, currentParentId, gameNum);
        }
        currentParentId = transpositionNode.id;
        continue;
      }

      // Create new node
      const newNodeId = uuidv4();
      const newNode: RepertoireNode = {
        id: newNodeId,
        repertoireId,
        move: result.san,
        fen: newFen,
        comment: pgnMove.comment,
        color: parentNode.color || NODE_COLORS.DEFAULT,
        tags: [],
        parentId: currentParentId,
        childIds: [],
        transpositionEdges: [],
        arrows: [],
        highlightedSquares: [],
      };

      const updatedParent = {
        ...parentNode,
        childIds: [...parentNode.childIds, newNodeId],
      };

      nodesMap.set(newNodeId, newNode);
      nodesMap.set(currentParentId, updatedParent);
      positionIndex.set(newPosKey, newNodeId);
      stats.nodesCreated++;

      // Process RAVs from parent perspective (before advancing currentParentId)
      for (const variation of pgnMove.variations) {
        walkMoves(variation, currentParentId, gameNum);
      }

      currentParentId = newNodeId;
    }
  }

  return { nodesMap, stats };
}
