# TODO

## High Priority

- ~~Fix `/repertoire/:id` rewrite returning 404 (changed destination from `/index.html` to `/` for cleanUrls compatibility)~~ Done

## Medium Priority

- ~~Align meta description mismatch on `/repertoires` between prerender and client~~ Done
- ~~Add `og:image:alt` meta tags to `index.html` and prerender script (per-route alt text)~~ Done
- ~~Add `twitter:site` and `twitter:creator` meta tags~~ Done
- ~~Add immutable cache headers for Vite-hashed `/assets/*` files~~ Done
- ~~Add "My Graphs" link to footers on landing and features pages (internal linking to `/repertoires`)~~ Done

## Low Priority

- More optional views: top-down, floating window

## Accessibility

- ...

## New Features

- v2: login

## Improvements


## Security


## Non Code
- Reddit, Threads, Twitter, Chess.com, Lichess, Chess Forums, Product Hunt, etc, posts.
- Vercel Dashboard: ensure `www.chessgraph.net` is primary domain (for 301 instead of 307 redirects)
- Google Search Console: submit `/features` and `/repertoires` for indexing
- Validate structured data at https://search.google.com/test/rich-results
- Test OG tags at https://www.opengraph.xyz/

