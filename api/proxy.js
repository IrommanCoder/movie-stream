import axios from 'axios';

export default async function handler(req, res) {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // Get path from query
    let { path, ...queryParams } = req.query;

    if (Array.isArray(path)) path = path.join('/');
    if (!path) path = '';
    path = path.replace(/^\/+/, '');

    const queryString = new URLSearchParams(queryParams).toString();

    // Determine base URL
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
    headers['accept-encoding'] = 'identity'; // Disable compression to ensure we can parse body

    // Spoof headers
    headers['user-agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
    headers['referer'] = 'https://www.seedr.cc/';
    headers['origin'] = 'https://www.seedr.cc';

    // Handle Cookie Rewrite
    if (headers['x-seedr-cookie']) {
        headers['cookie'] = headers['x-seedr-cookie'];
        delete headers['x-seedr-cookie'];
    }

    // Prepare body
    let data = req.body;
    if (req.method === 'GET' || req.method === 'HEAD') {
        data = undefined;
    } else if (headers['content-type']?.includes('application/x-www-form-urlencoded')) {
        data = new URLSearchParams(req.body).toString();
    }

    try {
        const response = await axios({
            method: req.method,
            url: targetUrl,
            headers: headers,
            data: data,
            responseType: 'arraybuffer', // Get raw buffer
            validateStatus: () => true, // Don't throw on 4xx/5xx
            maxRedirects: 0 // Manual redirect handling
        });

        // Copy response headers
        Object.entries(response.headers).forEach(([key, value]) => {
            const lowerKey = key.toLowerCase();
            if (['content-length', 'content-encoding', 'transfer-encoding', 'connection', 'www-authenticate'].includes(lowerKey)) return;

            // Handle Set-Cookie
            if (lowerKey === 'set-cookie') {
                let cookies = Array.isArray(value) ? value : [value];
                cookies = cookies.map(c => c.replace(/Domain=[^;]+;?/gi, '').replace(/Path=[^;]+;?/gi, 'Path=/;'));
                res.setHeader(key, cookies);
                return;
            }

            res.setHeader(key, value);
        });

        // Send status
        res.status(response.status);

        // Inject cookies for login
        if (path.includes('auth/login') && response.headers['set-cookie']) {
            try {
                const jsonBody = JSON.parse(response.data.toString());
                // Normalize to array
                const cookies = response.headers['set-cookie'];
                jsonBody.cookies = Array.isArray(cookies) ? cookies : [cookies];
                res.json(jsonBody);
                return;
            } catch (e) {
                console.error('Error injecting cookies:', e);
            }
        }

        // Send body
        res.send(response.data);

    } catch (error) {
        console.error('Proxy error:', error.message);
        res.status(500).json({
            error: 'Proxy Error',
            message: error.message,
            details: error.response?.data?.toString() || 'No details'
        });
    }
}
