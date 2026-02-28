import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, '..', 'dist');

const template = fs.readFileSync(path.join(distDir, 'index.html'), 'utf-8');

const { render } = await import(path.join(distDir, 'server', 'entry-server.js'));

const routes = [
  {
    path: '/',
    outputFile: 'index.html',
    title: 'Chess Graph — Visualize Your Opening Repertoire',
    description:
      'Explore chess openings as interactive node-based graphs. Branch, annotate, and master your repertoire — all in your browser.',
    canonical: 'https://chessgraph.net/',
    ogImage: 'https://chessgraph.net/screenshots/chess-graph-after-e4.png',
  },
  {
    path: '/features',
    outputFile: 'features.html',
    title: 'Chess Opening Tree Features — Chess Graph',
    description:
      'Explore all Chess Graph features: interactive game tree, board annotations, PGN import, keyboard shortcuts, and more.',
    canonical: 'https://chessgraph.net/features',
    ogImage: 'https://chessgraph.net/screenshots/features/game-tree.png',
  },
  {
    path: '/not-found',
    outputFile: '404.html',
    title: 'Page Not Found — Chess Graph',
    description: 'The page you were looking for could not be found.',
    canonical: 'https://chessgraph.net/',
    ogImage: 'https://chessgraph.net/screenshots/chess-graph-after-e4.png',
  },
];

for (const route of routes) {
  console.log(`Pre-rendering ${route.path}...`);
  const appHtml = render(route.path);

  const html = template
    .replace('<div id="root"></div>', `<div id="root">${appHtml}</div>`)
    .replace(/<title>.*?<\/title>/, `<title>${route.title}</title>`)
    .replace(
      /(<meta name="description" content=").*?"/,
      `$1${route.description}"`,
    )
    .replace(
      /(<link rel="canonical" href=").*?"/,
      `$1${route.canonical}"`,
    )
    .replace(
      /(<meta property="og:title" content=").*?"/,
      `$1${route.title}"`,
    )
    .replace(
      /(<meta property="og:description" content=").*?"/,
      `$1${route.description}"`,
    )
    .replace(
      /(<meta property="og:url" content=").*?"/,
      `$1${route.canonical}"`,
    )
    .replace(
      /(<meta property="og:image" content=").*?"/,
      `$1${route.ogImage}"`,
    )
    .replace(
      /(<meta name="twitter:title" content=").*?"/,
      `$1${route.title}"`,
    )
    .replace(
      /(<meta name="twitter:description" content=").*?"/,
      `$1${route.description}"`,
    )
    .replace(
      /(<meta name="twitter:image" content=").*?"/,
      `$1${route.ogImage}"`,
    );

  const outputPath = path.join(distDir, route.outputFile);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, html);
  console.log(`  → ${route.outputFile}`);
}

console.log('Pre-rendering complete!');
