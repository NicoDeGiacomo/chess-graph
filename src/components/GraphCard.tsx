import type { Repertoire } from '../types/index.ts';

interface GraphCardProps {
  repertoire: Repertoire;
  nodeCount: number;
  onClick: () => void;
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

export function GraphCard({ repertoire, nodeCount, onClick }: GraphCardProps) {
  return (
    <button
      onClick={onClick}
      className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-left hover:border-zinc-600 hover:bg-zinc-800/50 transition-colors cursor-pointer w-full"
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">
          {repertoire.side === 'white' ? '\u2659' : '\u265F'}
        </span>
        <h3 className="text-zinc-100 font-medium truncate">{repertoire.name}</h3>
      </div>
      <div className="flex items-center justify-between text-xs text-zinc-500">
        <span>{nodeCount} {nodeCount === 1 ? 'node' : 'nodes'}</span>
        <span>{formatRelativeTime(repertoire.updatedAt)}</span>
      </div>
    </button>
  );
}
