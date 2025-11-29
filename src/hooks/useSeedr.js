import { useState, useCallback } from 'react';
import { seedr } from '../services/api';
// import parseTorrent from 'parse-torrent'; // This might be causing issues if it's a mix of CJS/ESM
import * as parseTorrentLib from 'parse-torrent';
const parseTorrent = parseTorrentLib.default || parseTorrentLib;
const toMagnetURI = parseTorrentLib.toMagnetURI || parseTorrent.toMagnetURI;
import { Buffer } from 'buffer';
import axios from 'axios';

export const useSeedr = () => {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchFiles = useCallback(async (folderId = '0') => {
        setLoading(true);
        try {
            const res = folderId === '0' ? await seedr.getFiles() : await seedr.getFolder(folderId);
            if (res.data.folders || res.data.files) {
                const items = [
                    ...(res.data.folders || []).map(f => ({ ...f, type: 'folder' })),
                    ...(res.data.files || []).map(f => ({ ...f, type: 'file' }))
                ];
                setFiles(items);
                return res.data; // Return full data for polling
            } else {
                setFiles([]);
                return null;
            }
        } catch (err) {
            setError(err.message);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    // Recursive function to find the first video file
    const findVideoFile = async (folderId) => {
        const res = await seedr.getFolder(folderId);
        const data = res.data;

        // Check files in current folder - Prioritize MP4 for browser support
        const mp4 = data.files.find(f => f.name.endsWith('.mp4'));
        if (mp4) return mp4;

        const otherVideo = data.files.find(f => f.name.endsWith('.mkv') || f.name.endsWith('.avi'));
        if (otherVideo) return otherVideo;

        // Check subfolders
        for (const folder of data.folders) {
            const found = await findVideoFile(folder.id);
            if (found) return found;
        }
        return null;
    };

    const addAndPlay = async (hashOrMagnet, title = 'video') => {
        setLoading(true);
        try {
            // 0. Clean Root Folder
            console.log("Cleaning root folder...");
            const rootFiles = await seedr.getFiles();
            if (rootFiles.data.folders) {
                for (const folder of rootFiles.data.folders) {
                    await seedr.deleteItem(folder.id);
                }
            }
            if (rootFiles.data.files) {
                for (const file of rootFiles.data.files) {
                    await seedr.deleteItem(file.id);
                }
            }
            if (rootFiles.data.torrents) {
                for (const torrent of rootFiles.data.torrents) {
                    await seedr.deleteItem(torrent.id);
                }
            }

            // 1. Construct Magnet Link
            let magnet;
            if (hashOrMagnet.startsWith('magnet:')) {
                magnet = hashOrMagnet;
            } else {
                // Construct magnet from hash
                console.log("Constructing magnet from hash:", hashOrMagnet);
                const trackers = [
                    "udp://open.demonii.com:1337/announce",
                    "udp://tracker.openbittorrent.com:80",
                    "udp://tracker.coppersurfer.tk:6969",
                    "udp://glotorrents.pw:6969/announce",
                    "udp://tracker.opentrackr.org:1337/announce",
                    "udp://torrent.gresille.org:80/announce",
                    "udp://p4p.arenabg.com:1337",
                    "udp://tracker.leechers-paradise.org:6969"
                ];
                const trParams = trackers.map(tr => `&tr=${encodeURIComponent(tr)}`).join('');
                magnet = `magnet:?xt=urn:btih:${hashOrMagnet}&dn=${encodeURIComponent(title)}${trParams}`;
            }

            // 2. Add Magnet
            console.log("Adding magnet to Seedr...", magnet);
            const addRes = await seedr.addMagnet(magnet);
            if (!addRes.data.success && addRes.data.result !== true) throw new Error("Failed to add torrent");

            const addedTitle = addRes.data.title;
            console.log("Added:", addedTitle);

            // 3. Poll for completion
            return new Promise((resolve, reject) => {
                let attempts = 0;
                const maxAttempts = 120; // 4 minutes

                const interval = setInterval(async () => {
                    attempts++;
                    console.log(`Polling attempt ${attempts}...`);

                    const data = await fetchFiles('0'); // Check root
                    console.log("Poll Data:", JSON.stringify(data));

                    // Check active torrents for progress
                    const activeTorrent = data.torrents.find(t =>
                        t.hash === addRes.data.torrent_hash ||
                        t.name === title ||
                        t.title === title
                    );

                    if (activeTorrent) {
                        if (activeTorrent.progress < 100) {
                            // Still downloading
                            console.log(`Progress: ${activeTorrent.progress}%`);
                            return;
                        }
                    }

                    // If torrent is gone or 100%, check for folder
                    const folder = data.folders.find(f => {
                        const folderName = f.path || f.name;
                        // Loose matching to handle title variations
                        return folderName.toLowerCase().includes(title.toLowerCase()) ||
                            title.toLowerCase().includes(folderName.toLowerCase());
                    });

                    if (folder) {
                        clearInterval(interval);
                        console.log("Folder found:", folder.path || folder.name, "ID:", folder.id);

                        // 4. Find Video File recursively
                        try {
                            const video = await findVideoFile(folder.id);
                            if (video) {
                                console.log("Found video file:", video.name, "ID:", video.id);
                                // 5. Get Stream URL
                                const videoUrlRes = await seedr.getVideo(video.id);
                                console.log("Stream URL response:", videoUrlRes.data);
                                if (videoUrlRes.data && videoUrlRes.data.url) {
                                    resolve(videoUrlRes.data.url);
                                } else {
                                    reject(new Error("Seedr did not return a stream URL"));
                                }
                            } else {
                                console.warn("No video file found in folder:", folder.name);
                                reject(new Error("No video file found in folder"));
                            }
                        } catch (findErr) {
                            console.error("Error finding video:", findErr);
                            reject(findErr);
                        }
                    } else if (attempts > maxAttempts) {
                        clearInterval(interval);
                        console.error("Timeout waiting for folder. Last data:", data);
                        reject(new Error("Timeout waiting for download"));
                    }
                }, 2000);
            });

        } catch (err) {
            console.error(err);
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return { files, loading, error, fetchFiles, addAndPlay };
};
