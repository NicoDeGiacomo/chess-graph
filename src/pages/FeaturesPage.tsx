import { Link } from 'react-router';
import { useDocumentMeta } from '../hooks/useDocumentMeta.ts';
import { ThemeToggle } from '../components/ThemeToggle.tsx';

const sections = [
  { id: 'game-tree', title: 'Interactive Game Tree' },
  { id: 'chess-board', title: 'Chess Board' },
  { id: 'move-input', title: 'Move Input' },
  { id: 'keyboard-shortcuts', title: 'Keyboard Shortcuts' },
  { id: 'node-customization', title: 'Node Customization' },
  { id: 'pgn-import', title: 'PGN Import' },
  { id: 'export-import', title: 'Export & Import' },
  { id: 'repertoire-management', title: 'Repertoire Management' },
  { id: 'additional', title: 'Additional Features' },
] as const;

function FeatureScreenshot({ src, alt }: { src: string; alt: string }) {
  return (
    <picture className="block mb-6">
      <source srcSet={`${src.replace('.png', '.webp')}`} type="image/webp" />
      <img
        src={src}
        alt={alt}
        className="rounded-lg border border-border-subtle w-full"
        loading="lazy"
      />
    </picture>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-block bg-input border border-border px-1.5 py-0.5 rounded text-xs font-mono text-secondary">
      {children}
    </kbd>
  );
}

