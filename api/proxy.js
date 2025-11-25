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

    // Prepare headers
    const headers = { ...req.headers };
    delete headers.host;
    delete headers.connection;
    delete headers['content-length'];

    // Spoof User-Agent to look like a browser
    headers['user-agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

    // Rewrite X-Seedr-Cookie to Cookie
    if (headers['x-seedr-cookie']) {
        headers['cookie'] = headers['x-seedr-cookie'];
        delete headers['x-seedr-cookie'];
    }

    // Spoof Origin and Referer to bypass Seedr checks
    headers['origin'] = 'https://www.seedr.cc';
    headers['referer'] = 'https://www.seedr.cc/';

    // Prepare body
    let body = req.body;

    // Vercel parses body into object, but node-fetch expects string/buffer
    if (body && typeof body === 'object' && !['GET', 'HEAD'].includes(req.method)) {
        const contentType = headers['content-type'] || '';

        if (contentType.includes('application/x-www-form-urlencoded')) {
            body = new URLSearchParams(body).toString();
        } else if (contentType.includes('application/json')) {
            body = JSON.stringify(body);
        }
    }

    try {
        const response = await fetch(targetUrl, {
            method: req.method,
            headers: headers,
            body: ['GET', 'HEAD'].includes(req.method) ? null : body,
            redirect: 'manual'
        });

        // Copy response headers
        response.headers.forEach((value, key) => {
            // STRIP WWW-Authenticate to prevent browser popup
            if (key.toLowerCase() === 'www-authenticate') return;

            // Handle Set-Cookie if needed (though we use token/cookie from body usually)
            // But if Seedr sets cookies, we might want to pass them back or ignore them
            // depending on our auth strategy.
            // For now, let's pass everything except WWW-Authenticate
            res.setHeader(key, value);
        });

        // Send status
        res.status(response.status);

        // Send body
        const buffer = await response.buffer();
        res.send(buffer);

    } catch (error) {
        console.error('Proxy error:', error);
        res.status(500).json({ error: 'Proxy error', details: error.message });
    }
}
