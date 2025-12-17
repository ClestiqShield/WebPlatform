"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { api } from "@/lib/api";

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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const initAuth = async () => {
            // 1. Check Cookie
            const token = Cookies.get("token");
            const currentPath = window.location.pathname;
            const isPublicPath = currentPath.startsWith("/login") || currentPath.startsWith("/signup");

            // No Token Case
            if (!token) {
                setLoading(false);
                if (!isPublicPath) {
                    router.push("/login"); // Force redirect
                }
                return;
            }

            // 2. Validate/Fetch User
            try {
                const { data } = await api.get<User>("/users/");
                setUser(data);
                // If we found a user and are on a public path, redirect to dashboard? 
                // Optional, but Middleware usually handles this. client-side backup is good.
                if (isPublicPath) {
                    router.push("/dashboard");
                }
            } catch (error: any) {
                console.error("Auth check failed:", error);
                console.error("Error details:", error.response?.data || error.message);
                // Clear invalid token
                Cookies.remove("token", { path: '/' });
                setUser(null);
                // Redirect to login if on a protected route
                if (!isPublicPath) {
                    router.push("/login");
                }
            } finally {
                setLoading(false);
            }
        };

        initAuth();
    }, []); // Run only on mount

    const login = (token: string, userData: User) => {
        // Set cookie for 7 days, strict path to root
        Cookies.set("token", token, { expires: 7, secure: window.location.protocol === 'https:', path: '/' });
        setUser(userData);
        router.push("/dashboard");
    };

    const logout = () => {
        Cookies.remove("token", { path: '/' });
        setUser(null);
        router.push("/login"); // Redirect to local login page
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
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
