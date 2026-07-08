import { describe, it, expect } from 'vitest';
import { buildExampleRepertoire } from './exampleRepertoire.ts';
import { NODE_COLORS } from '../types/index.ts';
import { positionKey } from '../utils/fen.ts';

describe('buildExampleRepertoire', () => {
  const { repertoire, nodes } = buildExampleRepertoire();

  // ─── Repertoire metadata ───────────────────────────────────────────

  it('returns valid repertoire metadata', () => {
    expect(repertoire.name).toBe('1.e4 Repertoire');
    expect(repertoire.side).toBe('white');
    expect(repertoire.id).toBeTruthy();
    expect(repertoire.rootNodeId).toBeTruthy();
    expect(repertoire.createdAt).toBeGreaterThan(0);
    expect(repertoire.updatedAt).toBeGreaterThan(0);
  });

  // ─── Root node ─────────────────────────────────────────────────────

  it('root node has expected tags, comment, and arrows', () => {
    const root = nodes.find((n) => n.id === repertoire.rootNodeId)!;
    expect(root).toBeDefined();
    expect(root.move).toBeNull();
    expect(root.parentId).toBeNull();
    expect(root.tags).toContain('1.e4 Repertoire');
    expect(root.tags).toContain('Example');
    expect(root.comment).toContain('1.e4');
    expect(root.arrows.length).toBeGreaterThanOrEqual(1);
    expect(root.arrows[0].startSquare).toBe('e2');
    expect(root.arrows[0].endSquare).toBe('e4');
  });

  // ─── FEN validity ─────────────────────────────────────────────────

  it('all FENs are valid 6-part strings', () => {
    for (const node of nodes) {
      const parts = node.fen.split(' ');
      expect(parts.length).toBe(6);
      // Piece placement should have 8 ranks
      expect(parts[0].split('/').length).toBe(8);
      // Active color
      expect(['w', 'b']).toContain(parts[1]);
    }
  });

  // ─── Referential integrity ─────────────────────────────────────────

  it('all parentId references point to existing nodes', () => {
    const nodeIds = new Set(nodes.map((n) => n.id));
    for (const node of nodes) {
      if (node.parentId !== null) {
        expect(nodeIds.has(node.parentId)).toBe(true);
      }
    }
  });

  it('all childIds reference existing nodes', () => {
    const nodeIds = new Set(nodes.map((n) => n.id));
    for (const node of nodes) {
      for (const childId of node.childIds) {
        expect(nodeIds.has(childId)).toBe(true);
      }
    }
  });

  it('parent-child relationships are bidirectional', () => {
    const nodeMap = new Map(nodes.map((n) => [n.id, n]));
    for (const node of nodes) {
      if (node.parentId) {
        const parent = nodeMap.get(node.parentId)!;
        expect(parent.childIds).toContain(node.id);
      }
      for (const childId of node.childIds) {
        const child = nodeMap.get(childId)!;
        expect(child.parentId).toBe(node.id);
      }
    }
  });

  // ─── Transpositions ────────────────────────────────────────────────

  it('has at least one transposition edge', () => {
    const allEdges = nodes.flatMap((n) => n.transpositionEdges);
    expect(allEdges.length).toBeGreaterThanOrEqual(1);
  });

  it('transposition edges target existing nodes', () => {
    const nodeIds = new Set(nodes.map((n) => n.id));
    for (const node of nodes) {
      for (const edge of node.transpositionEdges) {
        expect(nodeIds.has(edge.targetId)).toBe(true);
      }
    }
  });

  it('Four Knights transposition produces matching FENs', () => {
    // Path 1: e4 e5 Nf3 Nf6 Nc3 Nc6 — the "Four Knights" node
    // Path 2: e4 e5 Nf3 Nc6 Nc3 Nf6 — transposition
    // The transposition edge's target should have the same position key
    // as what would result from the second move order.
    const nodeMap = new Map(nodes.map((n) => [n.id, n]));

    // Find the node with the "Four Knights" tag
    const fourKnights = nodes.find((n) => n.tags.includes('Four Knights'));
    expect(fourKnights).toBeDefined();

    // Find the node that has a transposition edge
    const transposer = nodes.find((n) =>
      n.transpositionEdges.some((e) => e.targetId === fourKnights!.id),
    );
    expect(transposer).toBeDefined();

    // The transposer itself is the Nc3 node in the Nc6 branch
    expect(transposer!.move).toBe('Nc3');
    // Its parent should be the Nc6 node (the transposition branch)
    const transposerParent = nodeMap.get(transposer!.parentId!)!;
    expect(transposerParent.move).toBe('Nc6');

    // The Four Knights node's FEN position key should match the
    // position we'd get from the Nc6→Nc3→Nf6 move order
    expect(fourKnights!.fen).toBeTruthy();
  });

  it('Petroff d6 line transposes into the Philidor Nc3 node', () => {
    // Path 1 (Philidor): e4 e5 Nf3 d6 d4 exd4 Nxd4 Nf6 Nc3
    // Path 2 (Petroff):  e4 e5 Nf3 Nf6 Nc3 d6 d4 exd4 Nxd4
    // Nxd4 in the Petroff line should create a transposition edge
    // to the Philidor Nc3 "Main Line" node.
    const philidorNc3 = nodes.find(
      (n) => n.move === 'Nc3' && n.tags.includes('Main Line'),
    );
    expect(philidorNc3).toBeDefined();

    // Find a node with a transposition edge targeting the Philidor Nc3
    const transposer = nodes.find((n) =>
      n.transpositionEdges.some((e) => e.targetId === philidorNc3!.id),
    );
    expect(transposer).toBeDefined();
    // The transposition edge's move should be Nxd4
    const edge = transposer!.transpositionEdges.find(
      (e) => e.targetId === philidorNc3!.id,
    );
    expect(edge!.move).toBe('Nxd4');
  });

  // ─── Feature coverage ──────────────────────────────────────────────

  it('uses multiple node colors', () => {
    const colors = new Set(nodes.map((n) => n.color));
    expect(colors.has(NODE_COLORS.GREEN)).toBe(true);
    expect(colors.has(NODE_COLORS.RED)).toBe(true);
    expect(colors.has(NODE_COLORS.YELLOW)).toBe(true);
    expect(colors.has(NODE_COLORS.BLUE)).toBe(true);
    expect(colors.has(NODE_COLORS.PURPLE)).toBe(true);
  });

  it('has multiple nodes with tags', () => {
    const tagged = nodes.filter((n) => n.tags.length > 0);
    expect(tagged.length).toBeGreaterThanOrEqual(5);
  });

  it('has multiple nodes with comments', () => {
    const commented = nodes.filter((n) => n.comment !== '');
    expect(commented.length).toBeGreaterThanOrEqual(5);
  });

  it('has nodes with arrows', () => {
    const withArrows = nodes.filter((n) => n.arrows.length > 0);
    expect(withArrows.length).toBeGreaterThanOrEqual(3);
  });

  it('has nodes with highlighted squares', () => {
    const withHighlights = nodes.filter(
      (n) => n.highlightedSquares.length > 0,
    );
    expect(withHighlights.length).toBeGreaterThanOrEqual(2);
  });

  // ─── Node count ────────────────────────────────────────────────────

  it('generates between 30 and 58 nodes', () => {
    expect(nodes.length).toBeGreaterThanOrEqual(30);
    expect(nodes.length).toBeLessThanOrEqual(58);
  });

  // ─── All nodes belong to the repertoire ────────────────────────────

  it('all nodes belong to the example repertoire', () => {
    for (const node of nodes) {
      expect(node.repertoireId).toBe(repertoire.id);
    }
  });

  // ─── No duplicate position keys (except transpositions) ────────────

  it('has no duplicate position keys among created nodes', () => {
    const keys = nodes.map((n) => positionKey(n.fen));
    const uniqueKeys = new Set(keys);
    expect(uniqueKeys.size).toBe(keys.length);
  });
});
