import React, { useState, useEffect } from 'react';
import { X, Filter, ChevronDown, Star } from 'lucide-react';
import { movies as api } from '../services/api';
import Loader from './Loader';

const Explore = ({ isOpen, onClose, onMovieClick, initialGenre = 'all', initialSort = 'date_added' }) => {
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);

    // Filters
    const [genre, setGenre] = useState(initialGenre);
    const [rating, setRating] = useState('0');
    const [year, setYear] = useState('0');
    const [sortBy, setSortBy] = useState(initialSort);
    const [orderBy, setOrderBy] = useState('desc');

    const genres = ["All", "Action", "Adventure", "Animation", "Biography", "Comedy", "Crime", "Documentary", "Drama", "Family", "Fantasy", "Film-Noir", "History", "Horror", "Music", "Musical", "Mystery", "Romance", "Sci-Fi", "Short", "Sport", "Thriller", "War", "Western"];
    const ratings = ["All", "9+", "8+", "7+", "6+", "5+"];
    const sortOptions = [
        { value: 'date_added', label: 'Latest' },
        { value: 'download_count', label: 'Most Downloaded' },
        { value: 'rating', label: 'Top Rated' },
        { value: 'year', label: 'Year' },
        { value: 'title', label: 'Alphabetical' }
    ];

    // Reset filters when modal opens with new initial values
    useEffect(() => {
        if (isOpen) {
            setGenre(initialGenre);
            setSortBy(initialSort);
            setPage(1);
            setMovies([]); // Clear previous movies to avoid mix-up
            fetchMovies(); // Fetch immediately with new filters
        }
    }, [isOpen, initialGenre, initialSort]);

    useEffect(() => {
        if (isOpen) {
            fetchMovies();
        }
    }, [genre, rating, year, sortBy, orderBy, page]);

    const fetchMovies = async () => {
        setLoading(true);
        try {
            const params = {
                limit: 20,
                page: page,
                sort_by: sortBy,
                order_by: orderBy,
            };

            if (genre !== 'all') params.genre = genre.toLowerCase();
            if (rating !== '0') params.minimum_rating = parseInt(rating);
            // Year filter in YTS is query_term usually or specific params, let's keep it simple for now or use query_term if needed, 
            // but YTS doesn't have a direct 'year' param for list_movies, it's usually part of query_term or we filter client side? 
            // Actually YTS API docs say query_term can be used. 
            // Let's stick to what we know works: genre, rating, sort.

            const res = await api.getMovies(params);
            if (page === 1) {
                setMovies(res.data.data.movies || []);
            } else {
                setMovies(prev => [...prev, ...(res.data.data.movies || [])]);
            }
        } catch (error) {
            console.error("Error fetching explore movies:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (setter, value) => {
        setter(value);
        setPage(1); // Reset to page 1 on filter change
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] bg-[#141414] overflow-y-auto animate-fade-in">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-[#141414]/95 backdrop-blur-md border-b border-white/10 px-4 md:px-12 py-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Filter className="w-6 h-6 text-blue-500" />
                    Explore Movies
                </h2>
                <button
                    onClick={onClose}
                    className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                >
                    <X className="w-6 h-6" />
                </button>
            </div>

            {/* Filters Bar */}
            <div className="px-4 md:px-12 py-6 border-b border-white/5 bg-white/5">
                <div className="flex flex-wrap gap-4">
                    {/* Genre */}
                    <div className="relative group">
                        <select
                            value={genre}
                            onChange={(e) => handleFilterChange(setGenre, e.target.value)}
                            className="appearance-none bg-black border border-white/20 text-white py-2 pl-4 pr-10 rounded-lg focus:outline-none focus:border-blue-500 cursor-pointer"
                        >
                            {genres.map(g => (
                                <option key={g} value={g === 'All' ? 'all' : g}>{g}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50 pointer-events-none" />
                    </div>

                    {/* Rating */}
                    <div className="relative group">
                        <select
                            value={rating}
                            onChange={(e) => handleFilterChange(setRating, e.target.value)}
                            className="appearance-none bg-black border border-white/20 text-white py-2 pl-4 pr-10 rounded-lg focus:outline-none focus:border-blue-500 cursor-pointer"
                        >
                            <option value="0">Any Rating</option>
                            {ratings.slice(1).map(r => (
                                <option key={r} value={r.replace('+', '')}>{r}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50 pointer-events-none" />
                    </div>

                    {/* Sort By */}
                    <div className="relative group">
                        <select
                            value={sortBy}
                            onChange={(e) => handleFilterChange(setSortBy, e.target.value)}
                            className="appearance-none bg-black border border-white/20 text-white py-2 pl-4 pr-10 rounded-lg focus:outline-none focus:border-blue-500 cursor-pointer"
                        >
                            {sortOptions.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50 pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* Results */}
            <div className="px-4 md:px-12 py-8">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                    {movies.map(movie => (
                        <div key={movie.id} onClick={() => onMovieClick(movie)} className="cursor-pointer group">
                            <div className="relative aspect-[2/3] rounded-xl overflow-hidden mb-3 shadow-lg">
                                <img
                                    src={movie.medium_cover_image}
                                    alt={movie.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                                <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-xs font-bold text-yellow-500 flex items-center gap-1">
                                    <Star className="w-3 h-3 fill-current" />
                                    {movie.rating}
                                </div>
                            </div>
                            <h3 className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors truncate">{movie.title}</h3>
                            <p className="text-xs text-white/50">{movie.year}</p>
                        </div>
                    ))}
                </div>

                {/* Load More */}
                {!loading && movies.length > 0 && (
                    <div className="flex justify-center mt-12 mb-8">
                        <button
                            onClick={() => setPage(prev => prev + 1)}
                            className="bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-full font-medium transition-colors"
                        >
                            Load More
                        </button>
                    </div>
                )}



                // ... inside Explore component ...

                {loading && (
                    <div className="flex justify-center mt-12">
                        <Loader className="w-8 h-8" />
                    </div>
                )}
            </div>
        </div>
    );
};



export default Explore;
