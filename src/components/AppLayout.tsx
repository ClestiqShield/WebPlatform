"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";

export function AppLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    // Define paths where the sidebar/dashboard layout should NOT appear
    const isPublicPath = pathname === "/" || pathname?.startsWith("/auth");

    if (isPublicPath) {
        return <>{children}</>;
    }

    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-auto bg-muted/20">
                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
