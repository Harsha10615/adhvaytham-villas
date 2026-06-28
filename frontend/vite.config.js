import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
const apiUrl = process.env.VITE_API_URL || 'http://localhost:5001';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: apiUrl,
        changeOrigin: true,
      },
      '/uploads': {
        target: apiUrl,
        changeOrigin: true,
      }
    }
  }
})

