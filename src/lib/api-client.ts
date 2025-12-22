import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { getAuthToken, clearAuthToken } from './cookies';

const API_BASE_URL = 'http://api.shield.clestiq.com/api/v1';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - inject auth token
apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = getAuthToken();

        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - handle 401 errors
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Clear invalid token
            clearAuthToken();

            // Redirect to login if not already there
            if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/auth')) {
                window.location.href = '/auth/login';
            }
        }

        return Promise.reject(error);
    }
);

export default apiClient;
export { API_BASE_URL };
