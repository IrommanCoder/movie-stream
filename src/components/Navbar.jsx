
import React, { useState, useEffect } from 'react';

const Navbar = ({ onLoginClick, onSearch, user, onLogout }) => {
    const [scrolled, setScrolled] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Debug logging
    useEffect(() => {
        console.log('Navbar user prop:', user);
    }, [user]);

    return (
        <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
            <div className="logo">
                 TV+ Clone
            </div>

            <div className="actions">
                <div className="search-container">
                    <input
                        type="text"
                        placeholder="Search"
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            onSearch(e.target.value);
                        }}
                        className="search-input"
                    />
                    <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="rgba(255,255,255,0.5)"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="search-icon"
                    >
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                </div>

                {user ? (
                    <div className="user-menu">
                        <div className="user-avatar">
                            {user.username?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <button onClick={onLogout} className="logout-btn">
                            Logout
                        </button>
                    </div>
                ) : (
                    <button onClick={onLoginClick} className="login-btn">
                        Sign In
                    </button>
                )}
            </div>
            <style>{`
                .navbar {
                    position: fixed;
                    top: 0;
                    width: 100%;
                    z-index: 1000;
                    padding: 1.2rem 4rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, transparent 100%);
                    border-bottom: 1px solid transparent;
                    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                }

                .navbar.scrolled {
                    background: rgba(20, 20, 20, 0.8);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    border-bottom: 1px solid rgba(255,255,255,0.05);
                    padding: 0.8rem 4rem;
                }

                .logo {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: #fff;
                    cursor: pointer;
                    letter-spacing: -0.02em;
                    text-shadow: 0 2px 10px rgba(0,0,0,0.5);
                    white-space: nowrap;
                }

                .actions {
                    display: flex;
                    gap: 1.5rem;
                    align-items: center;
                }

                .search-container {
                    position: relative;
                }

                .search-input {
                    background: rgba(255,255,255,0.1);
                    border: 1px solid rgba(255,255,255,0.1);
                    padding: 0.6rem 1rem 0.6rem 2.5rem;
                    border-radius: 8px;
                    color: white;
                    outline: none;
                    width: 240px;
                    font-size: 0.95rem;
                    transition: all 0.2s ease;
                    backdrop-filter: blur(10px);
                }

                .search-input:focus {
                    background: rgba(255,255,255,0.15);
                    width: 300px;
                }

                .search-icon {
                    position: absolute;
                    left: 12px;
                    top: 50%;
                    transform: translateY(-50%);
                    pointer-events: none;
                }

                .user-menu {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }

                .user-avatar {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    background: linear-gradient(to bottom right, #4cd964, #2c8c3e);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.9rem;
                    font-weight: 600;
                    color: #fff;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                }

                .logout-btn {
                    font-size: 0.9rem;
                    padding: 0.5rem 1rem;
                    background: transparent;
                    border: none;
                    color: rgba(255,255,255,0.7);
                    cursor: pointer;
                    transition: color 0.2s;
                }

                .logout-btn:hover {
                    color: #fff;
                }

                .login-btn {
                    font-size: 0.9rem;
                    padding: 0.6rem 1.2rem;
                    background: #fff;
                    color: #000;
                    border: none;
                    border-radius: 6px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: transform 0.2s ease;
                    box-shadow: 0 2px 10px rgba(255,255,255,0.1);
                    white-space: nowrap;
                }

                .login-btn:hover {
                    transform: scale(1.05);
                }

                @media (max-width: 768px) {
                    .navbar, .navbar.scrolled {
                        padding: 1rem 1rem; /* Reduced padding */
                    }

                    .actions {
                        gap: 0.8rem; /* Reduced gap */
                    }

                    .search-input {
                        width: 100px; /* Smaller width on mobile */
                        padding: 0.5rem 0.8rem 0.5rem 2.2rem;
                    }

                    .search-input:focus {
                        width: 160px; /* Expand less */
                    }

                    .logout-btn {
                        display: none;
                    }
                    
                    .logo {
                        font-size: 1.1rem;
                    }

                    .login-btn {
                        padding: 0.5rem 0.8rem;
                        font-size: 0.85rem;
                    }
                }
            `}</style>
        </nav>
    );
};

export default Navbar;
