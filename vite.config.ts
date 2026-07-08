import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ isSsrBuild }) => ({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: isSsrBuild
      ? {}
      : {
          output: {
            manualChunks: {
              'chess': ['chess.js', 'react-chessboard'],
              'graph': ['@xyflow/react', '@xyflow/system', 'dagre'],
            },
          },
        },
  },
  test: {
    exclude: ['e2e/**', 'node_modules/**'],
    // jsdom exposes localStorage only on a non-opaque origin; set a real URL
    environmentOptions: {
      jsdom: { url: 'http://localhost/' },
    },
    // Node 26's inert global localStorage shadows jsdom's; install a working one
    setupFiles: ['./src/test-setup.ts'],
  },
}))
