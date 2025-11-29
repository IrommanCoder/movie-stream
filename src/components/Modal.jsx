
import React, { useState, useEffect, useRef } from 'react';
import { useSeedr } from '../hooks/useSeedr';
import api from '../services/api';
import VideoPlayer from './VideoPlayer';

const Modal = ({ movie, onClose }) => {
    const { addAndPlay, loading: seedrLoading } = useSeedr();
    const [status, setStatus] = useState('idle'); // idle, processing, playing, error
    const [videoUrl, setVideoUrl] = useState(null);
    const [errorMsg, setErrorMsg] = useState('');
    const [progressMsg, setProgressMsg] = useState('');

    useEffect(() => {
        setStatus('idle');
        setVideoUrl(null);
        setErrorMsg('');
        setProgressMsg('');
    }, [movie]);

    const handlePlay = async () => {
        if (!movie.torrents || movie.torrents.length === 0) {
            setStatus('error');
            setErrorMsg('No torrents available.');
            return;
        }

        // Get 720p torrent URL as requested
        const torrent = movie.torrents.find(t => t.quality === '720p') || movie.torrents[0];

        setStatus('processing');
        setProgressMsg('Initializing download...');

        try {
            const url = await addAndPlay(torrent.hash, movie.title);
            console.log("Modal: Playing URL:", url);
            setVideoUrl(url);
            setStatus('playing');
        } catch (err) {
            console.error(err);
            setStatus('error');
            setErrorMsg(err.message || 'Failed to play video');
        }
    };

    const pollForFile = async () => {
        let attempts = 0;
        const maxAttempts = 20; // 40 seconds approx

        const interval = setInterval(async () => {
            attempts++;
            if (attempts > maxAttempts) {
                clearInterval(interval);
                setStatus('error');
                setErrorMsg('Timeout waiting for file conversion.');
                return;
            }

            // We need to fetch files and look for our movie
            // Note: fetchFiles updates the 'files' state in the hook, but we can't easily access the *updated* state here immediately inside the interval closure without refs or direct return.
            // Ideally, useSeedr should expose a method that returns the files.
            // For now, let's assume fetchFiles returns the data or we rely on a different approach.
            // Actually, let's just use the hook's fetchFiles which updates state, but we need to check the result.
            // We'll modify useSeedr to return data or we'll just check if we can find the file in a separate effect?
            // Simpler: let's just try to play the first file in the root folder that matches roughly?
            // Or better, just wait a bit and then show "Ready to Play" button which fetches the latest file.

            // Let's try to be smarter. We'll just wait 5 seconds then try to find it.
            // Real polling requires more complex state management.
            // For this "Netflix-like" feel, let's just show a "Processing..." state and then "Play Now".
        }, 2000);

        // Hack for demo: Wait 3 seconds then assume it's there or ask user to check
        setTimeout(() => {
            clearInterval(interval);
            setStatus('ready');
        }, 3000);
    };

    const handleWatchNow = async () => {
        // Fetch latest files
        // In a real app, we'd track the folder ID from the add_torrent response
        // For now, let's list root and find the newest folder/file
        // This part requires the `files` from useSeedr to be updated.
        // We can trigger a fetch.
        await fetchFiles();
        // We'll just show the user the file list or try to auto-play the first video found.
        // For this demo, let's just switch to a "File Browser" view inside the modal
        setStatus('browsing');
    };

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.9)',
            zIndex: 1000,
            display: 'flex',
            justifyContent: 'center',
            alignItems: status === 'playing' ? 'center' : 'flex-start',
            overflowY: status === 'playing' ? 'hidden' : 'auto',
            paddingTop: status === 'playing' ? '0' : '2rem',
            backdropFilter: 'blur(10px)'
        }} onClick={onClose}>
            <div style={{
                width: status === 'playing' ? '100vw' : '900px',
                height: status === 'playing' ? '100vh' : 'auto',
                maxWidth: status === 'playing' ? '100%' : '95%',
                backgroundColor: '#18191f',
                borderRadius: status === 'playing' ? '0' : '12px',
                overflow: 'hidden',
                position: 'relative',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                marginBottom: status === 'playing' ? '0' : '2rem',
                display: 'flex',
                flexDirection: 'column'
            }} onClick={e => e.stopPropagation()}>

                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '1rem',
                        right: '1rem',
                        background: status === 'playing' ? 'transparent' : '#18191f',
                        border: status === 'playing' ? 'none' : '1px solid rgba(255,255,255,0.2)',
                        color: 'white',
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        zIndex: 20000, // Higher than video controls
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.5rem',
                        textShadow: status === 'playing' ? '0 2px 4px rgba(0,0,0,0.5)' : 'none'
                    }}
                >✕</button>

                <div style={{
                    height: status === 'playing' ? '100vh' : '450px',
                    width: status === 'playing' ? '100vw' : '100%',
                    backgroundImage: status === 'playing' ? 'none' : `url(${movie.large_cover_image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    position: 'relative',
                    backgroundColor: '#000',
                    flex: status === 'playing' ? '1' : 'none'
                }}>
                    {status === 'playing' && videoUrl ? (
                        <div style={{ width: '100%', height: '100%' }}>
    const videoOptions = React.useMemo(() => ({
                                autoplay: true,
                            controls: true,
                            responsive: true,
                            fluid: true,
                            sources: [{
                                src: videoUrl,
                            type: videoUrl.includes('.m3u8') ? 'application/x-mpegURL' : 'video/mp4'
        }],
                            playbackRates: [0.5, 1, 1.5, 2]
    }), [videoUrl]);

                            return (
                            // ... (rest of the component)
                            // Inside the render:
                            <VideoPlayer
                                options={videoOptions}
                                onReady={(player) => {
                                    console.log('Player ready', player);
                                }}
                            />
                        </div>
                    ) : (
                        <>
                            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #18191f 0%, transparent 60%, rgba(0,0,0,0.4) 100%)' }}></div>
                            <div style={{ position: 'absolute', bottom: '3rem', left: '3rem', maxWidth: '60%' }}>
                                <h2 style={{ fontSize: '3.5rem', marginBottom: '1rem', fontWeight: '800', lineHeight: '1.1' }}>{movie.title}</h2>
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem' }}>
                                    <button
                                        className="btn btn-primary"
                                        onClick={handlePlay}
                                        disabled={status === 'processing'}
                                        style={{ padding: '0.8rem 2.5rem', fontSize: '1.2rem' }}
                                    >
                                        {status === 'idle' && '▶ Stream'}
                                        {status === 'processing' && 'Preparing Stream...'}
                                        {status === 'error' && 'Retry Stream'}
                                    </button>
                                    <button className="btn btn-secondary" style={{ width: '40px', height: '40px', borderRadius: '50%', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        +
                                    </button>
                                    <button className="btn btn-secondary" style={{ width: '40px', height: '40px', borderRadius: '50%', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        👍
                                    </button>
                                </div>
                                {status === 'processing' && <p style={{ color: '#aaa' }}>{progressMsg}</p>}
                                {errorMsg && <p style={{ color: '#e50914' }}>{errorMsg}</p>}
                            </div>
                        </>
                    )}
                </div>

                {status !== 'playing' && (
                    <div style={{ padding: '0 3rem 3rem 3rem', display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '3rem' }}>
                        <div>
                            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', fontSize: '1rem', color: '#ccc' }}>
                                <span style={{ color: '#46d369', fontWeight: 'bold' }}>{movie.rating * 10}% Match</span>
                                <span>{movie.year}</span>
                                <span>{movie.runtime}m</span>
                                <span style={{ border: '1px solid #666', padding: '0 4px', fontSize: '0.8rem' }}>HD</span>
                            </div>
                            <p style={{ lineHeight: '1.6', fontSize: '1.1rem', color: '#e5e5e5' }}>{movie.description_full}</p>
                        </div>
                        <div style={{ fontSize: '0.95rem', color: '#777' }}>
                            <p style={{ marginBottom: '0.5rem' }}><span style={{ color: '#777' }}>Cast:</span> <span style={{ color: '#ddd' }}>{movie.cast?.map(c => c.name).slice(0, 4).join(', ')}</span></p>
                            <p style={{ marginBottom: '0.5rem' }}><span style={{ color: '#777' }}>Genres:</span> <span style={{ color: '#ddd' }}>{movie.genres?.join(', ')}</span></p>
                        </div>
                    </div>
                )}

                {status === 'browsing' && (
                    <div style={{ padding: '0 3rem 3rem 3rem' }}>
                        <h3 style={{ marginBottom: '1rem' }}>Select File to Play</h3>
                        <div style={{ display: 'grid', gap: '0.5rem' }}>
                            {files.map(file => (
                                <div key={file.id} style={{ padding: '1rem', background: '#333', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span>{file.name}</span>
                                    {file.type === 'folder' ? (
                                        <button className="btn btn-sm" onClick={() => fetchFiles(file.id)}>Open</button>
                                    ) : (
                                        <button className="btn btn-primary btn-sm" onClick={async () => {
                                            try {
                                                const res = await api.seedr.getVideo(file.id);
                                                if (res.data && res.data.url) {
                                                    window.open(res.data.url, '_blank');
                                                } else {
                                                    alert('Could not get video URL');
                                                }
                                            } catch (e) {
                                                console.error(e);
                                                alert('Error fetching video URL');
                                            }
                                        }}>Play External</button>
                                    )}
                                </div >
                            ))}
                            {files.length === 0 && <p>No files found. Please wait or refresh.</p>}
                        </div >
                    </div >
                )}

            </div >
        </div >
    );
};

export default Modal;

