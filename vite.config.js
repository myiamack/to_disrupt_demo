import path from 'node:path'
import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const root = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  // On GitHub Pages the game lives at /to_disrupt_demo/; locally it lives at /.
  base: process.env.GITHUB_PAGES === 'true' ? '/to_disrupt_demo/' : '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(root, 'src'),
    },
  },
})
