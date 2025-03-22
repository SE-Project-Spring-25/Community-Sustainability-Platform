// src/components/Signup.js
import React, {useEffect, useState} from 'react';
import authService from '../services/authService';
import './AuthStyles.css';
import {useNavigate} from "react-router-dom";

const Signup = ({switchToLogin}) => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);

    // Redirect if already logged in
    useEffect(() => {
        const token = authService.getAccessToken();
        if (token) {
            navigate('/dashboard');
        }
    }, []);

    const handleChange = (e) => {
        const {name, value} = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const validateEmail = (email) => {
        return /\S+@\S+\.\S+/.test(email);
    };

    const validateStep1 = () => {
        if (!formData.firstName || !formData.lastName || !formData.email) {
            setError('Please fill out all fields');
            return false;
        }
        if (!validateEmail(formData.email)) {
            setError('Please enter a valid email address');
            return false;
        }
        return true;
    };

    const validateStep2 = () => {
        if (!formData.password || !formData.confirmPassword) {
            setError('Please fill out all fields');
            return false;
        }
        if (formData.password.length < 8) {
            setError('Password must be at least 8 characters long');
            return false;
        }
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return false;
        }
        return true;
    };

    const nextStep = () => {
        if (step === 1 && validateStep1()) {
            setError('');
            setStep(2);
        }
    };

    const prevStep = () => {
        setError('');
        setStep(step - 1);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateStep2()) return;

        setLoading(true);
        setError('');

        try {
            // Map the form data to what the backend expects
            const userData = {
                first_name: formData.firstName,
                last_name: formData.lastName,
                email: formData.email,
                password: formData.password
            };

            const response = await authService.register(userData);

            if (response.access) {
                localStorage.setItem('accessToken', response.access);
            }
            if (response.refresh) {
                localStorage.setItem('refreshToken', response.refresh);
            }

            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
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
                        <h2>Join Our Community</h2>
                        <p>Create an account to start your sustainability journey</p>
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <div className="signup-progress">
                        <div className={`progress-step ${step >= 1 ? 'active' : ''}`}>1</div>
                        <div className="progress-line"></div>
                        <div className={`progress-step ${step >= 2 ? 'active' : ''}`}>2</div>
                    </div>

                    <form onSubmit={handleSubmit}>
                        {step === 1 && (
                            <div className="step-content">
                                <div className="form-group">
                                    <label htmlFor="firstName">First Name</label>
                                    <div className="input-with-icon">
                                        <span className="input-icon">👤</span>
                                        <input
                                            type="text"
                                            id="firstName"
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleChange}
                                            required
                                            placeholder="John"
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="lastName">Last Name</label>
                                    <div className="input-with-icon">
                                        <span className="input-icon">👤</span>
                                        <input
                                            type="text"
                                            id="lastName"
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleChange}
                                            required
                                            placeholder="Doe"
                                        />
                                    </div>
                                </div>

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

                                <button type="button" className="auth-button" onClick={nextStep}>
                                    Next
                                </button>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="step-content">
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
                                            placeholder="At least 8 characters"
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="confirmPassword">Confirm Password</label>
                                    <div className="input-with-icon">
                                        <span className="input-icon">🔒</span>
                                        <input
                                            type="password"
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            required
                                            placeholder="Confirm your password"
                                        />
                                    </div>
                                </div>

                                <div className="button-group">
                                    <button type="button" className="auth-button secondary" onClick={prevStep}>
                                        Back
                                    </button>
                                    <button type="submit" className="auth-button" disabled={loading}>
                                        {loading ? 'Creating Account...' : 'Create Account'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </form>

                    <div className="auth-footer">
                        <p>
                            Already have an account?{' '}
                            <span className="auth-link" onClick={switchToLogin}>
                Sign in
              </span>
                        </p>
                        <div className="eco-fact">
                            <span className="eco-icon">🌎</span>
                            <p>
                                Did you know? A single tree can absorb up to 22kg of carbon dioxide per year.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            <div className="nature-bg"></div>
        </div>
    );
};

export default Signup;
