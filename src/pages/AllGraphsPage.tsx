import { useState, useEffect, useMemo, useCallback } from 'react';
import { useDocumentMeta } from '../hooks/useDocumentMeta.ts';
import { useNavigate } from 'react-router';
import { useRepertoire } from '../hooks/useRepertoire.tsx';
import { GraphCard } from '../components/GraphCard.tsx';
import { CreateRepertoireDialog } from '../components/CreateRepertoireDialog.tsx';
import { CreateFolderDialog } from '../components/CreateFolderDialog.tsx';
import { FolderSection } from '../components/FolderSection.tsx';
import { groupByFolder } from '../utils/folders.ts';
import { FolderContextMenu } from '../components/FolderContextMenu.tsx';
import { ConfirmDialog } from '../components/ConfirmDialog.tsx';
import { ThemeToggle } from '../components/ThemeToggle.tsx';
import { db } from '../db/index.ts';
import { NODE_COLORS, type RepertoireSide } from '../types/index.ts';

interface ContextMenuTarget {
  repertoireId: string;
  folderId: string | null;
  x: number;
  y: number;
}

interface DeleteFolderTarget {
  folderId: string;
  name: string;
  count: number;
}

export function AllGraphsPage() {
  useDocumentMeta({
    title: 'My Graphs — Chess Graph',
    description:
      'Browse and manage your chess graphs. Create, edit, and organize your variations in interactive graph form.',
    canonical: 'https://www.chessgraph.net/repertoires',
  });
  const {
    state,
    createRepertoire,
    refreshRepertoireList,
    refreshFolderList,
    createFolder,
    renameFolder,
    deleteFolder,
    toggleFolderCollapsed,
    moveRepertoireToFolder,
  } = useRepertoire();
  const { repertoireList, folderList } = state;
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showFolderDialog, setShowFolderDialog] = useState(false);
  const [createInFolderId, setCreateInFolderId] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<ContextMenuTarget | null>(null);
  const [deleteFolderTarget, setDeleteFolderTarget] = useState<DeleteFolderTarget | null>(null);
  const [uncategorizedCollapsed, setUncategorizedCollapsed] = useState(false);
  const [cardData, setCardData] = useState<Record<string, { nodeCount: number; tags: string[]; comment: string; color: string }>>({});

  useEffect(() => {
    refreshRepertoireList();
    refreshFolderList();
  }, [refreshRepertoireList, refreshFolderList]);

  // Fetch node counts and root node data whenever the repertoire list changes
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const data: Record<string, { nodeCount: number; tags: string[]; comment: string; color: string }> = {};
      for (const r of repertoireList) {
        const [count, rootNode] = await Promise.all([
          db.nodes.where('repertoireId').equals(r.id).count(),
          db.nodes.get(r.rootNodeId),
        ]);
        data[r.id] = {
          nodeCount: count,
          tags: rootNode?.tags ?? [],
          comment: rootNode?.comment ?? '',
          color: rootNode?.color ?? NODE_COLORS.DEFAULT,
        };
      }
      if (!cancelled) setCardData(data);
    })();
    return () => { cancelled = true; };
  }, [repertoireList]);

  const filtered = useMemo(() =>
    repertoireList.filter((r) =>
      r.name.toLowerCase().includes(search.toLowerCase())
    ),
    [repertoireList, search],
  );

  const isSearching = search.length > 0;

  const groups = useMemo(
    () => groupByFolder(filtered, folderList),
    [filtered, folderList],
  );

  const handleCreate = async (name: string, side: RepertoireSide, folderId: string | null) => {
    const id = await createRepertoire(name, side, folderId);
    setShowCreateDialog(false);
    setCreateInFolderId(null);
    navigate(`/repertoire/${id}`);
  };

  const handleCreateFolder = async (name: string) => {
    await createFolder(name);
    setShowFolderDialog(false);
  };

  const handleContextMenu = useCallback((e: React.MouseEvent, repertoireId: string, folderId: string | null) => {
    e.preventDefault();
    setContextMenu({ repertoireId, folderId, x: e.clientX, y: e.clientY });
  }, []);

  const handleDragStart = useCallback((e: React.DragEvent, repertoireId: string) => {
    e.dataTransfer.setData('application/x-repertoire-id', repertoireId);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleMoveTo = useCallback(async (folderId: string | null) => {
    if (!contextMenu) return;
    if (contextMenu.folderId !== folderId) {
      await moveRepertoireToFolder(contextMenu.repertoireId, folderId);
    }
    setContextMenu(null);
  }, [contextMenu, moveRepertoireToFolder]);

  const handleDeleteFolder = useCallback(async () => {
    if (!deleteFolderTarget) return;
    await deleteFolder(deleteFolderTarget.folderId);
    setDeleteFolderTarget(null);
  }, [deleteFolderTarget, deleteFolder]);

  const handleOpenCreate = useCallback((folderId?: string | null) => {
    setCreateInFolderId(folderId ?? null);
    setShowCreateDialog(true);
  }, []);

  return (
    <div className="min-h-screen bg-page text-primary">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">My Graphs</h1>
          <div className="flex items-center gap-3">
          <ThemeToggle />
          <button
            className="text-sm bg-card hover:bg-elevated border border-border-subtle text-primary rounded-lg px-4 py-2"
            onClick={() => setShowFolderDialog(true)}
            data-testid="new-folder-btn"
          >
            + New Folder
          </button>
          <button
            className="text-sm bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-4 py-2"
            onClick={() => handleOpenCreate()}
          >
            + New Graph
          </button>
          </div>
        </div>

        {/* Search */}
        {repertoireList.length > 1 && (
          <input
            className="w-full bg-card border border-border-subtle rounded-lg px-3 py-2 text-sm text-primary outline-none focus:border-muted mb-6"
            placeholder="Search graphs..."
            aria-label="Search graphs"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        )}

        {/* Folder sections */}
        {filtered.length === 0 && !folderList.length ? (
          <p className="text-muted text-center py-12">
            {search ? 'No graphs match your search.' : 'No graphs yet. Create one to get started!'}
          </p>
        ) : (
          <div className="space-y-4">
            {groups.map(({ folder, repertoires: groupReps }) => {
              // When searching, hide empty folders
              if (isSearching && groupReps.length === 0) return null;

              return (
                <FolderSection
                  key={folder?.id ?? 'uncategorized'}
                  folder={folder}
                  repertoireCount={groupReps.length}
                  collapsed={folder ? folder.collapsed : uncategorizedCollapsed}
                  forceOpen={isSearching}
                  onToggleCollapsed={() => {
                    if (folder) toggleFolderCollapsed(folder.id);
                    else setUncategorizedCollapsed((prev) => !prev);
                  }}
                  onRename={folder ? (name) => renameFolder(folder.id, name) : undefined}
                  onDelete={folder ? () => {
                    setDeleteFolderTarget({
                      folderId: folder.id,
                      name: folder.name,
                      count: groupReps.length,
                    });
                  } : undefined}
                  onDrop={(repertoireId) => {
                    moveRepertoireToFolder(repertoireId, folder?.id ?? null);
                  }}
                >
                  {groupReps.length === 0 ? (
                    <p className="text-muted text-sm py-4 pl-7">No graphs in this folder</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pl-7">
                      {groupReps.map((r) => (
                        <GraphCard
                          key={r.id}
                          repertoire={r}
                          nodeCount={cardData[r.id]?.nodeCount ?? 0}
                          tags={cardData[r.id]?.tags ?? []}
                          comment={cardData[r.id]?.comment ?? ''}
                          color={cardData[r.id]?.color ?? NODE_COLORS.DEFAULT}
                          onClick={() => navigate(`/repertoire/${r.id}`)}
                          draggable
                          onDragStart={(e) => handleDragStart(e, r.id)}
                          onContextMenu={(e) => handleContextMenu(e, r.id, r.folderId)}
                        />
                      ))}
                    </div>
                  )}
                </FolderSection>
              );
            })}
          </div>
        )}
      </div>

      <CreateRepertoireDialog
        open={showCreateDialog}
        onClose={() => { setShowCreateDialog(false); setCreateInFolderId(null); }}
        onCreate={handleCreate}
        folders={folderList}
        defaultFolderId={createInFolderId}
      />

      <CreateFolderDialog
        open={showFolderDialog}
        onClose={() => setShowFolderDialog(false)}
        onCreate={handleCreateFolder}
      />

      {contextMenu && (
        <FolderContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          currentFolderId={contextMenu.folderId}
          folders={folderList}
          onMove={handleMoveTo}
          onClose={() => setContextMenu(null)}
        />
      )}

      <ConfirmDialog
        open={deleteFolderTarget !== null}
        title="Delete Folder"
        message={deleteFolderTarget
          ? `Delete folder "${deleteFolderTarget.name}"? Its ${deleteFolderTarget.count} ${deleteFolderTarget.count === 1 ? 'graph' : 'graphs'} will be moved to Uncategorized.`
          : ''}
        confirmLabel="Delete"
        confirmStyle="red"
        onConfirm={handleDeleteFolder}
        onClose={() => setDeleteFolderTarget(null)}
      />
    </div>
  );
}
