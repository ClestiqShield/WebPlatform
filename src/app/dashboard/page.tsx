"use client";

import { useEffect, useState } from "react";
import { Application, ApiKey, appsApi, apiKeysApi, usersApi, User } from "@/lib/api-client";
import { useAuth } from "@/context/auth-context";
import { Plus, Activity, Shield, Server, ArrowRight, Key } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
    const { user: authUser } = useAuth();
    const [user, setUser] = useState<User | null>(null);
    const [apps, setApps] = useState<Application[]>([]);
    const [activeKeysCount, setActiveKeysCount] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Fetch Apps and User Profile in parallel
                const [appsRes, userRes] = await Promise.all([
                    appsApi.getAll(),
                    usersApi.get()
                ]);

                // Sort apps by created_at descending
                const sortedApps = appsRes.data.sort((a, b) =>
                    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                );
                setApps(sortedApps);
                setUser(userRes.data);

                // Fetch keys for all apps to get total count
                const keysPromises = sortedApps.map(app => apiKeysApi.list(app.id));
                const keysResponses = await Promise.all(keysPromises);

                let totalActive = 0;
                keysResponses.forEach(res => {
                    totalActive += res.data.filter(k => k.is_active).length;
                });
                setActiveKeysCount(totalActive);

            } catch (err) {
                console.error("Failed to fetch dashboard data:", err);
                setError("Failed to load dashboard metrics");
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const recentApps = apps.slice(0, 3);
    const totalApps = apps.length;
    const displayName = user?.full_name || authUser?.full_name || 'User';

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                        Dashboard
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Welcome back, <span className="text-primary font-medium">{displayName}</span>. Here's your platform overview.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button className="glass-button px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/5 transition-colors border border-white/10 flex items-center gap-2">
                        <Activity className="h-4 w-4" /> System Health
                    </button>
                    <Link href="/apps" className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-lg shadow-primary/20">
                        <Plus className="h-4 w-4" /> New App
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Total Apps Card */}
                <div className="glass p-6 rounded-xl border border-white/5 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 group relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Server className="h-24 w-24 text-primary" />
                    </div>
                    <div className="relative z-10">
                        <h2 className="text-sm font-medium text-muted-foreground mb-1 uppercase tracking-wider">Total Applications</h2>
                        <div className="text-4xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">{totalApps}</div>
                        <p className="text-xs text-muted-foreground flex items-center gap-2">
                            <span className="text-green-400 flex items-center gap-1 bg-green-400/10 px-1.5 py-0.5 rounded">
                                <Activity className="h-3 w-3" /> Active
                            </span>
                            Across all regions
                        </p>
                    </div>
                </div>

                {/* Active Keys Card */}
                <div className="glass p-6 rounded-xl border border-white/5 hover:border-yellow-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-yellow-500/5 group relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Key className="h-24 w-24 text-yellow-500" />
                    </div>
                    <div className="relative z-10">
                        <h2 className="text-sm font-medium text-muted-foreground mb-1 uppercase tracking-wider">Active API Keys</h2>
                        <div className="text-4xl font-bold text-foreground mb-2 group-hover:text-yellow-500 transition-colors">
                            {activeKeysCount !== null ? activeKeysCount : '-'}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Keys currently authorized for requests.
                        </p>
                    </div>
                </div>

                {/* Account Status Card */}
                <div className="glass p-6 rounded-xl border border-white/5 hover:border-green-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/5 group">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <h2 className="text-sm font-medium text-muted-foreground mb-1 uppercase tracking-wider">Account Status</h2>
                            <div className="flex items-center gap-2 mt-2">
                                <div className={`h-2.5 w-2.5 rounded-full shadow-[0_0_10px_currentColor] animate-pulse ${user?.is_active ? 'bg-green-500 text-green-500' : 'bg-red-500 text-red-500'}`}></div>
                                <span className="text-lg font-semibold text-foreground">
                                    {user?.is_active ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                        </div>
                        <Shield className={`h-8 w-8 opacity-50 group-hover:opacity-100 transition-opacity ${user?.is_active ? 'text-green-500' : 'text-red-500'}`} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-4">
                        {user?.email}
                        <br />
                        Member since {user?.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}
                    </p>
                </div>

                {/* Quick Actions / New Data Card */}
                <div className="glass p-6 rounded-xl border border-white/5 hover:border-blue-500/30 transition-all duration-300 relative overflow-hidden group">
                    <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all"></div>
                    <h2 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wider">Quick Actions</h2>
                    <div className="space-y-2 relative z-10">
                        <Link href="/apps" className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/5 group/link">
                            <span className="text-sm font-medium">Manage Applications</span>
                            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover/link:text-primary transition-colors" />
                        </Link>
                        <button className="w-full flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/5 group/link text-left">
                            <span className="text-sm font-medium">View API Usage</span>
                            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover/link:text-primary transition-colors" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Recent Activity Section */}
            <div>
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    Recent Applications
                </h3>
                <div className="glass rounded-xl border border-white/5 overflow-hidden">
                    {recentApps.length > 0 ? (
                        <div className="divide-y divide-white/5">
                            {recentApps.map((app) => (
                                <div key={app.id} className="p-4 hover:bg-white/5 transition-colors flex items-center justify-between group">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-gray-800 to-black border border-white/10 flex items-center justify-center text-lg font-bold text-gray-400 group-hover:text-primary group-hover:border-primary/50 transition-all">
                                            {app.name.substring(0, 1).toUpperCase()}
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-foreground group-hover:text-primary transition-colors">{app.name}</h4>
                                            <p className="text-xs text-muted-foreground line-clamp-1">{app.description || "No description provided"}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <span className="text-xs text-muted-foreground hidden md:block">
                                            Created {new Date(app.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </span>
                                        <Link href={`/apps/${app.id}`} className="p-2 rounded-full hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors">
                                            <ArrowRight className="h-4 w-4" />
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-8 text-center text-muted-foreground">
                            No applications found. Create your first app to get started.
                        </div>
                    )}
                    {totalApps > 3 && (
                        <div className="p-3 bg-white/5 text-center border-t border-white/5">
                            <Link href="/apps" className="text-xs font-medium text-primary hover:text-primary/80 transition-colors">
                                View All Applications
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
