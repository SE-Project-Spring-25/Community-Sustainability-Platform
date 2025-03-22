// src/components/Login.js
import React, {useEffect, useState} from 'react';
import authService from '../services/authService';
import './AuthStyles.css';
import {useNavigate} from "react-router-dom";

const Login = ({switchToSignup}) => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Redirect if already logged in
    useEffect(() => {
        const token = authService.getAccessToken();
        if (token) {
            navigate('/dashboard');
        }
    }, [navigate]);

    const handleChange = (e) => {
        const {name, value} = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await authService.login(formData.email, formData.password);
            console.log('Successfully logged in: ', response);
            // Token is stored within authService.login
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-content">
                    <div className="auth-header">
                        <div className="leaf-icon">🌿</div>
                        <h2>Welcome Back</h2>
                        <p>Sign in to continue your sustainability journey</p>
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <div className="input-with-icon">
                                <span className="input-icon">✉️</span>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    placeholder="your@email.com"
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <div className="input-with-icon">
                                <span className="input-icon">🔒</span>
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <div className="forgot-password">
                            <a href="/forgot-password">Forgot password?</a>
                        </div>

                        <button type="submit" className="auth-button" disabled={loading}>
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>

                    <div className="auth-footer">
                        <p>
                            Don't have an account?{' '}
                            <span className="auth-link" onClick={() => navigate('/signup')}>
                Sign up
              </span>
                        </p>
                        <div className="eco-fact">
                            <span className="eco-icon">🌎</span>
                            <p>
                                Did you know? Going paperless saves approximately 3.3 cubic meters of landfill space per
                                person
                                annually.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            <div className="nature-bg"></div>
        </div>
    );
};

export default Login;
