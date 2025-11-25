import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';

const Watch = () => {
    const [searchParams] = useSearchParams();
    const id = searchParams.get('id');
    const videoRef = useRef(null);
    const playerRef = useRef(null);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (!id) {
            setError('No video ID provided');
            return;
        }

        const src = localStorage.getItem(`video_${id}`);
        if (!src) {
            setError('Video link expired or invalid');
            return;
        }

        // Make sure the video element exists
        if (!videoRef.current) return;

        // Initialize player only once
        if (!playerRef.current) {
            const videoElement = document.createElement("video-js");
            videoElement.classList.add('vjs-big-play-centered');
            videoRef.current.appendChild(videoElement);

            const player = playerRef.current = videojs(videoElement, {
                autoplay: true,
                controls: true,
                responsive: true,
                fluid: true,
                playbackRates: [0.5, 1, 1.5, 2],
                sources: [{
                    src: src,
                    type: 'application/x-mpegURL'
                }],
                html5: {
                    hls: {
                        enableLowLatency: false,
                        smoothQualityChange: true,
                        overrideNative: true
                    }
                }
            }, () => {
                videojs.log('player is ready');
                player.on('error', () => {
                    console.error('VideoJS Error:', player.error());
                });
            });
        }

        // Cleanup
        return () => {
            if (playerRef.current && !playerRef.current.isDisposed()) {
                playerRef.current.dispose();
                playerRef.current = null;
            }
        };
    }, [id]);

    if (error) {
        return (
            <div style={{
                height: '100vh',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                background: 'black',
                color: 'white',
                fontFamily: 'sans-serif',
                flexDirection: 'column',
                gap: '20px'
            }}>
                <div>{error}</div>
                <button
                    onClick={() => navigate('/')}
                    style={{
                        padding: '10px 20px',
                        background: '#E50914',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Go Back
                </button>
            </div>
        );
    }

    return (
        <div style={{ width: '100vw', height: '100vh', background: 'black', overflow: 'hidden', position: 'relative' }}>
            <div ref={videoRef} style={{ width: '100%', height: '100%' }} />

            <button
                onClick={() => navigate('/')}
                style={{
                    position: 'absolute',
                    top: '20px',
                    left: '20px',
                    zIndex: 1000,
                    background: 'rgba(0,0,0,0.5)',
                    color: 'white',
                    border: 'none',
                    padding: '10px',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                <i className="fas fa-arrow-left"></i>
            </button>

            <style>{`
                .video-js {
                    width: 100% !important;
                    height: 100% !important;
                }
                .vjs-big-play-button {
                    background-color: rgba(229, 9, 20, 0.8) !important;
                    border: none !important;
                    border-radius: 50% !important;
                    width: 80px !important;
                    height: 80px !important;
                    line-height: 80px !important;
                    font-size: 50px !important;
                }
            `}</style>
        </div>
    );
};

export default Watch;
