
import React, { useState } from 'react';

const MovieCard = ({ movie, onClick }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div
            className={`movie-card ${isHovered ? 'hovered' : ''}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={onClick}
        >
            <div className="card-content">
                <img
                    src={movie.medium_cover_image}
                    alt={movie.title}
                    className="card-image"
                    loading="lazy"
                />

                {/* Overlay on Hover */}
                <div className="card-overlay">
                    <h4 className="card-title">
                        {movie.title}
                    </h4>
                    <div className="card-meta">
                        <span className="rating">{movie.rating * 10}%</span>
                        <span>{movie.year}</span>
                        <span className="hd-badge">HD</span>
                    </div>
                </div>
            </div>
            <style>{`
                .movie-card {
                    min-width: 220px;
                    height: 330px;
                    position: relative;
                    border-radius: 12px;
                    cursor: pointer;
                    transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                    margin-right: 1rem;
                    z-index: 1;
                    box-shadow: 0 4px 10px rgba(0,0,0,0.2);
                }

                .movie-card.hovered {
                    transform: scale(1.05) translateY(-10px);
                    z-index: 100;
                    box-shadow: 0 20px 40px rgba(0,0,0,0.4);
                }

                .card-content {
                    width: 100%;
                    height: 100%;
                    border-radius: 12px;
                    overflow: hidden;
                    position: relative;
                    background: #1a1a1a;
                }

                .card-image {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    transition: transform 0.4s ease;
                }

                .movie-card.hovered .card-image {
                    transform: scale(1.1);
                }

                .card-overlay {
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 50%, transparent 100%);
                    opacity: 0;
                    transition: opacity 0.3s ease;
                    display: flex;
                    flex-direction: column;
                    justify-content: flex-end;
                    padding: 1.5rem;
                }

                .movie-card.hovered .card-overlay {
                    opacity: 1;
                }

                .card-title {
                    font-size: 1rem;
                    font-weight: 700;
                    color: #fff;
                    margin-bottom: 0.5rem;
                    text-shadow: 0 2px 4px rgba(0,0,0,0.8);
                }

                .card-meta {
                    display: flex;
                    gap: 8px;
                    font-size: 0.8rem;
                    color: rgba(255,255,255,0.8);
                    font-weight: 500;
                }

                .rating {
                    color: #4cd964;
                }

                .hd-badge {
                    border: 1px solid rgba(255,255,255,0.4);
                    padding: 0 4px;
                    border-radius: 3px;
                    font-size: 0.7rem;
                }

                @media (max-width: 768px) {
                    .movie-card {
                        min-width: 160px;
                        height: 240px;
                        margin-right: 0.5rem;
                    }

                    .card-overlay {
                        padding: 1rem;
                    }
                    
                    .card-title {
                        font-size: 0.9rem;
                    }
                }
            `}</style>
        </div>
    );
};

export default MovieCard;
