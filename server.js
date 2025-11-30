import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createProxyMiddleware } from 'http-proxy-middleware';
import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

// Proxy for Seedr
app.use('/seedr', createProxyMiddleware({
    target: 'https://www.seedr.cc',
    changeOrigin: true,
    pathRewrite: {
        '^/seedr': '', // remove /seedr prefix
    },
    onProxyReq: (proxyReq, req, res) => {
        // Forward the x-seedr-cookie header as Cookie
        const seedrCookie = req.headers['x-seedr-cookie'];
        if (seedrCookie) {
            proxyReq.setHeader('Cookie', seedrCookie);
        }
    }
}));

// Proxy for YTS
app.use('/yts', createProxyMiddleware({
    target: 'https://yts.lt/api/v2',
    changeOrigin: true,
    pathRewrite: {
        '^/yts': '', // remove /yts prefix
    }
}));

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// Handle React routing, return all requests to React app
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
