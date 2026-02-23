# TODO

## High Priority

- ~~Replace `alert()` in import error (`EditorTopBar.tsx`) with a styled modal~~ Done — last remaining native browser dialog replaced with ConfirmDialog
- ~~Lock interactivity toggle by default (interactivity disabled)~~ Done — graph nodes locked by default, toggle via Controls button
- ~~Arrow keys should move the game forwards and backwards~~ Done — Left/Right for parent/child, Up/Down for siblings

## Medium Priority

- Auto-detect transpositions and join nodes in the graph — FEN comparison across nodes
- Buttons at the side of the board with: open in chess.com, open in lichess, etc.
- Ability to draw arrows and paint squares of different colors on the board, saved per node

## Low Priority

- CI / CD
- Groupings (folders) of graphs
- More optional views: top-down, floating window
- Dark/light themes
- Convert the repertoire on my main obsidian as an example graph to show the users

## Accessibility

- Add aria-labels to icon-only buttons (back, color picker, delete)
- Add `role="menu"` and keyboard navigation to ContextMenu

## New Features

- v2: login

## Done

- ~~Using an alert for "Delete "My Repertoire"?" is ugly~~ — replaced with styled ConfirmDialog
- ~~"Clear Graph" button with a confirmation modal~~ — Clear button with red confirmation dialog