export function FeaturesPage() {
  useDocumentMeta({
    title: 'Features — Chess Graph',
    description:
      'Explore all Chess Graph features: interactive game tree, board annotations, PGN import, keyboard shortcuts, and more.',
    canonical: 'https://chessgraph.net/features',
  });

  return (
    <div className="relative min-h-screen bg-page text-primary">
      <ThemeToggle className="absolute top-4 right-4" />

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-4 pt-24 pb-12 text-center">
        <Link to="/">
          <img
            src="/logo.svg"
            alt="Chess Graph"
            className="h-14 sm:h-18 mx-auto"
          />
        </Link>
        <h1 className="text-3xl sm:text-4xl font-bold mt-6">Features</h1>
        <p className="mt-4 text-lg text-tertiary max-w-2xl mx-auto">
          Everything you need to build, explore, and master your chess opening repertoire.
        </p>
      </section>

      {/* Table of Contents */}
      <nav className="max-w-4xl mx-auto px-4 pb-16" aria-label="Table of contents">
        <div className="bg-card border border-border-subtle rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">On This Page</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
            {sections.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="text-blue-400 hover:text-blue-300 transition-colors text-sm py-1"
              >
                {s.title}
              </a>
            ))}
          </div>
        </div>
      </nav>

      {/* Sections */}
      <div className="max-w-4xl mx-auto px-4 pb-24 space-y-16">

        {/* 1. Interactive Game Tree */}
        <section id="game-tree">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7 text-blue-400 shrink-0" aria-hidden="true">
              <circle cx="12" cy="5" r="2.5" />
              <circle cx="5" cy="19" r="2.5" />
              <circle cx="19" cy="19" r="2.5" />
              <path d="M12 7.5v4.5m0 0l-5.5 4.5m5.5-4.5l5.5 4.5" />
            </svg>
            Interactive Game Tree
          </h2>
          <div className="bg-card border border-border-subtle rounded-xl p-6">
            <FeatureScreenshot
              src="/screenshots/features/game-tree.png"
              alt="Interactive game tree showing branching opening variations"
            />
            <p className="text-sm text-tertiary mb-4">
              Your opening repertoire is displayed as a visual node graph. Each node represents a chess position, and edges represent the moves connecting them.
            </p>
            <ul className="text-sm text-tertiary space-y-2 list-disc list-inside">
              <li><strong className="text-secondary">Click any node</strong> to jump to that position on the board</li>
              <li><strong className="text-secondary">Auto-layout</strong> keeps the graph organized as it grows using the dagre layout engine</li>
              <li><strong className="text-secondary">Collapse &amp; expand</strong> — double-click a node to hide its descendants; a blue <span className="text-blue-400">+N</span> badge shows how many nodes are hidden</li>
              <li><strong className="text-secondary">Minimap</strong> in the corner for quick orientation in large trees</li>
              <li><strong className="text-secondary">Zoom &amp; pan</strong> — scroll to zoom, drag the background to pan</li>
              <li><strong className="text-secondary">Transpositions</strong> — when different move orders reach the same position, a curved edge connects them instead of duplicating nodes</li>
            </ul>
          </div>
        </section>

        {/* 2. Chess Board */}
        <section id="chess-board">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7 text-blue-400 shrink-0" aria-hidden="true">
              <rect x="3" y="3" width="18" height="18" rx="1" />
              <rect x="3" y="3" width="4.5" height="4.5" fill="currentColor" opacity="0.3" />
              <rect x="12" y="3" width="4.5" height="4.5" fill="currentColor" opacity="0.3" />
              <rect x="7.5" y="7.5" width="4.5" height="4.5" fill="currentColor" opacity="0.3" />
              <rect x="16.5" y="7.5" width="4.5" height="4.5" fill="currentColor" opacity="0.3" />
            </svg>
            Chess Board
          </h2>
          <div className="bg-card border border-border-subtle rounded-xl p-6">
            <FeatureScreenshot
              src="/screenshots/features/chess-board.png"
              alt="Chess board with arrows and highlighted squares"
            />
            <p className="text-sm text-tertiary mb-4">
              A fully interactive chess board stays in sync with the graph. Make moves by clicking or dragging pieces.
            </p>
            <h3 className="text-base font-semibold mb-3">Board Annotations</h3>
            <p className="text-sm text-tertiary mb-3">
              Right-click and drag on the board to draw arrows. Right-click a square to highlight it. Annotations persist per node.
            </p>
            <div className="overflow-x-auto mb-4">
              <table className="text-sm w-full">
                <thead>
                  <tr className="border-b border-border-subtle text-left">
                    <th className="py-2 pr-4 text-secondary font-medium">Action</th>
                    <th className="py-2 text-secondary font-medium">Color</th>
                  </tr>
                </thead>
                <tbody className="text-tertiary">
                  <tr className="border-b border-border-subtle">
                    <td className="py-2 pr-4">Right-click a square</td>
                    <td className="py-2"><span className="inline-block w-3 h-3 rounded-sm mr-2 align-middle" style={{ backgroundColor: 'rgba(255, 170, 0, 0.8)' }} />Orange</td>
                  </tr>
                  <tr className="border-b border-border-subtle">
                    <td className="py-2 pr-4"><Kbd>Shift</Kbd> + right-click</td>
                    <td className="py-2"><span className="inline-block w-3 h-3 rounded-sm mr-2 align-middle" style={{ backgroundColor: 'rgba(76, 175, 80, 0.8)' }} />Green</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4"><Kbd>Ctrl</Kbd> / <Kbd>Cmd</Kbd> + right-click</td>
                    <td className="py-2"><span className="inline-block w-3 h-3 rounded-sm mr-2 align-middle" style={{ backgroundColor: 'rgba(244, 67, 54, 0.8)' }} />Red</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-sm text-tertiary mb-4">
              Click the eraser icon below the board to clear all annotations for the current node. Right-clicking the same square with the same modifier toggles the highlight off.
            </p>
            <h3 className="text-base font-semibold mb-3">External Analysis</h3>
            <p className="text-sm text-tertiary">
              Below the board, quick links open the current position on{' '}
              <strong className="text-secondary">Chess.com</strong> and{' '}
              <strong className="text-secondary">Lichess</strong> for deeper analysis with their engines.
            </p>
          </div>
        </section>

        {/* 3. Move Input */}
        <section id="move-input">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7 text-blue-400 shrink-0" aria-hidden="true">
              <path d="M4 6h16M4 12h10M4 18h14" />
            </svg>
            Move Input
          </h2>
          <div className="bg-card border border-border-subtle rounded-xl p-6">
            <FeatureScreenshot
              src="/screenshots/features/move-input.png"
              alt="Move input field with turn indicator"
            />
            <p className="text-sm text-tertiary mb-4">
              Type moves in standard algebraic notation instead of dragging pieces. A turn indicator shows whose move it is.
            </p>
            <ul className="text-sm text-tertiary space-y-2 list-disc list-inside">
              <li>Press <Kbd>Enter</Kbd> to submit a move</li>
              <li>Invalid moves show a red error message that auto-clears after 2 seconds</li>
              <li>Pawn promotions to the back rank without a piece suffix (e.g., <code className="text-secondary">e8</code>) automatically promote to queen</li>
              <li>Examples: <code className="text-secondary">e4</code>, <code className="text-secondary">Nf3</code>, <code className="text-secondary">O-O</code>, <code className="text-secondary">exd5</code>, <code className="text-secondary">e8=Q</code></li>
            </ul>
          </div>
        </section>

        {/* 4. Keyboard Shortcuts */}
        <section id="keyboard-shortcuts">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7 text-blue-400 shrink-0" aria-hidden="true">
              <rect x="2" y="6" width="20" height="12" rx="2" />
              <path d="M6 10h0M10 10h0M14 10h0M18 10h0M8 14h8" />
            </svg>
            Keyboard Shortcuts
          </h2>
          <div className="bg-card border border-border-subtle rounded-xl p-6">
            <p className="text-sm text-tertiary mb-4">
              Navigate and edit without touching the mouse. Shortcuts are disabled when a text input is focused.
            </p>
            <div className="overflow-x-auto">
              <table className="text-sm w-full">
                <thead>
                  <tr className="border-b border-border-subtle text-left">
                    <th className="py-2 pr-4 text-secondary font-medium">Shortcut</th>
                    <th className="py-2 text-secondary font-medium">Action</th>
                  </tr>
                </thead>
                <tbody className="text-tertiary">
                  <tr className="border-b border-border-subtle">
                    <td className="py-2 pr-4"><Kbd>&larr;</Kbd></td>
                    <td className="py-2">Navigate to parent node</td>
                  </tr>
                  <tr className="border-b border-border-subtle">
                    <td className="py-2 pr-4"><Kbd>&rarr;</Kbd></td>
                    <td className="py-2">Navigate to first child (expands if collapsed)</td>
                  </tr>
                  <tr className="border-b border-border-subtle">
                    <td className="py-2 pr-4"><Kbd>&uarr;</Kbd></td>
                    <td className="py-2">Navigate to previous sibling</td>
                  </tr>
                  <tr className="border-b border-border-subtle">
                    <td className="py-2 pr-4"><Kbd>&darr;</Kbd></td>
                    <td className="py-2">Navigate to next sibling</td>
                  </tr>
                  <tr className="border-b border-border-subtle">
                    <td className="py-2 pr-4"><Kbd>Ctrl</Kbd> / <Kbd>Cmd</Kbd> + <Kbd>Z</Kbd></td>
                    <td className="py-2">Undo</td>
                  </tr>
                  <tr className="border-b border-border-subtle">
                    <td className="py-2 pr-4"><Kbd>Ctrl</Kbd> / <Kbd>Cmd</Kbd> + <Kbd>Shift</Kbd> + <Kbd>Z</Kbd></td>
                    <td className="py-2">Redo</td>
                  </tr>
                  <tr className="border-b border-border-subtle">
                    <td className="py-2 pr-4"><Kbd>Ctrl</Kbd> / <Kbd>Cmd</Kbd> + <Kbd>Y</Kbd></td>
                    <td className="py-2">Redo (alternate)</td>
                  </tr>
                  <tr className="border-b border-border-subtle">
                    <td className="py-2 pr-4"><Kbd>Escape</Kbd></td>
                    <td className="py-2">Close dialogs and menus</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4">Double-click node</td>
                    <td className="py-2">Collapse or expand subtree</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* 5. Node Customization */}
        <section id="node-customization">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7 text-blue-400 shrink-0" aria-hidden="true">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
            </svg>
            Node Customization
          </h2>
          <div className="bg-card border border-border-subtle rounded-xl p-6">
            <FeatureScreenshot
              src="/screenshots/features/context-menu.png"
              alt="Node context menu with color, tag, and delete options"
            />
            <p className="text-sm text-tertiary mb-4">
              Right-click any node in the graph to open its context menu with these options:
            </p>
            <ul className="text-sm text-tertiary space-y-2 list-disc list-inside">
              <li><strong className="text-secondary">Edit Comment</strong> — add or edit a text annotation for the node (<Kbd>Ctrl</Kbd> / <Kbd>Cmd</Kbd> + <Kbd>Enter</Kbd> to save)</li>
              <li><strong className="text-secondary">Change Color</strong> — pick from 6 colors (Default, Green, Red, Yellow, Blue, Purple) to visually categorize nodes</li>
              <li><strong className="text-secondary">Add Tag</strong> — attach text labels like &ldquo;main line&rdquo; or &ldquo;dubious&rdquo; shown as badges on the node</li>
              <li><strong className="text-secondary">Delete</strong> — remove a node and all its descendants (not available on the root node)</li>
              <li><strong className="text-secondary">Remove Transposition</strong> — delete specific transposition edges from the node</li>
            </ul>
          </div>
        </section>

        {/* 6. PGN Import */}
        <section id="pgn-import">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7 text-blue-400 shrink-0" aria-hidden="true">
              <path d="M12 3v12m0 0l-4-4m4 4l4-4" />
              <path d="M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
            </svg>
            PGN Import
          </h2>
          <div className="bg-card border border-border-subtle rounded-xl p-6">
            <FeatureScreenshot
              src="/screenshots/features/pgn-import.png"
              alt="PGN import dialog with text area and file upload"
            />
            <p className="text-sm text-tertiary mb-4">
              Import games from any PGN source to quickly build your repertoire.
            </p>
            <ul className="text-sm text-tertiary space-y-2 list-disc list-inside">
              <li><strong className="text-secondary">Paste PGN text</strong> directly into the text area</li>
              <li><strong className="text-secondary">Upload a .pgn file</strong> from your computer</li>
              <li><strong className="text-secondary">Multiple games</strong> are supported in a single import</li>
              <li><strong className="text-secondary">Auto-merge</strong> — existing nodes with matching moves are reused, not duplicated</li>
              <li><strong className="text-secondary">Recursive variations</strong> (RAVs) are fully parsed</li>
              <li><strong className="text-secondary">Import summary</strong> shows new nodes, merged nodes, and transpositions created</li>
              <li><strong className="text-secondary">Error reporting</strong> — invalid moves are reported by game number and move, while valid moves are still imported</li>
            </ul>
          </div>
        </section>

        {/* 7. Export & Import */}
        <section id="export-import">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7 text-blue-400 shrink-0" aria-hidden="true">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export &amp; Import
          </h2>
          <div className="bg-card border border-border-subtle rounded-xl p-6">
            <p className="text-sm text-tertiary mb-4">
              Back up your entire library or transfer it to another browser.
            </p>
            <h3 className="text-base font-semibold mb-3">Export</h3>
            <ul className="text-sm text-tertiary space-y-2 list-disc list-inside mb-4">
              <li>Click <strong className="text-secondary">Export</strong> in the top bar to download all repertoires as a single JSON file</li>
              <li>Filename includes the date: <code className="text-secondary">chess-graph-export-2025-01-15.json</code></li>
              <li>Includes all repertoires, nodes, and folders</li>
            </ul>
            <h3 className="text-base font-semibold mb-3">Import</h3>
            <ul className="text-sm text-tertiary space-y-2 list-disc list-inside">
              <li>Click <strong className="text-secondary">Import</strong> and select a previously exported JSON file</li>
              <li>The file is validated before loading — malformed files are rejected with an error message</li>
              <li>Importing replaces your entire library (all repertoires and folders)</li>
            </ul>
          </div>
        </section>

        {/* 8. Repertoire Management */}
        <section id="repertoire-management">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7 text-blue-400 shrink-0" aria-hidden="true">
              <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
            Repertoire Management
          </h2>
          <div className="bg-card border border-border-subtle rounded-xl p-6">
            <FeatureScreenshot
              src="/screenshots/features/repertoire-management.png"
              alt="All Graphs page with repertoire cards organized in folders"
            />
            <p className="text-sm text-tertiary mb-4">
              Organize your repertoires from the All Graphs page.
            </p>
            <ul className="text-sm text-tertiary space-y-2 list-disc list-inside">
              <li><strong className="text-secondary">Create</strong> new repertoires with a single click</li>
              <li><strong className="text-secondary">Rename</strong> repertoires inline from the editor top bar</li>
              <li><strong className="text-secondary">Delete</strong> repertoires you no longer need</li>
              <li><strong className="text-secondary">Folders</strong> — group related repertoires into collapsible folders</li>
              <li><strong className="text-secondary">Drag and drop</strong> — move repertoires between folders</li>
              <li><strong className="text-secondary">Search</strong> — filter repertoires by name</li>
              <li><strong className="text-secondary">Graph panel sidebar</strong> — quickly switch between repertoires from within the editor</li>
            </ul>
          </div>
        </section>

        {/* 9. Additional Features */}
        <section id="additional">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7 text-blue-400 shrink-0" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4l3 3" />
            </svg>
            Additional Features
          </h2>
          <div className="bg-card border border-border-subtle rounded-xl p-6">
            <ul className="text-sm text-tertiary space-y-2 list-disc list-inside">
              <li><strong className="text-secondary">Dark &amp; light theme</strong> — toggle from any page using the theme switch in the top-right corner</li>
              <li><strong className="text-secondary">Undo &amp; redo</strong> — up to 50 steps of history for every action (add moves, delete nodes, edit comments, import PGN)</li>
              <li><strong className="text-secondary">Local persistence</strong> — all data is saved in your browser via IndexedDB; no account or server required</li>
              <li><strong className="text-secondary">Node details sidebar</strong> — view the comment, tags, and transposition links for the selected node</li>
              <li><strong className="text-secondary">Flip board</strong> — view from Black&apos;s perspective with one click</li>
              <li><strong className="text-secondary">Board coordinates</strong> — rank and file labels on the board edges</li>
            </ul>
          </div>
        </section>
      </div>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-4 pb-24 text-center">
        <h2 className="text-2xl font-bold mb-4">Ready to build your repertoire?</h2>
        <Link
          to="/repertoires"
          className="inline-block bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg px-6 py-3 text-lg transition-colors"
        >
          Get Started
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-border-subtle py-8">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted">
          <span>Chess Graph &middot; MIT License &middot; {new Date().getFullYear()}</span>
          <div className="flex items-center gap-6">
            <Link
              to="/features"
              className="hover:text-secondary transition-colors"
            >
              Features
            </Link>
            <a
              href="https://github.com/NicoDeGiacomo/chess-graph"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-secondary transition-colors"
              aria-label="GitHub (opens in new tab)"
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
