import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

// On a GitHub Pages project site the app is served from /<repo>/, not /.
// The Pages workflow sets BASE_PATH; everywhere else this stays '/'.
const base = process.env.BASE_PATH || '/'

export default defineConfig({
  base,
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(process.cwd(), 'src') },
  },
  build: {
    target: 'es2020',
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three', '@react-three/fiber', '@react-three/drei'],
          gsap: ['gsap'],
        },
      },
    },
  },
})
