# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Chess Graph is a chess game tree visualization app. Players can explore chess variations as interactive node-based graphs alongside a chess board. Built with React 19, TypeScript, and Vite 7.

## Commands

- **Dev server**: `npm run dev`
- **Build**: `npm run build` (runs `tsc -b` then `vite build`)
- **Lint**: `npm run lint`
- **Preview production build**: `npm run preview`
- **Test**: `npm test` (runs Vitest)
- **Test watch**: `npm run test:watch`
- **E2E test**: `npm run test:e2e` (runs Playwright)

## Architecture

```
React 19 + TypeScript + Tailwind CSS v4
├── @xyflow/react — graph visualization for the game tree
├── react-chessboard — interactive chess board component
├── chess.js — move validation, game state, PGN parsing
├── dagre — automatic graph layout (node positioning)
├── dexie — IndexedDB wrapper for local persistence
└── uuid — unique IDs for games/nodes
```

The app combines a chess board view (react-chessboard) with a graph view (@xyflow/react) where nodes represent positions and edges represent moves. chess.js handles game logic, dagre handles layout, and dexie persists data client-side.

## Tech Stack Details

- **Tailwind CSS v4** — imported via `@import "tailwindcss"` in index.css, integrated through `@tailwindcss/vite` plugin
- **ESM throughout** — `"type": "module"` in package.json
- **Strict TypeScript** — `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch` all enabled
- **ESLint 9** flat config with typescript-eslint and react-hooks plugins

## Git Rules

- **Never add `Co-Authored-By` lines to commit messages.** Do not include any co-author trailers.

## Agent Workflow

After every code change, always:

1. Run `npm run build` — fix any TypeScript errors before proceeding
2. Run `npm run lint` — fix any lint errors
3. Run `npm test` — ensure all unit tests pass
4. Run `npm run test:e2e` — ensure all E2E tests pass
5. Write new tests for any new or changed functionality

## TODO File Management

After every development session, always update `TODO.md`:

- Mark completed items with ~~strikethrough~~ and "Done"
- Add newly discovered issues (warnings, errors, incomplete features)
- Add any ideas or improvements noticed during development
- **Always inform the user** when editing the TODO file

## TODO

- ~~All graphs page view (browse all repertoires as a grid/list)~~ Done
- ~~Root node tags & comments shown on graph cards~~ Done
