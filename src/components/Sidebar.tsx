import { ChessboardPanel } from './ChessboardPanel.tsx';
import { MoveInput } from './MoveInput.tsx';
import { NodeDetails } from './NodeDetails.tsx';

export function Sidebar() {
  return (
    <aside className="w-full border-t md:border-t-0 md:border-l border-border-subtle flex flex-col bg-page overflow-hidden">
      <ChessboardPanel />
      <MoveInput />
      <div className="flex-1 overflow-y-auto border-t border-border-subtle">
        <NodeDetails />
      </div>
    </aside>
  );
}
