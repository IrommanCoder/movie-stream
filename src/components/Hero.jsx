import React from 'react';

const Hero = ({ movie, onPlay, onMoreInfo }) => {
  if (!movie) return null;

  const backgroundStyle = {
    backgroundImage: `url(${movie.background_image_original || movie.large_cover_image})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center top',
    height: '85vh',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  };

  const gradientStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(to top, #0f1014 0%, transparent 60%, rgba(0,0,0,0.4) 100%)',
  };

  const leftGradient = {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: '40%',
    background: 'linear-gradient(to right, rgba(0,0,0,0.8) 0%, transparent 100%)',
  };

  return (
    <header style={backgroundStyle}>
      <div style={gradientStyle}></div>
      <div style={leftGradient}></div>
      <div className="container" style={{ position: 'relative', zIndex: 10, maxWidth: '1400px', paddingLeft: '4rem' }}>
        <h1 style={{
          fontSize: '4rem',
          marginBottom: '1.5rem',
          fontWeight: '800',
          textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
          maxWidth: '600px',
          lineHeight: '1.1'
        }}>
          {movie.title}
        </h1>

        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', fontSize: '1.1rem', alignItems: 'center' }}>
          <span style={{ color: '#46d369', fontWeight: 'bold' }}>{movie.rating * 10}% Match</span>
          <span style={{ color: '#fff' }}>{movie.year}</span>
          <span style={{ border: '1px solid #999', padding: '0 0.4rem', fontSize: '0.8rem', color: '#ccc' }}>HD</span>
          <span>{movie.runtime}m</span>
        </div>

        <p style={{
          fontSize: '1.2rem',
          lineHeight: '1.5',
          marginBottom: '2.5rem',
          textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
          maxWidth: '600px',
          color: '#e5e5e5'
        }}>
          {movie.summary?.slice(0, 200)}...
        </p>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            className="btn"
            onClick={() => onPlay(movie)}
            style={{
              backgroundColor: 'white',
              color: 'black',
              fontSize: '1.2rem',
              padding: '0.8rem 2rem',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.8rem'
            }}
          >
            <span style={{ fontSize: '1.5rem' }}>▶</span> Play
          </button>
          <button
            className="btn"
            onClick={() => onMoreInfo(movie)}
            style={{
              backgroundColor: 'rgba(109, 109, 110, 0.7)',
              color: 'white',
              fontSize: '1.2rem',
              padding: '0.8rem 2rem',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.8rem'
            }}
          >
            <span style={{ fontSize: '1.5rem' }}>ⓘ</span> More Info
          </button>
        </div>
      </div>
    </header>
  );
};

export default Hero;
