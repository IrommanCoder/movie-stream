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
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLoginSuccess = (userData) => {
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
      <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div className="loader">Loading...</div>
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

          <div className="main-content" style={{ marginTop: '-100px', position: 'relative', zIndex: 10 }}>
            <MovieRow title="Trending Now" movies={trending} onMovieClick={setModalMovie} />
            <MovieRow title="Top Rated" movies={topRated} onMovieClick={setModalMovie} />
            <MovieRow title="Action Thrillers" movies={action} onMovieClick={setModalMovie} />
            <MovieRow title="Comedies" movies={comedy} onMovieClick={setModalMovie} />
          </div>
        </>
      ) : (
        <div className="container" style={{ paddingTop: '100px' }}>
          <h2>Search Results</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
            {searchResults.map(movie => (
              <div key={movie.id} onClick={() => setModalMovie(movie)} style={{ width: '200px', cursor: 'pointer' }}>
                <img src={movie.medium_cover_image} alt={movie.title} style={{ width: '100%', borderRadius: '4px' }} />
                <p style={{ marginTop: '0.5rem' }}>{movie.title}</p>
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
    </div>
  );
}

export default App;
