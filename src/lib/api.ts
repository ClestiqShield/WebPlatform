import axios from "axios";
import Cookies from "js-cookie";

// Default to localhost for development if not specified
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export const api = axios.create({
    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

api.interceptors.request.use((config) => {
    if (typeof window !== "undefined") {
        const token = Cookies.get("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 && typeof window !== "undefined") {
            // Only redirect if not already on auth page to avoid loops
            if (!window.location.pathname.startsWith("/login") && !window.location.pathname.startsWith("/signup")) {
                window.location.href = "/login";
            }
        }
        return Promise.reject(error);
    }
);
