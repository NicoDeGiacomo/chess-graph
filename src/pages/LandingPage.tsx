import { Link } from 'react-router';
import { useDocumentMeta } from '../hooks/useDocumentMeta.ts';
import { ThemeToggle } from '../components/ThemeToggle.tsx';

const features = [
  {
    title: 'Interactive Game Tree',
    description:
      'Explore your openings as a visual node graph. Branch, merge, and navigate variations with drag-and-drop ease.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8" aria-hidden="true">
        <circle cx="12" cy="5" r="2.5" />
        <circle cx="5" cy="19" r="2.5" />
        <circle cx="19" cy="19" r="2.5" />
        <path d="M12 7.5v4.5m0 0l-5.5 4.5m5.5-4.5l5.5 4.5" />
      </svg>
    ),
  },
  {
    title: 'Synced Chess Board',
    description:
      'Click any node to jump to that position. Make moves on the board and the graph updates in real time.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="1" />
        <rect x="3" y="3" width="4.5" height="4.5" fill="currentColor" opacity="0.3" />
        <rect x="12" y="3" width="4.5" height="4.5" fill="currentColor" opacity="0.3" />
        <rect x="7.5" y="7.5" width="4.5" height="4.5" fill="currentColor" opacity="0.3" />
        <rect x="16.5" y="7.5" width="4.5" height="4.5" fill="currentColor" opacity="0.3" />
        <rect x="3" y="12" width="4.5" height="4.5" fill="currentColor" opacity="0.3" />
        <rect x="12" y="12" width="4.5" height="4.5" fill="currentColor" opacity="0.3" />
        <rect x="7.5" y="16.5" width="4.5" height="4.5" fill="currentColor" opacity="0.3" />
        <rect x="16.5" y="16.5" width="4.5" height="4.5" fill="currentColor" opacity="0.3" />
      </svg>
    ),
  },
  {
    title: 'PGN Import & Export',
    description:
      'Bring in games from any source via JSON export, or back up your graphs anytime.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8" aria-hidden="true">
        <path d="M12 3v12m0 0l-4-4m4 4l4-4" />
        <path d="M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
      </svg>
    ),
  },
  {
    title: 'Local Persistence',
    description:
      'All data lives in your browser via IndexedDB. No account required, no data sent to any server.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8" aria-hidden="true">
        <path d="M12 2a4 4 0 00-4 4v4h8V6a4 4 0 00-4-4z" />
        <rect x="4" y="10" width="16" height="12" rx="2" />
        <circle cx="12" cy="16" r="1.5" />
      </svg>
    ),
  },
];

