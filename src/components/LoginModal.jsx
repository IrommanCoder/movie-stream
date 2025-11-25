import React, { useState } from 'react';
import SeedrService from '../services/seedr';

const LoginModal = ({ onClose, onLoginSuccess }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const result = await SeedrService.login(username, password);

        if (result.success) {
            onLoginSuccess();
            onClose();
        } else {
            setError(result.error);
        }
        setLoading(false);
    };

    return (
        <div className="modal-overlay active">
            <div className="modal" style={{ maxWidth: '400px', height: 'auto' }}>
                <div className="modal-close" onClick={onClose}>
                    <i className="fas fa-times"></i>
                </div>
                <div className="login-content">
                    <h2 className="modal-title" style={{ textAlign: 'center', marginBottom: '30px' }}>Login to Seedr</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <input
                                type="text"
                                placeholder="Email / Username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '20px' }} disabled={loading}>
                            {loading ? 'Signing In...' : 'Sign In'}
                        </button>
                        {error && <p className="error-msg">{error}</p>}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LoginModal;
