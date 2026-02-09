import { ChessboardPanel } from './ChessboardPanel.tsx';
import { NodeDetails } from './NodeDetails.tsx';

export function Sidebar() {
  return (
    <div className="w-[35%] min-w-[300px] max-w-[450px] border-l border-zinc-800 flex flex-col bg-zinc-950 overflow-hidden">
      <ChessboardPanel />
      <div className="flex-1 overflow-y-auto border-t border-zinc-800">
        <NodeDetails />
      </div>
    </div>
  );
}
