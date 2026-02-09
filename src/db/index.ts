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
  }
}

export const db = new ChessGraphDB();
