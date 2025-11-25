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
        secure: false,
        rewrite: (path) => path.replace(/^\/seedr-api/, ''),
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            // Remove the custom header so Seedr doesn't see it
            proxyReq.removeHeader('x-seedr-cookie');

            // Spoof User-Agent
            proxyReq.setHeader('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

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
