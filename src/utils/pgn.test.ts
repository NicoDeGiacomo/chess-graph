import { describe, it, expect } from 'vitest';
import { tokenize, parsePgn } from './pgn.ts';

// ─── Tokenizer Tests ────────────────────────────────────────────────

describe('tokenize', () => {
  describe('whitespace handling', () => {
    it('handles spaces, tabs, newlines', () => {
      const tokens = tokenize('  e4 \t e5 \n Nf3 ');
      expect(tokens.map((t) => t.value)).toEqual(['e4', 'e5', 'Nf3']);
    });

    it('handles CRLF', () => {
      const tokens = tokenize('e4\r\ne5');
      expect(tokens.map((t) => t.value)).toEqual(['e4', 'e5']);
    });
  });

  describe('headers', () => {
    it('parses a header token', () => {
      const tokens = tokenize('[Event "Sicilian Defense"]');
      expect(tokens).toEqual([{ type: 'HEADER', value: '[Event "Sicilian Defense"]' }]);
    });

    it('parses multiple headers', () => {
      const tokens = tokenize('[Event "Test"]\n[White "Player1"]');
      expect(tokens).toHaveLength(2);
      expect(tokens[0].type).toBe('HEADER');
      expect(tokens[1].type).toBe('HEADER');
    });

    it('handles special characters in header values', () => {
      const tokens = tokenize('[Event "1/2 Final (Match)"]');
      expect(tokens).toHaveLength(1);
      expect(tokens[0].value).toBe('[Event "1/2 Final (Match)"]');
    });
  });

  describe('comments', () => {
    it('parses inline comments', () => {
      const tokens = tokenize('{Best by test}');
      expect(tokens).toEqual([{ type: 'COMMENT', value: 'Best by test' }]);
    });

    it('parses line comments', () => {
      const tokens = tokenize('; This is a comment\ne4');
      expect(tokens).toHaveLength(2);
      expect(tokens[0]).toEqual({ type: 'COMMENT', value: 'This is a comment' });
      expect(tokens[1]).toEqual({ type: 'MOVE', value: 'e4' });
    });

    it('handles multi-line inline comments', () => {
      const tokens = tokenize('{This is\na multi-line\ncomment}');
      expect(tokens[0].value).toBe('This is\na multi-line\ncomment');
    });

    it('handles empty comments', () => {
      const tokens = tokenize('{}');
      expect(tokens).toEqual([{ type: 'COMMENT', value: '' }]);
    });
  });

  describe('NAGs', () => {
    it('parses symbolic NAGs', () => {
      const cases: [string, string][] = [
        ['!', '$1'],
        ['?', '$2'],
        ['!!', '$3'],
        ['??', '$4'],
        ['!?', '$5'],
        ['?!', '$6'],
      ];
      for (const [input, expected] of cases) {
        const tokens = tokenize(input);
        expect(tokens).toEqual([{ type: 'NAG', value: expected }]);
      }
    });

    it('parses numeric NAGs', () => {
      const tokens = tokenize('$1 $14 $256');
      expect(tokens.map((t) => t.value)).toEqual(['$1', '$14', '$256']);
      expect(tokens.every((t) => t.type === 'NAG')).toBe(true);
    });
  });

  describe('move numbers', () => {
    it('parses white move numbers', () => {
      const tokens = tokenize('1. 12.');
      expect(tokens).toEqual([
        { type: 'MOVE_NUMBER', value: '1.' },
        { type: 'MOVE_NUMBER', value: '12.' },
      ]);
    });

    it('parses black continuation numbers', () => {
      const tokens = tokenize('1... 12...');
      expect(tokens).toEqual([
        { type: 'MOVE_NUMBER', value: '1...' },
        { type: 'MOVE_NUMBER', value: '12...' },
      ]);
    });
  });

  describe('results', () => {
    it('parses all result types', () => {
      const tokens = tokenize('1-0 0-1 1/2-1/2 *');
      expect(tokens.map((t) => t.type)).toEqual(['RESULT', 'RESULT', 'RESULT', 'RESULT']);
      expect(tokens.map((t) => t.value)).toEqual(['1-0', '0-1', '1/2-1/2', '*']);
    });
  });

  describe('RAV delimiters', () => {
    it('parses open and close parens', () => {
      const tokens = tokenize('( )');
      expect(tokens).toEqual([
        { type: 'RAV_OPEN', value: '(' },
        { type: 'RAV_CLOSE', value: ')' },
      ]);
    });
  });

  describe('moves', () => {
    it('parses standard moves', () => {
      const tokens = tokenize('e4 Nf3');
      expect(tokens).toEqual([
        { type: 'MOVE', value: 'e4' },
        { type: 'MOVE', value: 'Nf3' },
      ]);
    });

    it('parses captures', () => {
      const tokens = tokenize('exd5 Bxf7+');
      expect(tokens.map((t) => t.value)).toEqual(['exd5', 'Bxf7+']);
    });

    it('parses castling', () => {
      const tokens = tokenize('O-O O-O-O');
      expect(tokens.map((t) => t.value)).toEqual(['O-O', 'O-O-O']);
    });

    it('parses promotions', () => {
      const tokens = tokenize('e8=Q dxc1=N+');
      expect(tokens.map((t) => t.value)).toEqual(['e8=Q', 'dxc1=N+']);
    });

    it('parses check and mate', () => {
      const tokens = tokenize('Qh7# Bb5+');
      expect(tokens.map((t) => t.value)).toEqual(['Qh7#', 'Bb5+']);
    });
  });

  describe('complex tokenization', () => {
    it('tokenizes a full game', () => {
      const pgn = '[Event "Test"]\n\n1. e4 e5 2. Nf3 {A common move} Nc6 1-0';
      const tokens = tokenize(pgn);
      const types = tokens.map((t) => t.type);
      expect(types).toEqual([
        'HEADER', 'MOVE_NUMBER', 'MOVE', 'MOVE',
        'MOVE_NUMBER', 'MOVE', 'COMMENT', 'MOVE', 'RESULT',
      ]);
    });

    it('tokenizes RAV with comments', () => {
      const pgn = '1. e4 e5 (1... c5 {The Sicilian}) 2. Nf3';
      const tokens = tokenize(pgn);
      const types = tokens.map((t) => t.type);
      expect(types).toEqual([
        'MOVE_NUMBER', 'MOVE', 'MOVE',
        'RAV_OPEN', 'MOVE_NUMBER', 'MOVE', 'COMMENT', 'RAV_CLOSE',
        'MOVE_NUMBER', 'MOVE',
      ]);
    });
  });
});

