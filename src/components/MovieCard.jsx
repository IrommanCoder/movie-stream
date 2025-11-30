import React from 'react';
import { Play } from 'lucide-react';

const MovieCard = ({ movie, onClick }) => {
    return (
        <div
            onClick={() => onClick && onClick(movie)}
            className="relative group min-w-[130px] md:min-w-[200px] aspect-[2/3] cursor-pointer transition-all duration-300 hover:scale-105 hover:z-10"
        >
            {/* Image */}
            <img
                src={movie.medium_cover_image || movie.image}
                alt={movie.title}
                className="w-full h-full object-cover rounded-xl shadow-lg group-hover:shadow-2xl transition-all duration-300 brightness-90 group-hover:brightness-110"
                loading="lazy"
            />

            {/* Overlay Content (Visible on Hover) */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl flex items-center justify-center backdrop-blur-[2px]">
                <div className="transform scale-90 group-hover:scale-100 transition-transform duration-300 flex flex-col items-center gap-3">
                    <button className="bg-white text-black rounded-full p-3 shadow-xl hover:scale-110 transition-transform">
                        <Play className="w-6 h-6 fill-current pl-1" />
                    </button>
                    <div className="text-center px-2">
                        <h3 className="text-white font-bold text-sm drop-shadow-md line-clamp-2">{movie.title}</h3>
                        <p className="text-white/80 text-xs font-medium mt-1">
                            {movie.year}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MovieCard;
