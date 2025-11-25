import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/seedr-api': {
        target: 'https://www.seedr.cc',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/seedr-api/, ''),
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            const seedrCookie = req.headers['x-seedr-cookie'];
            if (seedrCookie) {
              proxyReq.setHeader('Cookie', seedrCookie);
            }
          });
        }
      }
    }
  }
})
