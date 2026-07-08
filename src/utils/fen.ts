import type { RepertoireNode } from '../types/index.ts';

/**
 * Extracts the position-relevant parts of a FEN string (piece placement,
 * active color, castling rights, en passant square). Strips halfmove clock
 * and fullmove number so two positions reached via different move orders
 * produce the same key.
 */
export function positionKey(fen: string): string {
  return fen.split(' ').slice(0, 4).join(' ');
}

/**
 * Finds the first node in a map whose FEN matches the given position key.
 * Returns the node or null if no match is found.
 */
export function findTransposition(
  fen: string,
  nodesMap: Map<string, RepertoireNode>,
  excludeNodeId?: string,
): RepertoireNode | null {
  const key = positionKey(fen);
  for (const [id, node] of nodesMap) {
    if (id === excludeNodeId) continue;
    if (positionKey(node.fen) === key) return node;
  }
  return null;
}
