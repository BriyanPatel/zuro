'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
    Zap,
    Code2,
    Blocks,
    GraduationCap,
    FolderTree,
    Lock,
    Clock,
    ArrowRight,
    Database,
    Key,
} from 'lucide-react';

const MODULAR_MODULES = ['auth', 'database', 'validator'];

const BentoGrid = () => {
    return (
        <section className="py-24 px-4 relative overflow-hidden">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-green-950/5 to-transparent pointer-events-none" />

            <div className="container mx-auto max-w-6xl relative z-10">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    className="text-center mb-16"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-sm font-medium mb-6">
                        <Zap className="w-3.5 h-3.5" />
                        Speed is everything
                    </div>
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-tight">
                        Everything you need, <span className="gradient-text">nothing you don't</span>
                    </h2>
                    <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
                        Stop Googling "express typescript setup" for the hundredth time. Get auth, database, and validation in seconds.
                    </p>
                </motion.div>

                {/* Bento Grid - Row 1 */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5 mb-4 lg:mb-5">
                    {/* Card 1 - Speed (Large) */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="md:col-span-2 lg:col-span-2"
                    >
                        <BentoCard className="h-full min-h-[280px]">
                            <SpeedCard />
                        </BentoCard>
                    </motion.div>

                    {/* Card 2 - Learn Real Patterns */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                    >
                        <BentoCard className="h-full min-h-[280px]">
                            <LearnCard />
                        </BentoCard>
                    </motion.div>
                </div>

                {/* Bento Grid - Row 2 */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5 mb-4 lg:mb-5">
                    {/* Card 3 - Auth Ready */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 }}
                    >
                        <BentoCard className="h-full min-h-[240px]">
                            <AuthCard />
                        </BentoCard>
                    </motion.div>

                    {/* Card 4 - Database */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.4 }}
                    >
                        <BentoCard className="h-full min-h-[240px]">
                            <DatabaseCard />
                        </BentoCard>
                    </motion.div>

                    {/* Card 5 - Modular */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.5 }}
                    >
                        <BentoCard className="h-full min-h-[240px]">
                            <ModularCard />
                        </BentoCard>
                    </motion.div>

                    {/* Card 6 - What You Get */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.6 }}
                    >
                        <BentoCard className="h-full min-h-[240px]">
                            <WhatYouGetCard />
                        </BentoCard>
                    </motion.div>
                </div>

                {/* Bento Grid - Row 3 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5">
                    {/* Card 7 - No Magic */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.7 }}
                    >
                        <BentoCard className="h-full min-h-[200px]">
                            <NoMagicCard />
                        </BentoCard>
                    </motion.div>

                    {/* Card 8 - Security */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.8 }}
                    >
                        <BentoCard className="h-full min-h-[200px]">
                            <SecurityCard />
                        </BentoCard>
                    </motion.div>
                </div>

                {/* CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mt-12 text-center"
                >
                    <Link
                        href="/docs"
                        className="inline-flex items-center gap-2 text-green-400 hover:text-green-300 font-medium transition-colors group"
                    >
                        Start your project now
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </motion.div>
            </div>
        </section>
    );
};

// Bento Card Wrapper
const BentoCard: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        setMousePosition({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        });
    };

    return (
        <div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            className={`bento-card bento-card-glow p-6 lg:p-8 ${className || ''}`}
            style={{
                '--mouse-x': `${mousePosition.x}px`,
                '--mouse-y': `${mousePosition.y}px`,
            } as React.CSSProperties}
        >
            {children}
        </div>
    );
};

// Card 1: Speed - The hero card
const SpeedCard = () => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div
            className="h-full flex flex-col"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="feature-icon mb-6">
                <Clock className="w-5 h-5 text-green-500" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">60 seconds to start coding</h3>
            <p className="text-zinc-400 mb-6 flex-grow">
                From idea to running server in under a minute. Fully configured Express + TypeScript backend with auth, database, and validation ready. No tutorials. No Stack Overflow. Just code.
            </p>

            {/* Speed Comparison */}
            <div className="flex items-center justify-between bg-black/30 rounded-xl p-4 border border-white/5">
                <div className="text-center">
                    <motion.div
                        className="text-3xl font-bold text-zinc-500 line-through"
                        animate={{ opacity: isHovered ? 0.5 : 1 }}
                    >
                        2hrs
                    </motion.div>
                    <div className="text-xs text-zinc-600 mt-1">Manual setup</div>
                </div>

                <motion.div
                    className="flex items-center gap-2"
                    animate={{ scale: isHovered ? 1.1 : 1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                >
                    <Zap className="w-5 h-5 text-green-500" />
                </motion.div>

                <div className="text-center">
                    <motion.div
                        className="text-3xl font-bold text-green-500"
                        animate={{ scale: isHovered ? 1.1 : 1 }}
                        transition={{ type: "spring", stiffness: 300 }}
                    >
                        60s
                    </motion.div>
                    <div className="text-xs text-zinc-400 mt-1">With Zuro</div>
                </div>
            </div>
        </div>
    );
};

// Card 2: Learn Real Patterns
const LearnCard = () => {
    return (
        <div className="h-full flex flex-col">
            <div className="feature-icon mb-6">
                <GraduationCap className="w-5 h-5 text-green-500" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Learn by reading</h3>
            <p className="text-zinc-400 mb-6 flex-grow">
                Every file is readable. No decorators, no DI containers, no magic. Just Express patterns you can follow and learn from.
            </p>

            {/* Code Preview */}
            <div className="code-block-interactive p-4 text-xs">
                <div className="space-y-1">
                    <div><span className="text-zinc-500">// Real code, not magic</span></div>
                    <div><span className="text-purple-400">const</span> <span className="text-blue-400">app</span> = <span className="text-yellow-400">express</span>()</div>
                    <div><span className="text-blue-400">app</span>.<span className="text-yellow-400">use</span>(<span className="text-yellow-400">helmet</span>())</div>
                    <div><span className="text-blue-400">app</span>.<span className="text-yellow-400">use</span>(<span className="text-yellow-400">cors</span>())</div>
                </div>
            </div>
        </div>
    );
};

