import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/seedr-proxy': {
        target: 'https://www.seedr.cc/rest',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/seedr-proxy/, ''),
        configure: (proxy, _options) => {
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
