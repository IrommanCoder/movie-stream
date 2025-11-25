import axios from 'axios';

const BASE_URL = '/api/seedr';

// Ensure cookies are sent with requests
axios.defaults.withCredentials = true;

const SeedrService = {
    // Login
    async login(username, password) {
        try {
            const formData = new URLSearchParams();
            formData.append('username', username);
            formData.append('password', password);

            const response = await axios.post(`${BASE_URL}/login`, formData, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });

            const data = response.data;

            if (data.success === true) {
                // Cookies are handled by the browser automatically now
                if (data.user_data) {
                    localStorage.setItem('seedr_user', JSON.stringify(data.user_data));
                }
                return { success: true };
            }

            return { success: false, error: 'Login failed' };
        } catch (error) {
            console.error('Seedr Login Error:', error);
            if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                this.logout();
            }
            return { success: false, error: error.response?.data?.error || error.message || 'Network error' };
        }
    },

    logout() {
        // Clear cookies (best effort)
        const cookies = document.cookie.split(";");
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i];
            const eqPos = cookie.indexOf("=");
            const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
            document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
        }
        localStorage.removeItem('seedr_user');
    },

    isLoggedIn() {
        return !!localStorage.getItem('seedr_user');
    },

    getUser() {
        const user = localStorage.getItem('seedr_user');
        return user ? JSON.parse(user) : null;
    },

    // Get Settings
    async getSettings() {
        if (!this.isLoggedIn()) return null;
        try {
            const response = await axios.get(`${BASE_URL}/settings`);
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
            const response = await axios.get(`${BASE_URL}/files`);
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
            const response = await axios.get(`${BASE_URL}/folder/${folderId}`);
            return response.data;
        } catch (error) {
            console.error('Error listing folder items:', error);
            return null;
        }
    },

    // Scrape Torrent (Not implemented in backend yet, skipping or adding placeholder)
    async scrapeTorrent(url) {
        // Placeholder or implement in backend if needed
        return null;
    },

    // Add Torrent
    async addTorrent(magnetLink) {
        if (!this.isLoggedIn()) return { success: false, error: 'Not logged in' };

        try {
            const formData = new URLSearchParams();
            formData.append('magnet', magnetLink);

            const response = await axios.post(`${BASE_URL}/torrent`, formData, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });

            const data = response.data;
            if (data.result === true || data.user_torrent_id) { // Seedr API returns result: true
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
            const data = folderId === 0 ? await this.listRootItems() : await this.listFolderItems(folderId);
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

    // Get Download Link (Not explicitly implemented in backend, but video url is)
    async getDownloadLink(fileId) {
        // Reuse video URL logic for now
        return this.getStreamManifest(fileId);
    },

    // Wait for Torrent Completion (Polling)
    async waitForTorrentCompletion(timeout = 120000) {
        if (!this.isLoggedIn()) return false;

        const startTime = Date.now();

        while (Date.now() - startTime < timeout) {
            try {
                const data = await this.listRootItems();
                if (data) {
                    if (!data.torrents || data.torrents.length === 0) {
                        return true;
                    }
                }
            } catch (error) {
                console.error('Error polling torrent status:', error);
            }
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
        return false;
    },

    // Get Stream Manifest
    async getStreamManifest(fileId) {
        if (!this.isLoggedIn()) return null;
        try {
            const response = await axios.get(`${BASE_URL}/video/${fileId}`);
            if (response.data && response.data.url) {
                return response.data.url;
            }
            return null;
        } catch (error) {
            console.error('Error fetching stream manifest:', error);
            return null;
        }
    },

    // Clear Account
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

            const deleteArr = [];
            folders.forEach(f => deleteArr.push({ type: 'folder', id: f.id.toString() }));
            files.forEach(f => deleteArr.push({ type: 'file', id: f.id.toString() }));

            await axios.post(`${BASE_URL}/delete`, { delete_arr: deleteArr });

            return { success: true };

        } catch (error) {
            console.error('Error clearing account:', error);
            return { success: false, error: error.message };
        }
    }
};

export default SeedrService;