// Card 3: Auth Ready
const AuthCard = () => {
    return (
        <div className="h-full flex flex-col">
            <div className="feature-icon mb-4">
                <Key className="w-5 h-5 text-green-500" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Auth in one command</h3>
            <p className="text-sm text-zinc-400 mb-4 flex-grow">
                Signup, login, sessions. No more auth tutorials at 2 AM.
            </p>

            <div className="text-xs text-zinc-500 font-mono bg-black/20 rounded-lg p-3 border border-white/5">
                <span className="text-green-500">$</span> zuro add auth
            </div>
        </div>
    );
};

// Card 4: Database
const DatabaseCard = () => {
    return (
        <div className="h-full flex flex-col">
            <div className="feature-icon mb-4">
                <Database className="w-5 h-5 text-green-500" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Database ready</h3>
            <p className="text-sm text-zinc-400 mb-4 flex-grow">
                PostgreSQL or MySQL. Drizzle ORM for type-safe queries.
            </p>

            <div className="flex flex-wrap gap-2">
                <div className="px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <span className="text-blue-400 text-xs font-medium">PostgreSQL</span>
                </div>
                <div className="px-2.5 py-1 rounded-lg bg-orange-500/10 border border-orange-500/20">
                    <span className="text-orange-400 text-xs font-medium">MySQL</span>
                </div>
            </div>
        </div>
    );
};

// Card 5: Modular Design
const ModularCard = () => {
    const [activeModule, setActiveModule] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveModule((prev) => (prev + 1) % MODULAR_MODULES.length);
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="h-full flex flex-col">
            <div className="feature-icon mb-4">
                <Blocks className="w-5 h-5 text-green-500" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Add as you go</h3>
            <p className="text-sm text-zinc-400 mb-4 flex-grow">
                Start minimal. Add features when you need them.
            </p>

            <div className="flex flex-wrap gap-2">
                {MODULAR_MODULES.map((mod, i) => (
                    <motion.div
                        key={mod}
                        className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all duration-300 ${i === activeModule
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                            : 'bg-zinc-800/50 text-zinc-500 border border-transparent'
                            }`}
                        animate={{
                            scale: i === activeModule ? 1.05 : 1,
                        }}
                    >
                        {mod}
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

// Card 6: What You Get
const WhatYouGetCard = () => {
    const [expanded, setExpanded] = useState(false);
    const files = [
        { name: 'src/', type: 'folder' },
        { name: '  app.ts', type: 'file' },
        { name: '  server.ts', type: 'file' },
        { name: '  env.ts', type: 'file' },
        { name: 'tsconfig.json', type: 'file' },
    ];

    return (
        <div
            className="h-full flex flex-col"
            onMouseEnter={() => setExpanded(true)}
            onMouseLeave={() => setExpanded(false)}
        >
            <div className="feature-icon mb-4">
                <FolderTree className="w-5 h-5 text-green-500" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Clean structure</h3>
            <p className="text-sm text-zinc-400 mb-3">
                Sensible defaults, easy to navigate.
            </p>

            <div className="code-block-interactive p-3 text-xs font-mono flex-grow overflow-hidden">
                {files.slice(0, expanded ? files.length : 3).map((file, i) => (
                    <motion.div
                        key={file.name}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className={`file-tree-item py-0.5 ${file.type === 'folder' ? 'text-yellow-400' : 'text-zinc-400'
                            }`}
                    >
                        {file.name}
                    </motion.div>
                ))}
                {!expanded && (
                    <div className="text-zinc-600 mt-1">...</div>
                )}
            </div>
        </div>
    );
};

// Card 7: No Magic
const NoMagicCard = () => {
    return (
        <div className="h-full flex flex-col md:flex-row md:items-center gap-6">
            <div className="flex-1">
                <div className="feature-icon mb-4">
                    <Code2 className="w-5 h-5 text-green-500" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Your code, forever</h3>
                <p className="text-sm text-zinc-400">
                    No framework lock-in. Eject anytime—actually, there's nothing to eject. It's just Express code you own 100%.
                </p>
            </div>

            <div className="font-mono text-sm text-zinc-500 bg-black/20 rounded-lg p-3 border border-white/5 md:max-w-[200px]">
                <div className="text-zinc-600 text-xs mb-1"># No dependencies on Zuro</div>
                <span className="text-green-500">$</span> npm run dev
                <div className="text-green-400 mt-1">Server running</div>
            </div>
        </div>
    );
};

// Card 8: Security
const SecurityCard = () => {
    const features = ['Helmet.js', 'CORS', 'Zod Validation', 'Env Safety'];

    return (
        <div className="h-full flex flex-col md:flex-row md:items-center gap-6">
            <div className="flex-1">
                <div className="feature-icon mb-4">
                    <Lock className="w-5 h-5 text-green-500" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Security by default</h3>
                <p className="text-sm text-zinc-400">
                    Helmet, CORS, and Zod validation included. Production-ready security from day one.
                </p>
            </div>

            <div className="flex flex-wrap gap-2 md:max-w-[180px]">
                {features.map((feature) => (
                    <span
                        key={feature}
                        className="px-2.5 py-1 text-xs rounded-lg bg-green-500/10 text-green-400 border border-green-500/20"
                    >
                        {feature}
                    </span>
                ))}
            </div>
        </div>
    );
};

export { BentoGrid };
