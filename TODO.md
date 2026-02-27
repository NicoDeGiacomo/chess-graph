# TODO

## High Priority

- PGN import — paste or upload a PGN file and auto-generate the graph (chess.js already supports `loadPgn()`)
- Keyboard-driven move entry — type moves in algebraic notation (e.g. "e4", "Nf3") to add nodes without clicking the board
- ~~Sometimes quite randomly the arrows start working backwards (up goes to the down node and down goes to the up node)~~ Done — siblings now sorted by visual y-position

## Medium Priority

- Sidebar graph switcher — jump between graphs without going back to All Graphs page
- ~~Collapse/expand subtrees — click to collapse a branch in the graph for deep repertoires~~ Done
- ~~Undo/redo — Ctrl+Z / Ctrl+Shift+Z to undo last move addition or deletion~~ Done

## Low Priority

- Example repertoire — ship a pre-built demo graph showcasing tags, colors, transpositions, etc. for onboarding
- Groupings (folders) of graphs
- More optional views: top-down, floating window
- Convert the repertoire on my main obsidian as an example graph to show the users. Use the full length of the features (tags, colors, branches, transpositions, etc)

## Accessibility

- ...

## New Features

- v2: login

## Done

- ~~Dark/light theme support with inline toggle on every page~~
- ~~Collapse/expand subtrees — double-click to collapse, badge shows +N hidden count, ArrowRight expands~~
- ~~Undo/redo — snapshot-based undo for all tree mutations, Ctrl+Z / Ctrl+Shift+Z, toolbar buttons~~

## Improvements

- Are we using too much storage? Should we implement a compression strategy to save the graphs on the browser?

## Security

- Should we make sure editing the json of the graph is not possible / detect when it was tampered? Is that a security risk?
- Should we save a file different that .json? To hide a bit the functionality to avoid tampering. Should/can we use a custom .chessgraph for example? Can/should it be a binary or something else?

## Non Code 
- Check all features are documented to the user in some page.
- Re-Run a SEO skill check
- Reddit, Threads, Twitter, Chess.com, Lichess, Chess Forums, Product Hunt, etc, posts.

