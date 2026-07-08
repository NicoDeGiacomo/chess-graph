import { Chess } from 'chess.js';
import { v4 as uuidv4 } from 'uuid';
import type {
  Repertoire,
  RepertoireNode,
  NodeColor,
  BoardArrow,
  HighlightedSquare,
} from '../types/index.ts';
import { NODE_COLORS } from '../types/index.ts';
import { positionKey } from '../utils/fen.ts';

interface TreeDef {
  move: string;
  comment?: string;
  color?: NodeColor;
  tags?: string[];
  arrows?: BoardArrow[];
  highlightedSquares?: HighlightedSquare[];
  children?: TreeDef[];
}

const tree: TreeDef[] = [
  {
    move: 'e4',
    color: NODE_COLORS.GREEN,
    tags: ['Main Line'],
    children: [
      {
        move: 'e5',
        children: [
          {
            move: 'Nf3',
            tags: ['Main Line'],
            children: [
              // Branch 1: Philidor
              {
                move: 'd6',
                color: NODE_COLORS.GREEN,
                tags: ['Philidor'],
                arrows: [{ startSquare: 'd2', endSquare: 'd4', color: 'green' }],
                comment:
                  "The Philidor Defense (2...d6). Solid but passive — Black's light-squared bishop is blocked. White seizes space with 3.d4.",
                children: [
                  {
                    move: 'd4',
                    comment:
                      'The key central break. Black must decide how to handle the tension.',
                    arrows: [
                      { startSquare: 'e4', endSquare: 'd5', color: 'orange' },
                    ],
                    children: [
                      // Bg4 refutation line
                      {
                        move: 'Bg4',
                        color: NODE_COLORS.RED,
                        tags: ['Refuted'],
                        comment:
                          'A common amateur mistake. After 4.dxe5, Black loses material by force.',
                        children: [
                          {
                            move: 'dxe5',
                            children: [
                              {
                                move: 'Bxf3',
                                children: [
                                  {
                                    move: 'Qxf3',
                                    children: [
                                      {
                                        move: 'dxe5',
                                        children: [
                                          {
                                            move: 'Bc4',
                                            tags: ['Key Position'],
                                            comment:
                                              'White has the bishop pair and a huge lead in development. Both Qb3 lines target the weak f7 square.',
                                            arrows: [
                                              {
                                                startSquare: 'c4',
                                                endSquare: 'f7',
                                                color: 'red',
                                              },
                                            ],
                                            highlightedSquares: [
                                              { square: 'f7', color: 'red' },
                                            ],
                                            children: [
                                              {
                                                move: 'Qf6',
                                                children: [
                                                  {
                                                    move: 'Qb3',
                                                    comment:
                                                      'Threatening Bxf7+ and attacking b7. White is winning.',
                                                  },
                                                ],
                                              },
                                              {
                                                move: 'Nf6',
                                                children: [
                                                  {
                                                    move: 'Qb3',
                                                    comment:
                                                      'Double attack on b7 and f7. White has a decisive advantage.',
                                                  },
                                                ],
                                              },
                                            ],
                                          },
                                        ],
                                      },
                                    ],
                                  },
                                ],
                              },
                            ],
                          },
                        ],
                      },
                      // exd4 main line
                      {
                        move: 'exd4',
                        color: NODE_COLORS.GREEN,
                        tags: ['Main Line'],
                        comment:
                          "Black's best response. Opening the position highlights White's development advantage.",
                        children: [
                          {
                            move: 'Nxd4',
                            comment:
                              'White has a strong central knight. The position resembles a Scotch Game.',
                            arrows: [
                              {
                                startSquare: 'd4',
                                endSquare: 'f5',
                                color: 'green',
                              },
                            ],
                            children: [
                              {
                                move: 'Nf6',
                                children: [
                                  {
                                    move: 'Nc3',
                                    tags: ['Main Line'],
                                    comment:
                                      'A natural developing move, controlling d5 and supporting e4.',
                                    highlightedSquares: [
                                      { square: 'd5', color: 'green' },
                                    ],
                                    children: [
                                      {
                                        move: 'c5',
                                        color: NODE_COLORS.YELLOW,
                                        comment:
                                          'Dubious — kicks the knight but permanently weakens the d5 square.',
                                        highlightedSquares: [
                                          { square: 'd5', color: 'orange' },
                                        ],
                                      },
                                      {
                                        move: 'Be7',
                                        color: NODE_COLORS.GREEN,
                                        comment:
                                          'The main line. Solid development — Black prepares to castle kingside.',
                                        children: [
                                          {
                                            move: 'Bf4',
                                            tags: ['Main Line'],
                                            comment:
                                              'Active development. White prepares Qd2 and O-O-O for a kingside attack.',
                                            arrows: [
                                              {
                                                startSquare: 'c1',
                                                endSquare: 'f4',
                                                color: 'green',
                                              },
                                            ],
                                          },
                                        ],
                                      },
                                    ],
                                  },
                                ],
                              },
                              {
                                move: 'c5',
                                children: [{ move: 'Ne2' }],
                              },
                            ],
                          },
                        ],
                      },
                      // Nc6 Scotch-like
                      {
                        move: 'Nc6',
                        comment:
                          'A developing move, but White gets a comfortable Scotch-like game.',
                        children: [
                          {
                            move: 'Nc3',
                            comment:
                              'Scotch-like structure. White has easy development and central control.',
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
              // Branch 2: Petroff
              {
                move: 'Nf6',
                color: NODE_COLORS.PURPLE,
                tags: ['Petroff'],
                arrows: [
                  { startSquare: 'b1', endSquare: 'c3', color: 'blue' },
                ],
                comment:
                  'The Petroff Defense (2...Nf6). Instead of the main line 3.Nxe5, we play 3.Nc3 steering into the Three Knights / Four Knights.',
                children: [
                  {
                    move: 'Nc3',
                    comment:
                      'Developing naturally. Black must now choose a setup.',
                    children: [
                      {
                        move: 'd6',
                        comment:
                          'Philidor-like setup. White can play d4 to transpose into the main Philidor lines.',
                        children: [
                          {
                            move: 'd4',
                            comment:
                              'Striking the center — this transposes into the Philidor.',
                            children: [
                              {
                                move: 'exd4',
                                children: [
                                  {
                                    move: 'Nxd4',
                                    // FEN matches Philidor's Nc3 node
                                    // (e4 e5 Nf3 d6 d4 exd4 Nxd4 Nf6 Nc3)
                                    // — auto-detected as transposition
                                  },
                                ],
                              },
                            ],
                          },
                        ],
                      },
                      {
                        move: 'Nc6',
                        color: NODE_COLORS.BLUE,
                        tags: ['Four Knights'],
                        comment:
                          "The Four Knights Game. A solid, symmetrical opening. The key square is d5 — White's Nc3 controls it.",
                        arrows: [
                          {
                            startSquare: 'd2',
                            endSquare: 'd4',
                            color: 'orange',
                          },
                        ],
                        highlightedSquares: [
                          { square: 'd5', color: 'orange' },
                        ],
                        children: [
                          {
                            move: 'Bb5',
                            tags: ['Spanish Four Knights'],
                            comment:
                              'The most principled move — pins the knight and maintains central tension.',
                            arrows: [
                              {
                                startSquare: 'b5',
                                endSquare: 'c6',
                                color: 'orange',
                              },
                            ],
                            highlightedSquares: [
                              { square: 'e5', color: 'orange' },
                            ],
                          },
                        ],
                      },
                      {
                        move: 'Bc5',
                        tags: ['Italian-like'],
                        comment:
                          'Aggressive development. White can grab the e5 pawn immediately with 4.Nxe5.',
                        arrows: [
                          {
                            startSquare: 'f3',
                            endSquare: 'e5',
                            color: 'red',
                          },
                        ],
                        children: [
                          {
                            move: 'Nxe5',
                            comment:
                              'Winning a pawn. Black must try to recover it.',
                            children: [
                              {
                                move: 'd6',
                                children: [
                                  {
                                    move: 'Nf3',
                                    comment:
                                      'The knight retreats — White keeps the extra pawn.',
                                  },
                                ],
                              },
                              {
                                move: 'Nc6',
                                children: [
                                  {
                                    move: 'Nxc6',
                                    children: [
                                      {
                                        move: 'dxc6',
                                        children: [
                                          {
                                            move: 'h3',
                                            comment:
                                              'Preventing ...Bg4. White consolidates the extra pawn.',
                                          },
                                        ],
                                      },
                                    ],
                                  },
                                ],
                              },
                            ],
                          },
                        ],
                      },
                      {
                        move: 'Bb4',
                        tags: ['Pin Variation'],
                        comment:
                          'Pinning the c3 knight. White responds with the sharp 4.Nxe5.',
                        children: [
                          {
                            move: 'Nxe5',
                            comment:
                              'Grabbing the pawn. Black must recapture or play for compensation.',
                            children: [
                              {
                                move: 'd6',
                                children: [
                                  {
                                    move: 'Nd3',
                                    children: [
                                      {
                                        move: 'Bxc3',
                                        children: [
                                          {
                                            move: 'dxc3',
                                            comment:
                                              'White has the bishop pair and a solid center.',
                                          },
                                        ],
                                      },
                                    ],
                                  },
                                ],
                              },
                              {
                                move: 'Bxc3',
                                children: [
                                  {
                                    move: 'dxc3',
                                    comment:
                                      'Doubled pawns but the bishop pair compensates. White stands well.',
                                  },
                                ],
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
              // Branch 3: Nc6 transposition
              {
                move: 'Nc6',
                color: NODE_COLORS.BLUE,
                tags: ['Transposition'],
                comment:
                  'The most common response (2...Nc6). After 3.Nc3 Nf6, we reach the Four Knights by transposition.',
                children: [
                  {
                    move: 'Nc3',
                    children: [
                      {
                        move: 'Nf6',
                        // This will be detected as a transposition to the
                        // Four Knights node (e4 e5 Nf3 Nf6 Nc3 Nc6).
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
];

export function buildExampleRepertoire(): {
  repertoire: Repertoire;
  nodes: RepertoireNode[];
} {
  const repertoireId = uuidv4();
  const rootNodeId = uuidv4();
  const now = Date.now();

  const DEFAULT_FEN =
    'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

  const rootNode: RepertoireNode = {
    id: rootNodeId,
    repertoireId,
    move: null,
    fen: DEFAULT_FEN,
    comment:
      'Example 1.e4 repertoire for White. Covers the Philidor, Petroff, and Four Knights systems.',
    color: NODE_COLORS.DEFAULT,
    tags: ['1.e4 Repertoire', 'Example'],
    parentId: null,
    childIds: [],
    transpositionEdges: [],
    arrows: [{ startSquare: 'e2', endSquare: 'e4', color: 'green' }],
    highlightedSquares: [],
  };

  const nodes: RepertoireNode[] = [rootNode];
  // Map from positionKey → nodeId for transposition detection
  const positionMap = new Map<string, string>();
  positionMap.set(positionKey(DEFAULT_FEN), rootNodeId);

  function walk(
    defs: TreeDef[],
    parentNode: RepertoireNode,
    parentFen: string,
    parentColor: NodeColor,
  ) {
    for (const def of defs) {
      const chess = new Chess(parentFen);
      const moveResult = chess.move(def.move);
      if (!moveResult) {
        throw new Error(
          `Invalid move "${def.move}" from position ${parentFen}`,
        );
      }

      const fen = chess.fen();
      const key = positionKey(fen);
      const existingNodeId = positionMap.get(key);

      if (existingNodeId) {
        // Transposition — add edge on the parent instead of creating a new node
        parentNode.transpositionEdges.push({
          targetId: existingNodeId,
          move: def.move,
        });
        continue;
      }

      const nodeColor = def.color ?? parentColor;
      const nodeId = uuidv4();

      const node: RepertoireNode = {
        id: nodeId,
        repertoireId,
        move: moveResult.san,
        fen,
        comment: def.comment ?? '',
        color: nodeColor,
        tags: def.tags ?? [],
        parentId: parentNode.id,
        childIds: [],
        transpositionEdges: [],
        arrows: def.arrows ?? [],
        highlightedSquares: def.highlightedSquares ?? [],
      };

      parentNode.childIds.push(nodeId);
      nodes.push(node);
      positionMap.set(key, nodeId);

      if (def.children) {
        walk(def.children, node, fen, nodeColor);
      }
    }
  }

  walk(tree, rootNode, DEFAULT_FEN, NODE_COLORS.DEFAULT);

  const repertoire: Repertoire = {
    id: repertoireId,
    name: '1.e4 Repertoire',
    side: 'white',
    rootNodeId,
    folderId: null,
    createdAt: now - 1, // slightly earlier so "My Initial Graph" sorts first
    updatedAt: now - 1,
  };

  return { repertoire, nodes };
}
