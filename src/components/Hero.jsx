import React from 'react';

const Hero = ({ movie, onPlay, onMoreInfo }) => {
    if (!movie) return null;

    const bgImage = movie.background_image_original || movie.background_image;

    return (
        <header className="hero">
            <div className="hero-bg" style={{ backgroundImage: `url('${bgImage}')` }}></div>
            <div className="hero-overlay"></div>
            <div className="hero-content">
                <h1 className="hero-title">{movie.title}</h1>
                <div className="hero-meta">
                    <span>{movie.year}</span>
                    <span>{movie.rating} Rating</span>
                    <span>{movie.runtime} min</span>
                </div>
                <p className="hero-desc">{movie.summary || movie.description_full}</p>
                <div className="hero-actions">
                    <button className="btn btn-primary" onClick={() => onPlay(movie)}>
                        <i className="fas fa-play"></i> Play
                    </button>
                    <button className="btn btn-secondary" onClick={() => onMoreInfo(movie)}>
                        <i className="fas fa-info-circle"></i> More Info
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Hero;
