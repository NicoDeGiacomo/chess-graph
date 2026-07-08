import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  MiniMap,
  Background,
  Controls,
  type NodeTypes,
  type EdgeTypes,
  type NodeMouseHandler,
  type OnNodeDrag,
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { MoveNode, CollapseProvider } from './MoveNode.tsx';
import { TranspositionEdge } from './TranspositionEdge.tsx';
import { useRepertoire } from '../hooks/useRepertoire.tsx';
import { useTheme } from '../hooks/useTheme.tsx';
import { computeLayout } from '../hooks/useGraphLayout.ts';
import { resolveNodeColor } from '../utils/themeColor.ts';
import type { MoveFlowNode, MoveFlowEdge, RepertoireNode } from '../types/index.ts';

const nodeTypes: NodeTypes = { move: MoveNode };
const edgeTypes: EdgeTypes = { transposition: TranspositionEdge };

function collectDescendantIds(nodeId: string, nodesMap: Map<string, RepertoireNode>): Set<string> {
  const ids = new Set<string>();
  const stack = [...(nodesMap.get(nodeId)?.childIds ?? [])];
  while (stack.length > 0) {
    const current = stack.pop()!;
    ids.add(current);
    const node = nodesMap.get(current);
    if (node) {
      for (const childId of node.childIds) stack.push(childId);
    }
  }
  return ids;
}


interface GraphCanvasProps {
  collapsedNodes: Set<string>;
  toggleCollapse: (nodeId: string) => void;
  nodePositionsRef?: React.RefObject<Map<string, { x: number; y: number }>>;
}

export function GraphCanvas({ collapsedNodes, toggleCollapse, nodePositionsRef }: GraphCanvasProps) {
  const { state, selectNode, setContextMenu } = useRepertoire();
  const { repertoire, nodesMap, selectedNodeId } = state;
  const { theme } = useTheme();
  const reactFlowInstance = useReactFlow();
  const prevNodeCount = useRef(0);
  const draggedPositions = useRef(new Map<string, { x: number; y: number }>());
  const [interactive, setInteractive] = useState(false);

  const layout = useMemo(() => {
    if (!repertoire) return { nodes: [] as MoveFlowNode[], edges: [] as MoveFlowEdge[] };
    return computeLayout(nodesMap, repertoire.rootNodeId, repertoire.name);
  }, [nodesMap, repertoire]);

  // Filter out collapsed descendants and enrich node data
  const { visibleNodes, visibleEdges } = useMemo(() => {
    // Collect all hidden node IDs (descendants of collapsed nodes)
    const hiddenIds = new Set<string>();
    const collapsedCounts = new Map<string, number>();

    for (const collapsedId of collapsedNodes) {
      // Skip collapsed IDs that no longer exist in the map
      if (!nodesMap.has(collapsedId)) continue;
      const descendants = collectDescendantIds(collapsedId, nodesMap);
      collapsedCounts.set(collapsedId, descendants.size);
      for (const id of descendants) {
        hiddenIds.add(id);
      }
    }

    const filteredNodes = layout.nodes
      .filter((node) => !hiddenIds.has(node.id))
      .map((node) => {
        const repoNode = nodesMap.get(node.id);
        const hasChildren = (repoNode?.childIds.length ?? 0) > 0 || (repoNode?.transpositionEdges.length ?? 0) > 0;
        const isCollapsed = collapsedNodes.has(node.id);
        const hiddenCount = collapsedCounts.get(node.id) ?? 0;

        return {
          ...node,
          data: {
            ...node.data,
            hasChildren,
            isCollapsed,
            hiddenCount,
          },
        };
      });

    const filteredEdges = layout.edges.filter(
      (edge) => !hiddenIds.has(edge.source) && !hiddenIds.has(edge.target),
    );

    return { visibleNodes: filteredNodes, visibleEdges: filteredEdges };
  }, [layout, collapsedNodes, nodesMap]);

  const [nodes, setNodes, onNodesChange] = useNodesState(visibleNodes);
  const [edges, setEdges] = useEdgesState(visibleEdges);

  useEffect(() => {
    const layoutIds = new Set(visibleNodes.map((n) => n.id));
    for (const id of draggedPositions.current.keys()) {
      if (!layoutIds.has(id)) draggedPositions.current.delete(id);
    }

    // Populate node positions for arrow key navigation (y-sorted siblings)
    if (nodePositionsRef?.current) {
      nodePositionsRef.current.clear();
      for (const node of visibleNodes) {
        const dragged = draggedPositions.current.get(node.id);
        nodePositionsRef.current.set(node.id, dragged ?? node.position);
      }
    }

    setNodes(
      visibleNodes.map((node) => {
        const dragged = draggedPositions.current.get(node.id);
        return dragged ? { ...node, position: dragged } : node;
      }),
    );
    setEdges(visibleEdges);
  }, [visibleNodes, visibleEdges, setNodes, setEdges, nodePositionsRef]);

  useEffect(() => {
    setNodes((prev) =>
      prev.map((node) => ({
        ...node,
        data: { ...node.data, isSelected: node.id === selectedNodeId },
      }))
    );
  }, [selectedNodeId, setNodes]);

  // Fit view when visible node count changes (add/delete/collapse)
  useEffect(() => {
    if (visibleNodes.length > 0 && visibleNodes.length !== prevNodeCount.current) {
      prevNodeCount.current = visibleNodes.length;
      const timer = setTimeout(() => {
        reactFlowInstance.fitView({ padding: 0.2, duration: 300 });
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [visibleNodes.length, reactFlowInstance]);

  const onNodeDragStop: OnNodeDrag = useCallback((_event, node) => {
    draggedPositions.current.set(node.id, node.position);
    nodePositionsRef?.current?.set(node.id, node.position);
  }, [nodePositionsRef]);

  const onNodeClick: NodeMouseHandler = useCallback((_event, node) => {
    selectNode(node.id);
  }, [selectNode]);

  const onNodeContextMenu: NodeMouseHandler = useCallback((event, node) => {
    event.preventDefault();
    setContextMenu({
      nodeId: node.id,
      x: event.clientX,
      y: event.clientY,
    });
  }, [setContextMenu]);

  const onPaneClick = useCallback(() => {
    setContextMenu(null);
  }, [setContextMenu]);

  return (
    <CollapseProvider onToggle={toggleCollapse}>
      <div className="flex-1 h-full">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onNodeDragStop={onNodeDragStop}
          onNodeClick={onNodeClick}
          onNodeContextMenu={onNodeContextMenu}
          onPaneClick={onPaneClick}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          nodesDraggable={interactive}
          elementsSelectable={interactive}
          nodesConnectable={false}
          colorMode={theme}
          fitView
          minZoom={0.1}
          maxZoom={2}
          proOptions={{ hideAttribution: true }}
        >
          <MiniMap
            nodeColor={(node) => {
              const color = node.data?.color as string | undefined;
              return resolveNodeColor(color || '#3f3f46');
            }}
            maskColor="var(--color-minimap-mask)"
            style={{
              backgroundColor: 'var(--color-minimap-bg)',
              border: '1px solid var(--color-minimap-border)',
            }}
          />
          <Background color="var(--color-graph-bg-dot)" gap={20} />
          <Controls
            className="!bg-elevated !border-border !shadow-lg [&>button]:!bg-elevated [&>button]:!border-border [&>button]:!fill-tertiary [&>button:hover]:!bg-input"
            onInteractiveChange={() => setInteractive((prev) => !prev)}
          />
        </ReactFlow>
      </div>
    </CollapseProvider>
  );
}
