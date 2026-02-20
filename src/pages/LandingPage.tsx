import { Link } from 'react-router';
import { useDocumentTitle } from '../hooks/useDocumentTitle.ts';

const features = [
  {
    title: 'Interactive Game Tree',
    description:
      'Explore your openings as a visual node graph. Branch, merge, and navigate variations with drag-and-drop ease.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8">
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
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8">
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
      'Bring in games from any source via JSON export, or back up your repertoires anytime.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8">
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
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8">
        <path d="M12 2a4 4 0 00-4 4v4h8V6a4 4 0 00-4-4z" />
        <rect x="4" y="10" width="16" height="12" rx="2" />
        <circle cx="12" cy="16" r="1.5" />
      </svg>
    ),
  },
];

export function LandingPage() {
  useDocumentTitle('Chess Graph — Visualize Your Opening Repertoire');

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Hero */}
      <section className="max-w-4xl mx-auto px-4 pt-24 pb-16 text-center">
        <img
          src="/logo.svg"
          alt="Chess Graph"
          className="h-14 sm:h-18 mx-auto"
        />
        <p className="mt-4 text-lg text-zinc-400 max-w-2xl mx-auto">
          Visualize your opening repertoire as an interactive game tree.
          Branch, explore, and master your lines — all in your browser.
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
        <img
          src="/screenshots/chess-graph-after-e4.png"
          alt="Chess Graph showing an opening tree after 1. e4"
          className="rounded-xl border border-zinc-800 shadow-2xl w-full"
        />
      </section>

      {/* Features */}
      <section className="max-w-4xl mx-auto px-4 pb-24">
        <h2 className="text-2xl font-bold text-center mb-12">Features</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-zinc-900 border border-zinc-800 rounded-xl p-6"
            >
              <div className="text-blue-400 mb-3">{f.icon}</div>
              <h3 className="text-lg font-semibold mb-1">{f.title}</h3>
              <p className="text-sm text-zinc-400">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800 py-8">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-zinc-500">
          <span>Chess Graph &middot; MIT License &middot; {new Date().getFullYear()}</span>
          <a
            href="https://github.com/ndegiaco/chess-graph"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-zinc-300 transition-colors"
          >
            GitHub
          </a>
        </div>
      </footer>
    </div>
  );
}
