import React from 'react';
import { Play, Plus } from 'lucide-react';

const Hero = ({ movie, onPlay, wishlist, onToggleWishlist }) => {
  if (!movie) return null;

  return (
    <div className="relative h-[85vh] w-full overflow-hidden group">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={movie.background_image_original || movie.large_cover_image}
          alt="" // Empty alt to prevent text showing up
          className="w-full h-full object-cover object-center opacity-0 transition-opacity duration-700"
          onLoad={(e) => e.target.classList.remove('opacity-0')}
        />
        {/* Fallback/Placeholder if image fails or loading */}
        <div className="absolute inset-0 bg-[#1c1c1e] -z-10" />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative h-full flex items-end pb-24 px-4 md:px-12 max-w-[1920px] mx-auto">
        <div className="max-w-2xl space-y-6 animate-fade-in-up">
          {/* Metadata */}
          <div className="flex items-center gap-3 text-sm font-medium text-white/80 uppercase tracking-wider">
            <span>{movie.genres?.[0] || 'Movie'}</span>
            <span>•</span>
            <span>{movie.year}</span>
          </div>

          {/* Title */}
          <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight drop-shadow-2xl">
            {movie.title}
          </h1>

          {/* Description */}
          <p className="text-lg text-white/90 line-clamp-3 font-medium drop-shadow-md">
            {movie.summary || movie.description_full}
          </p>

          {/* Buttons */}
          <div className="flex items-center gap-4 pt-4">
            <button
              onClick={() => onPlay(movie)}
              className="flex items-center gap-2 bg-white text-black px-8 py-3.5 rounded-lg font-bold hover:scale-105 transition-transform duration-200 shadow-lg shadow-white/10"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>Play</span>
            </button>
            <button
              onClick={() => onToggleWishlist(movie)}
              className="flex items-center gap-2 bg-white/10 backdrop-blur-md text-white px-8 py-3.5 rounded-lg font-bold hover:bg-white/20 transition-all duration-200 border border-white/10"
            >
              <Plus className={`w-5 h-5 ${wishlist?.some(m => m.id === movie.id) ? 'rotate-45' : ''} transition-transform duration-300`} />
              <span>{wishlist?.some(m => m.id === movie.id) ? 'In Wishlist' : 'Add to Wishlist'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
