import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  root: 'src',
  base: '/',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/index.html')
      }
    }
  },
  resolve: {
    alias: {
      '@css': resolve(__dirname, './css'),
      '@behaviors': resolve(__dirname, './src/behaviors')
    }
  },
  server: {
    port: 3000
  }
})
