"use client";

import { useEffect, useState } from "react";
import { Application, ApiKey, appsApi, apiKeysApi } from "@/lib/api-client";
import { BarChart3, PieChart, TrendingUp, Zap, Server, Key, Activity } from "lucide-react";

interface AppMetrics {
    app: Application;
    totalRequests: number;
    keyCount: number;
    activeKeyCount: number;
}

interface KeyMetrics extends ApiKey {
    appName: string;
}

export default function MetricsPage() {
    const [loading, setLoading] = useState(true);
    const [appsMetrics, setAppsMetrics] = useState<AppMetrics[]>([]);
    const [topKeys, setTopKeys] = useState<KeyMetrics[]>([]);
    const [globalStats, setGlobalStats] = useState({
        totalRequests: 0,
        totalKeys: 0,
        activeKeys: 0,
        avgRequestsPerApp: 0
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data: apps } = await appsApi.getAll();

                const metricsPromises = apps.map(async (app) => {
                    const { data: keys } = await apiKeysApi.list(app.id);
                    const requests = keys.reduce((sum, k) => sum + (k.request_count || 0), 0);
                    const active = keys.filter(k => k.is_active).length;

                    return {
                        app,
                        keysData: keys,
                        metrics: {
                            app,
                            totalRequests: requests,
                            keyCount: keys.length,
                            activeKeyCount: active
                        }
                    };
                });

                const results = await Promise.all(metricsPromises);

                // Process Apps Metrics
                const processedApps = results.map(r => r.metrics);
                setAppsMetrics(processedApps);

                // Process Top Keys
                const allKeys: KeyMetrics[] = results.flatMap(r =>
                    r.keysData.map(k => ({ ...k, appName: r.app.name }))
                );
                const sortedKeys = allKeys.sort((a, b) => (b.request_count || 0) - (a.request_count || 0));
                setTopKeys(sortedKeys.slice(0, 10)); // Top 10 keys

                // Global Stats
                const totalReq = processedApps.reduce((sum, a) => sum + a.totalRequests, 0);
                const totalK = processedApps.reduce((sum, a) => sum + a.keyCount, 0);
                const activeK = processedApps.reduce((sum, a) => sum + a.activeKeyCount, 0);

                setGlobalStats({
                    totalRequests: totalReq,
                    totalKeys: totalK,
                    activeKeys: activeK,
                    avgRequestsPerApp: apps.length ? Math.round(totalReq / apps.length) : 0
                });

            } catch (error) {
                console.error("Failed to fetch metrics:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    // Sorters
    const topAppsByUsage = [...appsMetrics].sort((a, b) => b.totalRequests - a.totalRequests).slice(0, 5);
    const topAppsByKeys = [...appsMetrics].sort((a, b) => b.keyCount - a.keyCount).slice(0, 5);

    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto pb-10">
            <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                    Metrics & Insights
                </h1>
                <p className="text-muted-foreground mt-2">
                    Deep dive into application performance and usage statistics.
                </p>
            </div>

            {/* Global Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="glass p-4 rounded-xl border border-white/5 flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-blue-500/10 text-blue-500">
                        <TrendingUp className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Requests</p>
                        <p className="text-2xl font-bold">{globalStats.totalRequests.toLocaleString()}</p>
                    </div>
                </div>
                <div className="glass p-4 rounded-xl border border-white/5 flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-green-500/10 text-green-500">
                        <Key className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Active Keys</p>
                        <p className="text-2xl font-bold">{globalStats.activeKeys} <span className="text-sm text-muted-foreground font-normal">/ {globalStats.totalKeys}</span></p>
                    </div>
                </div>
                <div className="glass p-4 rounded-xl border border-white/5 flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-purple-500/10 text-purple-500">
                        <Activity className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Avg Req / App</p>
                        <p className="text-2xl font-bold">{globalStats.avgRequestsPerApp.toLocaleString()}</p>
                    </div>
                </div>
                <div className="glass p-4 rounded-xl border border-white/5 flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-orange-500/10 text-orange-500">
                        <Zap className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Est. Cost</p>
                        <p className="text-2xl font-bold">${(globalStats.totalRequests * 0.0002).toFixed(4)}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Top Apps by Usage - Bar Chart */}
                <div className="glass p-6 rounded-2xl border border-white/5">
                    <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-primary" />
                        Top Applications by Request Volume
                    </h3>
                    <div className="space-y-4">
                        {topAppsByUsage.map((item, index) => {
                            const maxVal = topAppsByUsage[0].totalRequests || 1;
                            const percent = (item.totalRequests / maxVal) * 100;
                            return (
                                <div key={item.app.id} className="relative group">
                                    <div className="flex justify-between text-sm mb-1.5 z-10 relative">
                                        <span className="font-medium text-foreground flex items-center gap-2">
                                            <span className="text-muted-foreground font-mono text-xs w-4">{index + 1}.</span>
                                            {item.app.name}
                                        </span>
                                        <span className="text-muted-foreground font-mono">{item.totalRequests.toLocaleString()} reqs</span>
                                    </div>
                                    <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-primary to-blue-600 rounded-full transition-all duration-1000 ease-out group-hover:brightness-110"
                                            style={{ width: `${percent}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                        {topAppsByUsage.length === 0 && <p className="text-center text-muted-foreground py-8">No usage data avaliable.</p>}
                    </div>
                </div>

                {/* Top Apps by Key Count - Bar Chart */}
                <div className="glass p-6 rounded-2xl border border-white/5">
                    <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                        <Key className="h-5 w-5 text-green-500" />
                        Applications by Key Count
                    </h3>
                    <div className="space-y-4">
                        {topAppsByKeys.map((item, index) => {
                            const maxVal = topAppsByKeys[0].keyCount || 1;
                            const percent = (item.keyCount / maxVal) * 100;
                            return (
                                <div key={item.app.id} className="relative group">
                                    <div className="flex justify-between text-sm mb-1.5 z-10 relative">
                                        <span className="font-medium text-foreground flex items-center gap-2">
                                            <span className="text-muted-foreground font-mono text-xs w-4">{index + 1}.</span>
                                            {item.app.name}
                                        </span>
                                        <span className="text-muted-foreground font-mono">
                                            {item.activeKeyCount} / {item.keyCount} <span className="text-xs">active</span>
                                        </span>
                                    </div>
                                    <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden flex">
                                        <div
                                            className="h-full bg-green-500 rounded-l-full transition-all duration-1000 ease-out"
                                            style={{ width: `${(item.activeKeyCount / maxVal) * 100}%` }}
                                        />
                                        <div
                                            className="h-full bg-white/10"
                                            style={{ width: `${((item.keyCount - item.activeKeyCount) / maxVal) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                        {topAppsByKeys.length === 0 && <p className="text-center text-muted-foreground py-8">No applications found.</p>}
                    </div>
                </div>
            </div>

            {/* Top API Keys Table */}
            <div className="glass p-6 rounded-2xl border border-white/5">
                <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                    <Server className="h-5 w-5 text-purple-500" />
                    Top Active API Keys (Global)
                </h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="border-b border-white/10">
                                <th className="pb-3 text-muted-foreground font-medium pl-2">API Key Name / Prefix</th>
                                <th className="pb-3 text-muted-foreground font-medium">Application</th>
                                <th className="pb-3 text-muted-foreground font-medium">Created</th>
                                <th className="pb-3 text-muted-foreground font-medium text-right">Last Used</th>
                                <th className="pb-3 text-muted-foreground font-medium text-right pr-2">Requests</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {topKeys.map((key) => (
                                <tr key={key.id} className="group hover:bg-white/5 transition-colors">
                                    <td className="py-3 pl-2">
                                        <div className="font-medium text-foreground">{key.name || "Unnamed Key"}</div>
                                        <div className="text-xs text-muted-foreground font-mono">{key.key_prefix}...</div>
                                    </td>
                                    <td className="py-3 text-foreground/80">{key.appName}</td>
                                    <td className="py-3 text-muted-foreground">
                                        {new Date(key.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="py-3 text-right text-muted-foreground">
                                        {key.last_used_at ? new Date(key.last_used_at).toLocaleDateString() : 'Never'}
                                    </td>
                                    <td className="py-3 pr-2 text-right">
                                        <span className="inline-block bg-purple-500/10 text-purple-400 px-2 py-1 rounded font-mono text-xs border border-purple-500/20">
                                            {(key.request_count || 0).toLocaleString()}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {topKeys.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="py-8 text-center text-muted-foreground">No API keys found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
