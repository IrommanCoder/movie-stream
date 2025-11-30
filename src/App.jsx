import React, { useState, useEffect, Suspense, lazy } from 'react';
import Footer from './components/Footer';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ContentRow from './components/ContentRow';
import Loader from './components/Loader';
import { movies as api, seedr } from './services/api';
import { useSeedr } from './hooks/useSeedr';

// Lazy load heavy components
const LoginModal = lazy(() => import('./components/LoginModal'));
const MovieDetailModal = lazy(() => import('./components/MovieDetailModal'));
const WishlistModal = lazy(() => import('./components/WishlistModal'));
const Explore = lazy(() => import('./components/Explore'));
const Player = lazy(() => import('./components/Player'));

function App() {
  const [user, setUser] = useState(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isExploreOpen, setIsExploreOpen] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [playerUrl, setPlayerUrl] = useState(null);
  const [playerTitle, setPlayerTitle] = useState('');
  const [playerMovieId, setPlayerMovieId] = useState(null);

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
  const [continueWatching, setContinueWatching] = useState([]);

  const { addAndPlay } = useSeedr();

  // Check for existing login, wishlist, and continue watching
  useEffect(() => {
    const storedUser = localStorage.getItem('seedr_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    const storedWishlist = localStorage.getItem('movie_wishlist');
    if (storedWishlist) {
      setWishlist(JSON.parse(storedWishlist));
    }

    const storedContinueWatching = localStorage.getItem('continue_watching');
    if (storedContinueWatching) {
      setContinueWatching(JSON.parse(storedContinueWatching));
    }

    const handleSessionExpired = () => {
      setUser(null);
      setIsLoginOpen(true);
      setLoadingMessage(null); // Clear any loading toasts
      // Optional: Show a message "Session expired, please login again"
    };

    window.addEventListener('seedr:logout', handleSessionExpired);

    return () => {
      window.removeEventListener('seedr:logout', handleSessionExpired);
    };
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

  // Fetch Movies with Randomization
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        // Generate random page numbers (1-10) to keep content fresh
        const randomPage = () => Math.floor(Math.random() * 10) + 1;

        const [trendingRes, topRatedRes, actionRes, comedyRes] = await Promise.all([
          api.getTrending(randomPage()),
          api.getTopRated(randomPage()),
          api.getAction(randomPage()),
          api.getComedy(randomPage())
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

  // Deep Linking for Share Feature
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const movieId = params.get('movie');
    if (movieId) {
      api.getDetails(movieId)
        .then(res => {
          if (res.data.data.movie) {
            setSelectedMovie(res.data.data.movie);
            // Clean URL without reloading
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        })
        .catch(err => console.error("Error fetching shared movie:", err));
    }
  }, []);

  const handleSurpriseMe = async () => {
    try {
      setLoadingMessage("Picking a random movie...");
      // Random page 1-50
      const page = Math.floor(Math.random() * 50) + 1;
      const res = await api.getTopRated(page);
      const movies = res.data.data.movies || [];

      if (movies.length > 0) {
        const randomMovie = movies[Math.floor(Math.random() * movies.length)];
        setSelectedMovie(randomMovie);
      } else {
        // Fallback if empty page
        const fallback = trending[Math.floor(Math.random() * trending.length)];
        if (fallback) setSelectedMovie(fallback);
      }
    } catch (error) {
      console.error("Surprise Me error:", error);
    } finally {
      setLoadingMessage(null);
    }
  };

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
      setPlayerMovieId(movie.id);
      setSelectedMovie(null); // Close modal when playing
      setLoadingMessage(null); // Clear message

      // Add to Continue Watching
      setContinueWatching(prev => {
        const newHistory = [movie, ...prev.filter(m => m.id !== movie.id)].slice(0, 10); // Keep last 10
        localStorage.setItem('continue_watching', JSON.stringify(newHistory));
        return newHistory;
      });
    } catch (error) {
      console.error("Playback error:", error);
      setLoadingMessage(null);

      // If it's a 401, the global handler will take care of it (logout + open login modal)
      // So we don't need to show a generic alert
      if (error.response && error.response.status === 401) {
        return;
      }

      alert("Failed to start playback: " + (error.message || "Unknown error"));
    }
  };

  const handlePlayFromWishlist = (movie) => { // Added handler
    setIsWishlistOpen(false);
    handlePlay(movie);
  };

  const [exploreInitialGenre, setExploreInitialGenre] = useState('all');
  const [exploreInitialSort, setExploreInitialSort] = useState('date_added');

  const handleCategoryClick = (genre = 'all', sort = 'date_added') => {
    setExploreInitialGenre(genre);
    setExploreInitialSort(sort);
    setIsExploreOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader className="w-16 h-16" />
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
        onWishlistClick={() => setIsWishlistOpen(true)}
        onExploreClick={() => {
          setExploreInitialGenre('all');
          setExploreInitialSort('date_added');
          setIsExploreOpen(true);
        }}
      />

      <main>
        {!isSearching ? (
          <>
            <Hero
              movie={trending[0]}
              onPlay={handleMovieClick}
              wishlist={wishlist}
              onToggleWishlist={toggleWishlist}
              onSurpriseMe={handleSurpriseMe}
            />

            <div className="relative z-10 -mt-32 pb-20 space-y-8">
              {continueWatching.length > 0 && (
                <ContentRow title="Continue Watching" movies={continueWatching} onMovieClick={handleMovieClick} />
              )}
              <ContentRow
                title="Latest Movies"
                movies={trending}
                onMovieClick={handleMovieClick}
                onTitleClick={() => handleCategoryClick('all', 'date_added')}
              />
              <ContentRow
                title="Hit Movies"
                movies={topRated}
                onMovieClick={handleMovieClick}
                onTitleClick={() => handleCategoryClick('all', 'rating')}
              />
              <ContentRow
                title="Action Thrillers"
                movies={action}
                onMovieClick={handleMovieClick}
                onTitleClick={() => handleCategoryClick('Action', 'date_added')}
              />
              <ContentRow
                title="Comedy Series"
                movies={comedy}
                onMovieClick={handleMovieClick}
                onTitleClick={() => handleCategoryClick('Comedy', 'date_added')}
              />
            </div>
          </>
        ) : (
          <div className="pt-32 px-4 md:px-12 pb-20">
            <h2 className="text-2xl font-bold text-white mb-8">Search Results</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-6">
              {searchResults.map(movie => (
                <div key={movie.id} onClick={() => handleMovieClick(movie)} className="cursor-pointer group">
                  <img
                    src={movie.medium_cover_image || movie.large_cover_image}
                    alt={movie.title}
                    loading="lazy"
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

      <Footer />

      <Suspense fallback={null}>
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
          onSwitchMovie={setSelectedMovie}
        />

        <WishlistModal
          isOpen={isWishlistOpen}
          onClose={() => setIsWishlistOpen(false)}
          wishlist={wishlist}
          onPlay={handlePlayFromWishlist}
          onRemove={removeFromWishlist}
        />

        <Explore
          isOpen={isExploreOpen}
          onClose={() => setIsExploreOpen(false)}
          onMovieClick={(movie) => {
            setIsExploreOpen(false);
            handleMovieClick(movie);
          }}
          initialGenre={exploreInitialGenre}
          initialSort={exploreInitialSort}
        />

        {playerUrl && (
          <Player
            src={playerUrl}
            title={playerTitle}
            movieId={playerMovieId}
            onClose={() => {
              setPlayerUrl(null);
              setPlayerTitle('');
              setPlayerMovieId(null);
            }}
          />
        )}
      </Suspense>

      {/* Loading Toast */}
      {loadingMessage && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-[300] bg-[#1c1c1e] border border-white/10 px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 animate-fade-in-up">
          <Loader className="w-5 h-5" />
          <span className="text-sm font-medium text-white">{loadingMessage}</span>
        </div>
      )}
    </div>
  );
}

export default App;
