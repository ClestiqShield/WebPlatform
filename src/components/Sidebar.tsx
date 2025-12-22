"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Settings, User, BarChart2, Grid } from "lucide-react";
import { useAuth } from "@/context/auth-context";

const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Metrics", href: "/metrics", icon: BarChart2 },
    { name: "Apps", href: "/apps", icon: Grid },
    { name: "Profile", href: "/profile", icon: User },
    { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
    const pathname = usePathname();
    const { user, loading } = useAuth();

    // Hide sidebar on auth pages
    if (pathname && pathname.startsWith('/auth')) {
        return null;
    }

    return (
        <div className="flex flex-col h-full w-64 glass border-r border-border/50 text-card-foreground">
            <div className="p-6 border-b border-border/50">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-green-400 bg-clip-text text-transparent">
                    WebPlatform
                </h1>
            </div>
            <nav className="flex-1 p-4 space-y-1">
                {navigation.map((item) => {
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
            </nav>
            <div className="p-4 border-t border-border/50">
                {loading ? (
                    <div className="px-3 py-2 text-sm text-muted-foreground animate-pulse">Initializing...</div>
                ) : user ? (
                    <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-green-800 flex items-center justify-center text-white font-bold shadow-lg">
                            {user.email.substring(0, 1).toUpperCase()}
                        </div>
                        <div className="flex flex-col overflow-hidden">
                            <span className="text-foreground font-medium text-sm truncate">{user.full_name || "User"}</span>
                            <span className="text-xs text-muted-foreground truncate">{user.email}</span>
                        </div>
                    </div>
                ) : (
                    <div className="px-3 py-2 text-sm text-muted-foreground">Guest User</div>
                )}
            </div>
        </div>
    );
}
