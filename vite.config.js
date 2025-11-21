import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig({
  base: '/theholeofrabbit/',
  build: {
    outDir: 'docs',
    emptyOutDir: true,
    assetsDir: 'assets',
    sourcemap: false
  },
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
