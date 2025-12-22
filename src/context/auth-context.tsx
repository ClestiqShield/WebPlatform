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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

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
                    console.log("No token in AuthContext, redirecting to login");
                    router.push("/auth/login"); // Force redirect
                }
                return;
            }

            // 2. Validate/Fetch User
            // First search in local storage
            let hasCachedData = false;
            const cachedUser = localStorage.getItem("clestiq_user");

            if (cachedUser) {
                try {
                    const parsed = JSON.parse(cachedUser);
                    setUser(parsed);
                    console.log("Loaded user from local storage cache");
                    hasCachedData = true;
                } catch (e) {
                    console.error("Failed to parse cached user", e);
                }
            }

            // Only fetch from backend if we DON'T have cached data
            // User requested to rely on local storage to avoid 500 errors
            if (!hasCachedData) {
                try {
                    console.log('Fetching user profile...');
                    // Backend endpoint is /users/ (see eagle-eye/app/api/v1/endpoints/users.py)
                    const { data } = await apiClient.get<User>("/users/");
                    console.log('User profile fetched:', data);
                    setUser(data);
                    localStorage.setItem("clestiq_user", JSON.stringify(data));
                } catch (error: any) {
                    console.error("Auth check failed:", error);

                    // CRITICAL FIX: Only logout on 401 (Unauthenticated).
                    if (error.response?.status === 401) {
                        console.log("Token invalid/expired (401), logging out.");
                        Cookies.remove("clestiq_auth_token", { path: '/' });
                        localStorage.removeItem("clestiq_user");
                        setUser(null);

                        if (!isPublicPath) {
                            router.push("/auth/login");
                        }
                    } else {
                        console.warn("Backend error (likely 500), but no cached data available.");
                    }
                }
            } else {
                console.log("Skipping backend fetch because local data exists.");
            }

            // Always redirect to dashboard if on public path and we have a user (from cache or fetch)
            if (token && isPublicPath) {
                router.push("/dashboard");
            }

            setLoading(false);
        };

        initAuth();
    }, []); // Run only on mount

    const login = (token: string, userData: User) => {
        // Set cookie for 7 days, strict path to root
        Cookies.set("clestiq_auth_token", token, { expires: 7, secure: window.location.protocol === 'https:', path: '/' });
        localStorage.setItem("clestiq_user", JSON.stringify(userData));
        setUser(userData);
        router.push("/dashboard");
    };

    const logout = () => {
        Cookies.remove("clestiq_auth_token", { path: '/' });
        localStorage.removeItem("clestiq_user");
        setUser(null);
        window.location.href = "/auth/login"; // Use full page redirect to clear state completely
    };

    const updateUser = async (data: Partial<User>) => {
        try {
            // Optimistic update locally
            if (user) {
                const updatedUser = { ...user, ...data };
                setUser(updatedUser);
                localStorage.setItem("clestiq_user", JSON.stringify(updatedUser));
            }

            // Send to backend
            const response = await apiClient.patch<User>("/users/", data);

            // Confirm with backend response
            setUser(response.data);
            localStorage.setItem("clestiq_user", JSON.stringify(response.data));
        } catch (error) {
            console.error("Failed to update user profile:", error);
            // Revert or show error? For now just log it. 
            // Since backend might be flaky, keeping the local update might be desired behavior 
            // if we treat local as source of truth for UI.
            throw error;
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
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
