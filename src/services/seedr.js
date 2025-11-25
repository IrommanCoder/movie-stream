import axios from 'axios';

const BASE_URL = '/seedr-api';

const SeedrService = {
    // Helper to get headers with Basic Auth
    getHeaders() {
        const user = localStorage.getItem('seedr_user_creds');
        if (!user) return {};

        const { username, password } = JSON.parse(user);
        const auth = btoa(`${username}:${password}`);

        return {
            'Authorization': `Basic ${auth}`
        };
    },

    // Login (Just verifies credentials and stores them)
    async login(username, password) {
        try {
            // Test credentials by fetching settings
            const auth = btoa(`${username}:${password}`);
            const response = await axios.get(`${BASE_URL}/account/settings`, {
                headers: {
                    'Authorization': `Basic ${auth}`
                }
            });

            if (response.status === 200) {
                // Store credentials for future requests
                localStorage.setItem('seedr_user_creds', JSON.stringify({ username, password }));

                // Store user info
                const data = response.data;
                // Settings endpoint returns { settings: ..., account: ... }
                // We need to map it to the user object format expected by the app
                const account = data.account || {};

                localStorage.setItem('seedr_user', JSON.stringify({
                    username: account.username || username,
                    email: account.email || username,
                    user_id: account.user_id,
                    is_premium: account.premium
                }));

                return { success: true };
            }

            return { success: false, error: 'Login failed' };
        } catch (error) {
            console.error('Seedr Login Error:', error);
            return { success: false, error: 'Invalid credentials or network error' };
        }
    },

    logout() {
        localStorage.removeItem('seedr_user_creds');
        localStorage.removeItem('seedr_user');
        localStorage.removeItem('seedr_cookies'); // Cleanup old cookies
    },

    isLoggedIn() {
        return !!localStorage.getItem('seedr_user_creds');
    },

    getUser() {
        const user = localStorage.getItem('seedr_user');
        return user ? JSON.parse(user) : null;
    },

    // Get Settings
    async getSettings() {
        if (!this.isLoggedIn()) return null;
        try {
            const response = await axios.get(`${BASE_URL}/account/settings`, {
                headers: this.getHeaders()
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching settings:', error);
            return null;
        }
    },

    // List Root Items
    async listRootItems() {
        if (!this.isLoggedIn()) return null;
        try {
            const response = await axios.get(`${BASE_URL}/fs/folder/0/items`, {
                headers: this.getHeaders()
            });
            return response.data;
        } catch (error) {
            console.error('Error listing root items:', error);
            return null;
        }
    },

    // List Folder Items
    async listFolderItems(folderId) {
        if (!this.isLoggedIn()) return null;
        try {
            const response = await axios.get(`${BASE_URL}/fs/folder/${folderId}/items`, {
                headers: this.getHeaders()
            });
            return response.data;
        } catch (error) {
            console.error('Error listing folder items:', error);
            return null;
        }
    },

    // Scrape Torrent (Confirmed)
    async scrapeTorrent(url) {
        if (!this.isLoggedIn()) return null;
        try {
            const formData = new URLSearchParams();
            formData.append('url', url);

            const response = await axios.post(`${BASE_URL}/scrape/html/torrents`, formData, {
                headers: {
                    ...this.getHeaders(),
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error scraping torrent:', error);
            return null;
        }
    },

    // Add Torrent (Confirmed via v1.1.0 spec)
    async addTorrent(magnetLink) {
        if (!this.isLoggedIn()) return { success: false, error: 'Not logged in' };

        try {
            const formData = new URLSearchParams();
            formData.append('folder_id', '0');
            formData.append('type', 'torrent');
            formData.append('torrent_magnet', magnetLink);

            const response = await axios.post(`${BASE_URL}/task`, formData, {
                headers: {
                    ...this.getHeaders(),
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });

            const data = response.data;
            if (data.success === true || data.user_torrent_id) {
                return { success: true, title: data.title || 'Torrent added' };
            }
            return { success: false, error: data.error || 'Failed to add torrent' };

        } catch (error) {
            console.error('Error adding torrent:', error);
            return { success: false, error: error.message };
        }
    },

    // Find Video File (Recursive)
    async findVideoFile(folderId = 0) {
        if (!this.isLoggedIn()) return null;

        try {
            const data = await this.listFolderItems(folderId);
            if (!data) return null;

            const files = data.files || [];
            const videoFile = files.find(f => f.name.endsWith('.mp4') || f.name.endsWith('.mkv'));

            if (videoFile) {
                return videoFile;
            }

            const folders = data.folders || [];
            for (const folder of folders) {
                const found = await this.findVideoFile(folder.id);
                if (found) return found;
            }

            return null;
        } catch (error) {
            console.error('Error finding video:', error);
            return null;
        }
    },

    // Get Download Link
    async getDownloadLink(fileId) {
        if (!this.isLoggedIn()) return null;
        try {
            const response = await axios.get(`${BASE_URL}/download/file/${fileId}/url`, {
                headers: this.getHeaders()
            });
            if (response.data && response.data.url) {
                return response.data.url;
            }
            return null;
        } catch (error) {
            console.error('Error fetching download link:', error);
            return null;
        }
    },

    // Wait for Torrent Completion (Polling)
    async waitForTorrentCompletion(timeout = 120000) { // 2 minutes timeout
        if (!this.isLoggedIn()) return false;

        const startTime = Date.now();

        while (Date.now() - startTime < timeout) {
            try {
                const data = await this.listRootItems();
                if (data) {
                    // User requested: check if torrents array is empty
                    if (!data.torrents || data.torrents.length === 0) {
                        return true;
                    }
                    // If torrents exist, check progress (optional logging)
                    if (data.torrents.length > 0) {
                        console.log(`Torrent progress: ${data.torrents[0].progress}%`);
                    }
                }
            } catch (error) {
                console.error('Error polling torrent status:', error);
            }

            // Wait 2 seconds before next check
            await new Promise(resolve => setTimeout(resolve, 2000));
        }

        return false; // Timeout reached
    },

    // Get Stream Manifest
    async getStreamManifest(fileId) {
        if (!this.isLoggedIn()) return null;
        try {
            const response = await axios.get(`${BASE_URL}/presentation/fs/item/${fileId}/video/url`, {
                headers: this.getHeaders()
            });
            if (response.data && response.data.url) {
                return response.data.url;
            }
            return null;
        } catch (error) {
            console.error('Error fetching stream manifest:', error);
            return null;
        }
    },

    // Clear Account (Helper)
    async clearAccount() {
        if (!this.isLoggedIn()) return;
        try {
            const data = await this.listRootItems();
            if (!data) return;

            const folders = data.folders || [];
            const files = data.files || [];

            if (folders.length === 0 && files.length === 0) {
                return { success: true };
            }

            // Prepare batch delete array
            const deleteArr = [];
            folders.forEach(f => deleteArr.push({ type: 'folder', id: f.id.toString() }));
            files.forEach(f => deleteArr.push({ type: 'file', id: f.id.toString() }));

            // Use batch delete endpoint
            const formData = new URLSearchParams();
            formData.append('delete_arr', JSON.stringify(deleteArr));

            await axios.post(`${BASE_URL}/fs/batch/delete`, formData, {
                headers: {
                    ...this.getHeaders(),
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });

            return { success: true };

        } catch (error) {
            console.error('Error clearing account:', error);
            return { success: false, error: error.message };
        }
    }
};

export default SeedrService;
