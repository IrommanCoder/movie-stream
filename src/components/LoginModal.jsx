
import React, { useState } from 'react';
import { seedr } from '../services/api';

const LoginModal = ({ onClose, onLoginSuccess }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [focusedInput, setFocusedInput] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await seedr.login(username, password);
            console.log('Login response:', res);
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
        <div className="login-modal-overlay" onClick={onClose}>
            <div className="login-modal-content" onClick={e => e.stopPropagation()}>

                <div className="login-header">
                    <h2 className="login-title">Sign In</h2>
                    <p className="login-subtitle">
                        Enter your Seedr credentials to continue.
                    </p>
                </div>

                {error && (
                    <div className="login-error">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="input-group">
                        <input
                            type="text"
                            placeholder="Username or Email"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            onFocus={() => setFocusedInput('username')}
                            onBlur={() => setFocusedInput(null)}
                            className={`login-input ${focusedInput === 'username' ? 'focused' : ''}`}
                        />
                    </div>

                    <div className="input-group">
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            onFocus={() => setFocusedInput('password')}
                            onBlur={() => setFocusedInput(null)}
                            className={`login-input ${focusedInput === 'password' ? 'focused' : ''}`}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`login-button ${loading ? 'loading' : ''}`}
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>
            </div>
            <style>{`
                .login-modal-overlay {
                    position: fixed;
                    inset: 0;
                    background-color: rgba(0,0,0,0.6);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    z-index: 2000;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    animation: fadeIn 0.3s ease-out;
                    padding: 20px;
                }

                .login-modal-content {
                    width: 100%;
                    max-width: 440px;
                    background-color: rgba(30, 30, 30, 0.6);
                    padding: 3rem;
                    border-radius: 24px;
                    border: 1px solid rgba(255,255,255,0.1);
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
                    display: flex;
                    flex-direction: column;
                    gap: 2rem;
                }

                .login-header {
                    text-align: center;
                }

                .login-title {
                    font-size: 2rem;
                    font-weight: 700;
                    margin-bottom: 0.5rem;
                    color: #fff;
                }

                .login-subtitle {
                    color: rgba(255,255,255,0.6);
                    font-size: 1rem;
                }

                .login-error {
                    padding: 1rem;
                    border-radius: 12px;
                    background: rgba(255, 69, 58, 0.1);
                    border: 1px solid rgba(255, 69, 58, 0.2);
                    color: #ff453a;
                    font-size: 0.9rem;
                    text-align: center;
                }

                .login-form {
                    display: flex;
                    flex-direction: column;
                    gap: 1.2rem;
                }

                .input-group {
                    position: relative;
                }

                .login-input {
                    width: 100%;
                    padding: 1.2rem;
                    border-radius: 12px;
                    border: 1px solid rgba(255,255,255,0.1);
                    background-color: rgba(0,0,0,0.2);
                    color: white;
                    font-size: 1.1rem;
                    outline: none;
                    transition: all 0.2s ease;
                }

                .login-input.focused {
                    border: 1px solid #fff;
                }

                .login-button {
                    margin-top: 1rem;
                    padding: 1.2rem;
                    border-radius: 12px;
                    border: none;
                    background-color: #fff;
                    color: #000;
                    font-size: 1.1rem;
                    font-weight: 700;
                    cursor: pointer;
                    transition: transform 0.2s ease, opacity 0.2s;
                    opacity: 1;
                    transform: scale(1);
                }

                .login-button:hover:not(:disabled) {
                    transform: scale(1.02);
                }

                .login-button.loading {
                    cursor: wait;
                    opacity: 0.7;
                }

                @keyframes fadeIn {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }

                @media (max-width: 480px) {
                    .login-modal-content {
                        padding: 2rem;
                    }

                    .login-title {
                        font-size: 1.5rem;
                    }
                }
            `}</style>
        </div>
    );
};

export default LoginModal;
