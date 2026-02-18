import type { Metadata } from "next";
import { RootProvider } from 'fumadocs-ui/provider/next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';

export const metadata: Metadata = {
    title: "Zuro - Backend Engineering, Reimagined",
    description: "Build production-ready Node.js backends with a single command. Type-safe, secure, and modular by default.",
};


export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`} suppressHydrationWarning>
            <body className="font-sans">
                <RootProvider>{children}</RootProvider>
            </body>
        </html>
    );
}
