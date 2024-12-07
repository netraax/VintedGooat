import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  root: 'src',
  base: '/',
  build: {
    outDir: '../dist',
    emptyOutDir: true
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@css': resolve(__dirname, 'css'),
      '@behaviors': resolve(__dirname, 'src/behaviors')
    }
  },
  server: {
    port: 3000,
    open: true,
    host: true
  }
})
