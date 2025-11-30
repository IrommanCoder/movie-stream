import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      // Whether to polyfill `node:` protocol imports.
      protocolImports: true,
    }),
  ],
  server: {
    proxy: {
      '/seedr': {
        target: 'https://www.seedr.cc',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/seedr/, ''),
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            // Rewrite x-seedr-cookie to Cookie header
            const seedrCookie = req.headers['x-seedr-cookie'];
            if (seedrCookie) {
              proxyReq.setHeader('Cookie', seedrCookie);
              // Optional: Remove the custom header if you want
              // proxyReq.removeHeader('x-seedr-cookie');
            }
          });
        }
      },
      '/yts': {
        target: 'https://yts.lt/api/v2',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/yts/, ''),
      }
    }
  }
})
