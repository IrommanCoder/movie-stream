import React from 'react';
import { X, Play, Trash2 } from 'lucide-react';

const WishlistModal = ({ isOpen, onClose, wishlist, onPlay, onRemove }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity duration-300"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative bg-[#1c1c1e] w-full max-w-4xl max-h-[80vh] rounded-2xl shadow-2xl overflow-hidden border border-white/10 flex flex-col animate-fade-in-up">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                    <h2 className="text-2xl font-bold text-white">My Wishlist</h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    {wishlist.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-white/50">
                            <p className="text-lg">Your wishlist is empty.</p>
                            <p className="text-sm mt-2">Add movies to watch them later.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {wishlist.map(movie => (
                                <div key={movie.id} className="flex gap-4 bg-white/5 p-3 rounded-xl hover:bg-white/10 transition-colors group">
                                    <img
                                        src={movie.medium_cover_image}
                                        alt={movie.title}
                                        className="w-20 h-30 object-cover rounded-lg shadow-md"
                                    />
                                    <div className="flex-1 flex flex-col justify-between py-1">
                                        <div>
                                            <h3 className="font-bold text-white line-clamp-1">{movie.title}</h3>
                                            <p className="text-sm text-white/60">{movie.year} • {movie.genres?.[0]}</p>
                                        </div>
                                        <div className="flex items-center gap-3 mt-3">
                                            <button
                                                onClick={() => onPlay(movie)}
                                                className="flex items-center gap-2 bg-white text-black px-4 py-1.5 rounded-lg text-sm font-bold hover:scale-105 transition-transform"
                                            >
                                                <Play className="w-3 h-3 fill-current" />
                                                Play
                                            </button>
                                            <button
                                                onClick={() => onRemove(movie)}
                                                className="flex items-center gap-2 text-red-400 hover:text-red-300 px-2 py-1.5 rounded-lg text-sm transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default WishlistModal;
