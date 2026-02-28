# TODO

## High Priority

- ~~Pre-render /repertoires page for SSR (crawlers were getting homepage meta tags)~~ Done
- ~~Fix /repertoires 404 on live site (removed Vercel rewrite, now served as static HTML)~~ Done
- ~~Fix www vs non-www canonical mismatch — all URLs now use `www.chessgraph.net` to match Vercel's primary domain~~ Done

## Medium Priority

- ~~Fix JSON-LD `url` field — was hardcoded to homepage on all pages~~ Done
- ~~Add `og:site_name`, `og:locale`, `robots` meta tags to index.html~~ Done
- ~~Add `noindex` to 404 page~~ Done
- ~~Add breadcrumb structured data to /features and /repertoires~~ Done
- ~~Auto-generate sitemap.xml at build time with current date~~ Done
- ~~SEO audit fixes: keyword-rich meta descriptions, OG image dimensions, Twitter desc fix, FAQ schema, cache headers, SSR content for /repertoires~~ Done


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

