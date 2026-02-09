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
