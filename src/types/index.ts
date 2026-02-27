import type { Node, Edge } from '@xyflow/react';

// Node color options (no enums due to erasableSyntaxOnly)
export const NODE_COLORS = {
  DEFAULT: '#3f3f46',  // zinc-700
  GREEN: '#16a34a',
  RED: '#dc2626',
  YELLOW: '#ca8a04',
  BLUE: '#2563eb',
  PURPLE: '#9333ea',
} as const;

export type NodeColor = (typeof NODE_COLORS)[keyof typeof NODE_COLORS];

export const NODE_COLOR_LABELS: Record<NodeColor, string> = {
  [NODE_COLORS.DEFAULT]: 'Default',
  [NODE_COLORS.GREEN]: 'Green',
  [NODE_COLORS.RED]: 'Red',
  [NODE_COLORS.YELLOW]: 'Yellow',
  [NODE_COLORS.BLUE]: 'Blue',
  [NODE_COLORS.PURPLE]: 'Purple',
};

export type RepertoireSide = 'white' | 'black';

export interface BoardArrow {
  startSquare: string;
  endSquare: string;
  color: string;
}

export interface HighlightedSquare {
  square: string;
  color: string;
}

export interface TranspositionEdge {
  targetId: string;  // Existing node this move transposes to
  move: string;      // SAN notation (e.g., "e4")
}

// Persisted in IndexedDB
export interface RepertoireNode {
  id: string;
  repertoireId: string;
  move: string | null;       // SAN notation, null for root
  fen: string;               // FEN after this move
  comment: string;
  color: NodeColor;
  tags: string[];
  parentId: string | null;   // null for root node
  childIds: string[];
  transpositionEdges: TranspositionEdge[];
  arrows: BoardArrow[];
  highlightedSquares: HighlightedSquare[];
}

export interface Folder {
  id: string;
  name: string;
  sortOrder: number;
  collapsed: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface Repertoire {
  id: string;
  name: string;
  side: RepertoireSide;
  rootNodeId: string;
  folderId: string | null;
  createdAt: number;
  updatedAt: number;
}

// React Flow node data payload
export interface MoveNodeData extends Record<string, unknown> {
  move: string | null;
  fen: string;
  comment: string;
  color: NodeColor;
  tags: string[];
  isRoot: boolean;
  repertoireName: string;
  isSelected: boolean;
  hasChildren: boolean;
  isCollapsed: boolean;
  hiddenCount: number;
}

export type MoveFlowNode = Node<MoveNodeData, 'move'>;

export interface MoveEdgeData extends Record<string, unknown> {
  isTransposition: boolean;
  move?: string;
  graphBottom?: number;
}

export type MoveFlowEdge = Edge<MoveEdgeData>;

export interface ContextMenuState {
  nodeId: string;
  x: number;
  y: number;
}

export interface ExportData {
  version: 1 | 2 | 3;
  repertoires: Repertoire[];
  nodes: RepertoireNode[];
  folders?: Folder[];
}
