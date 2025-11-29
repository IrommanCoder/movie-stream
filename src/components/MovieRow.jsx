import React, { useRef } from 'react';
import MovieCard from './MovieCard';

const MovieRow = ({ title, movies, onMovieClick }) => {
    const rowRef = useRef(null);

    if (!movies || movies.length === 0) return null;

    return (
        <div style={{ padding: '1.5rem 0 1.5rem 3rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', fontWeight: '600' }}>{title}</h2>
            <div
                ref={rowRef}
                style={{
                    display: 'flex',
                    gap: '1rem',
                    overflowX: 'auto',
                    paddingBottom: '1rem',
                    scrollBehavior: 'smooth',
                    scrollbarWidth: 'none' /* Firefox */
                }}
                className="hide-scrollbar"
            >
                {movies.map(movie => (
                    <MovieCard key={movie.id} movie={movie} onClick={() => onMovieClick(movie)} />
                ))}
            </div>
        </div>
    );
};

export default MovieRow;
