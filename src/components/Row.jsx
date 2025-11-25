import React from 'react';

const Row = ({ title, movies, onMovieClick }) => {
    if (!movies || movies.length === 0) return null;

    return (
        <div className="row">
            <h2 className="row-title">{title}</h2>
            <div className="row-posters">
                {movies.map(movie => (
                    <div key={movie.id} className="movie-card" onClick={() => onMovieClick(movie)}>
                        <img src={movie.medium_cover_image} alt={movie.title} loading="lazy" />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Row;
