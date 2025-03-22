// src/api.js
import axios from 'axios';

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

const API = axios.create({
    baseURL: 'http://localhost:8000/api/accounts/', // Adjust the base URL as needed
});

// Request interceptor: attach the access token to every request if available.
API.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor: handle expired tokens, network errors, and 403 errors.
API.interceptors.response.use(
    (response) => response,
    (error) => {
        const originalRequest = error.config;

        // Handle network errors
        if (!error.response) {
            return Promise.reject({message: 'Network Error. Please check your internet connection.'});
        }

        // Handle 401 errors (unauthorized / expired access token)
        if (error.response.status === 401 && !originalRequest._retry) {
            // If a refresh request is already in progress, queue this request.
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({resolve, reject});
                })
                    .then((token) => {
                        originalRequest.headers.Authorization = 'Bearer ' + token;
                        return API(originalRequest);
                    })
                    .catch((err) => {
                        return Promise.reject(err);
                    });
            }

            originalRequest._retry = true;
            isRefreshing = true;
            const refreshToken = localStorage.getItem('refreshToken');

            if (!refreshToken) {
                // No refresh token available, force logout.
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                window.location.href = '/login';
                return Promise.reject(error);
            }

            return new Promise((resolve, reject) => {
                axios
                    .post('http://localhost:8000/api/accounts/token/refresh/', {refresh: refreshToken})
                    .then(({data}) => {
                        localStorage.setItem('accessToken', data.access);
                        API.defaults.headers.common['Authorization'] = 'Bearer ' + data.access;
                        originalRequest.headers.Authorization = 'Bearer ' + data.access;
                        processQueue(null, data.access);
                        resolve(API(originalRequest));
                    })
                    .catch((err) => {
                        processQueue(err, null);
                        // Token refresh failed, force logout.
                        localStorage.removeItem('accessToken');
                        localStorage.removeItem('refreshToken');
                        window.location.href = '/login';
                        reject(err);
                    })
                    .finally(() => {
                        isRefreshing = false;
                    });
            });
        }

        // Handle 403 errors (for example, account deactivated/suspended)
        if (error.response.status === 403) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            window.location.href = '/login';
        }

        return Promise.reject(error);
    }
);

export default API;
