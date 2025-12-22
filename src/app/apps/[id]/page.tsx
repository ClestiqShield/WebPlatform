"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { appsApi, apiKeysApi, Application, ApiKey } from "@/lib/api-client";
import { ArrowLeft, Copy, Check, Terminal, Shield, Plus, Trash2, AlertTriangle, Key } from "lucide-react";

export default function AppDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const [app, setApp] = useState<Application | null>(null);
    const [keys, setKeys] = useState<ApiKey[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"sentinel" | "guardian">("sentinel");

    // Key Creation State
    const [isCreatingKey, setIsCreatingKey] = useState(false);
    const [newKeyName, setNewKeyName] = useState("");
    const [createdKeySecret, setCreatedKeySecret] = useState<string | null>(null);
    const [creating, setCreating] = useState(false);
    const [copiedSecret, setCopiedSecret] = useState(false);

    // Key Deletion State
    const [keyToDelete, setKeyToDelete] = useState<ApiKey | null>(null);

    useEffect(() => {
        if (params.id) {
            loadData(params.id as string);
        }
    }, [params.id]);

    const loadData = async (id: string) => {
        try {
            const [appData, keysData] = await Promise.all([
                appsApi.get(id),
                apiKeysApi.list(id)
            ]);
            setApp(appData.data);
            setKeys(keysData.data);
        } catch (error) {
            console.error("Failed to load app data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateKey = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!app || !newKeyName.trim()) return;

        setCreating(true);
        try {
            const { data } = await apiKeysApi.create(app.id, newKeyName);
            setCreatedKeySecret(data.api_key);
            setKeys([data, ...keys]);
            setNewKeyName("");
        } catch (error) {
            console.error("Failed to create key", error);
        } finally {
            setCreating(false);
        }
    };

    const handleRevokeClick = (key: ApiKey) => {
        setKeyToDelete(key);
    };

    const confirmRevoke = async () => {
        if (!app || !keyToDelete) return;

        try {
            await apiKeysApi.revoke(app.id, keyToDelete.id);
            setKeys(keys.filter(k => k.id !== keyToDelete.id));
            setKeyToDelete(null);
        } catch (error) {
            console.error("Failed to revoke key", error);
        }
    };

    const copySecret = () => {
        if (createdKeySecret) {
            navigator.clipboard.writeText(createdKeySecret);
            setCopiedSecret(true);
            setTimeout(() => setCopiedSecret(false), 2000);
        }
    };

    const closeKeyModal = () => {
        setIsCreatingKey(false);
        setCreatedKeySecret(null);
    };

    // Use the first active key for examples, or a placeholder
    const exampleKey = keys.find(k => k.is_active)?.key_prefix ? `${keys.find(k => k.is_active)?.key_prefix}...` : "YOUR_API_KEY";

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-10 w-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                    <p className="text-muted-foreground animate-pulse">Loading application details...</p>
                </div>
            </div>
        );
    }

    if (!app) {
        return (
            <div className="flex flex-col items-center justify-center h-full gap-4">
                <h1 className="text-2xl font-bold text-foreground">Application Not Found</h1>
                <button
                    onClick={() => router.push('/apps')}
                    className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Apps
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-5xl mx-auto pb-10">
            {/* Header */}
            <div>
                <button
                    onClick={() => router.push('/apps')}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Applications
                </button>
                <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-gray-800 to-black flex items-center justify-center border border-white/10 shadow-lg">
                        <Terminal className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">{app.name}</h1>
                        <p className="text-muted-foreground mt-1 text-sm font-mono">Created: {new Date(app.created_at).toLocaleDateString()}</p>
                    </div>
                </div>
            </div>

            {/* API Keys Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                        <Key className="h-5 w-5 text-primary" />
                        API Keys
                    </h2>
                    <button
                        onClick={() => setIsCreatingKey(true)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm hover:bg-white/10 transition-colors"
                    >
                        <Plus className="h-4 w-4" />
                        Create New Key
                    </button>
                </div>

                {keys.length === 0 ? (
                    <div className="p-8 rounded-xl bg-white/5 border border-white/5 text-center">
                        <p className="text-muted-foreground">No API keys found. Create one to start using the API.</p>
                    </div>
                ) : (
                    <div className="grid gap-3">
                        {keys.map(key => (
                            <div key={key.id} className="flex items-center justify-between p-4 rounded-xl bg-black/20 border border-white/5">
                                <div>
                                    <div className="flex items-center gap-3">
                                        <p className="font-medium text-foreground">{key.name || "Unnamed Key"}</p>
                                        <span className={`px-2 py-0.5 rounded text-[10px] bg-green-500/10 text-green-400 border border-green-500/20`}>Active</span>
                                    </div>
                                    <p className="text-xs font-mono text-muted-foreground mt-1">
                                        Prefix: <span className="text-foreground/80">{key.key_prefix}</span> • Created: {new Date(key.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </p>
                                </div>
                                <button
                                    onClick={() => handleRevokeClick(key)}
                                    className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                    title="Revoke Key"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Create Key Modal */}
            {isCreatingKey && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="w-full max-w-md bg-[#020403] border border-white/10 rounded-2xl shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200">
                        <h2 className="text-xl font-bold text-foreground">Create API Key</h2>

                        {!createdKeySecret ? (
                            <form onSubmit={handleCreateKey} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-muted-foreground mb-1">Key Name</label>
                                    <input
                                        type="text"
                                        value={newKeyName}
                                        onChange={(e) => setNewKeyName(e.target.value)}
                                        placeholder="e.g. Development Key"
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                        autoFocus
                                    />
                                </div>
                                <div className="flex justify-end gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsCreatingKey(false)}
                                        className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={creating || !newKeyName.trim()}
                                        className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-all"
                                    >
                                        {creating ? "Creating..." : "Create Key"}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="space-y-4">
                                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                                    <div className="flex items-start gap-3">
                                        <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                                        <div>
                                            <h3 className="font-medium text-green-500">Key Created Successfully</h3>
                                            <p className="text-sm text-green-400/80 mt-1">Copy this key now. You won't be able to see it again.</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="relative">
                                    <code className="block w-full p-4 bg-black/40 border border-white/10 rounded-lg font-mono text-sm break-all pr-12 text-foreground">
                                        {createdKeySecret}
                                    </code>
                                    <button
                                        onClick={copySecret}
                                        className="absolute right-2 top-2 p-2 text-muted-foreground hover:text-foreground bg-white/5 hover:bg-white/10 rounded-md transition-colors"
                                    >
                                        {copiedSecret ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                    </button>
                                </div>

                                <button
                                    onClick={closeKeyModal}
                                    className="w-full py-2 bg-white/10 hover:bg-white/20 text-foreground rounded-lg font-medium transition-colors"
                                >
                                    Done
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Revoke Key Confirmation Modal */}
            {keyToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="w-full max-w-md bg-[#09090b] border border-white/10 rounded-2xl shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center gap-4 text-red-500 mb-2">
                            <div className="p-3 bg-red-500/10 rounded-full">
                                <AlertTriangle className="h-6 w-6" />
                            </div>
                            <h2 className="text-xl font-bold text-foreground">Revoke API Key?</h2>
                        </div>

                        <div className="space-y-3">
                            <p className="text-muted-foreground">
                                You are about to revoke <span className="font-semibold text-foreground">{keyToDelete.name || "this key"}</span>.
                            </p>
                            <p className="text-sm text-red-400">
                                Any applications or scripts using this key will immediately stop working. This action cannot be undone.
                            </p>
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <button
                                onClick={() => setKeyToDelete(null)}
                                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmRevoke}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-all shadow-[0_0_15px_rgba(220,38,38,0.3)]"
                            >
                                Revoke Key
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
