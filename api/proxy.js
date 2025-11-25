import { createProxyMiddleware } from 'http-proxy-middleware';

export default function handler(req, res) {
    // Rewrite the X-Seedr-Cookie header to Cookie
    if (req.headers['x-seedr-cookie']) {
        req.headers['cookie'] = req.headers['x-seedr-cookie'];
        delete req.headers['x-seedr-cookie'];
    }

    const proxy = createProxyMiddleware({
        target: 'https://www.seedr.cc',
        changeOrigin: true,
        pathRewrite: {
            '^/seedr-proxy': '/rest', // Rewrite /seedr-proxy to /rest
        },
        onProxyReq: (proxyReq, req) => {
            // Ensure the cookie header is set on the proxy request
            if (req.headers['cookie']) {
                proxyReq.setHeader('Cookie', req.headers['cookie']);
            }
        },
    });

    return proxy(req, res);
}
