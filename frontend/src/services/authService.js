// src/services/authService.js
import API from '../api';

const authService = {
    // Now using API for all requests, so the interceptor applies
    login: async (email, password) => {
        try {
            const response = await API.post('token/', {email, password});
            if (response.data) {
                localStorage.setItem('accessToken', response.data.access);
                localStorage.setItem('refreshToken', response.data.refresh);
            }
            return response.data;
        } catch (error) {
            console.error('Login error:', error.response ? error.response.data : error.message);
            throw error;
        }
    },

    /**
     * Registers a new user with the provided userData.
     *
     * @param {Object} userData - Should include email, first_name, last_name, dob, address,
     *                            members_in_family, phone_number, occupation, and password.
     * @returns {Promise<Object>} The newly created user data.
     */
    register: async (userData) => {
        try {
            const response = await API.post('register/', userData);
            return response.data;
        } catch (error) {
            console.error('Registration error:', error.response ? error.response.data : error.message);
            throw error;
        }
    },

    /**
     * Logs out the user by clearing tokens from localStorage.
     */
    logout: () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
    },

    /**
     * Refreshes the access token using the stored refresh token.
     *
     * @returns {Promise<string>} The new access token.
     */
    refreshToken: async () => {
        try {
            const refresh = localStorage.getItem('refreshToken');
            if (!refresh) {
                throw new Error('No refresh token available');
            }
            const response = await API.post('token/refresh/', {refresh});
            if (response.data) {
                localStorage.setItem('accessToken', response.data.access);
                return response.data.access;
            }
        } catch (error) {
            console.error('Token refresh error:', error.response ? error.response.data : error.message);
            throw error;
        }
    },

    /**
     * Returns the current access token from localStorage.
     *
     * @returns {string|null} The access token or null if not found.
     */
    getAccessToken: () => {
        return localStorage.getItem('accessToken');
    },
};

export default authService;
