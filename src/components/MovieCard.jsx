import React, { useState, useRef } from 'react';

const MovieCard = ({ movie, onClick }) => {
    const [isHovered, setIsHovered] = useState(false);
    const timerRef = useRef(null);

    const handleMouseEnter = () => {
        timerRef.current = setTimeout(() => {
            setIsHovered(true);
        }, 500); // 500ms delay before showing details
    };

    const handleMouseLeave = () => {
        clearTimeout(timerRef.current);
        setIsHovered(false);
    };

    return (
        <div
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={onClick}
            style={{
                minWidth: '200px',
                height: '300px', // Portrait aspect ratio for YTS posters
                position: 'relative',
                borderRadius: '4px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                marginRight: '0.5rem',
                zIndex: isHovered ? 100 : 1
            }}
            className={`movie-card ${isHovered ? 'hovered' : ''}`}
        >
            <img
                src={movie.medium_cover_image}
                alt={movie.title}
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: '4px'
                }}
            />

            {isHovered && (
                <div style={{
                    position: 'absolute',
                    top: '-20%',
                    left: '-20%',
                    width: '140%',
                    height: '140%',
                    backgroundColor: '#18191f',
                    borderRadius: '6px',
                    boxShadow: '0 10px 20px rgba(0,0,0,0.8)',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    animation: 'fadeIn 0.3s ease'
                }}>
                    <div style={{ height: '60%', position: 'relative' }}>
                        <img
                            src={movie.medium_cover_image}
                            alt={movie.title}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        <div style={{
                            position: 'absolute',
                            inset: 0,
                            background: 'linear-gradient(to top, #18191f, transparent)',
                        }}></div>
                    </div>

                    <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button className="btn-icon">▶</button>
                            <button className="btn-icon">+</button>
                            <button className="btn-icon">↓</button>
                        </div>
                        <h4 style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>{movie.title}</h4>
                        <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.7rem', color: '#46d369' }}>
                            <span>{movie.rating * 10}% Match</span>
                            <span style={{ color: '#fff', border: '1px solid #666', padding: '0 4px' }}>HD</span>
                            <span style={{ color: '#ccc' }}>{movie.year}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.7rem', color: '#ccc' }}>
                            {movie.genres?.slice(0, 3).join(' • ')}
                        </div>
                    </div>
                </div>
            )}

            <style>{`
        .btn-icon {
            width: 30px;
            height: 30px;
            border-radius: 50%;
            border: 2px solid rgba(255,255,255,0.5);
            background: rgba(0,0,0,0.5);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.2s;
        }
        .btn-icon:hover {
            border-color: white;
            background: white;
            color: black;
        }
        .btn-icon:first-child {
            background: white;
            color: black;
            border-color: white;
        }
      `}</style>
        </div>
    );
};

export default MovieCard;
