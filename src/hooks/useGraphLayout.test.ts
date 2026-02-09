import { describe, it, expect } from 'vitest';
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
});
