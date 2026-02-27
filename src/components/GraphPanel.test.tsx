// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { GraphPanel } from './GraphPanel.tsx';

const mockNavigate = vi.fn();

vi.mock('react-router', async () => {
  const actual = await vi.importActual<typeof import('react-router')>('react-router');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const mockState = {
  repertoire: { id: 'rep-1', name: 'Italian Game', side: 'white' as const, rootNodeId: 'n1', createdAt: 0, updatedAt: 0 },
  nodesMap: new Map(),
  selectedNodeId: null,
  contextMenu: null,
  repertoireList: [
    { id: 'rep-1', name: 'Italian Game', side: 'white' as const, rootNodeId: 'n1', createdAt: 0, updatedAt: 0 },
    { id: 'rep-2', name: 'Sicilian Defense', side: 'black' as const, rootNodeId: 'n2', createdAt: 0, updatedAt: 0 },
    { id: 'rep-3', name: 'French Defense', side: 'black' as const, rootNodeId: 'n3', createdAt: 0, updatedAt: 0 },
  ],
  isLoading: false,
  editingNodeId: null,
};

vi.mock('../hooks/useRepertoire.tsx', () => ({
  useRepertoire: () => ({ state: mockState }),
}));

function renderPanel(props: { open?: boolean; onClose?: () => void } = {}) {
  const { open = true, onClose = vi.fn() } = props;
  return render(
    <MemoryRouter>
      <GraphPanel open={open} onClose={onClose} />
    </MemoryRouter>,
  );
}

describe('GraphPanel', () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all repertoire list items when open', () => {
    renderPanel();
    expect(screen.getByText('Italian Game')).toBeTruthy();
    expect(screen.getByText('Sicilian Defense')).toBeTruthy();
    expect(screen.getByText('French Defense')).toBeTruthy();
  });

  it('renders "Graphs" heading', () => {
    renderPanel();
    expect(screen.getByText('Graphs')).toBeTruthy();
  });

  it('highlights current repertoire', () => {
    renderPanel();
    const activeItem = screen.getByTestId('panel-item-rep-1');
    expect(activeItem.className).toContain('bg-elevated');
    const otherItem = screen.getByTestId('panel-item-rep-2');
    expect(otherItem.className).not.toContain('bg-elevated ');
  });

  it('shows correct side icons', () => {
    renderPanel();
    const items = screen.getAllByRole('button');
    // First item is close button, then repertoire items
    const repButtons = items.filter((btn) => btn.getAttribute('data-testid')?.startsWith('panel-item-'));
    expect(repButtons[0].textContent).toContain('\u2659'); // white pawn
    expect(repButtons[1].textContent).toContain('\u265F'); // black pawn
  });

  it('has hidden content when closed', () => {
    renderPanel({ open: false });
    const panel = screen.getByTestId('graph-panel');
    expect(panel.className).toContain('w-0');
    expect(panel.className).toContain('overflow-hidden');
  });

  it('calls onClose on mouse leave', () => {
    const onClose = vi.fn();
    renderPanel({ onClose });
    fireEvent.mouseLeave(screen.getByTestId('graph-panel'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn();
    renderPanel({ onClose });
    fireEvent.click(screen.getByTestId('panel-close'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('navigates when clicking a repertoire item', () => {
    renderPanel();
    fireEvent.click(screen.getByTestId('panel-item-rep-2'));
    expect(mockNavigate).toHaveBeenCalledWith('/repertoire/rep-2');
  });

  it('renders All Graphs link', () => {
    renderPanel();
    const link = screen.getByTestId('panel-all-graphs');
    expect(link.textContent).toContain('All Graphs');
    expect(link.getAttribute('href')).toBe('/repertoires');
  });
});
