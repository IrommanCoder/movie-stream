import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';

const Navbar = ({ onLoginClick, onSearch, user, onLogout, onWishlistClick, onExploreClick }) => {
    const [scrolled, setScrolled] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled || isMenuOpen ? 'bg-black/90 backdrop-blur-md border-b border-white/5' : 'bg-transparent'}`}>
            <div className="max-w-[1920px] mx-auto px-4 md:px-12 h-16 flex items-center justify-between">
                {/* Logo */}
                <div className="flex items-center gap-4 md:gap-8">
                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden text-white/70 hover:text-white"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {isMenuOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>

                    <a href="/" className="flex items-center gap-2 text-white hover:opacity-80 transition-opacity">
                        <span className="font-semibold text-lg tracking-tight">Movies</span>
                    </a>
                </div>

                {/* Desktop Actions */}
                <div className="hidden md:flex items-center gap-6">
                    <div className="relative group">
                        <Search className="w-5 h-5 text-white/70 group-hover:text-white transition-colors absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                            type="text"
                            placeholder="Search"
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                onSearch(e.target.value);
                            }}
                            className="bg-white/10 border border-white/10 rounded-lg py-1.5 pl-10 pr-4 text-sm text-white placeholder-white/50 focus:outline-none focus:bg-white/20 focus:w-64 w-48 transition-all duration-300"
                        />
                    </div>

                    <button
                        onClick={onExploreClick}
                        className="text-sm font-medium text-white/70 hover:text-white transition-colors"
                    >
                        Explore
                    </button>

                    <button
                        onClick={onWishlistClick}
                        className="text-sm font-medium text-white/70 hover:text-white transition-colors"
                    >
                        Wishlist
                    </button>

                    {user ? (
                        <div className="flex items-center gap-4">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white shadow-lg">
                                {user.username?.[0]?.toUpperCase() || 'U'}
                            </div>
                            <button
                                onClick={onLogout}
                                className="text-sm text-white/70 hover:text-white transition-colors"
                            >
                                Logout
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={onLoginClick}
                            className="bg-white text-black px-4 py-1.5 rounded-md text-sm font-medium hover:scale-105 transition-transform duration-200"
                        >
                            Sign In
                        </button>
                    )}
                </div>

                {/* Mobile Search Icon (opens full search in menu) */}
                <div className="md:hidden flex items-center gap-4">
                    {user ? (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white shadow-lg">
                            {user.username?.[0]?.toUpperCase() || 'U'}
                        </div>
                    ) : (
                        <button
                            onClick={onLoginClick}
                            className="text-sm font-medium text-white"
                        >
                            Sign In
                        </button>
                    )}
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden bg-black/95 backdrop-blur-xl border-t border-white/10 p-4 animate-fade-in">
                    <div className="flex flex-col gap-4">
                        <div className="relative">
                            <Search className="w-5 h-5 text-white/50 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Search movies..."
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    onSearch(e.target.value);
                                }}
                                className="w-full bg-white/10 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white placeholder-white/50 focus:outline-none focus:bg-white/20"
                            />
                        </div>

                        <button
                            onClick={() => {
                                onExploreClick();
                                setIsMenuOpen(false);
                            }}
                            className="text-left text-lg font-medium text-white/80 hover:text-white py-2 border-b border-white/5"
                        >
                            Explore
                        </button>

                        <button
                            onClick={() => {
                                onWishlistClick();
                                setIsMenuOpen(false);
                            }}
                            className="text-left text-lg font-medium text-white/80 hover:text-white py-2 border-b border-white/5"
                        >
                            Wishlist
                        </button>

                        {user && (
                            <button
                                onClick={() => {
                                    onLogout();
                                    setIsMenuOpen(false);
                                }}
                                className="text-left text-lg font-medium text-red-400 hover:text-red-300 py-2"
                            >
                                Logout
                            </button>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
