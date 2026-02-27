import { v4 as uuidv4 } from 'uuid';
import { db } from './index.ts';
import type { Repertoire, RepertoireNode } from '../types/index.ts';
import { NODE_COLORS } from '../types/index.ts';
import { buildExampleRepertoire } from './exampleRepertoire.ts';

const DEFAULT_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

export async function ensureDefaultRepertoire(): Promise<string> {
  const count = await db.repertoires.count();
  if (count > 0) {
    const first = await db.repertoires.orderBy('createdAt').first();
    return first!.id;
  }

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
    transpositionEdges: [],
    arrows: [],
    highlightedSquares: [],
  };

  const repertoire: Repertoire = {
    id: repertoireId,
    name: 'My Initial Graph',
    side: 'white',
    rootNodeId,
    createdAt: now,
    updatedAt: now,
  };

  const example = buildExampleRepertoire();

  await db.transaction('rw', db.repertoires, db.nodes, async () => {
    await db.nodes.add(rootNode);
    await db.repertoires.add(repertoire);
    await db.nodes.bulkAdd(example.nodes);
    await db.repertoires.add(example.repertoire);
  });

  return repertoireId;
}
