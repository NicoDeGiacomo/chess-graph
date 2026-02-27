// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { MoveInput } from './MoveInput.tsx';
import type { RepertoireNode } from '../types/index.ts';
import { NODE_COLORS } from '../types/index.ts';

const START_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
const AFTER_E4_FEN = 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1';

function makeNode(overrides: Partial<RepertoireNode> = {}): RepertoireNode {
  return {
    id: 'node-1',
    repertoireId: 'rep-1',
    move: null,
    fen: START_FEN,
    comment: '',
    color: NODE_COLORS.DEFAULT,
    tags: [],
    parentId: null,
    childIds: [],
    transpositionEdges: [],
    arrows: [],
    highlightedSquares: [],
    ...overrides,
  };
}

const mockAddChildNode = vi.fn();

let mockState = {
  repertoire: { id: 'rep-1', name: 'Test', side: 'white' as const, rootNodeId: 'node-1', createdAt: 0, updatedAt: 0 },
  nodesMap: new Map<string, RepertoireNode>(),
  selectedNodeId: null as string | null,
  contextMenu: null,
  repertoireList: [],
  isLoading: false,
  editingNodeId: null,
};

vi.mock('../hooks/useRepertoire.tsx', () => ({
  useRepertoire: () => ({
    state: mockState,
  }),
}));

vi.mock('../hooks/useUndoRedo.tsx', () => ({
  useUndoRedo: () => ({
    addChildNode: mockAddChildNode,
  }),
}));

describe('MoveInput', () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    const node = makeNode();
    mockState = {
      ...mockState,
      nodesMap: new Map([['node-1', node]]),
      selectedNodeId: 'node-1',
    };
  });

  it('renders input with placeholder when node is selected', () => {
    render(<MoveInput />);
    const input = screen.getByTestId('move-input') as HTMLInputElement;
    expect(input.disabled).toBe(false);
    expect(input.placeholder).toBe('Type a move…');
  });

  it('is disabled when no node is selected', () => {
    mockState.selectedNodeId = null;
    render(<MoveInput />);
    const input = screen.getByTestId('move-input') as HTMLInputElement;
    expect(input.disabled).toBe(true);
    expect(input.placeholder).toBe('Select a node');
  });

  it('shows turn indicator for white', () => {
    render(<MoveInput />);
    expect(screen.getByTestId('turn-indicator').textContent).toBe('White to move');
  });

  it('shows turn indicator for black', () => {
    const node = makeNode({ fen: AFTER_E4_FEN });
    mockState.nodesMap = new Map([['node-1', node]]);
    render(<MoveInput />);
    expect(screen.getByTestId('turn-indicator').textContent).toBe('Black to move');
  });

  it('calls addChildNode and clears input on valid move', () => {
    render(<MoveInput />);
    const input = screen.getByTestId('move-input') as HTMLInputElement;

    fireEvent.change(input, { target: { value: 'e4' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(mockAddChildNode).toHaveBeenCalledTimes(1);
    expect(mockAddChildNode).toHaveBeenCalledWith('node-1', 'e4', expect.any(String));
    expect(input.value).toBe('');
  });

  it('shows error on invalid move', () => {
    render(<MoveInput />);
    const input = screen.getByTestId('move-input');

    fireEvent.change(input, { target: { value: 'Zz9' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(mockAddChildNode).not.toHaveBeenCalled();
    expect(screen.getByTestId('move-input-error').textContent).toBe('Invalid move');
  });

  it('clears error on next keystroke', () => {
    render(<MoveInput />);
    const input = screen.getByTestId('move-input');

    fireEvent.change(input, { target: { value: 'bad' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(screen.getByTestId('move-input-error')).toBeTruthy();

    fireEvent.change(input, { target: { value: 'e' } });
    expect(screen.queryByTestId('move-input-error')).toBeNull();
  });

  it('defaults pawn promotion to queen', () => {
    const promoFen = '8/4P3/8/8/8/8/8/4K2k w - - 0 1';
    const node = makeNode({ fen: promoFen });
    mockState.nodesMap = new Map([['node-1', node]]);

    render(<MoveInput />);
    const input = screen.getByTestId('move-input');

    fireEvent.change(input, { target: { value: 'e8' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(mockAddChildNode).toHaveBeenCalledTimes(1);
    expect(mockAddChildNode.mock.calls[0][1]).toBe('e8=Q');
  });

  it('handles explicit under-promotion', () => {
    const promoFen = '8/4P3/8/8/8/8/8/4K2k w - - 0 1';
    const node = makeNode({ fen: promoFen });
    mockState.nodesMap = new Map([['node-1', node]]);

    render(<MoveInput />);
    const input = screen.getByTestId('move-input');

    fireEvent.change(input, { target: { value: 'e8=R' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(mockAddChildNode).toHaveBeenCalledTimes(1);
    expect(mockAddChildNode.mock.calls[0][1]).toBe('e8=R');
  });

  it('does nothing on Enter with empty input', () => {
    render(<MoveInput />);
    const input = screen.getByTestId('move-input');

    fireEvent.keyDown(input, { key: 'Enter' });

    expect(mockAddChildNode).not.toHaveBeenCalled();
    expect(screen.queryByTestId('move-input-error')).toBeNull();
  });

  it('does not show turn indicator when no node selected', () => {
    mockState.selectedNodeId = null;
    render(<MoveInput />);
    expect(screen.queryByTestId('turn-indicator')).toBeNull();
  });
});
