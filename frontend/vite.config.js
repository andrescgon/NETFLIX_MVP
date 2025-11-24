import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 80,
    host: true, 
    allowedHosts: [
      'ec2-54-196-222-22.compute-1.amazonaws.com', 
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