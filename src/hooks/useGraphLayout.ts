import dagre from 'dagre';
import { MarkerType } from '@xyflow/react';
import type { RepertoireNode, MoveFlowNode, MoveFlowEdge, MoveNodeData } from '../types/index.ts';

const NODE_WIDTH = 120;
const NODE_HEIGHT = 40;
const NODE_HEIGHT_WITH_TAGS = 52;

export function computeLayout(
  nodesMap: Map<string, RepertoireNode>,
  rootNodeId: string,
  selectedNodeId: string | null,
  repertoireName: string,
): { nodes: MoveFlowNode[]; edges: MoveFlowEdge[] } {
  if (nodesMap.size === 0) return { nodes: [], edges: [] };

  const g = new dagre.graphlib.Graph();
  g.setGraph({
    rankdir: 'LR',
    nodesep: 30,
    ranksep: 80,
    marginx: 20,
    marginy: 20,
  });
  g.setDefaultEdgeLabel(() => ({}));

  const flowEdges: MoveFlowEdge[] = [];

  for (const [id, node] of nodesMap) {
    const nodeHeight = node.tags.length > 0 ? NODE_HEIGHT_WITH_TAGS : NODE_HEIGHT;
    g.setNode(id, { width: NODE_WIDTH, height: nodeHeight });

    // Parent-child edges (added to dagre for layout)
    if (node.parentId && nodesMap.has(node.parentId)) {
      flowEdges.push({
        id: `e-${node.parentId}-${id}`,
        source: node.parentId,
        target: id,
        type: 'smoothstep',
        style: { stroke: '#71717a' },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#71717a' },
        data: { isTransposition: false },
      });
      g.setEdge(node.parentId, id);
    }

    // Transposition edges (NOT added to dagre to avoid cycles)
    if (node.transposesTo && nodesMap.has(node.transposesTo)) {
      flowEdges.push({
        id: `t-${id}-${node.transposesTo}`,
        source: id,
        target: node.transposesTo,
        animated: true,
        style: { stroke: '#f59e0b', strokeDasharray: '5 5' },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#f59e0b' },
        data: { isTransposition: true },
      });
    }
  }

  dagre.layout(g);

  const flowNodes: MoveFlowNode[] = [];
  for (const [id, node] of nodesMap) {
    const dagreNode = g.node(id);
    if (!dagreNode) continue;

    const nodeData: MoveNodeData = {
      move: node.move,
      fen: node.fen,
      comment: node.comment,
      color: node.color,
      tags: node.tags,
      isRoot: id === rootNodeId,
      repertoireName,
      isSelected: id === selectedNodeId,
    };

    flowNodes.push({
      id,
      type: 'move',
      position: {
        x: dagreNode.x - NODE_WIDTH / 2,
        y: dagreNode.y - (node.tags.length > 0 ? NODE_HEIGHT_WITH_TAGS : NODE_HEIGHT) / 2,
      },
      data: nodeData,
    });
  }

  return { nodes: flowNodes, edges: flowEdges };
}
