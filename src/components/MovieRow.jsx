
import React, { useRef } from 'react';
import MovieCard from './MovieCard';

const MovieRow = ({ title, movies, onMovieClick }) => {
    const rowRef = useRef(null);

    if (!movies || movies.length === 0) return null;

    return (
        <div className="movie-row">
            <h2 className="row-title">{title}</h2>
            <div
                ref={rowRef}
                className="row-container hide-scrollbar"
            >
                {movies.map(movie => (
                    <MovieCard key={movie.id} movie={movie} onClick={() => onMovieClick(movie)} />
                ))}
            </div>
            <style>{`
                .movie-row {
                    padding: 2rem 0 2rem 4rem;
                }

                .row-title {
                    font-size: 1.5rem;
                    margin-bottom: 1.5rem;
                    font-weight: 700;
                    color: rgba(255,255,255,0.9);
                    letter-spacing: -0.01em;
                }

                .row-container {
                    display: flex;
                    gap: 1.5rem;
                    overflow-x: auto;
                    padding-bottom: 2rem;
                    padding-right: 4rem;
                    scroll-behavior: smooth;
                    scrollbar-width: none;
                }

                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }

                @media (max-width: 768px) {
                    .movie-row {
                        padding: 1.5rem 0 1.5rem 1.5rem;
                    }
                    
                    .row-title {
                        font-size: 1.25rem;
                        margin-bottom: 1rem;
                    }

                    .row-container {
                        gap: 1rem;
                        padding-right: 1.5rem;
                    }
                }
            `}</style>
        </div>
    );
};

export default MovieRow;
