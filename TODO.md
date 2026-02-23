# TODO

## High Priority

- ~~Replace `alert()` in import error (`EditorTopBar.tsx`) with a styled modal~~ Done — last remaining native browser dialog replaced with ConfirmDialog
- ~~Lock interactivity toggle by default (interactivity disabled)~~ Done — graph nodes locked by default, toggle via Controls button
- ~~Arrow keys should move the game forwards and backwards~~ Done — Left/Right for parent/child, Up/Down for siblings

## Medium Priority

- Auto-detect transpositions and join nodes in the graph — FEN comparison across nodes
- ~~Buttons at the side of the board with: open in chess.com, open in lichess, etc.~~ Done — Chess.com and Lichess analysis links below the board
- Ability to draw arrows and paint squares of different colors on the board, saved per node
- The colors, comments, and tags of the root node should be the colors, comments, and tags of the entire graph. So they shoud show on the all graphs screen.

## Low Priority

- CI / CD
- Groupings (folders) of graphs
- More optional views: top-down, floating window
- Dark/light themes
- Convert the repertoire on my main obsidian as an example graph to show the users. Use the full lenght of the features (tags, colors, branches, transpositions, etc)

## Accessibility

- ~~Add aria-labels to icon-only buttons (back, color picker, delete)~~ Done — aria-labels on back link, color buttons, tag remove buttons, search input
- ~~Add dialog ARIA attributes (role, aria-modal, aria-labelledby)~~ Done — all 4 dialogs
- ~~Add semantic HTML landmarks (main, header, aside)~~ Done — EditorPage, EditorTopBar, Sidebar
- ~~Add form label associations in CreateRepertoireDialog~~ Done — htmlFor/id on name and side fields
- ~~Add aria-hidden to decorative SVGs on landing page~~ Done — 4 feature icons
- ~~Add accessible labels to external GitHub links~~ Done — "(opens in new tab)" suffix
- Add `role="menu"` and keyboard navigation to ContextMenu

## New Features

- v2: login

## Done

- ~~Using an alert for "Delete "My Repertoire"?" is ugly~~ — replaced with styled ConfirmDialog
- ~~"Clear Graph" button with a confirmation modal~~ — Clear button with red confirmation dialog

## Improvements
- Are we using too much storage? Should we implement a compression strategy to save the graphs on the browser?
- The details shown in the root node vs the rest change significantly and its confusing when you navigate the position. The moves and tags row disappear, the FEN row changes its hight because it has no characters inside. We should normalize all of that.
- Arrows dont appear on the bottom right overview of the graph.
- The left and right dots at the side of the nodes look ugly. Remove them completely.

