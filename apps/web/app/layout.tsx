import type { Metadata } from "next";
import { RootProvider } from 'fumadocs-ui/provider/next';
import { Inter } from 'next/font/google';
import { JetBrains_Mono } from 'next/font/google';
import './globals.css';

const inter = Inter({
    subsets: ['latin'],
    variable: '--font-inter',
    display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
    subsets: ['latin'],
    variable: '--font-jetbrains-mono',
    display: 'swap',
});

export const metadata: Metadata = {
    title: "Zuro - Backend Engineering, Reimagined",
    description: "Build production-ready Node.js backends with a single command. Type-safe, secure, and modular by default.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
            <body className="font-sans">
                <RootProvider>{children}</RootProvider>
            </body>
        </html>
    );
}
