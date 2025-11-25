import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SeedrService from '../services/seedr';
import api from '../services/api';

const Modal = ({ movie, onClose, onPlayStream }) => {
    const navigate = useNavigate();
    const [fullDetails, setFullDetails] = useState(null);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState('');

    useEffect(() => {
        const fetchDetails = async () => {
            const data = await api.getMovieDetails(movie.id);
            if (data && data.movie) {
                setFullDetails(data.movie);
            }
        };
        fetchDetails();
    }, [movie.id]);

    const displayMovie = fullDetails || movie;
    if (!displayMovie) return null;

    const bgImage = displayMovie.background_image_original || displayMovie.background_image || displayMovie.medium_cover_image;

    const handleSeedrAction = async () => {
        if (!SeedrService.isLoggedIn()) {
            alert('Please login to Seedr first!');
            return;
        }

        setLoading(true);
        setStatus('Clearing Seedr account...');

        // 1. Clear Account
        await SeedrService.clearAccount();

        // 2. Find 720p Torrent
        const torrents = displayMovie.torrents || [];
        const torrent720 = torrents.find(t => t.quality === '720p') || torrents[0];

        if (!torrent720) {
            setStatus('No torrent found.');
            setLoading(false);
            return;
        }

        setStatus('Adding torrent to Seedr...');
        const magnet = `magnet:?xt=urn:btih:${torrent720.hash}&dn=${encodeURIComponent(displayMovie.title)}`;

        const result = await SeedrService.addTorrent(magnet);

        if (result.success) {
            setStatus('Torrent added! Waiting for download to complete...');

            const completed = await SeedrService.waitForTorrentCompletion();

            if (completed) {
                setStatus('Torrent processed! Ready to stream.');
            } else {
                setStatus('Torrent download timed out. Please check Seedr manually.');
            }
        } else {
            setStatus(`Error: ${result.error}`);
        }
        setLoading(false);
    };

    const handlePlay = async () => {
        if (!SeedrService.isLoggedIn()) {
            alert('Please login to Seedr first!');
            return;
        }

        setLoading(true);
        setStatus('Finding video file...');

        const videoFile = await SeedrService.findVideoFile();

        if (videoFile) {
            setStatus('Getting stream manifest...');
            const link = await SeedrService.getStreamManifest(videoFile.id);
            if (link) {
                // Generate a random ID
                const id = Date.now().toString(36) + Math.random().toString(36).substr(2);

                // Store the link in localStorage with this ID
                // We can use a simple map or just prefix the key
                localStorage.setItem(`video_${id}`, link);

                // Navigate in same tab with the ID
                navigate(`/watch?id=${id}`);
            } else {
                setStatus('Failed to get stream manifest.');
            }
        } else {
            setStatus('Video file not found yet. Please wait for conversion.');
        }
        setLoading(false);
    };

    return (
        <div className="modal-overlay active" onClick={(e) => e.target.className.includes('modal-overlay') && onClose()}>
            <div className="modal">
                <div className="modal-close" onClick={onClose}>
                    <i className="fas fa-times"></i>
                </div>
                <img src={bgImage} className="modal-banner" alt="Banner" />
                <div className="modal-content">
                    <h2 className="modal-title">{displayMovie.title}</h2>
                    <div className="modal-meta">
                        <span className="modal-score">{displayMovie.rating * 10}% Match</span>
                        <span>{displayMovie.year}</span>
                        <span>{displayMovie.runtime} min</span>
                        <span>{displayMovie.genres ? displayMovie.genres.join(', ') : ''}</span>
                    </div>
                    <p className="modal-desc">{displayMovie.description_full}</p>

                    <div className="modal-actions">
                        <button className="btn btn-primary" onClick={handlePlay} disabled={loading}>
                            <i className="fas fa-play"></i> {loading ? 'Loading...' : 'Stream'}
                        </button>
                        <button className="btn btn-secondary" onClick={handleSeedrAction} disabled={loading}>
                            <i className="fas fa-bolt"></i> Prepare Stream (Seedr)
                        </button>
                    </div>

                    {status && <div style={{ marginTop: '20px', color: '#46d369', fontWeight: 'bold' }}>{status}</div>}

                    {/* Cast Section */}
                    {displayMovie.cast && (
                        <div className="modal-section">
                            <h3 className="section-title">Cast</h3>
                            <div className="cast-list">
                                {displayMovie.cast.map(actor => (
                                    <div key={actor.imdb_code || actor.name} className="cast-member">
                                        <img
                                            src={actor.url_small_image || 'https://via.placeholder.com/50'}
                                            alt={actor.name}
                                            onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/50'; }}
                                        />
                                        <span>{actor.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Modal;
