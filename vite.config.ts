import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/sciencefairai/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name].js',  // Removed hash for entry files
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name][extname]'  // Simplified asset naming
      }
    }
  },
  server: {
    port: 3000
  }
})