import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from 'react';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/index.ts';
import { ensureDefaultRepertoire } from '../db/seed.ts';
import type {
  Repertoire,
  RepertoireNode,
  RepertoireSide,
  ContextMenuState,
  ExportData,
} from '../types/index.ts';
import { NODE_COLORS } from '../types/index.ts';

const DEFAULT_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

interface RepertoireState {
  repertoire: Repertoire | null;
  nodesMap: Map<string, RepertoireNode>;
  selectedNodeId: string | null;
  contextMenu: ContextMenuState | null;
  repertoireList: Repertoire[];
  isLoading: boolean;
  editingNodeId: string | null;
  linkingNodeId: string | null;
}

interface RepertoireContextValue {
  state: RepertoireState;
  selectNode: (nodeId: string) => void;
  addChildNode: (parentId: string, move: string, fen: string) => Promise<void>;
  deleteNode: (nodeId: string) => Promise<void>;
  updateNode: (nodeId: string, updates: Partial<Pick<RepertoireNode, 'comment' | 'color' | 'tags'>>) => Promise<void>;
  linkTransposition: (sourceId: string, targetId: string) => Promise<void>;
  removeTransposition: (sourceId: string) => Promise<void>;
  switchRepertoire: (id: string) => Promise<void>;
  createRepertoire: (name: string, side: RepertoireSide) => Promise<string>;
  deleteRepertoire: (id: string) => Promise<void>;
  renameRepertoire: (id: string, name: string) => Promise<void>;
  refreshRepertoireList: () => Promise<void>;
  exportData: () => Promise<ExportData>;
  importData: (data: ExportData) => Promise<void>;
  setContextMenu: (menu: ContextMenuState | null) => void;
  setEditingNodeId: (id: string | null) => void;
  setLinkingNodeId: (id: string | null) => void;
}

const RepertoireContext = createContext<RepertoireContextValue | null>(null);

// eslint-disable-next-line react-refresh/only-export-components
export function useRepertoire(): RepertoireContextValue {
  const ctx = useContext(RepertoireContext);
  if (!ctx) throw new Error('useRepertoire must be used within RepertoireProvider');
  return ctx;
}

async function loadRepertoire(id: string): Promise<{ repertoire: Repertoire; nodesMap: Map<string, RepertoireNode> }> {
  const repertoire = await db.repertoires.get(id);
  if (!repertoire) throw new Error(`Repertoire ${id} not found`);
  const nodes = await db.nodes.where('repertoireId').equals(id).toArray();
  const nodesMap = new Map(nodes.map((n) => [n.id, n]));
  return { repertoire, nodesMap };
}

function collectDescendants(nodeId: string, nodesMap: Map<string, RepertoireNode>): string[] {
  const ids: string[] = [];
  const stack = [nodeId];
  while (stack.length > 0) {
    const current = stack.pop()!;
    ids.push(current);
    const node = nodesMap.get(current);
    if (node) {
      for (const childId of node.childIds) {
        stack.push(childId);
      }
    }
  }
  return ids;
}

