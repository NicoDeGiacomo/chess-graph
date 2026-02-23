import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { MoveFlowNode } from '../types/index.ts';

function MoveNodeComponent({ data }: NodeProps<MoveFlowNode>) {
  const label = data.isRoot ? data.repertoireName : data.move;

  return (
    <>
      <Handle type="target" position={Position.Left} className="!bg-zinc-500 !w-2 !h-2 !border-0 !opacity-0" />
      <div
        className={`min-h-[40px] flex items-center px-3 py-1.5 rounded-lg border text-sm font-medium cursor-pointer transition-all
          ${data.isSelected ? 'ring-2 ring-blue-400 ring-offset-1 ring-offset-zinc-950' : ''}
          ${data.isRoot ? 'text-xs px-2 py-1' : ''}
        `}
        style={{
          backgroundColor: data.color,
          borderColor: data.isSelected ? '#60a5fa' : '#52525b',
          color: '#fafafa',
        }}
      >
        <div>
          {label}
          {data.tags.length > 0 && (
            <div className="flex gap-0.5 mt-0.5">
              {data.tags.map((tag) => (
                <span key={tag} className="text-[9px] bg-zinc-800/60 rounded px-1">{tag}</span>
              ))}
            </div>
          )}
        </div>
      </div>
      <Handle type="source" position={Position.Right} className="!bg-zinc-500 !w-2 !h-2 !border-0 !opacity-0" />
    </>
  );
}

export const MoveNode = memo(MoveNodeComponent);
