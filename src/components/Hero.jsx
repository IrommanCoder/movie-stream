
import React, { useState } from 'react';

const Hero = ({ movie, onPlay, onMoreInfo }) => {
  const [isHoveredPlay, setIsHoveredPlay] = useState(false);
  const [isHoveredInfo, setIsHoveredInfo] = useState(false);

  if (!movie) return null;

  return (
    <header className="hero-container">
      {/* Background Image */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `url(${movie.background_image_original || movie.large_cover_image})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center top',
        zIndex: 0,
        transform: 'scale(1.05)', // Subtle zoom for cinematic feel
        transition: 'transform 10s ease'
      }}></div>

      {/* Gradient Overlays */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(to top, #000 0%, rgba(0,0,0,0.6) 20%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.4) 100%)',
        zIndex: 1
      }}></div>

      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(circle at 20% 50%, rgba(0,0,0,0.4) 0%, transparent 50%)',
        zIndex: 1
      }}></div>

      {/* Content */}
      <div className="hero-content">
        {/* Logo/Title */}
        <h1 className="hero-title">
          {movie.title}
        </h1>

        {/* Metadata */}
        <div className="hero-metadata">
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
          <span className="hero-genres">{movie.genres?.slice(0, 3).join(' • ')}</span>
        </div>

        {/* Description */}
        <p className="hero-description">
          {movie.summary?.slice(0, 200)}...
        </p>

        {/* Buttons */}
        <div className="hero-actions">
          <button
            onClick={() => onPlay(movie)}
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
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              transform: isHoveredPlay ? 'scale(1.05)' : 'scale(1)',
              transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
              boxShadow: isHoveredPlay ? '0 0 30px rgba(255, 255, 255, 0.4)' : '0 0 0 rgba(0,0,0,0)'
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
            Play
          </button>

          <button
            onClick={() => onMoreInfo(movie)}
            onMouseEnter={() => setIsHoveredInfo(true)}
            onMouseLeave={() => setIsHoveredInfo(false)}
            style={{
              padding: '16px 48px',
              fontSize: '1.2rem',
              fontWeight: '600',
              borderRadius: '100px',
              border: 'none',
              background: 'rgba(255, 255, 255, 0.2)',
              color: '#fff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              transform: isHoveredInfo ? 'scale(1.05)' : 'scale(1)',
              transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
              boxShadow: isHoveredInfo ? '0 0 30px rgba(255, 255, 255, 0.1)' : '0 0 0 rgba(0,0,0,0)'
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
            More Info
          </button>
        </div>
      </div>
      <style>{`
        .hero-container {
            height: 95vh;
            width: 100%;
            position: relative;
            display: flex;
            align-items: flex-end;
            overflow: hidden;
        }

        .hero-content {
            position: relative;
            z-index: 10;
            width: 100%;
            padding: 0 4rem 6rem 4rem;
            max-width: 1600px;
            margin: 0 auto;
        }

        .hero-title {
            font-size: clamp(3rem, 6vw, 6rem);
            font-weight: 800;
            line-height: 1;
            margin-bottom: 1.5rem;
            text-shadow: 0 4px 24px rgba(0,0,0,0.5);
            letter-spacing: -0.03em;
            background: linear-gradient(to bottom, #fff 0%, #ccc 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            max-width: 800px;
        }

        .hero-metadata {
            display: flex;
            gap: 16px;
            margin-bottom: 24px;
            font-size: 1.1rem;
            font-weight: 500;
            color: rgba(255, 255, 255, 0.9);
            text-shadow: 0 2px 4px rgba(0,0,0,0.5);
            align-items: center;
            flex-wrap: wrap;
        }

        .hero-description {
            font-size: 1.25rem;
            line-height: 1.6;
            margin-bottom: 3rem;
            color: rgba(255,255,255,0.9);
            max-width: 700px;
            text-shadow: 0 2px 4px rgba(0,0,0,0.5);
            font-weight: 400;
        }

        .hero-actions {
            display: flex;
            gap: 20px;
            flex-wrap: wrap;
        }

        @media (max-width: 768px) {
            .hero-content {
                padding: 0 24px 40px 24px;
            }

            .hero-title {
                font-size: clamp(2.5rem, 10vw, 4rem);
            }

            .hero-description {
                font-size: 1rem;
                display: -webkit-box;
                -webkit-line-clamp: 3;
                -webkit-box-orient: vertical;
                overflow: hidden;
            }

            .hero-genres {
                display: none;
            }
            
            .hero-actions button {
                padding: 12px 32px !important;
                font-size: 1rem !important;
                flex: 1;
                justify-content: center;
            }
        }
      `}</style>
    </header>
  );
};

export default Hero;
