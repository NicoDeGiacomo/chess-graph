import Dexie from 'dexie';
import type { Table } from 'dexie';
import type { Repertoire, RepertoireNode } from '../types/index.ts';

export class ChessGraphDB extends Dexie {
  repertoires!: Table<Repertoire, string>;
  nodes!: Table<RepertoireNode, string>;

  constructor() {
    super('chess-graph');
    this.version(1).stores({
      repertoires: 'id, name, createdAt',
      nodes: 'id, repertoireId, parentId, fen',
    });

    // Migrate transposesTo → transpositionEdges
    this.version(2).stores({
      repertoires: 'id, name, createdAt',
      nodes: 'id, repertoireId, parentId, fen',
    }).upgrade(async (tx) => {
      const nodes = tx.table<Record<string, unknown>, string>('nodes');
      const allNodes = await nodes.toArray();

      // Build a lookup from nodeId → its old transposesTo target
      const transposesToMap = new Map<string, string>();
      for (const node of allNodes) {
        if (typeof node.transposesTo === 'string' && node.transposesTo) {
          transposesToMap.set(node.id as string, node.transposesTo);
        }
      }

      // Build a lookup from nodeId → node for finding parent and move info
      const nodeMap = new Map<string, Record<string, unknown>>();
      for (const node of allNodes) {
        nodeMap.set(node.id as string, node);
      }

      for (const node of allNodes) {
        const edges: { targetId: string; move: string }[] = [];

        // Convert children's transposesTo into this node's transpositionEdges
        const childIds = node.childIds as string[] | undefined;
        if (childIds) {
          for (const childId of childIds) {
            const target = transposesToMap.get(childId);
            if (target) {
              const child = nodeMap.get(childId);
              const move = child?.move as string | undefined;
              if (move) {
                edges.push({ targetId: target, move });
              }
            }
          }
        }

        await nodes.update(node.id as string, {
          transpositionEdges: edges,
          transposesTo: undefined,
        });
      }
    });

    // Add arrows and highlightedSquares to all existing nodes
    this.version(3).stores({
      repertoires: 'id, name, createdAt',
      nodes: 'id, repertoireId, parentId, fen',
    }).upgrade(async (tx) => {
      await tx.table('nodes').toCollection().modify((node: Record<string, unknown>) => {
        if (!Array.isArray(node.arrows)) node.arrows = [];
        if (!Array.isArray(node.highlightedSquares)) node.highlightedSquares = [];
      });
    });
  }
}

export const db = new ChessGraphDB();
