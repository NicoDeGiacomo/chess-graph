import { describe, it, expect } from 'vitest';
import { positionKey, findTransposition } from './fen.ts';
import type { RepertoireNode } from '../types/index.ts';
import { NODE_COLORS } from '../types/index.ts';

function makeNode(overrides: Partial<RepertoireNode> & { id: string }): RepertoireNode {
  return {
    repertoireId: 'rep-1',
    move: null,
    fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    comment: '',
    color: NODE_COLORS.DEFAULT,
    tags: [],
    parentId: null,
    childIds: [],
    transpositionEdges: [],
    arrows: [],
    highlightedSquares: [],
    ...overrides,
  };
}

describe('positionKey', () => {
  it('strips halfmove clock and fullmove number', () => {
    const fen = 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1';
    expect(positionKey(fen)).toBe('rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3');
  });

  it('produces identical keys for same position with different move counts', () => {
    const fen1 = 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1';
    const fen2 = 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 2 5';
    expect(positionKey(fen1)).toBe(positionKey(fen2));
  });

  it('preserves en passant square', () => {
    const fenWithEp = 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1';
    const fenWithoutEp = 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1';
    expect(positionKey(fenWithEp)).not.toBe(positionKey(fenWithoutEp));
  });

  it('distinguishes different castling rights', () => {
    const fenKQkq = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    const fenKq = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w Kq - 0 1';
    expect(positionKey(fenKQkq)).not.toBe(positionKey(fenKq));
  });
});

describe('findTransposition', () => {
  it('finds a matching node by position key', () => {
    const node = makeNode({
      id: 'n1',
      fen: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1',
    });
    const nodesMap = new Map([['n1', node]]);

    // Same position, different move counts
    const result = findTransposition(
      'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 2 5',
      nodesMap,
    );
    expect(result).toBe(node);
  });

  it('returns null when no match exists', () => {
    const node = makeNode({
      id: 'n1',
      fen: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1',
    });
    const nodesMap = new Map([['n1', node]]);

    const result = findTransposition(
      'rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR b KQkq d3 0 1',
      nodesMap,
    );
    expect(result).toBeNull();
  });

  it('excludes specified node from search', () => {
    const node = makeNode({
      id: 'n1',
      fen: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1',
    });
    const nodesMap = new Map([['n1', node]]);

    const result = findTransposition(
      'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1',
      nodesMap,
      'n1',
    );
    expect(result).toBeNull();
  });

  it('returns first match when multiple nodes have same position', () => {
    const node1 = makeNode({
      id: 'n1',
      fen: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1',
    });
    const node2 = makeNode({
      id: 'n2',
      fen: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 2 3',
    });
    const nodesMap = new Map([['n1', node1], ['n2', node2]]);

    const result = findTransposition(
      'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 5 10',
      nodesMap,
    );
    expect(result).toBe(node1);
  });
});
