"use client";

import { useAuth } from "@/context/auth-context";
import { useState, useEffect } from "react";
import {
    User,
    Settings,
    Bell,
    Shield,
    Trash2,
    Edit2,
    Check,
    X,
    LogOut,
    Mail,
    Smartphone,
    AlertTriangle
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
    const { user, logout, loading, updateUser } = useAuth();
    const [activeTab, setActiveTab] = useState<"profile" | "preferences" | "account">("profile");
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        full_name: "",
    });
    const [saving, setSaving] = useState(false);
    const router = useRouter();

    // Preferences state (mocked for now as backend support is unclear)
    const [preferences, setPreferences] = useState({
        emailNotifications: true,
        pushNotifications: false,
        weeklyDigest: true,
        marketingEmails: false
    });

    useEffect(() => {
        if (user) {
            setFormData({
                full_name: user.full_name || "",
            });
        }
    }, [user]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-100px)]">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-12 w-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                    <p className="text-muted-foreground animate-pulse">Loading profile...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)] gap-4">
                <h1 className="text-2xl font-bold text-foreground">Access Denied</h1>
                <p className="text-muted-foreground">Please log in to view your profile.</p>
                <button
                    onClick={() => router.push('/auth/login')}
                    className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                    Go to Login
                </button>
            </div>
        );
    }

    const handleSaveProfile = async () => {
        setSaving(true);
        try {
            await updateUser({ full_name: formData.full_name });
            setIsEditing(false);
        } catch (error) {
            console.error("Failed to update profile", error);
            // Ideally show toast here
        } finally {
            setSaving(false);
        }
    };

    const togglePreference = (key: keyof typeof preferences) => {
        setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const tabs = [
        { id: "profile", label: "Profile", icon: User },
        { id: "preferences", label: "Preferences", icon: Settings }, // Using Settings icon for preferences as it's common
        { id: "account", label: "Account", icon: Shield },
    ] as const;

    return (
        <div className="h-[calc(100vh-4rem)] flex flex-col max-w-5xl mx-auto">
            <div className="pt-6 pb-4">
                <h1 className="text-3xl font-bold text-foreground">Account Settings</h1>
                <p className="text-muted-foreground mt-1">Manage your personal information and security.</p>
            </div>

            <div className="flex-1 flex gap-8 overflow-hidden">
                {/* Sidebar / Tabs */}
                <div className="w-64 flex-shrink-0 space-y-0 p-2 rounded-2xl border border-white/5 bg-black/20 h-fit">
                    {tabs.map((tab, index) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <div key={tab.id}>
                                <button
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                                        ? "bg-primary/10 text-primary shadow-[0_0_15px_rgba(16,185,129,0.1)] border border-primary/20"
                                        : "text-muted-foreground hover:bg-white/5 hover:text-foreground border border-transparent"
                                        }`}
                                >
                                    <Icon className={`h-5 w-5 ${isActive ? "text-primary" : "opacity-70"}`} />
                                    {tab.label}
                                </button>
                            </div>
                        );
                    })}
                </div>

                {/* Main Content Area */}
                <div className="flex-1 pr-2 pb-10">
                    <div className="space-y-6">

                        {/* PROFILE TAB */}
                        {activeTab === "profile" && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                                {/* Profile Card */}
                                <div className="glass-card p-8 rounded-2xl relative border border-border/50 bg-black/20 backdrop-blur-xl">
                                    <div className="absolute top-6 right-6">
                                        {isEditing ? (
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => setIsEditing(false)}
                                                    disabled={saving}
                                                    className="p-2 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
                                                    title="Cancel"
                                                >
                                                    <X className="h-5 w-5" />
                                                </button>
                                                <button
                                                    onClick={handleSaveProfile}
                                                    disabled={saving}
                                                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                                                >
                                                    {saving ? (
                                                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                    ) : (
                                                        <Check className="h-4 w-4" />
                                                    )}
                                                    Save Changes
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => setIsEditing(true)}
                                                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm font-medium hover:bg-white/10 transition-colors"
                                            >
                                                <Edit2 className="h-4 w-4" />
                                                Edit Profile
                                            </button>
                                        )}
                                    </div>

                                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                                        <div className="relative group">
                                            <div className="h-24 w-24 rounded-full bg-gradient-to-br from-primary to-green-800 flex items-center justify-center text-white text-3xl font-bold shadow-2xl ring-4 ring-black/40">
                                                {user.email.substring(0, 1).toUpperCase()}
                                            </div>
                                            {isEditing && (
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                                    <span className="text-xs text-white font-medium">Change</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-1 space-y-4 w-full pt-2 text-center sm:text-left">
                                            <div>
                                                {isEditing ? (
                                                    <div className="mb-2">
                                                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Full Name</label>
                                                        <input
                                                            type="text"
                                                            value={formData.full_name}
                                                            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                                            className="w-full max-w-md bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                                            placeholder="John Doe"
                                                        />
                                                    </div>
                                                ) : (
                                                    <h2 className="text-2xl font-bold text-foreground">{user.full_name || "Clestiq User"}</h2>
                                                )}
                                                <p className="text-muted-foreground">{user.email}</p>
                                                <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                                                    Active Account
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-6 border-t border-white/5">

                                                <div>
                                                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">Role</label>
                                                    <div className="text-sm text-foreground/80 px-1 py-1">
                                                        Owner
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* PREFERENCES TAB */}
                        {activeTab === "preferences" && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                                <div className="glass-card p-8 rounded-2xl border border-border/50 bg-black/20 backdrop-blur-xl space-y-8">

                                    {/* Email Preferences */}
                                    <div>
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                                                <Mail className="h-5 w-5" />
                                            </div>
                                            <h3 className="text-lg font-semibold text-foreground">Email Notifications</h3>
                                        </div>

                                        <div className="space-y-4 pl-0 sm:pl-12">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-medium text-foreground">Security Updates</p>
                                                    <p className="text-sm text-muted-foreground">Get notified about important security events</p>
                                                </div>
                                                <button
                                                    onClick={() => togglePreference("emailNotifications")}
                                                    className={`w-11 h-6 rounded-full transition-colors relative ${preferences.emailNotifications ? "bg-primary" : "bg-white/10"}`}
                                                >
                                                    <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${preferences.emailNotifications ? "left-6" : "left-1"}`} />
                                                </button>
                                            </div>
                                            <div className="h-px bg-white/5" />
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-medium text-foreground">Weekly Digest</p>
                                                    <p className="text-sm text-muted-foreground">Summary of your account activity</p>
                                                </div>
                                                <button
                                                    onClick={() => togglePreference("weeklyDigest")}
                                                    className={`w-11 h-6 rounded-full transition-colors relative ${preferences.weeklyDigest ? "bg-primary" : "bg-white/10"}`}
                                                >
                                                    <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${preferences.weeklyDigest ? "left-6" : "left-1"}`} />
                                                </button>
                                            </div>
                                            <div className="h-px bg-white/5" />
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-medium text-foreground">Marketing & Updates</p>
                                                    <p className="text-sm text-muted-foreground">News about product features and improvements</p>
                                                </div>
                                                <button
                                                    onClick={() => togglePreference("marketingEmails")}
                                                    className={`w-11 h-6 rounded-full transition-colors relative ${preferences.marketingEmails ? "bg-primary" : "bg-white/10"}`}
                                                >
                                                    <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${preferences.marketingEmails ? "left-6" : "left-1"}`} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Push Notifications */}
                                    <div>
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                                                <Bell className="h-5 w-5" />
                                            </div>
                                            <h3 className="text-lg font-semibold text-foreground">Push Notifications</h3>
                                        </div>

                                        <div className="space-y-4 pl-0 sm:pl-12">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-medium text-foreground">Browser Notifications</p>
                                                    <p className="text-sm text-muted-foreground">Get real-time alerts in your browser</p>
                                                </div>
                                                <button
                                                    onClick={() => togglePreference("pushNotifications")}
                                                    className={`w-11 h-6 rounded-full transition-colors relative ${preferences.pushNotifications ? "bg-primary" : "bg-white/10"}`}
                                                >
                                                    <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${preferences.pushNotifications ? "left-6" : "left-1"}`} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ACCOUNT TAB */}
                        {activeTab === "account" && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                                <div className="glass-card p-8 rounded-2xl border border-border/50 bg-black/20 backdrop-blur-xl">
                                    <h3 className="text-lg font-semibold text-foreground mb-6">Sign Out</h3>
                                    <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                                        <div>
                                            <p className="font-medium text-foreground">Sign out of your account</p>
                                            <p className="text-sm text-muted-foreground">Return to the login screen</p>
                                        </div>
                                        <button
                                            onClick={logout}
                                            className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-foreground text-sm font-medium transition-colors border border-white/10"
                                        >
                                            <LogOut className="h-4 w-4 mr-2 inline" />
                                            Sign Out
                                        </button>
                                    </div>
                                </div>

                                <div className="glass-card p-8 rounded-2xl border border-red-500/20 bg-red-500/5 backdrop-blur-xl">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="p-2 rounded-lg bg-red-500/10 text-red-500">
                                            <AlertTriangle className="h-5 w-5" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-red-500">Danger Zone</h3>
                                    </div>

                                    <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/10">
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                            <div>
                                                <p className="font-medium text-red-300">Request Account Deletion</p>
                                                <p className="text-sm text-red-400/70 mt-1">
                                                    Permanently delete your account and all associated data. This action cannot be undone.
                                                </p>
                                            </div>
                                            <button
                                                className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors shadow-lg shadow-red-500/20 whitespace-nowrap"
                                                onClick={() => {
                                                    if (confirm("Are you sure you want to request account deletion? This will alert the admin team.")) {
                                                        alert("Deletion request sent.");
                                                    }
                                                }}
                                            >
                                                <Trash2 className="h-4 w-4 mr-2 inline" />
                                                Delete Account
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
