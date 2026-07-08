// PGN Tokenizer + Recursive Descent Parser with full RAV support

export type PgnTokenType =
  | 'HEADER'
  | 'MOVE_NUMBER'
  | 'MOVE'
  | 'COMMENT'
  | 'NAG'
  | 'RAV_OPEN'
  | 'RAV_CLOSE'
  | 'RESULT';

export interface PgnToken {
  type: PgnTokenType;
  value: string;
}

export interface PgnMove {
  san: string;
  comment: string;
  variations: PgnMove[][];
}

export interface PgnGame {
  headers: Record<string, string>;
  moves: PgnMove[];
}

export interface PgnParseError {
  message: string;
  token?: PgnToken;
}

export interface PgnParseResult {
  games: PgnGame[];
  errors: PgnParseError[];
}

// Symbolic NAG map
const SYMBOLIC_NAGS: Record<string, string> = {
  '!!': '$3',
  '??': '$4',
  '!?': '$5',
  '?!': '$6',
  '!': '$1',
  '?': '$2',
};

const RESULT_PATTERN = /^(1-0|0-1|1\/2-1\/2|\*)$/;
const MOVE_NUMBER_PATTERN = /^\d+\.+$/;
const NAG_PATTERN = /^\$\d+$/;

export function tokenize(pgn: string): PgnToken[] {
  const tokens: PgnToken[] = [];
  let i = 0;
  const len = pgn.length;

  while (i < len) {
    const ch = pgn[i];

    // Skip whitespace
    if (ch === ' ' || ch === '\t' || ch === '\n' || ch === '\r') {
      i++;
      continue;
    }

    // Header: [Key "Value"]
    if (ch === '[') {
      const end = pgn.indexOf(']', i);
      if (end !== -1) {
        tokens.push({ type: 'HEADER', value: pgn.slice(i, end + 1) });
        i = end + 1;
        continue;
      }
    }

    // Inline comment: {text}
    if (ch === '{') {
      let depth = 1;
      let j = i + 1;
      while (j < len && depth > 0) {
        if (pgn[j] === '{') depth++;
        else if (pgn[j] === '}') depth--;
        j++;
      }
      tokens.push({ type: 'COMMENT', value: pgn.slice(i + 1, j - 1) });
      i = j;
      continue;
    }

    // Line comment: ; to end of line
    if (ch === ';') {
      let j = i + 1;
      while (j < len && pgn[j] !== '\n' && pgn[j] !== '\r') {
        j++;
      }
      tokens.push({ type: 'COMMENT', value: pgn.slice(i + 1, j).trim() });
      i = j;
      continue;
    }

    // RAV delimiters
    if (ch === '(') {
      tokens.push({ type: 'RAV_OPEN', value: '(' });
      i++;
      continue;
    }
    if (ch === ')') {
      tokens.push({ type: 'RAV_CLOSE', value: ')' });
      i++;
      continue;
    }

    // Symbolic NAGs: !!, ??, !?, ?!, !, ?
    if (ch === '!' || ch === '?') {
      const two = pgn.slice(i, i + 2);
      if (SYMBOLIC_NAGS[two]) {
        tokens.push({ type: 'NAG', value: SYMBOLIC_NAGS[two] });
        i += 2;
        continue;
      }
      tokens.push({ type: 'NAG', value: SYMBOLIC_NAGS[ch] });
      i++;
      continue;
    }

    // Numeric NAG: $N
    if (ch === '$') {
      let j = i + 1;
      while (j < len && pgn[j] >= '0' && pgn[j] <= '9') {
        j++;
      }
      tokens.push({ type: 'NAG', value: pgn.slice(i, j) });
      i = j;
      continue;
    }

    // Read a word (non-whitespace, non-delimiter)
    let j = i;
    while (
      j < len &&
      pgn[j] !== ' ' &&
      pgn[j] !== '\t' &&
      pgn[j] !== '\n' &&
      pgn[j] !== '\r' &&
      pgn[j] !== '{' &&
      pgn[j] !== '}' &&
      pgn[j] !== '(' &&
      pgn[j] !== ')' &&
      pgn[j] !== ';'
    ) {
      j++;
    }

    const word = pgn.slice(i, j);
    i = j;

    if (word.length === 0) {
      i++;
      continue;
    }

    // Result
    if (RESULT_PATTERN.test(word)) {
      tokens.push({ type: 'RESULT', value: word });
      continue;
    }

    // Move number: digits followed by one or more dots
    if (MOVE_NUMBER_PATTERN.test(word)) {
      tokens.push({ type: 'MOVE_NUMBER', value: word });
      continue;
    }

    // Numeric NAG that was part of a word
    if (NAG_PATTERN.test(word)) {
      tokens.push({ type: 'NAG', value: word });
      continue;
    }

    // Everything else is a MOVE (permissive; chess.js validates later)
    tokens.push({ type: 'MOVE', value: word });
  }

  return tokens;
}

