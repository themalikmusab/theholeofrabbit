import { defineConfig } from 'vite'
import path from 'path'
import { copyFileSync } from 'fs'

export default defineConfig({
  base: '/theholeofrabbit/',
  build: {
    outDir: 'docs',
    emptyOutDir: true,
    assetsDir: 'assets',
    sourcemap: false
  },
  plugins: [
    {
      name: 'copy-nojekyll',
      closeBundle() {
        try {
          copyFileSync('.nojekyll', 'docs/.nojekyll')
        } catch (e) {
          console.log('Note: .nojekyll file not found, skipping copy')
        }
      }
    }
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@assets': path.resolve(__dirname, './assets')
    }
  },
  server: {
    port: 3000,
    open: true
  }
})
