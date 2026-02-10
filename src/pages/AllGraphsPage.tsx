import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useRepertoire } from '../hooks/useRepertoire.tsx';
import { GraphCard } from '../components/GraphCard.tsx';
import { CreateRepertoireDialog } from '../components/CreateRepertoireDialog.tsx';
import { db } from '../db/index.ts';
import type { RepertoireSide } from '../types/index.ts';

export function AllGraphsPage() {
  const { state, createRepertoire, refreshRepertoireList } = useRepertoire();
  const { repertoireList } = state;
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [nodeCounts, setNodeCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    refreshRepertoireList();
  }, [refreshRepertoireList]);

  // Fetch node counts whenever the repertoire list changes
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const counts: Record<string, number> = {};
      for (const r of repertoireList) {
        counts[r.id] = await db.nodes.where('repertoireId').equals(r.id).count();
      }
      if (!cancelled) setNodeCounts(counts);
    })();
    return () => { cancelled = true; };
  }, [repertoireList]);

  const filtered = repertoireList.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = async (name: string, side: RepertoireSide) => {
    const id = await createRepertoire(name, side);
    setShowCreateDialog(false);
    navigate(`/repertoire/${id}`);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">My Repertoires</h1>
          <button
            className="text-sm bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-4 py-2"
            onClick={() => setShowCreateDialog(true)}
          >
            + New Repertoire
          </button>
        </div>

        {/* Search */}
        {repertoireList.length > 1 && (
          <input
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100 outline-none focus:border-zinc-600 mb-6"
            placeholder="Search repertoires..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        )}

        {/* Card grid */}
        {filtered.length === 0 ? (
          <p className="text-zinc-500 text-center py-12">
            {search ? 'No repertoires match your search.' : 'No repertoires yet. Create one to get started!'}
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((r) => (
              <GraphCard
                key={r.id}
                repertoire={r}
                nodeCount={nodeCounts[r.id] ?? 0}
                onClick={() => navigate(`/repertoire/${r.id}`)}
              />
            ))}
          </div>
        )}
      </div>

      <CreateRepertoireDialog
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onCreate={handleCreate}
      />
    </div>
  );
}
