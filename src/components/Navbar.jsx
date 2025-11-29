import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Navbar = ({ onLoginClick, onSearch, user, onLogout }) => {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-black/90' : 'bg-gradient-to-b from-black/80 to-transparent'}`} style={{
            position: 'fixed',
            top: 0,
            width: '100%',
            zIndex: 100,
            padding: '1rem 3rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: scrolled ? '#0f1014' : 'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, transparent 100%)',
            transition: 'background 0.3s ease'
        }}>
            <div className="logo" style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#e50914', cursor: 'pointer' }}>
                NETFLIX
            </div>

            <div className="actions" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <input
                    type="text"
                    placeholder="Search movies..."
                    onChange={(e) => onSearch(e.target.value)}
                    style={{
                        background: 'rgba(0,0,0,0.5)',
                        border: '1px solid rgba(255,255,255,0.3)',
                        padding: '0.5rem 1rem',
                        borderRadius: '4px',
                        color: 'white',
                        outline: 'none'
                    }}
                />
                {user ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span style={{ color: '#fff', fontSize: '0.9rem' }}>{user.username || user.email || 'User'}</span>
                        <button className="btn btn-secondary" onClick={onLogout} style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}>
                            Logout
                        </button>
                    </div>
                ) : (
                    <button className="btn btn-primary" onClick={onLoginClick} style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}>
                        Seedr Login
                    </button>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
