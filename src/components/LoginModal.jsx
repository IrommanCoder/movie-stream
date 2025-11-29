import React, { useState } from 'react';
import { seedr } from '../services/api';

const LoginModal = ({ onClose, onLoginSuccess }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await seedr.login(username, password);
            console.log('Login response:', res);
            // api.login returns response.data directly
            if (res && (res.success === true || res === 'OK' || res.username)) {
                onLoginSuccess(res);
                onClose();
            } else {
                setError(res?.error || 'Login failed');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.8)',
            zIndex: 2000,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backdropFilter: 'blur(5px)'
        }} onClick={onClose}>
            <div style={{
                width: '400px',
                backgroundColor: '#18191f',
                padding: '2rem',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.1)'
            }} onClick={e => e.stopPropagation()}>
                <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Seedr Login</h2>

                {error && <div style={{ color: '#e50914', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <input
                        type="text"
                        placeholder="Username / Email"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        style={{
                            padding: '0.8rem',
                            borderRadius: '4px',
                            border: 'none',
                            backgroundColor: '#333',
                            color: 'white'
                        }}
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        style={{
                            padding: '0.8rem',
                            borderRadius: '4px',
                            border: 'none',
                            backgroundColor: '#333',
                            color: 'white'
                        }}
                    />
                    <button
                        type="submit"
                        className="btn btn-accent"
                        disabled={loading}
                        style={{ marginTop: '1rem', justifyContent: 'center' }}
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginModal;
