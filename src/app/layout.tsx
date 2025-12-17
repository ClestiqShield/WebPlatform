import type { Metadata } from "next";
import { Suspense } from "react";
import { Outfit } from "next/font/google";
import { Sidebar } from "@/components/Sidebar";
import { AuthProvider } from "@/context/auth-context";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "Clestiq Shield WebPlatform",
  description: "WebPlatform Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${outfit.variable} font-sans antialiased bg-background text-foreground`}>
        <Suspense fallback={null}>
          <AuthProvider>
            <div className="flex h-screen overflow-hidden">
              <Sidebar />
              <main className="flex-1 overflow-auto bg-muted/20">
                <div className="p-8">
                  {children}
                </div>
              </main>
            </div>
          </AuthProvider>
        </Suspense>
      </body>
    </html>
  );
}
