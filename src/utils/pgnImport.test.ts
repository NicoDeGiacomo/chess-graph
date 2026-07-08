import { describe, it, expect } from 'vitest';
import { importPgn } from './pgnImport.ts';
import type { RepertoireNode } from '../types/index.ts';
import { NODE_COLORS } from '../types/index.ts';

const DEFAULT_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
const ROOT_ID = 'root-1';
const REP_ID = 'rep-1';

function makeRoot(overrides?: Partial<RepertoireNode>): RepertoireNode {
  return {
    id: ROOT_ID,
    repertoireId: REP_ID,
    move: null,
    fen: DEFAULT_FEN,
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

function emptyMap(): Map<string, RepertoireNode> {
  const root = makeRoot();
  return new Map([[ROOT_ID, root]]);
}

describe('importPgn', () => {
  describe('mainline import', () => {
    it('imports a simple mainline into empty graph', () => {
      const result = importPgn('1. e4 e5 2. Nf3 *', emptyMap(), ROOT_ID, REP_ID);
      expect(result.stats.gamesProcessed).toBe(1);
      expect(result.stats.nodesCreated).toBe(3);
      expect(result.stats.errors).toHaveLength(0);

      // Root should have 1 child (e4)
      const root = result.nodesMap.get(ROOT_ID)!;
      expect(root.childIds).toHaveLength(1);

      // Follow the line: e4 → e5 → Nf3
      const e4 = result.nodesMap.get(root.childIds[0])!;
      expect(e4.move).toBe('e4');
      expect(e4.childIds).toHaveLength(1);

      const e5 = result.nodesMap.get(e4.childIds[0])!;
      expect(e5.move).toBe('e5');
      expect(e5.childIds).toHaveLength(1);

      const nf3 = result.nodesMap.get(e5.childIds[0])!;
      expect(nf3.move).toBe('Nf3');
    });

    it('correctly sets parentId and repertoireId on new nodes', () => {
      const result = importPgn('1. e4 e5 *', emptyMap(), ROOT_ID, REP_ID);
      const root = result.nodesMap.get(ROOT_ID)!;
      const e4 = result.nodesMap.get(root.childIds[0])!;
      expect(e4.parentId).toBe(ROOT_ID);
      expect(e4.repertoireId).toBe(REP_ID);
    });
  });

  describe('RAV import', () => {
    it('creates branches from RAVs', () => {
      const result = importPgn('1. e4 e5 (1... c5) 2. Nf3 *', emptyMap(), ROOT_ID, REP_ID);
      expect(result.stats.nodesCreated).toBe(4); // e4, e5, c5, Nf3

      const root = result.nodesMap.get(ROOT_ID)!;
      const e4 = result.nodesMap.get(root.childIds[0])!;
      // e4 should have 2 children: e5 and c5
      expect(e4.childIds).toHaveLength(2);

      const childMoves = e4.childIds.map((id) => result.nodesMap.get(id)!.move);
      expect(childMoves).toContain('e5');
      expect(childMoves).toContain('c5');
    });

    it('handles nested RAVs', () => {
      const result = importPgn('1. e4 c5 (1... e5 2. Nf3 (2. Bc4)) 2. Nf3 *', emptyMap(), ROOT_ID, REP_ID);
      // Nodes: e4, c5, Nf3 (mainline), e5, Nf3 (variation), Bc4
      // But the two Nf3 are different positions, so 6 nodes created
      expect(result.stats.nodesCreated).toBe(6);
      expect(result.stats.errors).toHaveLength(0);
    });

    it('handles multiple consecutive RAVs', () => {
      const result = importPgn('1. e4 e5 (1... c5) (1... d5) 2. Nf3 *', emptyMap(), ROOT_ID, REP_ID);
      const root = result.nodesMap.get(ROOT_ID)!;
      const e4 = result.nodesMap.get(root.childIds[0])!;
      // e4 should have 3 children: e5, c5, d5
      expect(e4.childIds).toHaveLength(3);
    });
  });

  describe('merge with existing', () => {
    it('reuses existing moves', () => {
      // First import
      const first = importPgn('1. e4 e5 *', emptyMap(), ROOT_ID, REP_ID);
      expect(first.stats.nodesCreated).toBe(2);

      // Second import with same start
      const second = importPgn('1. e4 e5 2. Nf3 *', first.nodesMap, ROOT_ID, REP_ID);
      expect(second.stats.nodesReused).toBe(2); // e4, e5 reused
      expect(second.stats.nodesCreated).toBe(1); // Nf3 created
    });

    it('merges comment when existing is empty and PGN has one', () => {
      // Import without comment first
      const first = importPgn('1. e4 *', emptyMap(), ROOT_ID, REP_ID);
      const root = first.nodesMap.get(ROOT_ID)!;
      const e4Id = root.childIds[0];
      expect(first.nodesMap.get(e4Id)!.comment).toBe('');

      // Import with comment — should merge
      const second = importPgn('1. e4 {Best by test} *', first.nodesMap, ROOT_ID, REP_ID);
      expect(second.nodesMap.get(e4Id)!.comment).toBe('Best by test');
    });

    it('does not overwrite existing comment', () => {
      // Import with comment first
      const first = importPgn('1. e4 {Original} *', emptyMap(), ROOT_ID, REP_ID);
      const root = first.nodesMap.get(ROOT_ID)!;
      const e4Id = root.childIds[0];

      // Import with different comment — should NOT overwrite
      const second = importPgn('1. e4 {New comment} *', first.nodesMap, ROOT_ID, REP_ID);
      expect(second.nodesMap.get(e4Id)!.comment).toBe('Original');
    });
  });

  describe('transposition detection', () => {
    it('detects transpositions', () => {
      // Import two different move orders reaching the same position
      // 1. e4 d5 and 1. d4 ... could transpose, but let's use a clear example
      // First: 1. e4 e5 2. Nf3 Nc6
      const first = importPgn('1. e4 e5 2. Nf3 Nc6 *', emptyMap(), ROOT_ID, REP_ID);
      // Second: 1. Nf3 Nc6 2. e4 e5 — same position after 2...e5
      const second = importPgn('1. Nf3 Nc6 2. e4 e5 *', first.nodesMap, ROOT_ID, REP_ID);
      expect(second.stats.transpositionsFound).toBeGreaterThan(0);
    });
  });

  describe('comment import', () => {
    it('imports comments on moves', () => {
      const result = importPgn('1. e4 {Best by test} e5 {Solid reply} *', emptyMap(), ROOT_ID, REP_ID);
      const root = result.nodesMap.get(ROOT_ID)!;
      const e4 = result.nodesMap.get(root.childIds[0])!;
      expect(e4.comment).toBe('Best by test');
      const e5 = result.nodesMap.get(e4.childIds[0])!;
      expect(e5.comment).toBe('Solid reply');
    });
  });

  describe('multi-game import', () => {
    it('imports multiple games into same tree', () => {
      const pgn = `[Event "Game 1"]\n1. e4 e5 1-0\n\n[Event "Game 2"]\n1. e4 c5 0-1`;
      const result = importPgn(pgn, emptyMap(), ROOT_ID, REP_ID);
      expect(result.stats.gamesProcessed).toBe(2);
      // e4 should be reused, e5 and c5 are different
      expect(result.stats.nodesReused).toBe(1); // e4 reused in game 2
      expect(result.stats.nodesCreated).toBe(3); // e4, e5, c5

      // Root should have one child (e4), which has two children (e5, c5)
      const root = result.nodesMap.get(ROOT_ID)!;
      expect(root.childIds).toHaveLength(1);
      const e4 = result.nodesMap.get(root.childIds[0])!;
      expect(e4.childIds).toHaveLength(2);
    });
  });

  describe('error handling', () => {
    it('records error for invalid move', () => {
      const result = importPgn('1. e4 Zz9 *', emptyMap(), ROOT_ID, REP_ID);
      expect(result.stats.errors).toHaveLength(1);
      expect(result.stats.errors[0].move).toBe('Zz9');
      // e4 should still be created
      expect(result.stats.nodesCreated).toBe(1);
    });

    it('stops line after invalid move', () => {
      const result = importPgn('1. e4 INVALID e5 *', emptyMap(), ROOT_ID, REP_ID);
      // Only e4 created, rest of line skipped
      expect(result.stats.nodesCreated).toBe(1);
      expect(result.stats.errors).toHaveLength(1);
    });

    it('returns correct stats', () => {
      const result = importPgn('1. e4 e5 2. Nf3 *', emptyMap(), ROOT_ID, REP_ID);
      expect(result.stats).toEqual({
        gamesProcessed: 1,
        nodesCreated: 3,
        nodesReused: 0,
        transpositionsFound: 0,
        errors: [],
      });
    });
  });

  describe('node properties', () => {
    it('inherits parent color', () => {
      const greenRoot = makeRoot({ color: NODE_COLORS.GREEN });
      const map = new Map<string, RepertoireNode>([[ROOT_ID, greenRoot]]);
      const result = importPgn('1. e4 *', map, ROOT_ID, REP_ID);
      const root = result.nodesMap.get(ROOT_ID)!;
      const e4 = result.nodesMap.get(root.childIds[0])!;
      expect(e4.color).toBe(NODE_COLORS.GREEN);
    });

    it('sets empty arrays for new node properties', () => {
      const result = importPgn('1. e4 *', emptyMap(), ROOT_ID, REP_ID);
      const root = result.nodesMap.get(ROOT_ID)!;
      const e4 = result.nodesMap.get(root.childIds[0])!;
      expect(e4.tags).toEqual([]);
      expect(e4.arrows).toEqual([]);
      expect(e4.highlightedSquares).toEqual([]);
      expect(e4.transpositionEdges).toEqual([]);
    });
  });

  describe('does not mutate input', () => {
    it('returns a new map, not the input', () => {
      const original = emptyMap();
      const result = importPgn('1. e4 *', original, ROOT_ID, REP_ID);
      expect(result.nodesMap).not.toBe(original);
      // Original should be unchanged
      expect(original.get(ROOT_ID)!.childIds).toHaveLength(0);
    });
  });
});
