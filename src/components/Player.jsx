import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import Plyr from 'plyr-react';
import 'plyr-react/plyr.css';
import Hls from 'hls.js';

const Player = ({ src, onClose, title, movieId }) => {
    const ref = useRef(null);

    useEffect(() => {
        const loadHls = () => {
            const video = document.querySelector('.plyr video');

            if (!video) return;

            // Load progress
            const savedProgress = JSON.parse(localStorage.getItem('movie_progress') || '{}');
            const startTime = savedProgress[movieId] || 0;

            if (Hls.isSupported()) {
                const hls = new Hls();
                hls.loadSource(src);
                hls.attachMedia(video);

                hls.on(Hls.Events.MANIFEST_PARSED, () => {
                    if (startTime > 0) {
                        video.currentTime = startTime;
                    }
                    video.play().catch(() => { });
                });

                ref.current.plyr.on('languagechange', () => {
                    setTimeout(() => hls.subtitleTrack = ref.current.plyr.currentTrack, 50);
                });
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = src;
                if (startTime > 0) {
                    video.currentTime = startTime;
                }
            }

            // Save progress every 5 seconds
            const saveInterval = setInterval(() => {
                if (video && !video.paused) {
                    const currentProgress = JSON.parse(localStorage.getItem('movie_progress') || '{}');
                    currentProgress[movieId] = video.currentTime;
                    localStorage.setItem('movie_progress', JSON.stringify(currentProgress));
                }
            }, 5000);

            return () => clearInterval(saveInterval);
        };

        // Small delay to ensure Plyr has rendered the video tag
        const timer = setTimeout(loadHls, 200);
        return () => clearTimeout(timer);
    }, [src, movieId]);

    useEffect(() => {
        // Handle escape key to close
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    return (
        <div className="fixed inset-0 z-[200] bg-black flex flex-col animate-fade-in">
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 p-4 md:p-6 flex justify-between items-center z-50 bg-gradient-to-b from-black/90 to-transparent pointer-events-none">
                <h3 className="text-white font-medium text-lg drop-shadow-md pointer-events-auto pl-2">{title}</h3>
                <button
                    onClick={onClose}
                    className="bg-white/10 backdrop-blur-md p-2 rounded-full text-white hover:bg-white/20 transition-all pointer-events-auto border border-white/10"
                >
                    <X className="w-6 h-6" />
                </button>
            </div>

            {/* Player Container */}
            <div className="flex-1 flex items-center justify-center bg-black w-full h-full">
                <div className="w-full h-full flex items-center justify-center">
                    <Plyr
                        ref={ref}
                        source={{
                            type: 'video',
                            sources: [
                                {
                                    src: src,
                                    type: src.includes('.m3u8') ? 'application/x-mpegURL' : 'video/mp4',
                                },
                            ],
                        }}
                        options={{
                            autoplay: true,
                            controls: [
                                'play-large', 'play', 'progress', 'current-time', 'mute', 'volume', 'captions', 'settings', 'pip', 'airplay', 'fullscreen'
                            ],
                            ratio: '16:9',
                            fullscreen: { enabled: true, fallback: true, iosNative: true },
                        }}
                        style={{ width: '100%', height: '100%' }}
                    />
                </div>
            </div>

            {/* Custom CSS to center play button and fix controls */}
            <style>{`
                .plyr {
                    width: 100%;
                    height: 100%;
                }
                .plyr__video-wrapper {
                    height: 100%;
                }
                .plyr--video .plyr__controls {
                    padding-bottom: 40px;
                    padding-left: 40px;
                    padding-right: 40px;
                }
                /* Center the big play button */
                .plyr__control--overlaid {
                    background: rgba(255, 255, 255, 0.2);
                    backdrop-filter: blur(4px);
                }
                .plyr__control--overlaid:hover {
                    background: rgba(255, 255, 255, 0.4);
                }
            `}</style>
        </div>
    );
};

export default Player;
