import fetch from 'node-fetch';

export default async function handler(req, res) {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // Get path from query (set by vercel.json rewrite)
    let { path, ...queryParams } = req.query;

    // Handle array case if Vercel passes it as array
    if (Array.isArray(path)) {
        path = path.join('/');
    }

    // Fallback if path is missing
    if (!path) {
        path = '';
    }

    // Clean up the path
    path = path.replace(/^\/+/, '');

    // Reconstruct query string
    const queryString = new URLSearchParams(queryParams).toString();

    // Determine base path: /auth/login is at root, others are likely under /rest
    // The user specifically pointed out https://www.seedr.cc/auth/login
    let baseUrl = 'https://www.seedr.cc/rest';
    if (path.startsWith('auth/') || path.startsWith('oauth/')) {
        baseUrl = 'https://www.seedr.cc';
    }

    const targetUrl = `${baseUrl}/${path}${queryString ? '?' + queryString : ''}`;
    res.status(500).json({ error: 'Proxy error', details: error.message });
}
}