export function LandingPage() {
  useDocumentMeta({
    title: 'Chess Graph — Visualize Your Opening Repertoire',
    description:
      'Free chess opening tree visualizer. Explore variations as interactive graphs, import PGN, annotate moves, and master your repertoire — no account needed.',
    canonical: 'https://www.chessgraph.net/',
  });

  return (
    <div className="relative min-h-screen bg-page text-primary">
      <ThemeToggle className="absolute top-4 right-4" />

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-4 pt-24 pb-16 text-center">
        <img
          src="/logo.svg"
          alt="Chess Graph"
          className="h-14 sm:h-18 mx-auto"
        />
        <h1 className="mt-6 text-3xl sm:text-4xl font-bold">
          Visualize Your Opening Repertoire
        </h1>
        <p className="mt-4 text-lg text-tertiary max-w-2xl mx-auto">
          Explore chess openings as an interactive game tree.
          Branch, annotate, and master your lines — all in your browser.
        </p>
        <Link
          to="/repertoires"
          className="inline-block mt-8 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg px-6 py-3 text-lg transition-colors"
        >
          Get Started
        </Link>
      </section>

      {/* Screenshot */}
      <section className="max-w-5xl mx-auto px-4 pb-20">
        <picture>
          <source srcSet="/screenshots/chess-graph-after-e4.webp" type="image/webp" />
          <img
            src="/screenshots/chess-graph-after-e4.png"
            alt="Chess Graph showing an opening tree after 1. e4"
            className="rounded-xl border border-border-subtle shadow-2xl w-full"
            width={2400}
            height={1636}
            fetchPriority="high"
          />
        </picture>
      </section>

      {/* Features */}
      <section className="max-w-4xl mx-auto px-4 pb-24">
        <h2 className="text-2xl font-bold text-center mb-4">Chess Opening Visualization Features</h2>
        <div className="text-center mb-12">
          <Link
            to="/features"
            className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
          >
            View all features &rarr;
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-card border border-border-subtle rounded-xl p-6"
            >
              <div className="text-blue-400 mb-3">{f.icon}</div>
              <h3 className="text-lg font-semibold mb-1">{f.title}</h3>
              <p className="text-sm text-tertiary">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-4xl mx-auto px-4 pb-24">
        <h2 className="text-2xl font-bold text-center mb-12">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-2">Build Your Repertoire Visually</h3>
            <p className="text-sm text-tertiary">
              Start from any position and add moves directly on the chess board. Each move
              creates a new node in your opening tree, letting you map out every variation
              you want to study. The graph grows organically as you explore lines, giving you
              a bird&apos;s-eye view of your entire repertoire.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Board and Graph Stay in Sync</h3>
            <p className="text-sm text-tertiary">
              Click any node in the graph to instantly load that position on the board.
              Make a move on the board and watch the graph update in real time. This
              two-way sync makes it easy to navigate deep lines without losing your place
              in the overall opening structure.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">No Account Required</h3>
            <p className="text-sm text-tertiary">
              Chess Graph runs entirely in your browser. Your graphs are saved locally
              using IndexedDB — no sign-up, no server, no data collection. Open the app
              and start building your opening preparation immediately. Export your data
              anytime as a backup.
            </p>
          </div>
        </div>
      </section>

      {/* Who Uses Chess Graph */}
      <section className="max-w-4xl mx-auto px-4 pb-24">
        <h2 className="text-2xl font-bold text-center mb-12">Who Uses Chess Graph</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-card border border-border-subtle rounded-xl p-6 text-center">
            <h3 className="text-lg font-semibold mb-2">Tournament Players</h3>
            <p className="text-sm text-tertiary">
              Organize your preparation for both colors. Map out main lines and sidelines so
              you&apos;re ready for any opponent.
            </p>
          </div>
          <div className="bg-card border border-border-subtle rounded-xl p-6 text-center">
            <h3 className="text-lg font-semibold mb-2">Chess Coaches</h3>
            <p className="text-sm text-tertiary">
              Build visual lesson plans for students. Share graphs as exported files and
              walk through variations step by step.
            </p>
          </div>
          <div className="bg-card border border-border-subtle rounded-xl p-6 text-center">
            <h3 className="text-lg font-semibold mb-2">Casual Improvers</h3>
            <p className="text-sm text-tertiary">
              Tired of forgetting your openings? Build a personal cheat sheet that&apos;s
              easy to read and always available in your browser.
            </p>
          </div>
        </div>
      </section>

      {/* About Chess Graph */}
      <section className="max-w-4xl mx-auto px-4 pb-24">
        <h2 className="text-2xl font-bold text-center mb-12">About Chess Graph</h2>
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-sm text-tertiary mb-4">
            Chess Graph is a free, open-source tool built by{' '}
            <a
              href="https://github.com/NicoDeGiacomo"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 transition-colors"
              aria-label="Nico De Giacomo (opens in new tab)"
            >
              Nico De Giacomo
            </a>
            . The project is maintained on{' '}
            <a
              href="https://github.com/NicoDeGiacomo/chess-graph"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 transition-colors"
              aria-label="GitHub (opens in new tab)"
            >
              GitHub
            </a>{' '}
            and released under the MIT License.
          </p>
          <p className="text-sm text-tertiary">
            Contributions, bug reports, and feature requests are welcome.
            If you find Chess Graph useful, consider starring the repository to help others discover it.
          </p>
        </div>
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