function parseHeader(headerToken: string): [string, string] | null {
  const match = headerToken.match(/^\[(\S+)\s+"(.*)"\]$/);
  if (!match) return null;
  return [match[1], match[2]];
}

export function parsePgn(pgn: string): PgnParseResult {
  const tokens = tokenize(pgn);
  const games: PgnGame[] = [];
  const errors: PgnParseError[] = [];
  let pos = 0;

  function peek(): PgnToken | undefined {
    return tokens[pos];
  }

  function advance(): PgnToken | undefined {
    return tokens[pos++];
  }

  function parseMovetext(): PgnMove[] {
    const moves: PgnMove[] = [];

    while (pos < tokens.length) {
      const token = peek();
      if (!token) break;

      // Stop conditions
      if (token.type === 'RAV_CLOSE') break;
      if (token.type === 'RESULT') break;
      // A HEADER after we've started parsing movetext means a new game
      if (token.type === 'HEADER') break;

      // Skip move numbers
      if (token.type === 'MOVE_NUMBER') {
        advance();
        continue;
      }

      // Skip NAGs (standalone, not attached to a move)
      if (token.type === 'NAG') {
        advance();
        continue;
      }

      // Comment before first move or between moves (attach to next move)
      if (token.type === 'COMMENT') {
        advance();
        // If there are already moves, attach to last move
        if (moves.length > 0) {
          const lastMove = moves[moves.length - 1];
          lastMove.comment = lastMove.comment
            ? lastMove.comment + ' ' + token.value
            : token.value;
        }
        // Otherwise it's a leading comment; we skip it (or could attach to first move later)
        continue;
      }

      // RAV_OPEN: variation on the last move
      if (token.type === 'RAV_OPEN') {
        advance(); // consume '('
        const variation = parseMovetext();
        if (peek()?.type === 'RAV_CLOSE') {
          advance(); // consume ')'
        } else {
          errors.push({ message: 'Unmatched opening parenthesis', token });
        }
        // Attach to the last move (the move being varied upon)
        if (moves.length > 0) {
          moves[moves.length - 1].variations.push(variation);
        }
        continue;
      }

      // MOVE token
      if (token.type === 'MOVE') {
        advance();
        const move: PgnMove = {
          san: token.value,
          comment: '',
          variations: [],
        };

        // Consume trailing comments, NAGs, and RAVs
        while (pos < tokens.length) {
          const next = peek();
          if (!next) break;

          if (next.type === 'COMMENT') {
            advance();
            move.comment = move.comment
              ? move.comment + ' ' + next.value
              : next.value;
            continue;
          }

          if (next.type === 'NAG') {
            advance();
            continue;
          }

          if (next.type === 'RAV_OPEN') {
            advance();
            const variation = parseMovetext();
            if (peek()?.type === 'RAV_CLOSE') {
              advance();
            } else {
              errors.push({ message: 'Unmatched opening parenthesis', token: next });
            }
            move.variations.push(variation);
            continue;
          }

          break;
        }

        moves.push(move);
        continue;
      }

      // Unknown token — skip
      advance();
    }

    return moves;
  }

  while (pos < tokens.length) {
    const headers: Record<string, string> = {};

    // Consume headers
    while (pos < tokens.length && peek()?.type === 'HEADER') {
      const headerToken = advance()!;
      const parsed = parseHeader(headerToken.value);
      if (parsed) {
        headers[parsed[0]] = parsed[1];
      }
    }

    // Parse movetext
    const moves = parseMovetext();

    // Consume result if present
    if (peek()?.type === 'RESULT') {
      advance();
    }

    // Only add a game if we found headers or moves
    if (Object.keys(headers).length > 0 || moves.length > 0) {
      games.push({ headers, moves });
    }
  }

  return { games, errors };
}
