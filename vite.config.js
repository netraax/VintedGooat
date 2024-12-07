import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  root: 'src',
  publicDir: '../public',
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
      '@behaviors': resolve(__dirname, './src/behaviors'),
      '@css': resolve(__dirname, './css')
    }
  },
  css: {
    preprocessorOptions: {
      css: {
        additionalData: `@import "@css/style.css";`
      }
    }
  },
  server: {
    port: 3000,
    open: true
  }
})
