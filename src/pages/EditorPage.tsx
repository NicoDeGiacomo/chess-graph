import { useEffect, useRef } from 'react';
import { useDocumentMeta } from '../hooks/useDocumentMeta.ts';
import { useParams, useNavigate, Navigate } from 'react-router';
import { ReactFlowProvider } from '@xyflow/react';
import { useRepertoire } from '../hooks/useRepertoire.tsx';
import { EditorTopBar } from '../components/EditorTopBar.tsx';
import { GraphCanvas } from '../components/GraphCanvas.tsx';
import { Sidebar } from '../components/Sidebar.tsx';
import { ContextMenu } from '../components/ContextMenu.tsx';
import { EditNodeDialog } from '../components/EditNodeDialog.tsx';
import { LinkTranspositionDialog } from '../components/LinkTranspositionDialog.tsx';

export function EditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state, switchRepertoire } = useRepertoire();
  const switchingRef = useRef<string | null>(null);
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
      <div className="h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center">
        <div className="text-zinc-500">Loading...</div>
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
      <div className="h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center">
        <div className="text-zinc-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-zinc-950 text-zinc-100 flex flex-col overflow-hidden">
      <EditorTopBar />
      <div className="flex flex-1 min-h-0">
        <ReactFlowProvider>
          <GraphCanvas />
        </ReactFlowProvider>
        <Sidebar />
      </div>
      <ContextMenu />
      <EditNodeDialog />
      <LinkTranspositionDialog />
    </div>
  );
}
