// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { UndoRedoProvider, useUndoRedo } from './useUndoRedo.tsx';
import type { ReactNode } from 'react';
import type { RepertoireNode } from '../types/index.ts';
import { NODE_COLORS } from '../types/index.ts';

// Mock useRepertoire
const mockState = {
  repertoire: { id: 'rep-1', name: 'Test', side: 'white' as const, rootNodeId: 'root', createdAt: 0, updatedAt: 0 },
  nodesMap: new Map<string, RepertoireNode>(),
  selectedNodeId: 'root',
  contextMenu: null,
  repertoireList: [],
  isLoading: false,
  editingNodeId: null,
};

const mockAddChildNode = vi.fn();
const mockDeleteNode = vi.fn();
const mockClearGraph = vi.fn();
const mockUpdateNode = vi.fn();
const mockRemoveTranspositionEdge = vi.fn();
const mockReplaceNodesMap = vi.fn();
const mockSelectNode = vi.fn();

vi.mock('./useRepertoire.tsx', () => ({
  useRepertoire: () => ({
    state: mockState,
    addChildNode: mockAddChildNode,
    deleteNode: mockDeleteNode,
    clearGraph: mockClearGraph,
    updateNode: mockUpdateNode,
    removeTranspositionEdge: mockRemoveTranspositionEdge,
    replaceNodesMap: mockReplaceNodesMap,
    selectNode: mockSelectNode,
  }),
}));

function makeNode(id: string, parentId: string | null = null): RepertoireNode {
  return {
    id,
    repertoireId: 'rep-1',
    move: id === 'root' ? null : 'e4',
    fen: 'test-fen',
    comment: '',
    color: NODE_COLORS.DEFAULT,
    tags: [],
    parentId,
    childIds: [],
    transpositionEdges: [],
    arrows: [],
    highlightedSquares: [],
  };
}

function wrapper({ children }: { children: ReactNode }) {
  return <UndoRedoProvider>{children}</UndoRedoProvider>;
}

describe('useUndoRedo', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    const root = makeNode('root');
    mockState.nodesMap = new Map([['root', root]]);
    mockState.selectedNodeId = 'root';
  });

  it('throws when used outside provider', () => {
    expect(() => {
      renderHook(() => useUndoRedo());
    }).toThrow('useUndoRedo must be used within UndoRedoProvider');
  });

  it('starts with canUndo and canRedo as false', () => {
    const { result } = renderHook(() => useUndoRedo(), { wrapper });
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(false);
  });

  it('canUndo becomes true after a wrapped mutation', async () => {
    const { result } = renderHook(() => useUndoRedo(), { wrapper });

    await act(async () => {
      await result.current.addChildNode('root', 'e4', 'fen-after-e4');
    });

    expect(result.current.canUndo).toBe(true);
    expect(mockAddChildNode).toHaveBeenCalledWith('root', 'e4', 'fen-after-e4');
  });

  it('undo calls replaceNodesMap with previous snapshot', async () => {
    const { result } = renderHook(() => useUndoRedo(), { wrapper });

    // Perform a mutation
    await act(async () => {
      await result.current.addChildNode('root', 'e4', 'fen-after-e4');
    });

    // Undo
    act(() => {
      result.current.undo();
    });

    expect(mockReplaceNodesMap).toHaveBeenCalledTimes(1);
    // The snapshot should be the nodesMap before the mutation
    const calledWith = mockReplaceNodesMap.mock.calls[0][0];
    expect(calledWith).toBeInstanceOf(Map);
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(true);
  });

  it('redo calls replaceNodesMap after undo', async () => {
    const { result } = renderHook(() => useUndoRedo(), { wrapper });

    await act(async () => {
      await result.current.addChildNode('root', 'e4', 'fen');
    });

    act(() => {
      result.current.undo();
    });

    act(() => {
      result.current.redo();
    });

    expect(mockReplaceNodesMap).toHaveBeenCalledTimes(2);
    expect(result.current.canUndo).toBe(true);
    expect(result.current.canRedo).toBe(false);
  });

  it('new mutation clears redo stack', async () => {
    const { result } = renderHook(() => useUndoRedo(), { wrapper });

    await act(async () => {
      await result.current.addChildNode('root', 'e4', 'fen');
    });

    act(() => {
      result.current.undo();
    });

    expect(result.current.canRedo).toBe(true);

    // New mutation should clear redo
    await act(async () => {
      await result.current.addChildNode('root', 'd4', 'fen2');
    });

    expect(result.current.canRedo).toBe(false);
  });

  it('undo selects root node', async () => {
    const { result } = renderHook(() => useUndoRedo(), { wrapper });

    await act(async () => {
      await result.current.addChildNode('root', 'e4', 'fen');
    });

    act(() => {
      result.current.undo();
    });

    expect(mockSelectNode).toHaveBeenCalledWith('root');
  });

  it('wraps deleteNode with snapshot', async () => {
    const { result } = renderHook(() => useUndoRedo(), { wrapper });

    await act(async () => {
      await result.current.deleteNode('node-1');
    });

    expect(mockDeleteNode).toHaveBeenCalledWith('node-1');
    expect(result.current.canUndo).toBe(true);
  });

  it('wraps clearGraph with snapshot', async () => {
    const { result } = renderHook(() => useUndoRedo(), { wrapper });

    await act(async () => {
      await result.current.clearGraph();
    });

    expect(mockClearGraph).toHaveBeenCalled();
    expect(result.current.canUndo).toBe(true);
  });

  it('wraps updateNode with snapshot', async () => {
    const { result } = renderHook(() => useUndoRedo(), { wrapper });

    await act(async () => {
      await result.current.updateNode('root', { comment: 'test' });
    });

    expect(mockUpdateNode).toHaveBeenCalledWith('root', { comment: 'test' });
    expect(result.current.canUndo).toBe(true);
  });

  it('wraps removeTranspositionEdge with snapshot', async () => {
    const { result } = renderHook(() => useUndoRedo(), { wrapper });

    await act(async () => {
      await result.current.removeTranspositionEdge('node-1', 'target-1');
    });

    expect(mockRemoveTranspositionEdge).toHaveBeenCalledWith('node-1', 'target-1');
    expect(result.current.canUndo).toBe(true);
  });
});
