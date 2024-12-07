import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  root: 'src/html',  
  base: '/',
  build: {
    outDir: '../../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/html/index.html'),
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
