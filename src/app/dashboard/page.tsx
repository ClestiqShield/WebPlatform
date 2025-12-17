export default function DashboardPage() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
                <p className="text-muted-foreground mt-2">Welcome back, here's what's happening today.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="glass-card p-6 rounded-xl hover:border-primary/30 transition-colors">
                    <h2 className="text-lg font-semibold mb-2 text-foreground">Usage Overview</h2>
                    <p className="text-muted-foreground text-sm">Real-time metrics for your active applications.</p>
                    <div className="mt-4 h-24 bg-gradient-to-r from-primary/10 to-transparent rounded-lg border border-white/5 flex items-center justify-center">
                        <span className="text-primary text-xs font-mono">Chart Placeholder</span>
                    </div>
                </div>

                <div className="glass-card p-6 rounded-xl hover:border-primary/30 transition-colors">
                    <h2 className="text-lg font-semibold mb-2 text-foreground">Security Status</h2>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_10px_#10b981]"></div>
                        <span className="text-green-500 text-sm font-medium">All Systems Operational</span>
                    </div>
                    <p className="text-muted-foreground text-sm">No recent security incidents detected.</p>
                </div>

                <div className="glass-card p-6 rounded-xl hover:border-primary/30 transition-colors relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                    <h2 className="text-lg font-semibold mb-2 text-foreground">Quick Actions</h2>
                    <div className="flex flex-col gap-2 mt-4">
                        <button className="px-4 py-2 rounded-lg bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors text-left">
                            + Deploy New App
                        </button>
                        <button className="px-4 py-2 rounded-lg bg-white/5 text-muted-foreground text-sm font-medium hover:bg-white/10 transition-colors text-left">
                            View Audit Logs
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
