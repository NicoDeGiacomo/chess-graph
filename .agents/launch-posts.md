# Chess Graph — Launch Posts

All posts ready to copy-paste. Adjust as needed before posting.

---

## Wave 1: Chess Communities (Day 1)

---

### Reddit — r/chess

**Title:** I built a free tool that visualizes your opening repertoire as an interactive graph

**Body:**

Hey r/chess,

I've been working on a side project called **Chess Graph** and wanted to share it with you all.

The idea is simple: instead of scrolling through PGN files or memorizing move lists, you can see your entire opening repertoire as a visual graph. Each node is a position, each edge is a move. Click a node to see it on the board. Make a move on the board and watch the graph grow.

**What it does:**
- Interactive game tree — zoom, pan, collapse/expand branches, drag nodes around
- PGN import — drop in your games and it builds the tree automatically (handles RAVs and multi-game merge)
- Transposition detection — curved edges show when different move orders reach the same position
- Annotations — color-code nodes, add comments, draw arrows on the board
- Keyboard moves — type algebraic notation directly (e.g., type "e4" to play 1.e4)
- Organize into folders — separate repertoires by color, opening, tournament, etc.

**What it doesn't do:**
- No account needed. Open the site and start building.
- No cloud. Everything is stored locally in your browser (IndexedDB).
- No ads, no paywall. It's free and open-source (MIT).

I built this because I kept forgetting my lines and wanted a way to *see* my repertoire instead of just reading it. Turns out a graph is way easier to navigate than a PGN file.

Try it out: https://www.chessgraph.net/

Source code: https://github.com/NicoDeGiacomo/chess-graph

Would love your feedback — what's missing, what's confusing, what would make this actually useful for your prep. I'm actively developing it.

---

### Reddit — r/chessbeginners

**Title:** I made a free visual tool to help you organize your openings (no account needed)

**Body:**

If you're like me, you've probably tried to learn openings by watching videos or reading books, then promptly forgotten everything by the next game.

I built **Chess Graph** to solve this for myself, and I think it might help you too.

Instead of memorizing move lists, you build a visual map of your openings. It looks like a flowchart — each bubble is a chess position, and the lines between them are moves. You can:

- **Click any position** to see it on the board
- **Make moves on the board** and the graph grows automatically
- **Import PGN games** to build your tree from existing games
- **Color-code branches** (green for your main line, red for traps to avoid, etc.)
- **Add notes** to any position ("here they usually play Nf3")

It's completely free, no sign-up required, and everything stays in your browser. Nothing is sent to any server.

I think it's especially useful if you're building your first repertoire and want to see the big picture of how your openings connect.

Give it a try: https://www.chessgraph.net/

Here's a quick overview of features: https://www.chessgraph.net/features

Let me know what you think! Happy to answer questions.

---

### Lichess Forum — General Chess Discussion

**Title:** Chess Graph — free visual opening repertoire builder (open-source)

**Body:**

Hi everyone,

I'd like to share a tool I built called Chess Graph. It's a free, open-source web app for visualizing your opening repertoire as an interactive node graph.

**How it works:**
You build a game tree where each node is a position and each edge is a move. The board and graph are synced — click a node to see the position, or make a move on the board to extend the tree. You can import PGN files (with full RAV support), color-code branches, add comments, and organize everything into folders.

**Key points:**
- Free, no account needed
- Local storage only (IndexedDB) — your data stays on your device
- Open-source: https://github.com/NicoDeGiacomo/chess-graph
- Quick link to analyze any position on Lichess built-in

It handles transpositions too — if two different move orders reach the same position, the graph shows a curved edge connecting them.

Try it: https://www.chessgraph.net/

Feedback welcome. I'm a Lichess user myself and would love to hear what this community thinks.

---

## Wave 2: Broader Social (Day 3-4)

---

### Twitter/X — Launch Thread

**Post 1 (hook):**
I built a free tool that turns your chess openings into a visual graph.

No account. No cloud. No paywall.

Just open it and start building your repertoire.

https://www.chessgraph.net/

Thread on why and how 🧵

**Post 2:**
The problem: I kept forgetting my opening prep.

PGN files are unreadable. Chessable is great but course-focused. ChessBase costs money and has a learning curve.

I wanted something simple — a visual map of my openings that I could glance at before a game.

**Post 3:**
So I built Chess Graph.

Each position is a node. Each move is an edge. Click any node to see the board. Make a move to grow the graph.

Import your PGN games and it builds the tree automatically — handles variations, sub-variations, and transpositions.

**Post 4:**
Features I'm most proud of:

