import { memo, useRef, useEffect, createContext, useContext } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { MoveFlowNode } from '../types/index.ts';
import { resolveNodeColor } from '../utils/themeColor.ts';

type CollapseHandler = (nodeId: string) => void;

const CollapseContext = createContext<CollapseHandler | null>(null);

// eslint-disable-next-line react-refresh/only-export-components
export function useCollapseHandler() {
  return useContext(CollapseContext);
}

export function CollapseProvider({ onToggle, children }: { onToggle: CollapseHandler; children: React.ReactNode }) {
  return <CollapseContext value={onToggle}>{children}</CollapseContext>;
}

function MoveNodeComponent({ id, data }: NodeProps<MoveFlowNode>) {
  const toggleCollapse = useCollapseHandler();
  const label = data.isRoot ? data.repertoireName : data.move;
  const nodeRef = useRef<HTMLDivElement>(null);

  // Native DOM listener for dblclick — React synthetic onDoubleClick doesn't
  // reliably fire inside ReactFlow node wrappers under automated testing.
  const toggleRef = useRef(toggleCollapse);
  useEffect(() => { toggleRef.current = toggleCollapse; });
  const idRef = useRef(id);
  useEffect(() => { idRef.current = id; });

  useEffect(() => {
    const el = nodeRef.current;
    if (!el) return;
    const handler = () => { if (toggleRef.current) toggleRef.current(idRef.current); };
    el.addEventListener('dblclick', handler);
    return () => el.removeEventListener('dblclick', handler);
  }, []);

  return (
    <>
      <Handle type="target" position={Position.Left} className="!w-2 !h-2 !border-0 !opacity-0" style={{ backgroundColor: 'var(--color-text-muted)' }} />
      <div
        ref={nodeRef}
        className={`relative min-h-[40px] w-[120px] overflow-visible flex items-center px-3 py-1.5 rounded-lg border text-sm font-medium cursor-pointer transition-all
          ${data.isSelected ? 'ring-2 ring-blue-400 ring-offset-1 ring-offset-page' : ''}
          ${data.isRoot ? 'text-xs px-2 py-1' : ''}
        `}
        style={{
          backgroundColor: resolveNodeColor(data.color),
          borderColor: data.isSelected ? 'var(--color-node-selected-border)' : 'var(--color-node-border)',
          color: 'var(--color-node-text)',
        }}
      >
        <div>
          {label}
          {data.tags.length > 0 && (
            <div className="flex gap-0.5 mt-0.5">
              {data.tags.map((tag) => (
                <span key={tag} className="text-[9px] rounded px-1" style={{ backgroundColor: 'var(--color-node-tag-bg)' }}>{tag}</span>
              ))}
            </div>
          )}
        </div>
        {data.hasChildren && data.isCollapsed && (
          <span
            data-testid="collapse-badge"
            className="absolute -right-2.5 top-1/2 -translate-y-1/2 bg-blue-500 text-white text-[9px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1"
          >
            +{data.hiddenCount}
          </span>
        )}
      </div>
      <Handle type="source" position={Position.Right} className="!w-2 !h-2 !border-0 !opacity-0" style={{ backgroundColor: 'var(--color-text-muted)' }} />
    </>
  );
}

export const MoveNode = memo(MoveNodeComponent);
