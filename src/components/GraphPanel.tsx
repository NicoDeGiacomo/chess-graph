import { Link, useNavigate } from 'react-router';
import { useRepertoire } from '../hooks/useRepertoire.tsx';

interface GraphPanelProps {
  open: boolean;
  onClose: () => void;
}

export function GraphPanel({ open, onClose }: GraphPanelProps) {
  const { state } = useRepertoire();
  const navigate = useNavigate();
  const currentId = state.repertoire?.id;

  return (
    <div
      className={`shrink-0 h-full border-r border-border-subtle bg-card flex flex-col transition-all duration-200 ${open ? 'w-64' : 'w-0 overflow-hidden'}`}
      onMouseLeave={onClose}
      data-testid="graph-panel"
    >
      <div className="min-w-64">
        {/* Header */}
        <div className="h-12 flex items-center justify-between px-4 border-b border-border-subtle shrink-0">
          <span className="text-sm font-medium text-primary">Graphs</span>
          <button
            className="text-tertiary hover:text-secondary"
            onClick={onClose}
            aria-label="Close graph list"
            data-testid="panel-close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
            </svg>
          </button>
        </div>

        {/* Repertoire list */}
        <nav className="flex-1 overflow-y-auto py-1" aria-label="Repertoire list">
          {state.repertoireList.map((r) => (
            <button
              key={r.id}
              className={`w-full text-left px-4 py-2 flex items-center gap-2 text-sm cursor-pointer ${
                r.id === currentId
                  ? 'bg-elevated text-primary'
                  : 'text-secondary hover:bg-elevated/50'
              }`}
              onClick={() => navigate(`/repertoire/${r.id}`)}
              data-testid={`panel-item-${r.id}`}
            >
              <span className="text-base leading-none" aria-hidden="true">
                {r.side === 'white' ? '♔' : '♚'}
              </span>
              <span className="truncate">{r.name}</span>
            </button>
          ))}
        </nav>

        {/* All Graphs link */}
        <div className="border-t border-border-subtle px-4 py-3 shrink-0">
          <Link
            to="/repertoires"
            className="text-sm text-tertiary hover:text-secondary flex items-center gap-1"
            data-testid="panel-all-graphs"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" />
            </svg>
            All Graphs
          </Link>
        </div>
      </div>
    </div>
  );
}
