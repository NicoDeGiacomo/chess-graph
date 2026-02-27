import { ChessboardPanel } from './ChessboardPanel.tsx';
import { NodeDetails } from './NodeDetails.tsx';

export function Sidebar() {
  return (
    <aside className="w-[35%] min-w-[300px] max-w-[450px] border-l border-border-subtle flex flex-col bg-page overflow-hidden">
      <ChessboardPanel />
      <div className="flex-1 overflow-y-auto border-t border-border-subtle">
        <NodeDetails />
      </div>
    </aside>
  );
}
