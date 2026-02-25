import { describe, it, expect } from 'vitest';
import { MarkerType } from '@xyflow/react';
import { computeLayout } from './useGraphLayout.ts';
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
    transposesTo: null,
    ...overrides,
  };
}

describe('computeLayout', () => {
  it('returns empty arrays for an empty nodesMap', () => {
    const nodesMap = new Map<string, RepertoireNode>();
    const { nodes, edges } = computeLayout(nodesMap, 'root', null, 'Test');
    expect(nodes).toHaveLength(0);
    expect(edges).toHaveLength(0);
  });

  it('returns a single root node with correct data for a one-node tree', () => {
    const root = makeNode({ id: 'root' });
    const nodesMap = new Map([['root', root]]);

    const { nodes, edges } = computeLayout(nodesMap, 'root', 'root', 'Sicilian');

    expect(nodes).toHaveLength(1);
    expect(edges).toHaveLength(0);

    const flowNode = nodes[0];
    expect(flowNode.id).toBe('root');
    expect(flowNode.type).toBe('move');
    expect(flowNode.data.isRoot).toBe(true);
    expect(flowNode.data.repertoireName).toBe('Sicilian');
    expect(flowNode.data.isSelected).toBe(true);
    expect(flowNode.position.x).toBeTypeOf('number');
    expect(flowNode.position.y).toBeTypeOf('number');
  });

  it('marks the correct node as selected when selectedNodeId differs from root', () => {
    const root = makeNode({ id: 'root', childIds: ['child1'] });
    const child = makeNode({ id: 'child1', move: 'e4', parentId: 'root' });
    const nodesMap = new Map([['root', root], ['child1', child]]);

    const { nodes } = computeLayout(nodesMap, 'root', 'child1', 'Test');

    const rootNode = nodes.find((n) => n.id === 'root')!;
    const childNode = nodes.find((n) => n.id === 'child1')!;
    expect(rootNode.data.isSelected).toBe(false);
    expect(childNode.data.isSelected).toBe(true);
  });

  it('marks no node as selected when selectedNodeId is null', () => {
    const root = makeNode({ id: 'root' });
    const nodesMap = new Map([['root', root]]);

    const { nodes } = computeLayout(nodesMap, 'root', null, 'Test');
    expect(nodes[0].data.isSelected).toBe(false);
  });

  it('passes node data fields correctly (move, fen, comment, color, tags)', () => {
    const node = makeNode({
      id: 'n1',
      move: 'Nf3',
      fen: 'some-fen',
      comment: 'A solid move',
      color: NODE_COLORS.GREEN,
      tags: ['main', 'theory'],
    });
    const nodesMap = new Map([['n1', node]]);

    const { nodes } = computeLayout(nodesMap, 'n1', null, 'Test');
    const data = nodes[0].data;

    expect(data.move).toBe('Nf3');
    expect(data.fen).toBe('some-fen');
    expect(data.comment).toBe('A solid move');
    expect(data.color).toBe(NODE_COLORS.GREEN);
    expect(data.tags).toEqual(['main', 'theory']);
  });

  it('creates edges with arrow markers for parent-child relationships', () => {
    const root = makeNode({ id: 'root', childIds: ['child1'] });
    const child = makeNode({
      id: 'child1',
      move: 'e4',
      fen: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1',
      parentId: 'root',
    });
    const nodesMap = new Map([['root', root], ['child1', child]]);

    const { nodes, edges } = computeLayout(nodesMap, 'root', 'root', 'Test');

    expect(nodes).toHaveLength(2);
    expect(edges).toHaveLength(1);

    const edge = edges[0];
    expect(edge.source).toBe('root');
    expect(edge.target).toBe('child1');
    expect(edge.type).toBe('smoothstep');
    expect(edge.data?.isTransposition).toBe(false);
    expect(edge.markerEnd).toEqual({ type: MarkerType.ArrowClosed, color: '#71717a' });
  });

  it('creates transposition edges with arrow markers (not in dagre)', () => {
    const root = makeNode({ id: 'root', childIds: ['a', 'b'] });
    const nodeA = makeNode({
      id: 'a',
      move: 'e4',
      parentId: 'root',
      transposesTo: 'b',
    });
    const nodeB = makeNode({
      id: 'b',
      move: 'd4',
      parentId: 'root',
    });
    const nodesMap = new Map([['root', root], ['a', nodeA], ['b', nodeB]]);

    const { edges } = computeLayout(nodesMap, 'root', 'root', 'Test');

    // 2 parent-child edges + 1 transposition edge
    expect(edges).toHaveLength(3);

    const transEdge = edges.find((e) => e.data?.isTransposition);
    expect(transEdge).toBeDefined();
    expect(transEdge!.source).toBe('a');
    expect(transEdge!.target).toBe('b');
    expect(transEdge!.animated).toBe(true);
    expect(transEdge!.markerEnd).toEqual({ type: MarkerType.ArrowClosed, color: '#f59e0b' });
  });

  it('handles a deep linear tree (root → e4 → e5 → Nf3)', () => {
    const root = makeNode({ id: 'root', childIds: ['n1'] });
    const n1 = makeNode({ id: 'n1', move: 'e4', parentId: 'root', childIds: ['n2'] });
    const n2 = makeNode({ id: 'n2', move: 'e5', parentId: 'n1', childIds: ['n3'] });
    const n3 = makeNode({ id: 'n3', move: 'Nf3', parentId: 'n2' });
    const nodesMap = new Map([['root', root], ['n1', n1], ['n2', n2], ['n3', n3]]);

    const { nodes, edges } = computeLayout(nodesMap, 'root', null, 'Test');

    expect(nodes).toHaveLength(4);
    expect(edges).toHaveLength(3);

    // Nodes should progress left-to-right (increasing x)
    const positions = nodes.sort((a, b) => a.position.x - b.position.x);
    expect(positions[0].id).toBe('root');
    expect(positions[3].id).toBe('n3');
  });

  it('handles a branching tree (root has two children)', () => {
    const root = makeNode({ id: 'root', childIds: ['e4', 'd4'] });
    const e4 = makeNode({ id: 'e4', move: 'e4', parentId: 'root' });
    const d4 = makeNode({ id: 'd4', move: 'd4', parentId: 'root' });
    const nodesMap = new Map([['root', root], ['e4', e4], ['d4', d4]]);

    const { nodes, edges } = computeLayout(nodesMap, 'root', null, 'Test');

    expect(nodes).toHaveLength(3);
    expect(edges).toHaveLength(2);

    // Both children should be to the right of root
    const rootPos = nodes.find((n) => n.id === 'root')!.position;
    const e4Pos = nodes.find((n) => n.id === 'e4')!.position;
    const d4Pos = nodes.find((n) => n.id === 'd4')!.position;
    expect(e4Pos.x).toBeGreaterThan(rootPos.x);
    expect(d4Pos.x).toBeGreaterThan(rootPos.x);

    // The two branches should have different y positions
    expect(e4Pos.y).not.toBe(d4Pos.y);
  });

  it('ignores transposition edges pointing to nodes not in the map', () => {
    const root = makeNode({ id: 'root', transposesTo: 'nonexistent' });
    const nodesMap = new Map([['root', root]]);

    const { edges } = computeLayout(nodesMap, 'root', null, 'Test');
    expect(edges).toHaveLength(0);
  });

  it('uses taller height for nodes with tags in layout and position', () => {
    const root = makeNode({ id: 'root', childIds: ['tagged', 'plain'] });
    const tagged = makeNode({ id: 'tagged', move: 'e4', parentId: 'root', tags: ['main'] });
    const plain = makeNode({ id: 'plain', move: 'd4', parentId: 'root' });
    const nodesMap = new Map([['root', root], ['tagged', tagged], ['plain', plain]]);

    const { nodes } = computeLayout(nodesMap, 'root', null, 'Test');

    const taggedNode = nodes.find((n) => n.id === 'tagged')!;
    const plainNode = nodes.find((n) => n.id === 'plain')!;

    // Both should be to the right of root
    const rootNode = nodes.find((n) => n.id === 'root')!;
    expect(taggedNode.position.x).toBeGreaterThan(rootNode.position.x);
    expect(plainNode.position.x).toBeGreaterThan(rootNode.position.x);

    // Tagged and plain nodes at the same rank should have different y offsets
    // due to the taller height (52 vs 40), confirming per-node height is used
    expect(taggedNode.position.y).not.toBe(plainNode.position.y);
  });

  it('ignores parent-child edges when parent is not in the map', () => {
    const orphan = makeNode({ id: 'orphan', parentId: 'missing' });
    const nodesMap = new Map([['orphan', orphan]]);

    const { nodes, edges } = computeLayout(nodesMap, 'orphan', null, 'Test');
    expect(nodes).toHaveLength(1);
    expect(edges).toHaveLength(0);
  });
});
