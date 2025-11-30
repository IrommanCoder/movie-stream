import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ContentRow from './components/ContentRow';
import LoginModal from './components/LoginModal';
import MovieDetailModal from './components/MovieDetailModal';
import WishlistModal from './components/WishlistModal';
import Player from './components/Player';
import { movies as api, seedr } from './services/api';
import { useSeedr } from './hooks/useSeedr';

function App() {
  const [user, setUser] = useState(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false); // Added missing state
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [playerUrl, setPlayerUrl] = useState(null);
  const [playerTitle, setPlayerTitle] = useState('');

  // Movie Data State
  const [trending, setTrending] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [action, setAction] = useState([]);
  const [comedy, setComedy] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [loading, setLoading] = useState(true);

  const [loadingMessage, setLoadingMessage] = useState(null);
  const [wishlist, setWishlist] = useState([]);

  const { addAndPlay } = useSeedr();

  // Check for existing login and wishlist
  useEffect(() => {
    const storedUser = localStorage.getItem('seedr_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    const storedWishlist = localStorage.getItem('movie_wishlist');
    if (storedWishlist) {
      setWishlist(JSON.parse(storedWishlist));
    }
  }, []);

  const toggleWishlist = (movie) => {
    setWishlist(prev => {
      const isInWishlist = prev.some(m => m.id === movie.id);
      let newWishlist;
      if (isInWishlist) {
        newWishlist = prev.filter(m => m.id !== movie.id);
      } else {
        newWishlist = [...prev, movie];
      }
      localStorage.setItem('movie_wishlist', JSON.stringify(newWishlist));
      return newWishlist;
    });
  };

  const removeFromWishlist = (movie) => {
    setWishlist(prev => {
      const newWishlist = prev.filter(m => m.id !== movie.id);
      localStorage.setItem('movie_wishlist', JSON.stringify(newWishlist));
      return newWishlist;
    });
  };

  // Fetch Movies
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const [trendingRes, topRatedRes, actionRes, comedyRes] = await Promise.all([
          api.getTrending(),
          api.getTopRated(),
          api.getAction(),
          api.getComedy()
        ]);

        setTrending(trendingRes.data.data.movies || []);
        setTopRated(topRatedRes.data.data.movies || []);
        setAction(actionRes.data.data.movies || []);
        setComedy(comedyRes.data.data.movies || []);
      } catch (error) {
        console.error("Error fetching movies:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  const handleLogin = async (username, password) => {
    const res = await seedr.login(username, password);
    if (res.success || res === 'OK') {
      const userData = { username };
      setUser(userData);
      localStorage.setItem('seedr_user', JSON.stringify(userData));
    } else {
      throw new Error(res.error || 'Login failed');
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('seedr_user');
    localStorage.removeItem('seedr_cookies');
  };

  const handleSearch = async (query) => {
    if (!query) {
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    try {
      const res = await api.search(query);
      setSearchResults(res.data.data.movies || []);
    } catch (error) {
      console.error("Search error:", error);
    }
  };

  const handleMovieClick = (movie) => {
    setSelectedMovie(movie);
  };

  const handlePlay = async (movie) => {
    if (!user) {
      setIsLoginOpen(true);
      return;
    }

    // Find the best torrent hash
    const torrent = movie.torrents?.find(t => t.quality === '1080p') || movie.torrents?.[0];
    if (!torrent) {
      alert("No torrent found for this movie.");
      return;
    }

    // Show loading state
    const showToast = (msg) => {
      // Simple toast implementation using DOM for now, or we could add a Toast component
      // For this iteration, we'll use a state-based overlay in the return JSX
      setLoadingMessage(msg);
    };

    try {
      showToast("Adding to cloud...");
      const url = await addAndPlay(torrent.hash, movie.title);

      showToast("Preparing stream...");
      // Small delay to let user read the message
      await new Promise(resolve => setTimeout(resolve, 1000));

      setPlayerUrl(url);
      setPlayerTitle(movie.title);
      setSelectedMovie(null); // Close modal when playing
      setLoadingMessage(null); // Clear message
    } catch (error) {
      console.error("Playback error:", error);
      alert("Failed to start playback: " + error.message);
      setLoadingMessage(null);
    }
  };

  const handlePlayFromWishlist = (movie) => { // Added handler
    setIsWishlistOpen(false);
    handlePlay(movie);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-white/20">
      <Navbar
        user={user}
        onLoginClick={() => setIsLoginOpen(true)}
        onLogout={handleLogout}
        onSearch={handleSearch}
        onWishlistClick={() => setIsWishlistOpen(true)} // Added prop
      />

      <main>
        {!isSearching ? (
          <>
            <Hero
              movie={trending[0]}
              onPlay={handleMovieClick}
              wishlist={wishlist}
              onToggleWishlist={toggleWishlist}
            />

            <div className="relative z-10 -mt-32 pb-20 space-y-8">
              <ContentRow title="Latest Originals" movies={trending} onMovieClick={handleMovieClick} />
              <ContentRow title="Hit Movies" movies={topRated} onMovieClick={handleMovieClick} />
              <ContentRow title="Action Thrillers" movies={action} onMovieClick={handleMovieClick} />
              <ContentRow title="Comedy Series" movies={comedy} onMovieClick={handleMovieClick} />
            </div>
          </>
        ) : (
          <div className="pt-32 px-4 md:px-12 pb-20">
            <h2 className="text-2xl font-bold text-white mb-8">Search Results</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {searchResults.map(movie => (
                <div key={movie.id} onClick={() => handleMovieClick(movie)} className="cursor-pointer group">
                  <img
                    src={movie.medium_cover_image || movie.large_cover_image}
                    alt={movie.title}
                    className="w-full aspect-[2/3] object-cover rounded-xl shadow-lg group-hover:scale-105 transition-transform duration-300"
                  />
                  <h3 className="mt-3 text-sm font-medium text-white group-hover:text-blue-400 transition-colors truncate">{movie.title}</h3>
                  <p className="text-xs text-white/50">{movie.year}</p>
                </div>
              ))}
            </div>
            {searchResults.length === 0 && (
              <p className="text-white/50">No results found.</p>
            )}
          </div>
        )}
      </main>

      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLogin={handleLogin}
      />

      <MovieDetailModal
        movie={selectedMovie}
        isOpen={!!selectedMovie}
        onClose={() => setSelectedMovie(null)}
        onPlay={handlePlay}
        wishlist={wishlist}
        onToggleWishlist={toggleWishlist}
      />

      <WishlistModal // Added component
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        wishlist={wishlist}
        onPlay={handlePlayFromWishlist}
        onRemove={removeFromWishlist}
      />

      {playerUrl && (
        <Player
          src={playerUrl}
          title={playerTitle}
          onClose={() => {
            setPlayerUrl(null);
            setPlayerTitle('');
          }}
        />
      )}

      {/* Loading Toast */}
      {loadingMessage && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-[300] bg-[#1c1c1e] border border-white/10 px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 animate-fade-in-up">
          <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          <span className="text-sm font-medium text-white">{loadingMessage}</span>
        </div>
      )}
    </div>
  );
}

export default App;
