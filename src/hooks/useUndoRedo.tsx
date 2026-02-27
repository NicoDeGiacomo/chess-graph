import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useRepertoire, type RepertoireState } from './useRepertoire.tsx';
import type { RepertoireNode } from '../types/index.ts';

const MAX_STACK_SIZE = 50;

type NodesSnapshot = Map<string, RepertoireNode>;

interface UndoRedoContextValue {
  addChildNode: (parentId: string, move: string, fen: string) => Promise<void>;
  deleteNode: (nodeId: string) => Promise<void>;
  clearGraph: () => Promise<void>;
  updateNode: (nodeId: string, updates: Partial<Pick<RepertoireNode, 'comment' | 'color' | 'tags'>>) => Promise<void>;
  removeTranspositionEdge: (nodeId: string, targetId: string) => Promise<void>;
  replaceNodesMap: (nodesMap: Map<string, RepertoireNode>) => Promise<void>;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const UndoRedoContext = createContext<UndoRedoContextValue | null>(null);

// eslint-disable-next-line react-refresh/only-export-components
export function useUndoRedo(): UndoRedoContextValue {
  const ctx = useContext(UndoRedoContext);
  if (!ctx) throw new Error('useUndoRedo must be used within UndoRedoProvider');
  return ctx;
}

export function UndoRedoProvider({ children }: { children: ReactNode }) {
  const repertoire = useRepertoire();
  const { state } = repertoire;

  const [undoStack, setUndoStack] = useState<NodesSnapshot[]>([]);
  const [redoStack, setRedoStack] = useState<NodesSnapshot[]>([]);

  // Track latest state via effect to satisfy lint rules
  const stateRef = useRef<RepertoireState>(state);
  useEffect(() => { stateRef.current = state; });

  const undoStackRef = useRef(undoStack);
  useEffect(() => { undoStackRef.current = undoStack; }, [undoStack]);
  const redoStackRef = useRef(redoStack);
  useEffect(() => { redoStackRef.current = redoStack; }, [redoStack]);

  // Clear stacks when repertoire changes (React pattern: adjust state during render)
  const repertoireId = state.repertoire?.id;
  const [prevRepertoireId, setPrevRepertoireId] = useState(repertoireId);
  if (repertoireId !== prevRepertoireId) {
    setPrevRepertoireId(repertoireId);
    setUndoStack([]);
    setRedoStack([]);
  }

  const pushUndo = useCallback((snapshot: NodesSnapshot) => {
    setUndoStack((prev) => {
      const next = [...prev, snapshot];
      if (next.length > MAX_STACK_SIZE) next.shift();
      return next;
    });
    setRedoStack([]);
  }, []);

  const wrappedAddChildNode = useCallback(async (parentId: string, move: string, fen: string) => {
    const snapshot = new Map(stateRef.current.nodesMap);
    pushUndo(snapshot);
    await repertoire.addChildNode(parentId, move, fen);
  }, [repertoire, pushUndo]);

  const wrappedDeleteNode = useCallback(async (nodeId: string) => {
    const snapshot = new Map(stateRef.current.nodesMap);
    pushUndo(snapshot);
    await repertoire.deleteNode(nodeId);
  }, [repertoire, pushUndo]);

  const wrappedClearGraph = useCallback(async () => {
    const snapshot = new Map(stateRef.current.nodesMap);
    pushUndo(snapshot);
    await repertoire.clearGraph();
  }, [repertoire, pushUndo]);

  const wrappedUpdateNode = useCallback(async (nodeId: string, updates: Partial<Pick<RepertoireNode, 'comment' | 'color' | 'tags'>>) => {
    const snapshot = new Map(stateRef.current.nodesMap);
    pushUndo(snapshot);
    await repertoire.updateNode(nodeId, updates);
  }, [repertoire, pushUndo]);

  const wrappedRemoveTranspositionEdge = useCallback(async (nodeId: string, targetId: string) => {
    const snapshot = new Map(stateRef.current.nodesMap);
    pushUndo(snapshot);
    await repertoire.removeTranspositionEdge(nodeId, targetId);
  }, [repertoire, pushUndo]);

  const wrappedReplaceNodesMap = useCallback(async (nodesMap: Map<string, RepertoireNode>) => {
    const snapshot = new Map(stateRef.current.nodesMap);
    pushUndo(snapshot);
    await repertoire.replaceNodesMap(nodesMap);
  }, [repertoire, pushUndo]);

  const undo = useCallback(() => {
    const stack = undoStackRef.current;
    if (stack.length === 0) return;

    const snapshot = stack[stack.length - 1];
    const currentMap = new Map(stateRef.current.nodesMap);

    setUndoStack((prev) => prev.slice(0, -1));
    setRedoStack((prev) => {
      const next = [...prev, currentMap];
      if (next.length > MAX_STACK_SIZE) next.shift();
      return next;
    });

    repertoire.replaceNodesMap(snapshot);
    // Select root to avoid referencing a potentially deleted node
    const rootId = stateRef.current.repertoire?.rootNodeId;
    if (rootId) repertoire.selectNode(rootId);
  }, [repertoire]);

  const redo = useCallback(() => {
    const stack = redoStackRef.current;
    if (stack.length === 0) return;

    const snapshot = stack[stack.length - 1];
    const currentMap = new Map(stateRef.current.nodesMap);

    setRedoStack((prev) => prev.slice(0, -1));
    setUndoStack((prev) => {
      const next = [...prev, currentMap];
      if (next.length > MAX_STACK_SIZE) next.shift();
      return next;
    });

    repertoire.replaceNodesMap(snapshot);
  }, [repertoire]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      const isCtrl = e.ctrlKey || e.metaKey;
      if (!isCtrl) return;

      if (e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if ((e.key === 'z' && e.shiftKey) || e.key === 'y') {
        e.preventDefault();
        redo();
      }
    };

    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [undo, redo]);

  const value: UndoRedoContextValue = {
    addChildNode: wrappedAddChildNode,
    deleteNode: wrappedDeleteNode,
    clearGraph: wrappedClearGraph,
    updateNode: wrappedUpdateNode,
    removeTranspositionEdge: wrappedRemoveTranspositionEdge,
    replaceNodesMap: wrappedReplaceNodesMap,
    undo,
    redo,
    canUndo: undoStack.length > 0,
    canRedo: redoStack.length > 0,
  };

  return (
    <UndoRedoContext value={value}>
      {children}
    </UndoRedoContext>
  );
}
