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
import { MoveNode } from './MoveNode.tsx';
import { TranspositionEdge } from './TranspositionEdge.tsx';
import { useRepertoire } from '../hooks/useRepertoire.tsx';
import { computeLayout } from '../hooks/useGraphLayout.ts';
import type { MoveFlowNode, MoveFlowEdge } from '../types/index.ts';

const nodeTypes: NodeTypes = { move: MoveNode };
const edgeTypes: EdgeTypes = { transposition: TranspositionEdge };

export function GraphCanvas() {
  const { state, selectNode, setContextMenu } = useRepertoire();
  const { repertoire, nodesMap, selectedNodeId } = state;
  const reactFlowInstance = useReactFlow();
  const prevNodeCount = useRef(0);
  const draggedPositions = useRef(new Map<string, { x: number; y: number }>());
  const [interactive, setInteractive] = useState(false);

  const layout = useMemo(() => {
    if (!repertoire) return { nodes: [] as MoveFlowNode[], edges: [] as MoveFlowEdge[] };
    return computeLayout(nodesMap, repertoire.rootNodeId, repertoire.name);
  }, [nodesMap, repertoire]);

  const [nodes, setNodes, onNodesChange] = useNodesState(layout.nodes);
  const [edges, setEdges] = useEdgesState(layout.edges);

  useEffect(() => {
    const layoutIds = new Set(layout.nodes.map((n) => n.id));
    for (const id of draggedPositions.current.keys()) {
      if (!layoutIds.has(id)) draggedPositions.current.delete(id);
    }

    setNodes(
      layout.nodes.map((node) => {
        const dragged = draggedPositions.current.get(node.id);
        return dragged ? { ...node, position: dragged } : node;
      }),
    );
    setEdges(layout.edges);
  }, [layout, setNodes, setEdges]);

  useEffect(() => {
    setNodes((prev) =>
      prev.map((node) => ({
        ...node,
        data: { ...node.data, isSelected: node.id === selectedNodeId },
      }))
    );
  }, [selectedNodeId, setNodes]);

  // Fit view when node count changes (add/delete)
  useEffect(() => {
    if (layout.nodes.length > 0 && layout.nodes.length !== prevNodeCount.current) {
      prevNodeCount.current = layout.nodes.length;
      const timer = setTimeout(() => {
        reactFlowInstance.fitView({ padding: 0.2, duration: 300 });
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [layout.nodes.length, reactFlowInstance]);

  const onNodeDragStop: OnNodeDrag = useCallback((_event, node) => {
    draggedPositions.current.set(node.id, node.position);
  }, []);

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
        colorMode="dark"
        fitView
        minZoom={0.1}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
      >
        <MiniMap
          nodeColor={(node) => {
            const color = node.data?.color as string | undefined;
            return color || '#3f3f46';
          }}
          maskColor="rgba(0, 0, 0, 0.7)"
          className="!bg-zinc-900 !border-zinc-700"
        />
        <Background color="#27272a" gap={20} />
        <Controls
          className="!bg-zinc-800 !border-zinc-700 !shadow-lg [&>button]:!bg-zinc-800 [&>button]:!border-zinc-700 [&>button]:!fill-zinc-400 [&>button:hover]:!bg-zinc-700"
          onInteractiveChange={() => setInteractive((prev) => !prev)}
        />
      </ReactFlow>
    </div>
  );
}
