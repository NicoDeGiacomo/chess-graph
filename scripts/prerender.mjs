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
      'Free chess opening tree visualizer. Explore variations as interactive graphs, import PGN, annotate moves, and master your repertoire — no account needed.',
    canonical: 'https://www.chessgraph.net/',
    ogImage: 'https://www.chessgraph.net/screenshots/chess-graph-after-e4.png',
    ogImageWidth: 2400,
    ogImageHeight: 1636,
    sitemapPriority: '1.0',
    faqSchema: {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'How do I build an opening repertoire with Chess Graph?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Start from any position and add moves directly on the chess board. Each move creates a new node in your opening tree, letting you map out every variation you want to study.',
          },
        },
        {
          '@type': 'Question',
          name: 'How does the board sync with the graph?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Click any node in the graph to instantly load that position on the board. Make a move on the board and watch the graph update in real time.',
          },
        },
        {
          '@type': 'Question',
          name: 'Do I need an account to use Chess Graph?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'No. Chess Graph runs entirely in your browser. Your graphs are saved locally using IndexedDB — no sign-up, no server, no data collection. Export your data anytime as a backup.',
          },
        },
      ],
    },
  },
  {
    path: '/features',
    outputFile: 'features.html',
    title: 'Chess Opening Tree Features — Chess Graph',
    description:
      'Chess Graph features: interactive opening tree, board annotations with arrows, PGN import/export, keyboard shortcuts, and local-first privacy. Free, no sign-up.',
    canonical: 'https://www.chessgraph.net/features',
    ogImage: 'https://www.chessgraph.net/screenshots/features/game-tree.png',
    ogImageWidth: 1280,
    ogImageHeight: 800,
    sitemapPriority: '0.8',
    breadcrumbs: [
      { name: 'Home', url: 'https://www.chessgraph.net/' },
      { name: 'Features', url: 'https://www.chessgraph.net/features' },
    ],
  },
  {
    path: '/repertoires',
    outputFile: 'repertoires.html',
    title: 'My Graphs — Chess Graph',
    description:
      'Browse and manage your chess opening repertoires. Create, edit, and organize your variations in interactive graph form.',
    canonical: 'https://www.chessgraph.net/repertoires',
    ogImage: 'https://www.chessgraph.net/screenshots/chess-graph-after-e4.png',
    ogImageWidth: 2400,
    ogImageHeight: 1636,
    sitemapPriority: '0.6',
    breadcrumbs: [
      { name: 'Home', url: 'https://www.chessgraph.net/' },
      { name: 'My Graphs', url: 'https://www.chessgraph.net/repertoires' },
    ],
  },
  {
    path: '/not-found',
    outputFile: '404.html',
    title: 'Page Not Found — Chess Graph',
    description: 'The page you were looking for could not be found.',
    canonical: 'https://www.chessgraph.net/',
    ogImage: 'https://www.chessgraph.net/screenshots/chess-graph-after-e4.png',
    ogImageWidth: 2400,
    ogImageHeight: 1636,
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

  // Set OG image dimensions per route
  if (route.ogImageWidth && route.ogImageHeight) {
    html = html
      .replace(
        /(<meta property="og:image:width" content=").*?"/,
        `$1${route.ogImageWidth}"`,
      )
      .replace(
        /(<meta property="og:image:height" content=").*?"/,
        `$1${route.ogImageHeight}"`,
      );
  }

  // Fix JSON-LD url field per page
  html = html.replace(
    /"url": "https:\/\/www\.chessgraph\.net\/"/,
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

  // Add FAQ structured data
  if (route.faqSchema) {
    html = html.replace(
      '</head>',
      `    <script type="application/ld+json">\n    ${JSON.stringify(route.faqSchema, null, 2).replace(/\n/g, '\n    ')}\n    </script>\n  </head>`,
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
