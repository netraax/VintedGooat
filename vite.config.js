import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  root: 'src',  // Changé de 'src/html' à 'src'
  base: '/',
  build: {
    outDir: '../dist', // Changé de '../../dist' à '../dist'
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/index.html'), // Changé de 'src/html/index.html'
      }
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@behaviors': resolve(__dirname, 'src/behaviors')
    }
  }
})
