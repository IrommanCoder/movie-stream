import React, { useEffect, useRef } from 'react';
import Plyr from 'plyr';
import Hls from 'hls.js';
import 'plyr/dist/plyr.css';

const VideoPlayer = ({ options, onReady }) => {
    const videoRef = useRef(null);
    const playerRef = useRef(null);
    const hlsRef = useRef(null);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const source = options.sources[0].src;
        const type = options.sources[0].type;
        console.log("VideoPlayer: Initializing with source:", source, "Type:", type);
        const isHls = type === 'application/x-mpegURL' || source.includes('.m3u8');

        // Default Plyr options
        const defaultOptions = {
            controls: [
                'play-large', 'restart', 'rewind', 'play', 'fast-forward',
                'progress', 'current-time', 'duration', 'mute', 'volume',
                'captions', 'settings', 'pip', 'airplay', 'fullscreen'
            ],
            speed: { selected: 1, options: [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2] },
            ...options
        };

        // If HLS, remove sources from Plyr options to prevent it from overriding HLS.js
        if (isHls) {
            delete defaultOptions.sources;
        }

        const initPlyr = () => {
            if (playerRef.current) return;
            playerRef.current = new Plyr(video, defaultOptions);

            // Expose player to window for debugging
            window.player = playerRef.current;

            // Fix for controls not showing: ensure Plyr container has correct z-index context
            if (playerRef.current.elements.container) {
                playerRef.current.elements.container.style.height = '100%';
                playerRef.current.elements.container.style.width = '100%';
            }

            if (onReady) onReady(playerRef.current);
        };

        if (isHls && Hls.isSupported()) {
            // Initialize HLS.js
            console.log("Initializing HLS.js for source:", source);
            const hls = new Hls({
                maxBufferHole: 2.5, // Increase tolerance for buffer holes
                highBufferWatchdogPeriod: 3, // Check buffer more frequently
                fragLoadingTimeOut: 20000, // Increase timeout for fragment loading
            });
            hlsRef.current = hls;
            hls.loadSource(source);
            hls.attachMedia(video);

            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                console.log("HLS Manifest Parsed, initializing Plyr...");
                initPlyr();
                // Attempt autoplay
                if (options.autoplay) {
                    const playPromise = video.play();
                    if (playPromise !== undefined) {
                        playPromise.catch(e => console.log("Autoplay blocked", e));
                    }
                }
            });

            hls.on(Hls.Events.ERROR, function (event, data) {
                console.error("HLS Error:", event, JSON.stringify(data, null, 2));
                if (data.fatal) {
                    switch (data.type) {
                        case Hls.ErrorTypes.NETWORK_ERROR:
                            console.log("fatal network error encountered, try to recover");
                            hls.startLoad();
                            break;
                        case Hls.ErrorTypes.MEDIA_ERROR:
                            console.log("fatal media error encountered, try to recover");
                            hls.recoverMediaError();
                            break;
                        default:
                            console.log("cannot recover, destroying HLS");
                            hls.destroy();
                            break;
                    }
                }
            });
        } else {
            // For other video types or if HLS is not supported
            console.log("HLS not supported or not HLS source, initializing Plyr directly.");
            initPlyr();
        }

        // Cleanup
        return () => {
            if (hlsRef.current) {
                hlsRef.current.destroy();
                hlsRef.current = null;
            }
            if (playerRef.current) {
                playerRef.current.destroy();
                playerRef.current = null;
            }
        };
    }, [options.sources]); // Re-run if source changes

    return (
        <div style={{ width: '100%', height: '100%' }}>
            <video
                ref={videoRef}
                className="plyr-react plyr"
                playsInline
                crossOrigin="anonymous"
                style={{ width: '100%', height: '100%' }}
            />
        </div>
    );
};

export default VideoPlayer;
