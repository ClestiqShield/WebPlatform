"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, Terminal, ArrowRight, Trash2, Key, AlertTriangle, Shield } from "lucide-react";
import { appsApi, apiKeysApi, Application } from "@/lib/api-client";

export default function AppsPage() {
    const [apps, setApps] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [isCreating, setIsCreating] = useState(false);
    const [newAppName, setNewAppName] = useState("");
    const [creating, setCreating] = useState(false);

    // Deletion State
    const [appToDelete, setAppToDelete] = useState<Application | null>(null);
    const [hasKeys, setHasKeys] = useState(false);

    const router = useRouter();

    useEffect(() => {
        loadApps();
    }, []);

    const loadApps = async () => {
        try {
            const { data } = await appsApi.getAll();
            setApps(data);
        } catch (error) {
            console.error("Failed to load apps", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateApp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newAppName.trim()) return;

        setCreating(true);
        try {
            const { data } = await appsApi.create(newAppName);
            setApps([data, ...apps]);
            setNewAppName("");
            setIsCreating(false);
        } catch (error) {
            console.error("Failed to create app", error);
        } finally {
            setCreating(false);
        }
    };

    const handleDeleteClick = async (e: React.MouseEvent, app: Application) => {
        e.stopPropagation();
        setAppToDelete(app);

        // Check for keys
        try {
            const { data: keys } = await apiKeysApi.list(app.id);
            setHasKeys(keys.length > 0);
        } catch (error) {
            console.error("Failed to check app keys", error);
            // Assume has keys for safety if check fails? Or allow? 
            // Better to allow user to try and fail than block if query fails.
            setHasKeys(false);
        }
    };

    const confirmDelete = async () => {
        if (!appToDelete) return;

        try {
            await appsApi.delete(appToDelete.id);
            setApps(apps.filter(app => app.id !== appToDelete.id));
            setAppToDelete(null);
            setHasKeys(false);
        } catch (error) {
            console.error("Failed to delete app", error);
            alert("Failed to delete application. It may have dependencies.");
        }
    };

    const filteredApps = apps.filter(app =>
        app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="h-full flex flex-col space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Applications</h1>
                    <p className="text-muted-foreground mt-1">Manage your API keys and integrations.</p>
                </div>
                <button
                    onClick={() => setIsCreating(true)}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all font-medium shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                >
                    <Plus className="h-4 w-4" />
                    New App
                </button>
            </div>

            {/* Create App Modal / Inline Form */}
            {isCreating && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="w-full max-w-md bg-[#020403] border border-white/10 rounded-2xl shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200">
                        <h2 className="text-xl font-bold text-foreground">Create New Application</h2>
                        <form onSubmit={handleCreateApp} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-1">App Name</label>
                                <input
                                    type="text"
                                    value={newAppName}
                                    onChange={(e) => setNewAppName(e.target.value)}
                                    placeholder="e.g. Production Web App"
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                    autoFocus
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsCreating(false)}
                                    className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={creating || !newAppName.trim()}
                                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    {creating ? "Creating..." : "Create App"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Search and List */}
            <div className="glass-card rounded-xl border border-border/50 bg-black/20 overflow-hidden flex flex-col flex-1">
                <div className="p-4 border-b border-white/5">
                    <div className="relative max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search apps..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="flex flex-col items-center gap-2">
                            <div className="h-8 w-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                            <p className="text-sm text-muted-foreground animate-pulse">Loading applications...</p>
                        </div>
                    </div>
                ) : filteredApps.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                        <div className="h-16 w-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                            <Terminal className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-medium text-foreground">No applications found</h3>
                        <p className="text-muted-foreground mt-1 max-w-sm">
                            {searchQuery ? "No apps match your search." : "Create your first application to get your API keys and start building."}
                        </p>
                        {!searchQuery && (
                            <button
                                onClick={() => setIsCreating(true)}
                                className="mt-4 text-primary hover:underline text-sm font-medium"
                            >
                                Create App Now
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="overflow-y-auto p-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {filteredApps.map((app) => (
                            <div
                                key={app.id}
                                onClick={() => router.push(`/apps/${app.id}`)}
                                className="group p-5 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-primary/20 transition-all cursor-pointer relative"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-gray-800 to-black flex items-center justify-center border border-white/10 group-hover:border-primary/30 transition-colors">
                                            <Terminal className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{app.name}</h3>
                                            <p className="text-xs text-muted-foreground">{new Date(app.created_at || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={(e) => handleDeleteClick(e, app)}
                                        className="p-2 rounded-lg text-muted-foreground hover:bg-red-500/10 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                        title="Delete App"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>

                                <div className="flex items-center gap-2 text-xs text-primary font-medium mt-2">
                                    <Key className="h-3 w-3" />
                                    <span>Click to view Details & API Keys</span>
                                    <ArrowRight className="h-3 w-3 ml-auto opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Custom Delete Modal */}
            {
                appToDelete && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                        <div className="w-full max-w-md bg-[#09090b] border border-white/10 rounded-2xl shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200">
                            <div className="flex items-center gap-4 text-red-500 mb-2">
                                <div className="p-3 bg-red-500/10 rounded-full">
                                    <AlertTriangle className="h-6 w-6" />
                                </div>
                                <h2 className="text-xl font-bold text-foreground">Delete Application?</h2>
                            </div>

                            <div className="space-y-3">
                                <p className="text-muted-foreground">
                                    You are about to delete <span className="font-semibold text-foreground">{appToDelete.name}</span>.
                                </p>

                                {hasKeys ? (
                                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-200 flex gap-2">
                                        <Shield className="h-5 w-5 shrink-0" />
                                        <div>
                                            <p className="font-semibold">Cannot Delete App</p>
                                            <p className="opacity-90 mt-1">
                                                This application has active API keys. You must revoke all keys before deleting the application.
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-sm text-red-400">
                                        This action cannot be undone. All data associated with this application will be permanently removed.
                                    </p>
                                )}
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    onClick={() => {
                                        setAppToDelete(null);
                                        setHasKeys(false);
                                    }}
                                    className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    Cancel
                                </button>
                                {!hasKeys && (
                                    <button
                                        onClick={confirmDelete}
                                        className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-all shadow-[0_0_15px_rgba(220,38,38,0.3)]"
                                    >
                                        Delete Application
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
}
