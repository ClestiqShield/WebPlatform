"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, Mail, Lock, AlertCircle } from "lucide-react";
import apiClient from "@/lib/api-client";
import { setAuthToken } from "@/lib/cookies";
import { useAuth } from "@/context/auth-context";

export default function LoginPage() {
    const router = useRouter();
    const { login, fetchUser } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            console.log('Attempting login with:', { email, password: '***' });

            // Try form-urlencoded format (common for OAuth2 password flow)
            const formData = new URLSearchParams();
            formData.append('username', email);
            formData.append('password', password);

            const response = await apiClient.post('/auth/login', formData, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });

            console.log('Login response:', response.data);
            const { access_token, user } = response.data;

            // Note: The backend response model is TokenWithUser.
            // If 'user' is missing in response, we might need to fetch it or rely on partial data.
            // Assuming response looks like: { access_token: "...", token_type: "bearer", user: { ... } }

            // Use AuthContext login to handle state and localStorage
            if (user) {
                login(access_token, user);
            } else {
                // Fallback for older backend versions that might not return user object in login response
                // Manually set token then fetch user
                setAuthToken(access_token);
                await fetchUser();
                router.push('/dashboard');
            }
        } catch (err: any) {
            console.error('Login error full:', err);
            console.error('Login error response:', err.response);
            console.error('Login error data:', err.response?.data);
            console.error('Login error detail:', err.response?.data?.detail);

            const errorDetail = err.response?.data?.detail;
            let errorMessage = "Login failed. Please check your credentials.";

            if (Array.isArray(errorDetail)) {
                errorMessage = errorDetail.map((e: any) => `${e.loc?.join(' -> ')}: ${e.msg}`).join(', ');
            } else if (typeof errorDetail === 'string') {
                errorMessage = errorDetail;
            } else if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            }

            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 bg-background">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="flex justify-center mb-8">
                    <div className="flex items-center gap-2">
                        <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                            <ShieldCheck className="w-8 h-8 text-primary" />
                        </div>
                        <span className="text-2xl font-bold">Clestiq Shield</span>
                    </div>
                </div>

                {/* Login Card */}
                <div className="glass-card p-8 rounded-2xl border border-border">
                    <h1 className="text-3xl font-bold mb-2">Welcome back</h1>
                    <p className="text-muted-foreground mb-8">Sign in to your account</p>

                    {error && (
                        <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-lg flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-error flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-error">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium mb-2">
                                Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <input
                                    type="email"
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-input border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                    placeholder="you@example.com"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <input
                                    type="password"
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-input border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? "Signing in..." : "Sign in"}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-muted-foreground">
                            Don't have an account?{" "}
                            <Link href="/auth/signup" className="text-primary hover:underline font-medium">
                                Sign up
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