→ Transposition detection (curved edges show same position from different move orders)
→ Keyboard move entry (type "Nf3" instead of dragging pieces)
→ Collapse/expand subtrees (hide branches you're not studying)
→ Color-coded nodes (green = main line, red = trap, etc.)

**Post 5:**
It's free and open-source (MIT license).

Everything is stored locally in your browser. No server, no account, no tracking.

GitHub: https://github.com/NicoDeGiacomo/chess-graph

If you play chess and want a better way to organize your openings, give it a try. Feedback welcome.

---

### Threads

I built a free tool that visualizes your chess openings as an interactive graph.

Instead of memorizing move lists, you see your entire repertoire as a visual map. Click any position to see it on the board. Make moves to grow the tree.

- Import PGN files
- Color-code branches
- Detect transpositions
- No account needed
- Everything stays in your browser

It's open-source and completely free.

https://www.chessgraph.net/

If you play chess, I'd love your feedback.

---

### Chess.com Forum — Chess Software & Tools

**Title:** Chess Graph — Free visual opening repertoire builder (no account needed)

**Body:**

Hey Chess.com community,

I wanted to share a free tool I've been building called Chess Graph.

It's a web app that lets you visualize your opening repertoire as an interactive graph — like a flowchart of your openings. Each node is a position, each connection is a move. The board and graph stay synced, so you can click around the graph or play moves on the board and everything updates together.

**Why I built it:**
I love Chess.com's opening explorer for seeing what's popular, but I wanted something for building my *personal* repertoire — my own lines, my own annotations, organized the way I think about them.

**What you can do:**
- Import your PGN games and it builds the tree automatically
- Color-code nodes (main lines, sidelines, traps)
- Add comments and board annotations (arrows, highlights)
- Organize multiple repertoires into folders
- See transpositions visually (curved edges)
- Quick-link any position to Chess.com or Lichess analysis

**What it costs:**
Nothing. No account, no ads, no paywall. It's open-source.

Everything is stored locally in your browser — nothing is sent to any server.

Check it out: https://www.chessgraph.net/
Features overview: https://www.chessgraph.net/features
Source code: https://github.com/NicoDeGiacomo/chess-graph

Would love to hear what you think. What features would make this useful for your prep?

---

## Wave 3: Tech Audience (Day 7-10)

---

### Product Hunt

**Tagline:** Visualize your chess opening repertoire as an interactive graph

**Description:**

Chess Graph is a free, open-source tool that turns chess opening preparation into a visual experience. Instead of memorizing move lists, you build an interactive graph where each node is a position and each edge is a move.

**Key features:**
🎯 Interactive game tree with zoom, pan, collapse/expand
♟️ Synced chess board — click nodes or play moves
📥 PGN import with full variation support
🎨 Color-coded nodes and board annotations
⌨️ Keyboard move entry (type algebraic notation)
🔀 Transposition detection with visual edges
📁 Multiple repertoires organized into folders
🔒 Local-first — no account, no cloud, IndexedDB storage
🌗 Dark and light theme

**Built with:** React 19, TypeScript, @xyflow/react, chess.js, Tailwind CSS

**Why:** Opening preparation shouldn't require expensive software or complex tools. Chess Graph gives you a clear visual picture of your repertoire — for free, in your browser.

**Topics:** Chess, Productivity, Open Source, Developer Tools, Education

**First Comment (by maker):**

Hi Product Hunt! 👋

I'm Nico, the maker of Chess Graph.

I built this because I kept forgetting my opening lines. I'd study a video, feel prepared, then immediately go wrong on move 5. The problem wasn't the studying — it was that I couldn't *see* my repertoire as a whole.

Chess Graph gives you that bird's-eye view. Import your games, color-code your main lines, and see exactly where your preparation branches.

It's free, open-source, and everything stays in your browser. No account needed.

I'd love your feedback — especially if you play chess. What would make this more useful for you?

---

### Hacker News — Show HN

**Title:** Show HN: Chess Graph – Visualize your opening repertoire as an interactive graph

**Body:**

I built a free, open-source web app for visualizing chess opening repertoires.

Instead of reading PGN files, you see an interactive graph where nodes are positions and edges are moves. The board and graph are synced — click a node to update the board, play a move to grow the graph.

Key features:
- PGN import with full RAV support (merges multiple games into one tree)
- Transposition detection (curved edges for same position via different move orders)
- Color-coded nodes, comments, board annotations
- Keyboard move entry (type algebraic notation)
- Local-first — IndexedDB, no account, no server
- Dark/light theme

Stack: React 19, TypeScript, Vite 7, @xyflow/react (for the graph), chess.js, dagre (layout), dexie (IndexedDB), Tailwind CSS v4.

Live: https://www.chessgraph.net/
GitHub: https://github.com/NicoDeGiacomo/chess-graph

Would appreciate feedback from any chess players here. Also happy to discuss the technical side — the graph layout algorithm, handling transpositions, and syncing two very different UI paradigms (board + graph) was an interesting challenge.

---

## Bonus: Short-Form Posts (for quick sharing)

---

### One-liner (for bios, cross-posts, etc.)

Chess Graph — free, open-source tool to visualize your chess openings as an interactive graph. No account needed. https://www.chessgraph.net/

### Short Reddit comment (for relevant threads)

I built a free tool for exactly this — it lets you visualize your opening repertoire as an interactive graph. Import PGN, color-code branches, see transpositions. No account needed, everything stays in your browser: https://www.chessgraph.net/
