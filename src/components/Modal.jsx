
import React, { useState, useEffect, useMemo } from 'react';
import { useSeedr } from '../hooks/useSeedr';
import VideoPlayer from './VideoPlayer';

const Modal = ({ movie, onClose }) => {
    const { addAndPlay } = useSeedr();
    const [status, setStatus] = useState('idle'); // idle, processing, playing, error
    const [videoUrl, setVideoUrl] = useState(null);
    const [errorMsg, setErrorMsg] = useState('');
    const [progressMsg, setProgressMsg] = useState('');
    const [isHoveredPlay, setIsHoveredPlay] = useState(false);

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
        setProgressMsg('Preparing your stream...');

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

    // Memoize video options
    const videoOptions = useMemo(() => {
        if (!videoUrl) return null;
        return {
            autoplay: true,
            controls: true,
            responsive: true,
            fluid: true,
            sources: [{
                src: videoUrl,
                type: videoUrl.includes('.m3u8') ? 'application/x-mpegURL' : 'video/mp4'
            }],
            playbackRates: [0.5, 1, 1.5, 2]
        };
    }, [videoUrl]);

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            animation: 'fadeIn 0.4s cubic-bezier(0.33, 1, 0.68, 1) forwards',
            padding: status === 'playing' ? 0 : '20px'
        }} onClick={onClose}>

            {/* Backdrop with heavy blur */}
            <div style={{
                position: 'absolute',
                inset: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                backdropFilter: 'blur(60px)',
                WebkitBackdropFilter: 'blur(60px)',
                zIndex: -1
            }}></div>

            <div
                className={`modal-container ${status === 'playing' ? 'playing' : ''}`}
                style={{
                    backgroundColor: status === 'playing' ? '#000' : 'rgba(30, 30, 30, 0.6)',
                    boxShadow: '0 50px 100px -20px rgba(0, 0, 0, 0.8)',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                    color: '#fff',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif',
                    border: status === 'playing' ? 'none' : '1px solid rgba(255, 255, 255, 0.1)'
                }}
                onClick={e => e.stopPropagation()}
            >

                {/* Close Button */}
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '24px',
                        right: '24px',
                        background: 'rgba(20, 20, 20, 0.6)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: 'rgba(255, 255, 255, 0.8)',
                        width: '44px',
                        height: '44px',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        zIndex: 20000,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.2rem',
                        backdropFilter: 'blur(20px)',
                        transition: 'all 0.2s ease',
                        outline: 'none'
                    }}
                    onMouseEnter={e => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                        e.currentTarget.style.transform = 'scale(1.1)';
                        e.currentTarget.style.color = '#fff';
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.background = 'rgba(20, 20, 20, 0.6)';
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)';
                    }}
                >✕</button>

                {/* Content */}
                <div style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    overflowY: status === 'playing' ? 'hidden' : 'auto'
                }}>
                    {status === 'playing' && videoUrl && videoOptions ? (
                        <div style={{ width: '100%', height: '100%', background: '#000' }}>
                            <VideoPlayer options={videoOptions} />
                        </div>
                    ) : (
                        <>
                            {/* Hero Section */}
                            <div className="modal-hero">
                                {/* Background Image */}
                                <div style={{
                                    position: 'absolute',
                                    inset: 0,
                                    backgroundImage: `url(${movie.large_cover_image})`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center top',
                                    filter: 'brightness(0.9)'
                                }}></div>

                                {/* Gradient Overlay */}
                                <div style={{
                                    position: 'absolute',
                                    inset: 0,
                                    background: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.8) 80%, #000 100%)'
                                }}></div>

                                <div className="modal-hero-content">
                                    {/* Title */}
                                    <h2 style={{
                                        fontSize: 'clamp(2.5rem, 5vw, 5rem)',
                                        fontWeight: '800',
                                        lineHeight: '1',
                                        textShadow: '0 4px 24px rgba(0,0,0,0.5)',
                                        letterSpacing: '-0.03em',
                                        margin: 0,
                                        background: 'linear-gradient(to bottom, #fff 0%, #ddd 100%)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent'
                                    }}>{movie.title}</h2>

                                    {/* Metadata Row */}
                                    <div className="modal-metadata">
                                        <span style={{ color: '#4cd964', fontWeight: '700' }}>{movie.rating * 10}% Match</span>
                                        <span>{movie.year}</span>
                                        <span>{movie.runtime}m</span>
                                        <span style={{
                                            border: '1px solid rgba(255,255,255,0.6)',
                                            padding: '2px 6px',
                                            borderRadius: '4px',
                                            fontSize: '0.8rem',
                                            fontWeight: '700',
                                            backgroundColor: 'rgba(0,0,0,0.3)'
                                        }}>HD</span>
                                        <span className="genres">{movie.genres?.slice(0, 3).join(' • ')}</span>
                                    </div>

                                    {/* Actions Row */}
                                    <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginTop: '8px', flexWrap: 'wrap' }}>
                                        <button
                                            onClick={handlePlay}
                                            disabled={status === 'processing'}
                                            onMouseEnter={() => setIsHoveredPlay(true)}
                                            onMouseLeave={() => setIsHoveredPlay(false)}
                                            style={{
                                                padding: '16px 48px',
                                                fontSize: '1.2rem',
                                                fontWeight: '700',
                                                borderRadius: '100px',
                                                border: 'none',
                                                background: '#fff',
                                                color: '#000',
                                                cursor: status === 'processing' ? 'wait' : 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '12px',
                                                transform: isHoveredPlay && !status.includes('processing') ? 'scale(1.05)' : 'scale(1)',
                                                transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
                                                boxShadow: isHoveredPlay ? '0 0 30px rgba(255, 255, 255, 0.4)' : '0 0 0 rgba(0,0,0,0)',
                                                opacity: status === 'processing' ? 0.8 : 1,
                                                minWidth: '200px',
                                                justifyContent: 'center'
                                            }}
                                        >
                                            {status === 'processing' ? (
                                                <>
                                                    <span className="spinner" style={{ width: '20px', height: '20px', border: '3px solid #000', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></span>
                                                    <span>Loading...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                                                    <span>Play</span>
                                                </>
                                            )}
                                        </button>

                                        <button style={{
                                            width: '56px',
                                            height: '56px',
                                            borderRadius: '50%',
                                            border: '1px solid rgba(255,255,255,0.2)',
                                            background: 'rgba(255,255,255,0.1)',
                                            color: '#fff',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '1.5rem',
                                            transition: 'all 0.2s ease',
                                            backdropFilter: 'blur(10px)'
                                        }}
                                            onMouseEnter={e => {
                                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                                                e.currentTarget.style.transform = 'scale(1.1)';
                                            }}
                                            onMouseLeave={e => {
                                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                                                e.currentTarget.style.transform = 'scale(1)';
                                            }}
                                        >
                                            +
                                        </button>
                                    </div>

                                    {errorMsg && (
                                        <div style={{
                                            background: 'rgba(255, 59, 48, 0.15)',
                                            color: '#ff453a',
                                            padding: '12px 20px',
                                            borderRadius: '12px',
                                            backdropFilter: 'blur(10px)',
                                            border: '1px solid rgba(255, 69, 58, 0.2)',
                                            maxWidth: 'fit-content',
                                            fontSize: '0.95rem',
                                            fontWeight: '500'
                                        }}>
                                            {errorMsg}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Details Content */}
                            <div className="modal-details">
                                <div className="modal-grid">
                                    {/* Left Column: Description */}
                                    <div>
                                        <p style={{
                                            lineHeight: '1.6',
                                            fontSize: '1.25rem',
                                            color: 'rgba(255,255,255,0.85)',
                                            marginBottom: '40px',
                                            fontWeight: '400'
                                        }}>
                                            {movie.description_full}
                                        </p>
                                    </div>

                                    {/* Right Column: Cast & Details */}
                                    <div>
                                        {movie.cast && (
                                            <div style={{ marginBottom: '40px' }}>
                                                <h3 style={{
                                                    fontSize: '0.9rem',
                                                    color: 'rgba(255,255,255,0.4)',
                                                    marginBottom: '20px',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.1em',
                                                    fontWeight: '600'
                                                }}>Cast</h3>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                                    {movie.cast.slice(0, 5).map(c => (
                                                        <div key={c.imdb_code || c.name} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                                            {c.url_small_image ? (
                                                                <img src={c.url_small_image} alt={c.name} style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', background: '#222' }} />
                                                            ) : (
                                                                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: '600' }}>{c.name[0]}</div>
                                                            )}
                                                            <span style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.9)', fontWeight: '500' }}>{c.name}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div >
            <style>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes spin { to { transform: rotate(360deg); } }

                .modal-container {
                    width: 100%;
                    max-width: 1200px;
                    height: auto;
                    max-height: 90vh;
                    border-radius: 24px;
                    overflow: hidden;
                    position: relative;
                }

                .modal-container.playing {
                    width: 100vw;
                    height: 100vh;
                    max-width: 100%;
                    max-height: 100vh;
                    border-radius: 0;
                }

                .modal-hero {
                    height: 65vh;
                    min-height: 500px;
                    width: 100%;
                    position: relative;
                }

                .modal-hero-content {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    padding: 0 60px 40px 60px;
                    display: flex;
                    flex-direction: column;
                    gap: 24px;
                }

                .modal-metadata {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    font-size: 1.1rem;
                    font-weight: 500;
                    color: rgba(255, 255, 255, 0.9);
                    text-shadow: 0 2px 4px rgba(0,0,0,0.5);
                    flex-wrap: wrap;
                }

                .modal-details {
                    padding: 0 60px 60px 60px;
                    background: linear-gradient(to bottom, #000 0%, #0a0a0a 100%);
                }

                .modal-grid {
                    display: grid;
                    grid-template-columns: 2fr 1fr;
                    gap: 60px;
                }

                @media (max-width: 768px) {
                    .modal-container {
                        max-height: 100vh;
                        height: 100%;
                        border-radius: 0;
                    }
                    
                    .modal-hero {
                        height: 50vh;
                        min-height: 400px;
                    }

                    .modal-hero-content {
                        padding: 0 24px 32px 24px;
                    }

                    .modal-details {
                        padding: 0 24px 40px 24px;
                    }

                    .modal-grid {
                        grid-template-columns: 1fr;
                        gap: 40px;
                    }

                    .modal-metadata {
                        font-size: 0.95rem;
                        gap: 12px;
                    }
                    
                    .genres {
                        display: none;
                    }
                }
            `}</style>
        </div >
    );
};

export default Modal;
