import fetch from 'node-fetch';

export default async function handler(req, res) {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const { path } = req.query;
    // Construct the target URL
    // req.url in Vercel functions might be just the path suffix or full path depending on rewrite
    // We rely on the rewrite mapping /seedr-api/* -> /api/proxy?path=* (if we used query)
    // But our vercel.json maps /seedr-api/:path* -> /api/proxy

    // Let's reconstruct the path. 
    // If the request is /seedr-api/auth/login, we want /rest/auth/login

    let targetPath = req.url.replace('/seedr-api', '/rest');
    // If the replacement didn't happen (e.g. direct call), force it or handle it
    if (!targetPath.startsWith('/rest')) {
        // Fallback or error, but let's assume the rewrite works as expected
        // or try to parse it from the request URL
        if (req.url.startsWith('/api/proxy')) {
            // If called directly or via some internal rewrite that exposes the function path
            // We might need to look at x-forwarded-path or similar, but let's stick to simple replacement
            // assuming the client calls /seedr-api/...
        }
    }

    const targetUrl = `https://www.seedr.cc${targetPath}`;

    // Prepare headers
    const headers = { ...req.headers };
    delete headers.host; // Remove host header to avoid conflicts
    delete headers.connection;
    delete headers['content-length']; // Let fetch calculate it

    // Rewrite X-Seedr-Cookie to Cookie
    if (headers['x-seedr-cookie']) {
        headers['cookie'] = headers['x-seedr-cookie'];
        delete headers['x-seedr-cookie'];
    }

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
