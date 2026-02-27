import type { Repertoire } from '../types/index.ts';
import { resolveNodeColor } from '../utils/themeColor.ts';

interface GraphCardProps {
  repertoire: Repertoire;
  nodeCount: number;
  tags: string[];
  comment: string;
  color: string;
  onClick: () => void;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onContextMenu?: (e: React.MouseEvent) => void;
}

function formatRelativeTime(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

const MAX_VISIBLE_TAGS = 3;

export function GraphCard({ repertoire, nodeCount, tags, comment, color, onClick, draggable, onDragStart, onContextMenu }: GraphCardProps) {
  const visibleTags = tags.slice(0, MAX_VISIBLE_TAGS);
  const overflowCount = tags.length - MAX_VISIBLE_TAGS;

  return (
    <button
      data-testid="graph-card"
      onClick={onClick}
      draggable={draggable}
      onDragStart={onDragStart}
      onContextMenu={onContextMenu}
      className="bg-card border border-border-subtle border-l-4 rounded-xl p-4 text-left hover:border-border hover:bg-elevated transition-colors cursor-pointer w-full"
      style={{ borderLeftColor: resolveNodeColor(color) }}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">
          {repertoire.side === 'white' ? '♔' : '♚'}
        </span>
        <h3 className="text-primary font-medium truncate">{repertoire.name}</h3>
      </div>

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {visibleTags.map((tag) => (
            <span key={tag} className="bg-input text-secondary rounded px-2 py-0.5 text-xs">
              {tag}
            </span>
          ))}
          {overflowCount > 0 && (
            <span className="text-muted text-xs px-1 py-0.5">+{overflowCount}</span>
          )}
        </div>
      )}

      {comment && (
        <p className="text-tertiary text-xs truncate mb-2">{comment}</p>
      )}

      <div className="flex items-center justify-between text-xs text-muted">
        <span>{nodeCount} {nodeCount === 1 ? 'node' : 'nodes'}</span>
        <span>{formatRelativeTime(repertoire.updatedAt)}</span>
      </div>
    </button>
  );
}
