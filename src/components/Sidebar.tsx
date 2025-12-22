"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Settings, User, BarChart2, Grid, LogOut } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useState, useEffect } from "react";

const mainNavigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Metrics", href: "/metrics", icon: BarChart2 },
    { name: "Apps", href: "/apps", icon: Grid },
];

const secondaryNavigation = [
    { name: "Profile", href: "/profile", icon: User },
];

export function Sidebar() {
    const pathname = usePathname();
    const { user, loading } = useAuth();
    const [isHealthy, setIsHealthy] = useState(true);

    // Mock health check
    useEffect(() => {
        const interval = setInterval(() => {
            setIsHealthy(true);
        }, 30000);
        return () => clearInterval(interval);
    }, []);

    // Hide sidebar on auth pages
    if (pathname && pathname.startsWith('/auth')) {
        return null;
    }

    return (
        <div className="flex flex-col h-full w-64 glass border-r border-border/50 text-card-foreground">
            <div className="p-6 border-b border-border/50">
                <div className="flex flex-col">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-green-400 bg-clip-text text-transparent">
                        Clestiq Shield
                    </h1>
                    <span className="text-xs font-mono text-muted-foreground/60 mt-1"> v2.1.1</span>
                </div>
            </div>
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                <div className="space-y-1">
                    {mainNavigation.map((item, index) => {
                        const isActive = pathname?.startsWith(item.href);
                        return (
                            <div key={item.name}>
                                <Link
                                    href={item.href}
                                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${isActive
                                        ? "bg-primary/10 text-primary font-medium shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                                        : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                                        }`}
                                >
                                    <item.icon className={`h-5 w-5 ${isActive ? "text-primary" : "text-muted-foreground/70"}`} />
                                    {item.name}
                                </Link>
                                {index < mainNavigation.length - 1 && (
                                    <div className="h-px bg-white/5 mx-2 my-1" />
                                )}
                            </div>
                        );
                    })}
                </div>

                <div className="h-px bg-white/5 mx-2 my-1" />

                <div className="space-y-1">
                    {secondaryNavigation.map((item) => {
                        const isActive = pathname?.startsWith(item.href);
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${isActive
                                    ? "bg-primary/10 text-primary font-medium shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                                    : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                                    }`}
                            >
                                <item.icon className={`h-5 w-5 ${isActive ? "text-primary" : "text-muted-foreground/70"}`} />
                                {item.name}
                            </Link>
                        );
                    })}
                </div>
            </nav>

            <div className="mt-auto px-6 pb-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground/60 py-2">
                    <div className={`h-2 w-2 rounded-full ${isHealthy ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                    <span>{isHealthy ? 'System Operational' : 'System Issues'}</span>
                </div>
                <div className="h-px bg-border/50 my-2" />
            </div>

            <div className="px-4 pb-4">
                {loading ? (
                    <div className="px-3 py-2 text-sm text-muted-foreground animate-pulse">Initializing...</div>
                ) : user ? (
                    <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/5 transition-colors hover:bg-white/10 group">
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-green-800 flex flex-shrink-0 items-center justify-center text-white font-bold text-xs shadow-lg">
                                {user.email.substring(0, 1).toUpperCase()}
                            </div>
                            <div className="flex flex-col overflow-hidden max-w-[90px]">
                                <span className="text-foreground font-medium text-sm truncate">{user.full_name || "User"}</span>
                                <span className="text-[10px] text-muted-foreground truncate">{user.email}</span>
                            </div>
                        </div>
                        <button
                            onClick={() => window.location.href = '/auth/login'}
                            className="p-1.5 rounded-md text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors opacity-70 group-hover:opacity-100"
                            title="Sign Out"
                        >
                            <LogOut className="h-4 w-4" />
                        </button>
                    </div>
                ) : (
                    <div className="px-3 py-2 text-sm text-muted-foreground">Guest User</div>
                )}
            </div>
        </div>
    );
}
