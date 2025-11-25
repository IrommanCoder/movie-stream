import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Row from './components/Row';
import Modal from './components/Modal';
import LoginModal from './components/LoginModal';
import api from './services/api';
import Watch from './pages/Watch';

function Home() {
  const [heroMovie, setHeroMovie] = useState(null);
  const [rows, setRows] = useState({
    trending: [],
    topRated: [],
    action: [],
    comedy: []
  });
  const [modalMovie, setModalMovie] = useState(null);
  const [showLogin, setShowLogin] = useState(false);

  const [searchResults, setSearchResults] = useState(null);

  const handleSearch = async (query) => {
    if (!query) {
      setSearchResults(null);
      return;
    }
    const results = await api.search(query);
    if (results && results.movies) {
      setSearchResults(results.movies);
    }
  };

  useEffect(() => {
    const loadContent = () => {
      api.getTrending().then(data => {
        if (data && data.movies) {
          setHeroMovie(data.movies[0]);
          setRows(prev => ({ ...prev, trending: data.movies }));
        }
      });

      api.getTopRated().then(data => {
        if (data && data.movies) {
          setRows(prev => ({ ...prev, topRated: data.movies }));
        }
      });

      api.getActionMovies().then(data => {
        if (data && data.movies) {
          setRows(prev => ({ ...prev, action: data.movies }));
        }
      });

      api.getComedyMovies().then(data => {
        if (data && data.movies) {
          setRows(prev => ({ ...prev, comedy: data.movies }));
        }
      });
    };

    loadContent();
  }, []);

  return (
    <div className="app">
      <Navbar onLoginClick={() => setShowLogin(true)} onSearch={handleSearch} />

      {!searchResults && (
        <Hero
          movie={heroMovie}
          onPlay={(m) => setModalMovie(m)}
          onMoreInfo={(m) => setModalMovie(m)}
        />
      )}

      <div className="main-content">
        {searchResults ? (
          <Row title="Search Results" movies={searchResults} onMovieClick={setModalMovie} />
        ) : (
          <>
            <Row title="Trending Now" movies={rows.trending} onMovieClick={setModalMovie} />
            <Row title="Top Rated" movies={rows.topRated} onMovieClick={setModalMovie} />
            <Row title="Action Thrillers" movies={rows.action} onMovieClick={setModalMovie} />
            <Row title="Comedies" movies={rows.comedy} onMovieClick={setModalMovie} />
          </>
        )}
      </div>

      {modalMovie && (
        <Modal
          movie={modalMovie}
          onClose={() => setModalMovie(null)}
        />
      )}

      {showLogin && (
        <LoginModal
          onClose={() => setShowLogin(false)}
          onLoginSuccess={() => window.location.reload()}
        />
      )}
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/watch" element={<Watch />} />
    </Routes>
  );
}

export default App;
