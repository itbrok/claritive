import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { crx } from '@crxjs/vite-plugin'
import manifest from './manifest.json' with { type: 'json' }
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    crx({ manifest }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'esnext',
    modulePreload: false,
    rollupOptions: {
      input: {
        sidepanel: 'sidepanel.html',
      },
    },
  },
  optimizeDeps: {
    include: ['@mlc-ai/web-llm', '@xenova/transformers']
  }
})
