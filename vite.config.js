import { defineConfig } from 'vite'

export default defineConfig({
  root: 'src',
  base: '/',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: 'src/index.html',
      },
      output: {
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'style.css') return 'assets/css/style.css'
          return 'assets/[name]-[hash][extname]'
        },
      },
    },
  }
})
