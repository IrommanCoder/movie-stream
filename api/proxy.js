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
    delete headers['accept-encoding']; // Let node-fetch handle compression

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
        // Copy response headers
        response.headers.forEach((value, key) => {
            const lowerKey = key.toLowerCase();
            // STRIP WWW-Authenticate to prevent browser popup
            if (lowerKey === 'www-authenticate') return;
            // STRIP Content-Encoding because node-fetch decompresses it, but we were passing the header back
            if (lowerKey === 'content-encoding') return;
            // STRIP Content-Length because the decompressed size is different
            if (lowerKey === 'content-length') return;
            // STRIP Transfer-Encoding because Vercel handles chunking
            if (lowerKey === 'transfer-encoding') return;

            // Handle Set-Cookie: Strip Domain so it applies to the current domain (Vercel)
            if (lowerKey === 'set-cookie') {
                // value might be an array or string depending on node-fetch version/headers handling
                // node-fetch usually returns a string for single header, but Set-Cookie can be multiple.
                // However, response.headers.forEach iterates over each header. 
                // If multiple Set-Cookie, it might call this multiple times or pass a combined string?
                // node-fetch headers.forEach passes value as string. If multiple, it might be comma separated?
                // Actually, Set-Cookie is special. node-fetch might return it as a combined string or we might need raw()
                // But let's try simple string replacement first.

                // Remove "Domain=...;" or "Domain=..."
                let newValue = value.replace(/Domain=[^;]+;?/gi, '');
                // Also ensure Path is /
                newValue = newValue.replace(/Path=[^;]+;?/gi, 'Path=/;');

                // Remove Secure if on localhost (optional, but good for dev) - actually Vercel is HTTPS so Secure is fine.
                // But SameSite might be strict. Let's leave it unless it breaks.

                res.setHeader(key, newValue);
                return;
            }

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
