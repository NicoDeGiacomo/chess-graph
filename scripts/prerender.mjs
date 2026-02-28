import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, '..', 'dist');

const template = fs.readFileSync(path.join(distDir, 'index.html'), 'utf-8');

const { render } = await import(path.join(distDir, 'server', 'entry-server.js'));

const today = new Date().toISOString().split('T')[0];

const routes = [
  {
    path: '/',
    outputFile: 'index.html',
    title: 'Chess Graph — Visualize Your Opening Repertoire',
    description:
      'Explore chess openings as interactive node-based graphs. Branch, annotate, and master your repertoire — all in your browser.',
    canonical: 'https://chessgraph.net/',
    ogImage: 'https://chessgraph.net/screenshots/chess-graph-after-e4.png',
    sitemapPriority: '1.0',
  },
  {
    path: '/features',
    outputFile: 'features.html',
    title: 'Chess Opening Tree Features — Chess Graph',
    description:
      'Explore all Chess Graph features: interactive game tree, board annotations, PGN import, keyboard shortcuts, and more.',
    canonical: 'https://chessgraph.net/features',
    ogImage: 'https://chessgraph.net/screenshots/features/game-tree.png',
    sitemapPriority: '0.8',
    breadcrumbs: [
      { name: 'Home', url: 'https://chessgraph.net/' },
      { name: 'Features', url: 'https://chessgraph.net/features' },
    ],
  },
  {
    path: '/repertoires',
    outputFile: 'repertoires.html',
    title: 'My Graphs — Chess Graph',
    description:
      'Browse and manage your chess opening repertoires. Create, edit, and organize your variations in interactive graph form.',
    canonical: 'https://chessgraph.net/repertoires',
    ogImage: 'https://chessgraph.net/screenshots/chess-graph-after-e4.png',
    sitemapPriority: '0.6',
    breadcrumbs: [
      { name: 'Home', url: 'https://chessgraph.net/' },
      { name: 'My Graphs', url: 'https://chessgraph.net/repertoires' },
    ],
  },
  {
    path: '/not-found',
    outputFile: '404.html',
    title: 'Page Not Found — Chess Graph',
    description: 'The page you were looking for could not be found.',
    canonical: 'https://chessgraph.net/',
    ogImage: 'https://chessgraph.net/screenshots/chess-graph-after-e4.png',
    noindex: true,
  },
];

for (const route of routes) {
  console.log(`Pre-rendering ${route.path}...`);
  const appHtml = render(route.path);

  let html = template
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

  // Fix JSON-LD url field per page
  html = html.replace(
    /"url": "https:\/\/chessgraph\.net\/"/,
    `"url": "${route.canonical}"`,
  );

  // Add noindex for 404 page
  if (route.noindex) {
    html = html.replace(
      '<meta name="robots" content="index, follow" />',
      '<meta name="robots" content="noindex" />',
    );
  }

  // Add breadcrumb structured data
  if (route.breadcrumbs) {
    const breadcrumbLd = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: route.breadcrumbs.map((crumb, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: crumb.name,
        item: crumb.url,
      })),
    };
    html = html.replace(
      '</head>',
      `    <script type="application/ld+json">\n    ${JSON.stringify(breadcrumbLd, null, 2).replace(/\n/g, '\n    ')}\n    </script>\n  </head>`,
    );
  }

  const outputPath = path.join(distDir, route.outputFile);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, html);
  console.log(`  → ${route.outputFile}`);
}

// Generate sitemap.xml at build time
const sitemapRoutes = routes.filter((r) => !r.noindex);
const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapRoutes
  .map(
    (r) => `  <url>
    <loc>${r.canonical}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${r.sitemapPriority}</priority>
  </url>`,
  )
  .join('\n')}
</urlset>
`;
fs.writeFileSync(path.join(distDir, 'sitemap.xml'), sitemapXml);
console.log('  → sitemap.xml (generated)');

console.log('Pre-rendering complete!');
