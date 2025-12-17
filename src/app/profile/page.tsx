"use client";

import { useAuth } from "@/context/auth-context";

export default function ProfilePage() {
    const { user, logout, loading } = useAuth();

    if (loading) {
        return (
            <div className="space-y-6">
                <h1 className="text-3xl font-bold text-foreground">Profile</h1>
                <p className="text-muted-foreground animate-pulse">Loading profile information...</p>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="space-y-6">
                <h1 className="text-3xl font-bold text-foreground">Profile</h1>
                <p className="text-muted-foreground">Please log in to view your profile.</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-2xl">
            <div>
                <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
                <p className="text-muted-foreground mt-2">Manage your account information and preferences.</p>
            </div>

            <div className="glass-card p-6 rounded-xl space-y-6">
                <div className="flex items-center gap-4">
                    <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary to-green-800 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                        {user.email.substring(0, 1).toUpperCase()}
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-foreground">{user.full_name || "Clestiq User"}</h2>
                        <p className="text-muted-foreground">{user.email}</p>
                        <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-500 border border-green-500/20">
                            Active Account
                        </div>
                    </div>
                </div>

                <div className="border-t border-border/50 pt-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-1">User ID</label>
                            <div className="p-3 bg-black/20 rounded-lg text-sm font-mono text-foreground/80 break-all">
                                {user.id}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-1">Role</label>
                            <div className="p-3 bg-black/20 rounded-lg text-sm text-foreground/80">
                                Owner
                            </div>
                        </div>
                    </div>
                </div>

                <div className="border-t border-border/50 pt-6 flex justify-end">
                    <button
                        onClick={logout}
                        className="px-4 py-2 rounded-lg bg-red-500/10 text-red-500 text-sm font-medium hover:bg-red-500/20 transition-colors border border-red-500/10"
                    >
                        Sign Out
                    </button>
                </div>
            </div>
        </div>
    );
}
