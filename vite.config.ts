import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
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
  },
})
