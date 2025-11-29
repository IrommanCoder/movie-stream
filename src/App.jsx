
import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import MovieRow from './components/MovieRow';
import Modal from './components/Modal';
import LoginModal from './components/LoginModal';
import { useMovies } from './hooks/useMovies';

import { movies } from './services/api';

function App() {
  const { trending, topRated, action, comedy, loading } = useMovies();
  const [modalMovie, setModalMovie] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('seedr_user');
    console.log('App mount: storedUser from localStorage:', storedUser);
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        console.log('App mount: parsed user:', parsed);
        setUser(parsed);
      } catch (e) {
        console.error('App mount: error parsing stored user', e);
      }
    }
  }, []);

  useEffect(() => {
    console.log('App: user state updated:', user);
  }, [user]);

  const handleLoginSuccess = (userData) => {
    console.log('handleLoginSuccess called with:', userData);
    setUser(userData);
    localStorage.setItem('seedr_user', JSON.stringify(userData));
    // Save cookies if present (from OpenAPI spec response)
    if (userData.cookies) {
      localStorage.setItem('seedr_cookies', JSON.stringify(userData.cookies));
    }
    alert('Logged in successfully!');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('seedr_user');
    localStorage.removeItem('seedr_cookies');
    // Also clear cookies/tokens if stored separately
  };

  const handleSearch = async (query) => {
    if (!query) {
      setIsSearching(false);
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const res = await movies.search(query);
      setSearchResults(res.data.data.movies || []);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="loader-container">
        <div className="loader">Loading...</div>
        <style>{`
          .loader-container {
            height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            background: #000;
            color: #fff;
          }
        `}</style>
      </div>
    );
  }

  // Use the first trending movie as hero
  const heroMovie = trending[0];

  return (
    <div className="app">
      <Navbar
        onLoginClick={() => setShowLogin(true)}
        onSearch={handleSearch}
        user={user}
        onLogout={handleLogout}
      />

      {!isSearching ? (
        <>
          <Hero
            movie={heroMovie}
            onPlay={(m) => setModalMovie(m)}
            onMoreInfo={(m) => setModalMovie(m)}
          />

          <div className="main-content">
            <MovieRow title="Trending Now" movies={trending} onMovieClick={setModalMovie} />
            <MovieRow title="Top Rated" movies={topRated} onMovieClick={setModalMovie} />
            <MovieRow title="Action Thrillers" movies={action} onMovieClick={setModalMovie} />
            <MovieRow title="Comedies" movies={comedy} onMovieClick={setModalMovie} />
          </div>
        </>
      ) : (
        <div className="search-results-container">
          <h2 className="search-title">Search Results</h2>
          <div className="search-grid">
            {searchResults.map(movie => (
              <div key={movie.id} onClick={() => setModalMovie(movie)} className="search-item">
                <img src={movie.medium_cover_image} alt={movie.title} className="search-image" />
                <p className="search-movie-title">{movie.title}</p>
              </div>
            ))}
            {searchResults.length === 0 && <p>No results found.</p>}
          </div>
        </div>
      )}

      {modalMovie && (
        <Modal
          movie={modalMovie}
          onClose={() => setModalMovie(null)}
        />
      )}

      {showLogin && (
        <LoginModal
          onClose={() => setShowLogin(false)}
          onLoginSuccess={handleLoginSuccess}
        />
      )}

      <style>{`
        .app {
          background: #000;
          min-height: 100vh;
          color: #fff;
        }

        .main-content {
          margin-top: -150px;
          position: relative;
          z-index: 10;
          padding-bottom: 4rem;
        }

        .search-results-container {
          padding: 120px 4rem 4rem 4rem;
        }

        .search-title {
          font-size: 2rem;
          margin-bottom: 2rem;
        }

        .search-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 2rem;
        }

        .search-item {
          width: 200px;
          cursor: pointer;
        }

        .search-image {
          width: 100%;
          border-radius: 12px;
          transition: transform 0.2s;
        }

        .search-item:hover .search-image {
          transform: scale(1.05);
        }

        .search-movie-title {
          margin-top: 0.8rem;
          font-weight: 600;
        }

        @media (max-width: 768px) {
          .main-content {
            margin-top: -50px;
            padding-bottom: 2rem;
          }

          .search-results-container {
            padding: 100px 1.5rem 2rem 1.5rem;
          }

          .search-grid {
            justify-content: center;
            gap: 1rem;
          }

          .search-item {
            width: 140px;
          }
        }
      `}</style>
    </div>
  );
}

export default App;
