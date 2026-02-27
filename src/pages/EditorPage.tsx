import { useEffect, useRef, useState, useCallback } from 'react';
import { useDocumentMeta } from '../hooks/useDocumentMeta.ts';
import { useParams, useNavigate, Navigate } from 'react-router';
import { ReactFlowProvider } from '@xyflow/react';
import { useRepertoire } from '../hooks/useRepertoire.tsx';
import { useArrowKeyNav } from '../hooks/useArrowKeyNav.ts';
import { UndoRedoProvider } from '../hooks/useUndoRedo.tsx';
import { EditorTopBar } from '../components/EditorTopBar.tsx';
import { GraphCanvas } from '../components/GraphCanvas.tsx';
import { GraphPanel } from '../components/GraphPanel.tsx';
import { Sidebar } from '../components/Sidebar.tsx';
import { ContextMenu } from '../components/ContextMenu.tsx';
import { EditNodeDialog } from '../components/EditNodeDialog.tsx';
import type { RepertoireNode } from '../types/index.ts';

function collectDescendantIds(nodeId: string, nodesMap: Map<string, RepertoireNode>): Set<string> {
  const ids = new Set<string>();
  const stack = [...(nodesMap.get(nodeId)?.childIds ?? [])];
  while (stack.length > 0) {
    const current = stack.pop()!;
    ids.add(current);
    const node = nodesMap.get(current);
    if (node) {
      for (const childId of node.childIds) {
        stack.push(childId);
      }
    }
  }
  return ids;
}

export function EditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state, selectNode, switchRepertoire } = useRepertoire();
  const switchingRef = useRef<string | null>(null);

  const [panelOpen, setPanelOpen] = useState(false);

  // Collapse state lives here so useArrowKeyNav can access it
  const [collapsedNodes, setCollapsedNodes] = useState<Set<string>>(new Set());
  const stateRef = useRef(state);
  useEffect(() => { stateRef.current = state; });

  // Clear collapse state when repertoire changes (React pattern: adjust state during render)
  const repertoireId = state.repertoire?.id;
  const [prevRepertoireId, setPrevRepertoireId] = useState(repertoireId);
  if (repertoireId !== prevRepertoireId) {
    setPrevRepertoireId(repertoireId);
    setCollapsedNodes(new Set());
  }

  const toggleCollapse = useCallback((nodeId: string) => {
    setCollapsedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
        const descendants = collectDescendantIds(nodeId, stateRef.current.nodesMap);
        if (stateRef.current.selectedNodeId && descendants.has(stateRef.current.selectedNodeId)) {
          selectNode(nodeId);
        }
      }
      return next;
    });
  }, [selectNode]);

  const nodePositionsRef = useRef(new Map<string, { x: number; y: number }>());
  useArrowKeyNav(state, selectNode, collapsedNodes, toggleCollapse, nodePositionsRef);
  const repertoireName = state.repertoire?.name;
  useDocumentMeta({
    title: repertoireName ? `${repertoireName} — Chess Graph` : 'Chess Graph',
    description: repertoireName
      ? `Editing ${repertoireName} — explore moves and variations as an interactive graph.`
      : 'Chess opening repertoire editor with interactive game tree visualization.',
    canonical: 'https://chessgraph.net/repertoires',
  });

  // Trigger switchRepertoire when id changes and list is ready
  useEffect(() => {
    if (!id || state.isLoading) return;

    // Check if repertoire exists in the list
    const exists = state.repertoireList.some((r) => r.id === id);
    if (!exists) {
      navigate('/repertoires', { replace: true });
      return;
    }

    // Already loaded or currently switching to this ID — skip
    if (state.repertoire?.id === id || switchingRef.current === id) return;

    switchingRef.current = id;
    switchRepertoire(id).then(() => {
      switchingRef.current = null;
    });
  }, [id, state.isLoading, state.repertoireList, state.repertoire?.id, switchRepertoire, navigate]);

  // Provider still initializing
  if (state.isLoading) {
    return (
      <div className="h-screen bg-page text-primary flex items-center justify-center">
        <div className="text-muted">Loading...</div>
      </div>
    );
  }

  // Invalid ID — redirect
  if (!id || !state.repertoireList.some((r) => r.id === id)) {
    return <Navigate to="/repertoires" replace />;
  }

  // Waiting for switchRepertoire to complete
  if (!state.repertoire || state.repertoire.id !== id) {
    return (
      <div className="h-screen bg-page text-primary flex items-center justify-center">
        <div className="text-muted">Loading...</div>
      </div>
    );
  }

  return (
    <UndoRedoProvider>
      <main className="h-screen bg-page text-primary flex flex-col overflow-hidden">
        <EditorTopBar panelOpen={panelOpen} onTogglePanel={() => setPanelOpen((v) => !v)} />
        <div className="flex flex-1 min-h-0">
          <GraphPanel open={panelOpen} onClose={() => setPanelOpen(false)} />
          {!panelOpen && (
            <div
              className="fixed left-0 top-12 bottom-0 w-2 z-10"
              onMouseEnter={() => setPanelOpen(true)}
              data-testid="panel-hover-zone"
            />
          )}
          <ReactFlowProvider>
            <GraphCanvas collapsedNodes={collapsedNodes} toggleCollapse={toggleCollapse} nodePositionsRef={nodePositionsRef} />
          </ReactFlowProvider>
          <Sidebar />
        </div>
        <ContextMenu />
        <EditNodeDialog />
      </main>
    </UndoRedoProvider>
  );
}
