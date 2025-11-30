import React from 'react';

const Loader = ({ className = "w-10 h-10" }) => {
    return (
        <div className={`relative flex items-center justify-center ${className}`}>
            {/* Outer Ring */}
            <div className="absolute inset-0 rounded-full border-2 border-white/10" />

            {/* Spinning Gradient Ring */}
            <div className="absolute inset-0 rounded-full border-2 border-t-blue-500 border-r-purple-500 border-b-transparent border-l-transparent animate-spin" />

            {/* Inner Pulsing Dot */}
            <div className="w-1/2 h-1/2 bg-white rounded-full animate-pulse shadow-[0_0_15px_rgba(255,255,255,0.5)]" />
        </div>
    );
};

export default Loader;
