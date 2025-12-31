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
    const [topApps, setTopApps] = useState<(Application & { usage: number })[]>([]);
    const [totalRequests, setTotalRequests] = useState<number>(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [topAppsByKeyCount, setTopAppsByKeyCount] = useState<(Application & { keyCount: number })[]>([]);
    const [topAppsByCost, setTopAppsByCost] = useState<(Application & { cost: number })[]>([]);
    const [topAppsByDisabledKeys, setTopAppsByDisabledKeys] = useState<(Application & { disabledCount: number })[]>([]);
    const [topKeys, setTopKeys] = useState<(ApiKey & { appName: string })[]>([]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [appsRes, userRes] = await Promise.all([
                    appsApi.getAll(),
                    usersApi.get()
                ]);

                const sortedApps = appsRes.data.sort((a, b) =>
                    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                );
                setApps(sortedApps);
                setUser(userRes.data);

                const keysPromises = sortedApps.map(app => apiKeysApi.list(app.id));
                const keysResponses = await Promise.all(keysPromises);

                let totalActive = 0;
                let globalRequests = 0;

                // Temp arrays for sorting
                const appsWithUsageAndCost: (Application & { usage: number; cost: number })[] = [];
                const appsWithKeyCounts: (Application & { keyCount: number })[] = [];
                const appsWithDisabled: (Application & { disabledCount: number })[] = [];
                const allKeys: (ApiKey & { appName: string })[] = [];

                keysResponses.forEach((res, index) => {
                    const appKeys = res.data;
                    const app = sortedApps[index];

                    const activeCount = appKeys.filter(k => k.is_active).length;
                    const disabledCount = appKeys.length - activeCount;
                    totalActive += activeCount;

                    const appRequests = appKeys.reduce((sum, key) => sum + (key.request_count || 0), 0);
                    globalRequests += appRequests;

                    appsWithUsageAndCost.push({ ...app, usage: appRequests, cost: appRequests * 0.0002 });
                    appsWithKeyCounts.push({ ...app, keyCount: appKeys.length });
                    appsWithDisabled.push({ ...app, disabledCount });

                    appKeys.forEach(k => allKeys.push({ ...k, appName: app.name }));
                });

                setActiveKeysCount(totalActive);
                setTotalRequests(globalRequests);

                // Set Top Lists
                setTopApps(appsWithUsageAndCost.sort((a, b) => b.usage - a.usage).slice(0, 5));
                setTopAppsByKeyCount(appsWithKeyCounts.sort((a, b) => b.keyCount - a.keyCount).slice(0, 5));
                setTopAppsByCost(appsWithUsageAndCost.sort((a, b) => b.cost - a.cost).slice(0, 5));
                setTopAppsByDisabledKeys(appsWithDisabled.sort((a, b) => b.disabledCount - a.disabledCount).slice(0, 5));
                setTopKeys(allKeys.sort((a, b) => (b.request_count || 0) - (a.request_count || 0)).slice(0, 5));

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
    const estimatedCost = totalRequests * 0.0002;



    // Trend Data Mock


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
            </div>

            {/* Analytics & Insights Section */}
            <div>
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    Analytics & Insights
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">


                    {/* Top Cost / Abuse */}
                    <div className="col-span-3 glass p-6 rounded-xl border border-white/5 space-y-6">
                        <div>
                            <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">Top Spenders (Est. Cost)</h4>
                            {topAppsByCost.slice(0, 3).map((app, i) => (
                                <div key={app.id} className="flex justify-between items-center text-sm py-1 border-b border-white/5 last:border-0">
                                    <span className="text-foreground">{i + 1}. {app.name}</span>
                                    <span className="font-mono text-primary">${app.cost.toFixed(3)}</span>
                                </div>
                            ))}
                        </div>
                        <div>
                            <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3 text-red-400">Potential Abuse (Disabled Keys)</h4>
                            {topAppsByDisabledKeys.filter(a => a.disabledCount > 0).slice(0, 3).map((app, i) => (
                                <div key={app.id} className="flex justify-between items-center text-sm py-1 border-b border-white/5 last:border-0">
                                    <span className="text-foreground">{i + 1}. {app.name}</span>
                                    <span className="font-mono text-red-400">{app.disabledCount} keys</span>
                                </div>
                            ))}
                            {topAppsByDisabledKeys.filter(a => a.disabledCount > 0).length === 0 && (
                                <p className="text-xs text-muted-foreground">No disabled keys detected.</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
                    {/* Top Apps by Usage */}
                    <div className="glass p-5 rounded-xl border border-white/5">
                        <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">Most Active Apps</h4>
                        {topApps.slice(0, 5).map((app, i) => (
                            <div key={app.id} className="mb-2 last:mb-0">
                                <div className="flex justify-between text-xs mb-1">
                                    <span>{app.name}</span>
                                    <span className="text-muted-foreground">{app.usage.toLocaleString()}</span>
                                </div>
                                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500" style={{ width: `${(app.usage / (topApps[0]?.usage || 1)) * 100}%` }} />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Top Apps by Key Count */}
                    <div className="glass p-5 rounded-xl border border-white/5">
                        <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">Apps w/ Most Keys</h4>
                        {topAppsByKeyCount.slice(0, 5).map((app, i) => (
                            <div key={app.id} className="mb-2 last:mb-0">
                                <div className="flex justify-between text-xs mb-1">
                                    <span>{app.name}</span>
                                    <span className="text-muted-foreground">{app.keyCount} keys</span>
                                </div>
                                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-purple-500" style={{ width: `${(app.keyCount / (topAppsByKeyCount[0]?.keyCount || 1)) * 100}%` }} />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Top Keys Global */}
                    <div className="col-span-2 glass p-5 rounded-xl border border-white/5">
                        <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">Top Used API Keys (Global)</h4>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead>
                                    <tr className="border-b border-white/5 text-muted-foreground">
                                        <th className="pb-2">Key Prefix</th>
                                        <th className="pb-2">App</th>
                                        <th className="pb-2 text-right">Requests</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {topKeys.slice(0, 5).map(key => (
                                        <tr key={key.id}>
                                            <td className="py-2 font-mono text-foreground">{key.key_prefix}...</td>
                                            <td className="py-2 text-muted-foreground">{key.appName}</td>
                                            <td className="py-2 text-right text-primary font-medium">{(key.request_count || 0).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Activity Section */}
                <div className="lg:col-span-3">
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
        </div>
    );
}