export function RepertoireProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<RepertoireState>({
    repertoire: null,
    nodesMap: new Map(),
    selectedNodeId: null,
    contextMenu: null,
    repertoireList: [],
    isLoading: true,
    editingNodeId: null,
    linkingNodeId: null,
  });

  // Prevent StrictMode double-initialization (ref persists across mount/unmount/remount)
  const initRef = useRef(false);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    (async () => {
      await ensureDefaultRepertoire();
      const repertoireList = await db.repertoires.toArray();
      setState((prev) => ({
        ...prev,
        repertoireList,
        isLoading: false,
      }));
    })();
  }, []);

  const selectNode = useCallback((nodeId: string) => {
    setState((prev) => ({ ...prev, selectedNodeId: nodeId, contextMenu: null }));
  }, []);

  const addChildNode = useCallback(async (parentId: string, move: string, fen: string) => {
    // Generate UUID before setState so StrictMode double-invocations use the same ID
    const newNodeId = uuidv4();

    setState((prev) => {
      const parent = prev.nodesMap.get(parentId);
      if (!parent || !prev.repertoire) return prev;

      // Check for existing child with same move
      const existingChild = parent.childIds
        .map((cid) => prev.nodesMap.get(cid))
        .find((c) => c && c.move === move);
      if (existingChild) {
        return { ...prev, selectedNodeId: existingChild.id };
      }

      const newNode: RepertoireNode = {
        id: newNodeId,
        repertoireId: prev.repertoire.id,
        move,
        fen,
        comment: '',
        color: NODE_COLORS.DEFAULT,
        tags: [],
        parentId,
        childIds: [],
        transposesTo: null,
      };

      const updatedParent: RepertoireNode = {
        ...parent,
        childIds: [...parent.childIds, newNodeId],
      };

      const newMap = new Map(prev.nodesMap);
      newMap.set(newNodeId, newNode);
      newMap.set(parentId, updatedParent);

      // Use put() for idempotent writes (safe under StrictMode double-invocation)
      db.transaction('rw', db.nodes, db.repertoires, async () => {
        await db.nodes.put(newNode);
        await db.nodes.update(parentId, { childIds: updatedParent.childIds });
        await db.repertoires.update(prev.repertoire!.id, { updatedAt: Date.now() });
      }).catch(console.error);

      return { ...prev, nodesMap: newMap, selectedNodeId: newNodeId };
    });
  }, []);

  const deleteNode = useCallback(async (nodeId: string) => {
    setState((prev) => {
      const node = prev.nodesMap.get(nodeId);
      if (!node || !node.parentId || !prev.repertoire) return prev; // Can't delete root

      const idsToDelete = collectDescendants(nodeId, prev.nodesMap);
      const newMap = new Map(prev.nodesMap);
      for (const id of idsToDelete) {
        newMap.delete(id);
      }

      // Remove from parent's childIds
      const parent = newMap.get(node.parentId);
      if (parent) {
        const updatedParent = {
          ...parent,
          childIds: parent.childIds.filter((cid) => cid !== nodeId),
        };
        newMap.set(node.parentId, updatedParent);

        // Clear transposesTo references pointing to deleted nodes
        const deletedSet = new Set(idsToDelete);
        for (const [id, n] of newMap) {
          if (n.transposesTo && deletedSet.has(n.transposesTo)) {
            newMap.set(id, { ...n, transposesTo: null });
          }
        }

        // All these operations are idempotent (safe under StrictMode double-invocation)
        db.transaction('rw', db.nodes, db.repertoires, async () => {
          await db.nodes.bulkDelete(idsToDelete);
          await db.nodes.update(node.parentId!, { childIds: updatedParent.childIds });
          await db.repertoires.update(prev.repertoire!.id, { updatedAt: Date.now() });
          for (const [id, n] of newMap) {
            if (n.transposesTo === null && prev.nodesMap.get(id)?.transposesTo && deletedSet.has(prev.nodesMap.get(id)!.transposesTo!)) {
              await db.nodes.update(id, { transposesTo: null });
            }
          }
        }).catch(console.error);

        const newSelected = prev.selectedNodeId && deletedSet.has(prev.selectedNodeId)
          ? node.parentId
          : prev.selectedNodeId;

        return { ...prev, nodesMap: newMap, selectedNodeId: newSelected, contextMenu: null };
      }

      return prev;
    });
  }, []);

  const updateNode = useCallback(async (nodeId: string, updates: Partial<Pick<RepertoireNode, 'comment' | 'color' | 'tags'>>) => {
    setState((prev) => {
      const node = prev.nodesMap.get(nodeId);
      if (!node) return prev;

      const updatedNode = { ...node, ...updates };
      const newMap = new Map(prev.nodesMap);
      newMap.set(nodeId, updatedNode);

      // Idempotent DB writes (safe under StrictMode double-invocation)
      db.nodes.update(nodeId, updates).catch(console.error);
      if (prev.repertoire) {
        db.repertoires.update(prev.repertoire.id, { updatedAt: Date.now() }).catch(console.error);
      }

      return { ...prev, nodesMap: newMap };
    });
  }, []);

  const linkTransposition = useCallback(async (sourceId: string, targetId: string) => {
    setState((prev) => {
      const node = prev.nodesMap.get(sourceId);
      if (!node) return prev;

      const updatedNode = { ...node, transposesTo: targetId };
      const newMap = new Map(prev.nodesMap);
      newMap.set(sourceId, updatedNode);

      db.nodes.update(sourceId, { transposesTo: targetId }).catch(console.error);

      return { ...prev, nodesMap: newMap, linkingNodeId: null };
    });
  }, []);

  const removeTransposition = useCallback(async (sourceId: string) => {
    setState((prev) => {
      const node = prev.nodesMap.get(sourceId);
      if (!node) return prev;

      const updatedNode = { ...node, transposesTo: null };
      const newMap = new Map(prev.nodesMap);
      newMap.set(sourceId, updatedNode);

      db.nodes.update(sourceId, { transposesTo: null }).catch(console.error);

      return { ...prev, nodesMap: newMap };
    });
  }, []);

  const switchRepertoire = useCallback(async (id: string) => {
    const { repertoire, nodesMap } = await loadRepertoire(id);
    setState((prev) => ({
      ...prev,
      repertoire,
      nodesMap,
      selectedNodeId: repertoire.rootNodeId,
      contextMenu: null,
      editingNodeId: null,
      linkingNodeId: null,
    }));
  }, []);

  const createRepertoire = useCallback(async (name: string, side: RepertoireSide): Promise<string> => {
    const rootNodeId = uuidv4();
    const repertoireId = uuidv4();
    const now = Date.now();

    const rootNode: RepertoireNode = {
      id: rootNodeId,
      repertoireId,
      move: null,
      fen: DEFAULT_FEN,
      comment: '',
      color: NODE_COLORS.DEFAULT,
      tags: [],
      parentId: null,
      childIds: [],
      transposesTo: null,
    };

    const repertoire: Repertoire = {
      id: repertoireId,
      name,
      side,
      rootNodeId,
      createdAt: now,
      updatedAt: now,
    };

    await db.transaction('rw', db.repertoires, db.nodes, async () => {
      await db.nodes.add(rootNode);
      await db.repertoires.add(repertoire);
    });

    const repertoireList = await db.repertoires.toArray();

    setState((prev) => ({
      ...prev,
      repertoireList,
    }));

    return repertoireId;
  }, []);

  const deleteRepertoire = useCallback(async (id: string) => {
    await db.transaction('rw', db.repertoires, db.nodes, async () => {
      await db.nodes.where('repertoireId').equals(id).delete();
      await db.repertoires.delete(id);
    });

    const repertoireList = await db.repertoires.toArray();

    setState((prev) => ({
      ...prev,
      repertoire: prev.repertoire?.id === id ? null : prev.repertoire,
      nodesMap: prev.repertoire?.id === id ? new Map() : prev.nodesMap,
      selectedNodeId: prev.repertoire?.id === id ? null : prev.selectedNodeId,
      repertoireList,
      contextMenu: null,
      editingNodeId: null,
      linkingNodeId: null,
    }));
  }, []);

  const renameRepertoire = useCallback(async (id: string, name: string) => {
    await db.repertoires.update(id, { name, updatedAt: Date.now() });
    const repertoireList = await db.repertoires.toArray();
    setState((prev) => ({
      ...prev,
      repertoire: prev.repertoire?.id === id ? { ...prev.repertoire, name } : prev.repertoire,
      repertoireList,
    }));
  }, []);

  const exportData = useCallback(async (): Promise<ExportData> => {
    const repertoires = await db.repertoires.toArray();
    const nodes = await db.nodes.toArray();
    return { version: 1, repertoires, nodes };
  }, []);

  const importData = useCallback(async (data: ExportData) => {
    if (data.version !== 1 || !Array.isArray(data.repertoires) || !Array.isArray(data.nodes)) {
      throw new Error('Invalid import data');
    }

    await db.transaction('rw', db.repertoires, db.nodes, async () => {
      await db.repertoires.clear();
      await db.nodes.clear();
      await db.repertoires.bulkAdd(data.repertoires);
      await db.nodes.bulkAdd(data.nodes);
    });

    const repertoireList = await db.repertoires.toArray();
    if (repertoireList.length > 0) {
      const { repertoire, nodesMap } = await loadRepertoire(repertoireList[0].id);
      setState((prev) => ({
        ...prev,
        repertoire,
        nodesMap,
        selectedNodeId: repertoire.rootNodeId,
        repertoireList,
        contextMenu: null,
        editingNodeId: null,
        linkingNodeId: null,
        isLoading: false,
      }));
    }
  }, []);

  const refreshRepertoireList = useCallback(async () => {
    const repertoireList = await db.repertoires.toArray();
    setState((prev) => ({ ...prev, repertoireList }));
  }, []);

  const setContextMenu = useCallback((menu: ContextMenuState | null) => {
    setState((prev) => ({ ...prev, contextMenu: menu }));
  }, []);

  const setEditingNodeId = useCallback((id: string | null) => {
    setState((prev) => ({ ...prev, editingNodeId: id, contextMenu: null }));
  }, []);

  const setLinkingNodeId = useCallback((id: string | null) => {
    setState((prev) => ({ ...prev, linkingNodeId: id, contextMenu: null }));
  }, []);

  const value: RepertoireContextValue = {
    state,
    selectNode,
    addChildNode,
    deleteNode,
    updateNode,
    linkTransposition,
    removeTransposition,
    switchRepertoire,
    createRepertoire,
    deleteRepertoire,
    renameRepertoire,
    refreshRepertoireList,
    exportData,
    importData,
    setContextMenu,
    setEditingNodeId,
    setLinkingNodeId,
  };

  return (
    <RepertoireContext value={value}>
      {children}
    </RepertoireContext>
  );
}