// ─── Parser Tests ───────────────────────────────────────────────────

describe('parsePgn', () => {
  describe('basic', () => {
    it('returns empty games for empty input', () => {
      const result = parsePgn('');
      expect(result.games).toEqual([]);
      expect(result.errors).toEqual([]);
    });

    it('parses headers only (no moves)', () => {
      const result = parsePgn('[Event "Test"]\n[White "Player1"]\n*');
      expect(result.games).toHaveLength(1);
      expect(result.games[0].headers).toEqual({ Event: 'Test', White: 'Player1' });
      expect(result.games[0].moves).toEqual([]);
    });

    it('parses simple mainline', () => {
      const result = parsePgn('1. e4 e5 2. Nf3 Nc6 *');
      expect(result.games).toHaveLength(1);
      const moves = result.games[0].moves;
      expect(moves).toHaveLength(4);
      expect(moves.map((m) => m.san)).toEqual(['e4', 'e5', 'Nf3', 'Nc6']);
    });

    it('parses moves without move numbers', () => {
      const result = parsePgn('e4 e5 Nf3');
      expect(result.games).toHaveLength(1);
      expect(result.games[0].moves.map((m) => m.san)).toEqual(['e4', 'e5', 'Nf3']);
    });

    it('parses black continuation number', () => {
      const result = parsePgn('1. e4 1... e5');
      expect(result.games).toHaveLength(1);
      expect(result.games[0].moves.map((m) => m.san)).toEqual(['e4', 'e5']);
    });
  });

  describe('comments', () => {
    it('attaches comment after move', () => {
      const result = parsePgn('1. e4 {Best by test} e5');
      const moves = result.games[0].moves;
      expect(moves[0].comment).toBe('Best by test');
      expect(moves[1].san).toBe('e5');
    });

    it('handles comment before first move (attaches to nothing)', () => {
      const result = parsePgn('{Starting comment} 1. e4');
      const moves = result.games[0].moves;
      expect(moves).toHaveLength(1);
      expect(moves[0].san).toBe('e4');
    });

    it('merges multiple comments on same move', () => {
      const result = parsePgn('1. e4 {first} {second}');
      expect(result.games[0].moves[0].comment).toBe('first second');
    });

    it('handles empty comment', () => {
      const result = parsePgn('1. e4 {} e5');
      const moves = result.games[0].moves;
      expect(moves).toHaveLength(2);
    });
  });

  describe('RAVs', () => {
    it('parses a single RAV', () => {
      const result = parsePgn('1. e4 e5 (1... c5) 2. Nf3');
      const moves = result.games[0].moves;
      expect(moves).toHaveLength(3); // e4, e5, Nf3
      expect(moves[1].variations).toHaveLength(1);
      expect(moves[1].variations[0]).toHaveLength(1);
      expect(moves[1].variations[0][0].san).toBe('c5');
    });

    it('parses nested RAVs', () => {
      const result = parsePgn('1. e4 c5 (1... e5 2. Nf3 (2. Bc4)) 2. Nf3');
      const moves = result.games[0].moves;
      // mainline: e4, c5, Nf3
      expect(moves).toHaveLength(3);
      // c5 has one variation: 1...e5
      const variation = moves[1].variations[0];
      expect(variation).toHaveLength(2); // e5, Nf3
      expect(variation[0].san).toBe('e5');
      expect(variation[1].san).toBe('Nf3');
      // Nf3 in variation has its own variation: 2. Bc4
      expect(variation[1].variations).toHaveLength(1);
      expect(variation[1].variations[0][0].san).toBe('Bc4');
    });

    it('parses multiple consecutive RAVs', () => {
      const result = parsePgn('1. e4 e5 (1... c5) (1... d5) (1... Nf6) 2. Nf3');
      const moves = result.games[0].moves;
      expect(moves[1].variations).toHaveLength(3);
      expect(moves[1].variations[0][0].san).toBe('c5');
      expect(moves[1].variations[1][0].san).toBe('d5');
      expect(moves[1].variations[2][0].san).toBe('Nf6');
    });

    it('parses RAV with comments', () => {
      const result = parsePgn('1. e4 e5 (1... c5 {The Sicilian}) 2. Nf3');
      const variation = result.games[0].moves[1].variations[0];
      expect(variation[0].san).toBe('c5');
      expect(variation[0].comment).toBe('The Sicilian');
    });

    it('parses RAV at end of game', () => {
      const result = parsePgn('1. e4 e5 (1... c5) *');
      expect(result.games).toHaveLength(1);
      expect(result.games[0].moves[1].variations).toHaveLength(1);
    });

    it('parses deeply nested RAVs (3+ levels)', () => {
      const result = parsePgn('1. e4 e5 (1... c5 (1... d5 (1... Nf6))) 2. Nf3');
      const level1 = result.games[0].moves[1].variations[0]; // c5
      expect(level1[0].san).toBe('c5');
      const level2 = level1[0].variations[0]; // d5
      expect(level2[0].san).toBe('d5');
      const level3 = level2[0].variations[0]; // Nf6
      expect(level3[0].san).toBe('Nf6');
    });

    it('parses RAV after black move', () => {
      const result = parsePgn('1. e4 e5 2. Nf3 Nc6 (2... d6) 3. Bb5');
      const moves = result.games[0].moves;
      expect(moves[3].san).toBe('Nc6');
      expect(moves[3].variations).toHaveLength(1);
      expect(moves[3].variations[0][0].san).toBe('d6');
      expect(moves[4].san).toBe('Bb5');
    });
  });

  describe('multi-game', () => {
    it('parses two games separated by results', () => {
      const pgn = `[Event "Game 1"]\n1. e4 e5 1-0\n\n[Event "Game 2"]\n1. d4 d5 0-1`;
      const result = parsePgn(pgn);
      expect(result.games).toHaveLength(2);
      expect(result.games[0].headers.Event).toBe('Game 1');
      expect(result.games[0].moves.map((m) => m.san)).toEqual(['e4', 'e5']);
      expect(result.games[1].headers.Event).toBe('Game 2');
      expect(result.games[1].moves.map((m) => m.san)).toEqual(['d4', 'd5']);
    });

    it('parses games with different results', () => {
      const pgn = '1. e4 1-0\n\n1. d4 0-1\n\n1. c4 1/2-1/2';
      const result = parsePgn(pgn);
      expect(result.games).toHaveLength(3);
    });

    it('parses games with and without headers mixed', () => {
      const pgn = '[Event "With"]\n1. e4 *\n\n1. d4 *';
      const result = parsePgn(pgn);
      expect(result.games).toHaveLength(2);
      expect(result.games[0].headers.Event).toBe('With');
      expect(result.games[1].headers).toEqual({});
    });
  });

  describe('real-world PGN examples', () => {
    it('parses the Opera Game (Morphy)', () => {
      const pgn = '1. e4 e5 2. Nf3 d6 3. d4 Bg4 4. dxe5 Bxf3 5. Qxf3 dxe5 6. Bc4 Nf6 7. Qb3 Qe7 8. Nc3 c6 9. Bg5 b5 10. Nxb5 cxb5 11. Bxb5+ Nbd7 12. O-O-O Rd8 13. Rxd7 Rxd7 14. Rd1 Qe6 15. Bxd7+ Nxd7 16. Qb8+ Nxb8 17. Rd8# 1-0';
      const result = parsePgn(pgn);
      expect(result.games).toHaveLength(1);
      expect(result.games[0].moves).toHaveLength(33);
      expect(result.games[0].moves[32].san).toBe('Rd8#');
      expect(result.errors).toHaveLength(0);
    });

    it('parses Ruy Lopez with variations', () => {
      const pgn = `1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 (3... Nf6 {Berlin Defense}) (3... f5 {Schliemann Defense}) 4. Ba4 Nf6 5. O-O *`;
      const result = parsePgn(pgn);
      expect(result.games).toHaveLength(1);
      const moves = result.games[0].moves;
      // a6 has two variations
      expect(moves[5].san).toBe('a6');
      expect(moves[5].variations).toHaveLength(2);
      expect(moves[5].variations[0][0].san).toBe('Nf6');
      expect(moves[5].variations[0][0].comment).toBe('Berlin Defense');
      expect(moves[5].variations[1][0].san).toBe('f5');
    });

    it('parses PGN with clock annotations in comments', () => {
      const pgn = '1. e4 {[%clk 0:10:00]} e5 {[%clk 0:10:00]} 2. Nf3 *';
      const result = parsePgn(pgn);
      expect(result.games[0].moves[0].comment).toBe('[%clk 0:10:00]');
    });

    it('parses PGN with eval annotations', () => {
      const pgn = '1. e4 {[%eval 0.3]} e5 *';
      const result = parsePgn(pgn);
      expect(result.games[0].moves[0].comment).toBe('[%eval 0.3]');
    });

    it('parses Italian Game with annotations', () => {
      const pgn = `1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 {The Italian Game} (3... Nf6 {Two Knights Defense} 4. d4 (4. Ng5 d5 5. exd5) 4... exd4) 4. c3 *`;
      const result = parsePgn(pgn);
      const moves = result.games[0].moves;
      expect(moves[5].san).toBe('Bc5');
      expect(moves[5].comment).toBe('The Italian Game');
      expect(moves[5].variations).toHaveLength(1);
      const twoKnights = moves[5].variations[0];
      expect(twoKnights[0].san).toBe('Nf6');
      expect(twoKnights[0].comment).toBe('Two Knights Defense');
    });

    it('parses Lichess study-style headers', () => {
      const pgn = `[Event "My Study: Chapter 1"]
[Site "https://lichess.org/study/abc123"]
[Result "*"]
[UTCDate "2024.01.15"]
[UTCTime "10:30:00"]
[Variant "Standard"]
[ECO "B90"]
[Opening "Sicilian Defense: Najdorf Variation"]

1. e4 c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 a6 *`;
      const result = parsePgn(pgn);
      expect(result.games).toHaveLength(1);
      expect(result.games[0].headers.Event).toBe('My Study: Chapter 1');
      expect(result.games[0].headers.Opening).toBe('Sicilian Defense: Najdorf Variation');
      expect(result.games[0].moves).toHaveLength(10);
    });
  });

  describe('edge cases', () => {
    it('handles PGN with no result terminator', () => {
      const result = parsePgn('1. e4 e5 2. Nf3');
      expect(result.games).toHaveLength(1);
      expect(result.games[0].moves).toHaveLength(3);
    });

    it('handles extra whitespace between tokens', () => {
      const result = parsePgn('1.   e4    e5     2.   Nf3');
      expect(result.games[0].moves.map((m) => m.san)).toEqual(['e4', 'e5', 'Nf3']);
    });

    it('handles Unicode characters in comments', () => {
      const result = parsePgn('1. e4 {Sicilian Najdorf \u2013 Best for Black! \u2654} *');
      expect(result.games[0].moves[0].comment).toContain('\u2013');
      expect(result.games[0].moves[0].comment).toContain('\u2654');
    });

    it('handles very long game (50+ moves)', () => {
      // Generate a long PGN with alternating e/d pawn moves — not valid chess but tests parser
      const moves = [];
      for (let i = 1; i <= 50; i++) {
        moves.push(`${i}. e4 e5`);
      }
      const pgn = moves.join(' ') + ' *';
      const result = parsePgn(pgn);
      expect(result.games[0].moves).toHaveLength(100);
    });

    it('handles empty RAV gracefully', () => {
      const result = parsePgn('1. e4 () e5');
      // Empty variation
      expect(result.games).toHaveLength(1);
    });

    it('reports unmatched parentheses', () => {
      const result = parsePgn('1. e4 (1... c5 *');
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('handles garbage text before valid PGN', () => {
      // The parser treats unknown words as moves
      const result = parsePgn('GARBAGE TEXT\n[Event "Test"]\n1. e4 *');
      // Should still parse the game
      const game = result.games.find((g) => g.headers.Event === 'Test');
      expect(game).toBeDefined();
    });

    it('handles partial/truncated PGN', () => {
      const result = parsePgn('1. e4 e5 2.');
      // Should parse what it can
      expect(result.games).toHaveLength(1);
      expect(result.games[0].moves.map((m) => m.san)).toEqual(['e4', 'e5']);
    });
  });
});
