import React, { useState, useEffect } from 'react';
import SeedrService from '../services/seedr';

const Navbar = ({ onLoginClick, onSearch }) => {
    const [scrolled, setScrolled] = useState(false);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);

        // Check login status
        if (SeedrService.isLoggedIn()) {
            setUser({ name: 'User' });
        }

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = () => {
        SeedrService.logout();
        setUser(null);
        window.location.reload();
    };

    return (
        <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
            <a href="#" className="nav-logo" onClick={() => window.location.reload()}>NETFLIX</a>
            <div className="nav-right">
                <div className="search-box">
                    <i className="fas fa-search"></i>
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Titles, people, genres"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                onSearch(e.target.value);
                            }
                        }}
                    />
                </div>

                {user ? (
                    <div className="nav-user" onClick={handleLogout}>
                        <img src="https://upload.wikimedia.org/wikipedia/commons/0/0b/Netflix-avatar.png" alt="User" />
                        <span>Logout</span>
                    </div>
                ) : (
                    <button className="btn btn-primary btn-sm" onClick={onLoginClick}>Login</button>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
