import axios from 'axios';

// Configuration
// Configuration
const YTS_BASE_URL = '/yts';
// Use local proxy path defined in vite.config.js
const SEEDR_BASE_URL = '/seedr';
// CORS Proxy no longer needed for Seedr as Vite proxies it.
// YTS might still need it if it doesn't support CORS, but usually it does.
// If YTS fails, we can add a proxy for it too.
const CORS_PROXY = 'https://corsproxy.io/?';


const api = axios.create({
    headers: {
        'Content-Type': 'application/json',
    }
});

// Helper to get headers with cookies and potential Bearer token
const getHeaders = (isForm = false) => {
    const headers = {
        'Content-Type': isForm ? 'application/x-www-form-urlencoded' : 'application/json'
    };

    const storedCookies = localStorage.getItem('seedr_cookies');
    console.log('getHeaders: storedCookies exists?', !!storedCookies);
    if (storedCookies) {
        try {
            const cookies = JSON.parse(storedCookies);
            console.log('getHeaders: parsed cookies', cookies);

            // 1. Send as custom header 'x-seedr-cookie'.
            // Vite proxy (vite.config.js) will rewrite this to 'Cookie' before sending to Seedr.
            // This bypasses browser restrictions on setting 'Cookie' header directly.
            const cookieString = cookies.map(c => c.split(';')[0]).join('; ');
            headers['x-seedr-cookie'] = cookieString;

            // 2. Keep Authorization Bearer token as a backup
            const sessionCookie = cookies.find(c => c.trim().startsWith('RSESS_session='));
            if (sessionCookie) {
                const token = sessionCookie.split('=')[1].split(';')[0];
                console.log('getHeaders: found token', token);
                if (token) {
                    headers['Authorization'] = `Bearer ${token}`;
                }
            }
        } catch (e) {
            console.error("Error parsing cookies", e);
        }
    } else {
        console.warn('getHeaders: No seedr_cookies in localStorage. User might need to re-login.');
    }
    return headers;
};

export const movies = {
    getTrending: (page = 1) => api.get(`${YTS_BASE_URL}/list_movies.json?sort_by=download_count&limit=20&page=${page}`),
    getTopRated: (page = 1) => api.get(`${YTS_BASE_URL}/list_movies.json?sort_by=rating&limit=20&page=${page}`),
    getAction: (page = 1) => api.get(`${YTS_BASE_URL}/list_movies.json?genre=action&limit=20&page=${page}`),
    getComedy: (page = 1) => api.get(`${YTS_BASE_URL}/list_movies.json?genre=comedy&limit=20&page=${page}`),
    search: (query) => api.get(`${YTS_BASE_URL}/list_movies.json?query_term=${query}`),
    getDetails: (id) => api.get(`${YTS_BASE_URL}/movie_details.json?movie_id=${id}&with_images=true&with_cast=true`),
    getSuggestions: (id) => api.get(`${YTS_BASE_URL}/movie_suggestions.json?movie_id=${id}`),
    getMovies: (params) => api.get(`${YTS_BASE_URL}/list_movies.json`, { params })
};

export const seedr = {
    login: async (username, password) => {
        const params = new URLSearchParams();
        params.append('username', username);
        params.append('password', password);
        params.append('rememberme', 'on');
        params.append('cf-turnstile-response', '');

        try {
            // Use local proxy path
            const response = await api.post(`${SEEDR_BASE_URL}/auth/login`, params, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });

            if (response.data && (response.data.success === true || response.data === 'OK')) {
                return response.data;
            }
            return response.data;
        } catch (error) {
            console.error("Seedr login error", error);
            throw error;
        }
    },

    getFiles: async () => {
        return api.get(`${SEEDR_BASE_URL}/fs/folder/0/items`, { headers: getHeaders() });
    },

    getFolder: async (folderId) => {
        return api.get(`${SEEDR_BASE_URL}/fs/folder/${folderId}/items`, { headers: getHeaders() });
    },

    scrapeTorrent: async (url) => {
        const params = new URLSearchParams();
        params.append('url', url);
        return api.post(`${SEEDR_BASE_URL}/scrape/html/torrents`, params, {
            headers: getHeaders(true)
        });
    },

    addMagnet: async (magnet) => {
        const params = new URLSearchParams();
        params.append('folder_id', '0');
        params.append('type', 'torrent');
        params.append('torrent_magnet', magnet);

        return api.post(`${SEEDR_BASE_URL}/task`, params, {
            headers: getHeaders(true)
        });
    },

    deleteItem: async (id) => {
        const params = new URLSearchParams();
        params.append('delete_arr', JSON.stringify([{ type: 'folder', id: id }]));
        return api.post(`${SEEDR_BASE_URL}/fs/batch/delete`, params, {
            headers: getHeaders(true)
        });
    },

    getVideo: async (fileId) => {
        return api.get(`${SEEDR_BASE_URL}/presentation/fs/item/${fileId}/video/url`, { headers: getHeaders() });
    }
};

export default api;
