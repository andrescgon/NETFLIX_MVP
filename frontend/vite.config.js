import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // escucha en 0.0.0.0
    allowedHosts: [
      'ec2-54-196-222-22.compute-1.amazonaws.com', // tu DNS público
    ],
    hmr: {
      host: 'ec2-54-196-222-22.compute-1.amazonaws.com',
      port: 5173,
      protocol: 'ws'
    },
    proxy: {
      '/api': {
        target: process.env.VITE_BACKEND_URL || 'http://backend:8000',
        changeOrigin: true,
        secure: false,
      },
      '/media': {
        target: process.env.VITE_BACKEND_URL || 'http://backend:8000',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})