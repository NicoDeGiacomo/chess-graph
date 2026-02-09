import { ReactFlowProvider } from '@xyflow/react';
import { RepertoireProvider } from './hooks/useRepertoire.tsx';
import { TopBar } from './components/TopBar.tsx';
import { GraphCanvas } from './components/GraphCanvas.tsx';
import { Sidebar } from './components/Sidebar.tsx';
import { ContextMenu } from './components/ContextMenu.tsx';
import { EditNodeDialog } from './components/EditNodeDialog.tsx';
import { LinkTranspositionDialog } from './components/LinkTranspositionDialog.tsx';
import { useRepertoire } from './hooks/useRepertoire.tsx';

function AppContent() {
  const { state } = useRepertoire();

  if (state.isLoading) {
    return (
      <div className="h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center">
        <div className="text-zinc-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-zinc-950 text-zinc-100 flex flex-col overflow-hidden">
      <TopBar />
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

function App() {
  return (
    <RepertoireProvider>
      <AppContent />
    </RepertoireProvider>
  );
}

export default App;
