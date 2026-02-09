import { useState, useMemo } from 'react';
import { useRepertoire } from '../hooks/useRepertoire.tsx';

export function LinkTranspositionDialog() {
  const { state, linkTransposition, removeTransposition, setLinkingNodeId } = useRepertoire();
  const { linkingNodeId, nodesMap } = state;
  const [search, setSearch] = useState('');

  const sourceNode = linkingNodeId ? nodesMap.get(linkingNodeId) : null;

  const candidates = useMemo(() => {
    if (!linkingNodeId) return [];
    const results: { id: string; move: string | null; fen: string; path: string }[] = [];

    for (const [id, node] of nodesMap) {
      if (id === linkingNodeId) continue; // Can't link to self

      // Build path for display
      const pathParts: string[] = [];
      let current = node;
      while (current.parentId) {
        if (current.move) pathParts.unshift(current.move);
        const parent = nodesMap.get(current.parentId);
        if (!parent) break;
        current = parent;
      }

      results.push({
        id,
        move: node.move,
        fen: node.fen,
        path: pathParts.join(' → ') || 'Start',
      });
    }

    if (!search) return results;
    const lower = search.toLowerCase();
    return results.filter(
      (r) =>
        r.path.toLowerCase().includes(lower) ||
        (r.move && r.move.toLowerCase().includes(lower)) ||
        r.fen.toLowerCase().includes(lower)
    );
  }, [linkingNodeId, nodesMap, search]);

  if (!linkingNodeId || !sourceNode) return null;

  const handleSelect = (targetId: string) => {
    linkTransposition(linkingNodeId, targetId);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setLinkingNodeId(null)}>
      <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-4 w-[450px] max-w-[90vw] shadow-xl max-h-[70vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-sm font-medium text-zinc-100 mb-2">
          Link Transposition — {sourceNode.move || 'Start'}
        </h3>
        <p className="text-xs text-zinc-400 mb-3">
          Select a target node that this position transposes to.
        </p>

        {sourceNode.transposesTo && (
          <div className="mb-3 flex items-center justify-between bg-yellow-900/20 border border-yellow-800/40 rounded p-2">
            <span className="text-xs text-yellow-400">
              Currently linked to: {nodesMap.get(sourceNode.transposesTo)?.move || 'Start'}
            </span>
            <button
              className="text-xs text-red-400 hover:text-red-300"
              onClick={() => {
                removeTransposition(linkingNodeId);
                setLinkingNodeId(null);
              }}
            >
              Remove
            </button>
          </div>
        )}

        <input
          autoFocus
          className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-1.5 text-sm text-zinc-100 outline-none focus:border-blue-500 mb-2"
          placeholder="Search by move or path..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="flex-1 overflow-y-auto space-y-1 min-h-0">
          {candidates.length === 0 ? (
            <p className="text-xs text-zinc-500 py-4 text-center">No matching nodes</p>
          ) : (
            candidates.map((c) => (
              <button
                key={c.id}
                className="w-full text-left px-3 py-2 hover:bg-zinc-800 rounded text-xs group"
                onClick={() => handleSelect(c.id)}
              >
                <div className="text-zinc-200 font-medium">{c.path}</div>
                <div className="text-zinc-500 font-mono truncate text-[10px]">{c.fen}</div>
              </button>
            ))
          )}
        </div>

        <div className="flex justify-end mt-3 pt-2 border-t border-zinc-800">
          <button
            className="text-sm text-zinc-400 hover:text-zinc-200 px-3 py-1"
            onClick={() => setLinkingNodeId(null)}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
