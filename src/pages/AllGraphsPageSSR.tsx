import { ThemeToggle } from '../components/ThemeToggle.tsx';

/**
 * Lightweight SSR shell for the /repertoires page.
 * Renders the static page structure without Dexie/IndexedDB dependencies
 * so it can be pre-rendered at build time for SEO.
 * The client-side AllGraphsPage hydrates over this with full interactivity.
 */
export function AllGraphsPageSSR() {
  return (
    <div className="min-h-screen bg-page text-primary">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">My Graphs</h1>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button className="text-sm bg-card hover:bg-elevated border border-border-subtle text-primary rounded-lg px-4 py-2">
              + New Folder
            </button>
            <button className="text-sm bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-4 py-2">
              + New Graph
            </button>
          </div>
        </div>
        {/* SEO content — visible in SSR, replaced after hydration */}
        <div className="text-tertiary text-sm space-y-3 mb-8">
          <p>
            Chess Graph lets you organize your opening repertoires as interactive game trees.
            Create graphs for White and Black, add moves from any starting position,
            and visualize your entire opening preparation at a glance.
          </p>
          <p>
            Import PGN files, annotate positions with tags and comments,
            and organize your graphs into folders. All data is stored locally in your
            browser — no account required.
          </p>
        </div>
        <p className="text-muted text-center py-12">Loading your graphs...</p>
      </div>
    </div>
  );
}
