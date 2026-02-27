import { describe, it, expect } from 'vitest';
import { validateImportData } from './importValidation.ts';

const DEFAULT_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

function makeValidExport(overrides?: {
  repertoires?: unknown[];
  nodes?: unknown[];
  folders?: unknown[];
}) {
  return {
    version: 3,
    repertoires: overrides?.repertoires ?? [
      { id: 'rep-1', name: 'My Repertoire', side: 'white', rootNodeId: 'root-1', folderId: null, createdAt: 1, updatedAt: 1 },
    ],
    nodes: overrides?.nodes ?? [
      { id: 'root-1', repertoireId: 'rep-1', move: null, fen: DEFAULT_FEN, comment: '', color: '#3f3f46', tags: [], parentId: null, childIds: ['child-1'], transpositionEdges: [], arrows: [], highlightedSquares: [] },
      { id: 'child-1', repertoireId: 'rep-1', move: 'e4', fen: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1', comment: '', color: '#3f3f46', tags: [], parentId: 'root-1', childIds: [], transpositionEdges: [], arrows: [], highlightedSquares: [] },
    ],
    folders: overrides?.folders ?? [],
  };
}

describe('validateImportData', () => {
  describe('top-level structure', () => {
    it('accepts valid export data', () => {
      expect(validateImportData(makeValidExport())).toBeNull();
    });

    it('rejects null', () => {
      expect(validateImportData(null)).toBe('Import data is not an object');
    });

    it('rejects non-object', () => {
      expect(validateImportData('string')).toBe('Import data is not an object');
    });

    it('rejects missing repertoires', () => {
      expect(validateImportData({ nodes: [] })).toBe('Missing or invalid "repertoires" array');
    });

    it('rejects missing nodes', () => {
      expect(validateImportData({ repertoires: [] })).toBe('Missing or invalid "nodes" array');
    });
  });

  describe('size guard', () => {
    it('rejects imports exceeding 500,000 nodes', () => {
      const data = {
        version: 3,
        repertoires: [],
        nodes: new Array(500_001).fill({ id: 'x', repertoireId: 'r', fen: 'f', parentId: null, childIds: [] }),
      };
      expect(validateImportData(data)).toMatch(/exceeding the limit/);
    });
  });

  describe('repertoire validation', () => {
    it('rejects repertoire with missing id', () => {
      const data = makeValidExport({
        repertoires: [{ name: 'Test', side: 'white', rootNodeId: 'root-1' }],
      });
      expect(validateImportData(data)).toMatch(/Repertoire at index 0.*"id"/);
    });

    it('rejects repertoire with empty id', () => {
      const data = makeValidExport({
        repertoires: [{ id: '', name: 'Test', side: 'white', rootNodeId: 'root-1' }],
      });
      expect(validateImportData(data)).toMatch(/Repertoire at index 0.*"id"/);
    });

    it('rejects repertoire with missing name', () => {
      const data = makeValidExport({
        repertoires: [{ id: 'r1', side: 'white', rootNodeId: 'root-1' }],
      });
      expect(validateImportData(data)).toMatch(/Repertoire "r1".*"name"/);
    });

    it('rejects repertoire with invalid side', () => {
      const data = makeValidExport({
        repertoires: [{ id: 'r1', name: 'Test', side: 'blue', rootNodeId: 'root-1' }],
      });
      expect(validateImportData(data)).toMatch(/Repertoire "r1".*"side"/);
    });

    it('rejects repertoire with missing rootNodeId', () => {
      const data = makeValidExport({
        repertoires: [{ id: 'r1', name: 'Test', side: 'white' }],
      });
      expect(validateImportData(data)).toMatch(/Repertoire "r1".*"rootNodeId"/);
    });
  });

  describe('node validation', () => {
    it('rejects node with missing id', () => {
      const data = makeValidExport({
        nodes: [{ repertoireId: 'rep-1', fen: DEFAULT_FEN, parentId: null, childIds: [] }],
      });
      expect(validateImportData(data)).toMatch(/Node at index 0.*"id"/);
    });

    it('rejects node with missing repertoireId', () => {
      const data = makeValidExport({
        repertoires: [{ id: 'rep-1', name: 'Test', side: 'white', rootNodeId: 'n1' }],
        nodes: [{ id: 'n1', fen: DEFAULT_FEN, parentId: null, childIds: [] }],
      });
      expect(validateImportData(data)).toMatch(/Node "n1".*"repertoireId"/);
    });

    it('rejects node with missing fen', () => {
      const data = makeValidExport({
        repertoires: [{ id: 'rep-1', name: 'Test', side: 'white', rootNodeId: 'n1' }],
        nodes: [{ id: 'n1', repertoireId: 'rep-1', parentId: null, childIds: [] }],
      });
      expect(validateImportData(data)).toMatch(/Node "n1".*"fen"/);
    });

    it('rejects node with invalid parentId type', () => {
      const data = makeValidExport({
        repertoires: [{ id: 'rep-1', name: 'Test', side: 'white', rootNodeId: 'n1' }],
        nodes: [{ id: 'n1', repertoireId: 'rep-1', fen: DEFAULT_FEN, parentId: 123, childIds: [] }],
      });
      expect(validateImportData(data)).toMatch(/Node "n1".*"parentId"/);
    });

    it('rejects node with missing childIds', () => {
      const data = makeValidExport({
        repertoires: [{ id: 'rep-1', name: 'Test', side: 'white', rootNodeId: 'n1' }],
        nodes: [{ id: 'n1', repertoireId: 'rep-1', fen: DEFAULT_FEN, parentId: null }],
      });
      expect(validateImportData(data)).toMatch(/Node "n1".*"childIds"/);
    });

    it('accepts node with null parentId', () => {
      const data = makeValidExport({
        repertoires: [{ id: 'rep-1', name: 'Test', side: 'white', rootNodeId: 'n1' }],
        nodes: [{ id: 'n1', repertoireId: 'rep-1', fen: DEFAULT_FEN, parentId: null, childIds: [] }],
      });
      expect(validateImportData(data)).toBeNull();
    });

    it('accepts node with string parentId', () => {
      const data = makeValidExport();
      expect(validateImportData(data)).toBeNull();
    });
  });

  describe('referential integrity', () => {
    it('rejects repertoire with rootNodeId not in nodes', () => {
      const data = makeValidExport({
        repertoires: [{ id: 'rep-1', name: 'Test', side: 'white', rootNodeId: 'missing-node' }],
        nodes: [{ id: 'n1', repertoireId: 'rep-1', fen: DEFAULT_FEN, parentId: null, childIds: [] }],
      });
      expect(validateImportData(data)).toMatch(/rootNodeId "missing-node" which does not exist/);
    });
  });

  describe('circular reference detection', () => {
    it('rejects circular childIds', () => {
      const data = makeValidExport({
        repertoires: [{ id: 'rep-1', name: 'Test', side: 'white', rootNodeId: 'a' }],
        nodes: [
          { id: 'a', repertoireId: 'rep-1', fen: DEFAULT_FEN, parentId: null, childIds: ['b'] },
          { id: 'b', repertoireId: 'rep-1', fen: DEFAULT_FEN, parentId: 'a', childIds: ['c'] },
          { id: 'c', repertoireId: 'rep-1', fen: DEFAULT_FEN, parentId: 'b', childIds: ['a'] },
        ],
      });
      expect(validateImportData(data)).toMatch(/Circular reference detected/);
    });

    it('rejects self-referencing node', () => {
      const data = makeValidExport({
        repertoires: [{ id: 'rep-1', name: 'Test', side: 'white', rootNodeId: 'a' }],
        nodes: [
          { id: 'a', repertoireId: 'rep-1', fen: DEFAULT_FEN, parentId: null, childIds: ['a'] },
        ],
      });
      expect(validateImportData(data)).toMatch(/Circular reference detected/);
    });

    it('accepts valid tree structure', () => {
      const data = makeValidExport();
      expect(validateImportData(data)).toBeNull();
    });
  });

  describe('edge cases', () => {
    it('accepts empty repertoires and nodes', () => {
      const data = { version: 3, repertoires: [], nodes: [] };
      expect(validateImportData(data)).toBeNull();
    });

    it('accepts data with folders', () => {
      const data = makeValidExport({
        folders: [{ id: 'f1', name: 'Folder', sortOrder: 0, collapsed: false, createdAt: 1, updatedAt: 1 }],
      });
      expect(validateImportData(data)).toBeNull();
    });
  });
});
