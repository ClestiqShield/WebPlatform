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

export interface Application {
    id: string;
    name: string;
    description?: string;
    owner_id?: string;
    created_at: string;
    updated_at?: string;
}

export interface ApiKey {
    id: string;
    key_prefix: string;
    name: string;
    created_at: string;
    last_used_at?: string;
    is_active: boolean;
}

export interface ApiKeySecret extends ApiKey {
    api_key: string;
}

export const appsApi = {
    getAll: () => apiClient.get<Application[]>('/apps/'),
    create: (name: string) => apiClient.post<Application>('/apps/', { name }),
    delete: (id: string) => apiClient.delete(`/apps/${id}`),
    get: (id: string) => apiClient.get<Application>(`/apps/${id}`),
    update: (id: string, data: Partial<Application>) => apiClient.patch<Application>(`/apps/${id}`, data),
};

export const apiKeysApi = {
    list: (appId: string) => apiClient.get<ApiKey[]>(`/apps/${appId}/keys`),
    create: (appId: string, name: string) => apiClient.post<ApiKeySecret>(`/apps/${appId}/keys`, { name }),
    revoke: (appId: string, keyId: string) => apiClient.delete(`/apps/${appId}/keys/${keyId}`),
};

export interface User {
    id: string;
    email: string;
    full_name?: string;
    is_active: boolean;
    created_at: string;
}

export const usersApi = {
    get: () => apiClient.get<User>('/users/'),
    update: (data: { full_name?: string; is_active?: boolean }) => apiClient.patch<User>('/users/', data),
    closeAccount: () => apiClient.delete('/users/account-closure'),
};

export default apiClient;
export { API_BASE_URL };
