import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { MoveFlowNode } from '../types/index.ts';
import { resolveNodeColor } from '../utils/themeColor.ts';

function MoveNodeComponent({ data }: NodeProps<MoveFlowNode>) {
  const label = data.isRoot ? data.repertoireName : data.move;

  return (
    <>
      <Handle type="target" position={Position.Left} className="!w-2 !h-2 !border-0 !opacity-0" style={{ backgroundColor: 'var(--color-text-muted)' }} />
      <div
        className={`min-h-[40px] w-[120px] overflow-hidden flex items-center px-3 py-1.5 rounded-lg border text-sm font-medium cursor-pointer transition-all
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
      </div>
      <Handle type="source" position={Position.Right} className="!w-2 !h-2 !border-0 !opacity-0" style={{ backgroundColor: 'var(--color-text-muted)' }} />
    </>
  );
}

export const MoveNode = memo(MoveNodeComponent);
