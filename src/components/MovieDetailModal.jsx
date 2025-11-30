import React, { useState, useEffect } from 'react';
import { X, Play, Star, Calendar, Clock, Youtube } from 'lucide-react';
import { movies as api } from '../services/api';

const MovieDetailModal = ({ movie, isOpen, onClose, onPlay, wishlist, onToggleWishlist, onSwitchMovie }) => {
    const [similarMovies, setSimilarMovies] = useState([]);
    const [showTrailer, setShowTrailer] = useState(false);

    useEffect(() => {
        if (movie?.id) {
            api.getSuggestions(movie.id)
                .then(res => setSimilarMovies(res.data.data.movies || []))
                .catch(err => console.error("Error fetching suggestions:", err));
        }
    }, [movie]);

    if (!isOpen || !movie) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity duration-300"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative bg-[#1c1c1e] w-full max-w-6xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden border border-white/10 flex flex-col md:flex-row animate-fade-in-up">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/50 hover:bg-white/20 text-white transition-colors"
                >
                    <X className="w-6 h-6" />
                </button>

                {/* Left Side: Poster (Hidden on mobile, visible on desktop) */}
                <div className="hidden md:block w-1/3 relative">
                    <img
                        src={movie.large_cover_image || movie.medium_cover_image}
                        alt={movie.title}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-[#1c1c1e]" />
                </div>

                {/* Right Side: Details */}
                <div className="flex-1 p-8 md:p-12 overflow-y-auto custom-scrollbar">
                    {/* Background Image for Mobile (blurred) */}
                    <div className="md:hidden absolute inset-0 -z-10 opacity-20">
                        <img
                            src={movie.background_image_original || movie.large_cover_image}
                            alt=""
                            className="w-full h-full object-cover"
                        />
                    </div>

                    <div className="space-y-6">
                        {/* Title & Meta */}
                        <div>
                            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
                                {movie.title}
                            </h2>
                            <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-white/70">
                                <span className="flex items-center gap-1 text-yellow-500">
                                    <Star className="w-4 h-4 fill-current" />
                                    {movie.rating}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    {movie.year}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    {movie.runtime} min
                                </span>
                                <span className="border border-white/20 px-2 py-0.5 rounded text-xs uppercase">
                                    {movie.genres?.[0]}
                                </span>
                                {movie.language && (
                                    <span className="uppercase">{movie.language}</span>
                                )}
                            </div>
                        </div>

                        {/* Synopsis */}
                        <p className="text-lg text-white/80 leading-relaxed">
                            {movie.description_full || movie.summary}
                        </p>

                        {/* Actions */}
                        <div className="pt-6 flex flex-col md:flex-row gap-4">
                            <button
                                onClick={() => onPlay(movie)}
                                className="flex-1 md:flex-none flex items-center justify-center gap-3 bg-white text-black px-8 py-4 rounded-xl font-bold text-lg hover:scale-105 transition-transform shadow-lg shadow-white/10"
                            >
                                <Play className="w-6 h-6 fill-current" />
                                <span>Play Movie</span>
                            </button>

                            <button
                                onClick={() => onToggleWishlist(movie)}
                                className="flex-1 md:flex-none flex items-center justify-center gap-3 bg-white/10 border border-white/10 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/20 transition-colors"
                            >
                                {wishlist?.some(m => m.id === movie.id) ? (
                                    <>
                                        <span className="text-green-400">✓</span>
                                        <span>In Wishlist</span>
                                    </>
                                ) : (
                                    <>
                                        <span>+</span>
                                        <span>Add to Wishlist</span>
                                    </>
                                )}
                            </button>

                            {movie.yt_trailer_code && (
                                <button
                                    onClick={() => setShowTrailer(true)}
                                    className="flex-1 md:flex-none flex items-center justify-center gap-3 bg-red-600/20 border border-red-600/50 text-red-500 px-8 py-4 rounded-xl font-bold text-lg hover:bg-red-600/30 transition-colors"
                                >
                                    <Youtube className="w-6 h-6" />
                                    <span>Trailer</span>
                                </button>
                            )}
                        </div>

                        {/* Similar Movies */}
                        {similarMovies.length > 0 && (
                            <div className="pt-8 border-t border-white/10 mt-8">
                                <h3 className="text-xl font-bold text-white mb-4">You Might Also Like</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {similarMovies.slice(0, 4).map(sim => (
                                        <div
                                            key={sim.id}
                                            onClick={() => onSwitchMovie && onSwitchMovie(sim)}
                                            className="cursor-pointer group"
                                        >
                                            <div className="relative aspect-[2/3] rounded-lg overflow-hidden mb-2">
                                                <img
                                                    src={sim.medium_cover_image}
                                                    alt={sim.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                />
                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                                            </div>
                                            <h4 className="text-sm font-medium text-white/80 truncate group-hover:text-white transition-colors">{sim.title}</h4>
                                            <p className="text-xs text-white/50">{sim.year}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <p className="mt-4 text-sm text-white/40 text-center md:text-left">
                            Streaming securely via Seedr.cc
                        </p>
                    </div>
                </div>
            </div>

            {/* Trailer Modal */}
            {showTrailer && (
                <div className="fixed inset-0 z-[150] bg-black/90 flex items-center justify-center p-4">
                    <div className="relative w-full max-w-4xl aspect-video bg-black rounded-xl overflow-hidden shadow-2xl">
                        <button
                            onClick={() => setShowTrailer(false)}
                            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-white/20 transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                        <iframe
                            width="100%"
                            height="100%"
                            src={`https://www.youtube.com/embed/${movie.yt_trailer_code}?autoplay=1`}
                            title="YouTube video player"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        ></iframe>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MovieDetailModal;
