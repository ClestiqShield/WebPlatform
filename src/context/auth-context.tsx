"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import apiClient from "@/lib/api-client";

interface User {
    id: string;
    email: string;
    full_name?: string;
    is_active: boolean;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (token: string, user: User) => void;
    logout: () => void;
    updateUser: (data: Partial<User>) => Promise<void>;
    fetchUser: () => Promise<User | undefined>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const fetchUser = async () => {
        try {
            // console.log('Fetching user profile...');
            const { data } = await apiClient.get<User>("/users/");
            // console.log('User profile fetched:', data);
            setUser(data);
            return data;
        } catch (error: any) {
            console.error("Auth check failed:", error);

            // On 401 (Unauthenticated) or 403 (Forbidden), logout.
            if (error.response?.status === 401 || error.response?.status === 403) {
                console.log("Token invalid/expired (401/403), logging out.");
                Cookies.remove("clestiq_auth_token", { path: '/' });
                setUser(null);

                const currentPath = window.location.pathname;
                if (!currentPath.startsWith("/auth/login") && !currentPath.startsWith("/auth/signup")) {
                    router.push("/auth/login");
                }
            } else {
                console.warn("Backend error fetching profile.");
            }
            throw error;
        }
    };

    useEffect(() => {
        const initAuth = async () => {
            // 1. Check Cookie using the correct name from lib/cookies
            const token = Cookies.get("clestiq_auth_token");
            const currentPath = window.location.pathname;
            const isPublicPath = currentPath.startsWith("/auth/login") || currentPath.startsWith("/auth/signup");

            // No Token Case
            if (!token) {
                setLoading(false);
                if (!isPublicPath) {
                    // console.log("No token in AuthContext, redirecting to login");
                    router.push("/auth/login");
                }
                return;
            }

            // 2. Fetch User from Backend
            // We do NOT store user in localStorage anymore.
            try {
                await fetchUser();
            } catch (e) {
                // Error handled in fetchUser
            }

            setLoading(false);
        };

        initAuth();
    }, []); // Run only on mount

    const login = (token: string, userData: User) => {
        // Set cookie for 7 days, strict path to root
        Cookies.set("clestiq_auth_token", token, { expires: 7, secure: window.location.protocol === 'https:', path: '/' });

        // We set the user in state, but do NOT persist to localStorage.
        setUser(userData);
        router.push("/dashboard");
    };

    const logout = () => {
        Cookies.remove("clestiq_auth_token", { path: '/' });
        setUser(null);
        window.location.href = "/auth/login"; // Use full page redirect to clear state completely
    };

    const updateUser = async (data: Partial<User>) => {
        try {
            // Optimistic update locally
            if (user) {
                const updatedUser = { ...user, ...data };
                setUser(updatedUser);
            }

            // Send to backend
            const response = await apiClient.patch<User>("/users/", data);

            // Confirm with backend response
            setUser(response.data);
        } catch (error) {
            console.error("Failed to update user profile:", error);
            throw error;
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, updateUser, fetchUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
