"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { Terminal, Plus, Rocket, Copy, Check } from 'lucide-react';
import Link from 'next/link';

const STEPS = [
    {
        step: '1',
        icon: Terminal,
        title: 'Initialize',
        command: 'npx zuro-cli init',
        description: 'One command creates your project with Express, TypeScript, security middleware, and environment validation.',
        result: 'Production-ready backend in 60 seconds',
        color: 'from-green-500',
    },
    {
        step: '2',
        icon: Plus,
        title: 'Add modules',
        command: 'npx zuro-cli add auth database',
        description: 'Add authentication, database, validation—whatever your project needs. Each module is optional.',
        result: 'Auth + database + validation ready',
        color: 'from-blue-500',
    },
    {
        step: '3',
        icon: Rocket,
        title: 'Build & ship',
        command: 'npm run dev',
        description: 'Start coding your actual features. The boring setup is done. Win that hackathon.',
        result: 'Focus on what makes your app unique',
        color: 'from-yellow-500',
    },
];

export const HowItWorks: React.FC = () => {
    const [copiedIndex, setCopiedIndex] = React.useState<number | null>(null);

    const copyCommand = (command: string, index: number) => {
        navigator.clipboard.writeText(command);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    return (
        <section className="py-24 px-4 bg-zinc-900/30 border-y border-white/5">
            <div className="container mx-auto max-w-4xl">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                        Three steps. <span className="gradient-text">That's it.</span>
                    </h2>
                    <p className="text-xl text-zinc-400">
                        From zero to backend in under two minutes.
                    </p>
                </motion.div>

                {/* Steps - Simplified */}
                <div className="space-y-6">
                    {STEPS.map((step, index) => (
                        <motion.div
                            key={step.step}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.15 }}
                            className="relative"
                        >
                            <div className="flex flex-col md:flex-row gap-6 p-6 rounded-2xl bg-zinc-900/50 border border-white/5 hover:border-green-500/10 transition-colors">
                                {/* Step Number & Icon */}
                                <div className="flex items-center gap-4 md:w-auto shrink-0">
                                    <div className={`relative w-14 h-14 rounded-xl bg-gradient-to-br ${step.color} to-transparent/10 border border-white/10 flex items-center justify-center`}>
                                        <step.icon className="w-6 h-6 text-white" />
                                        <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-green-500 text-black text-xs font-bold flex items-center justify-center">
                                            {step.step}
                                        </span>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                                    <p className="text-zinc-400 mb-4">{step.description}</p>

                                    {/* Command */}
                                    <div
                                        onClick={() => copyCommand(step.command, index)}
                                        className="inline-flex items-center gap-3 px-4 py-3 bg-black/50 rounded-xl border border-white/10 font-mono cursor-pointer hover:border-green-500/30 transition-colors group"
                                    >
                                        <span className="text-green-500">$</span>
                                        <span className="text-white text-sm">{step.command}</span>
                                        <button className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                                            {copiedIndex === index ? (
                                                <Check className="w-3.5 h-3.5 text-green-500" />
                                            ) : (
                                                <Copy className="w-3.5 h-3.5 text-zinc-500 group-hover:text-white transition-colors" />
                                            )}
                                        </button>
                                    </div>

                                    {/* Result */}
                                    <div className="mt-4 flex items-center gap-2 text-sm text-green-400">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                        {step.result}
                                    </div>
                                </div>
                            </div>

                            {/* Connector */}
                            {index < STEPS.length - 1 && (
                                <div className="hidden md:block absolute left-[43px] top-[100%] w-[2px] h-6 bg-gradient-to-b from-green-500/30 to-transparent" />
                            )}
                        </motion.div>
                    ))}
                </div>

                {/* Bottom CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mt-12 text-center"
                >
                    <Link
                        href="/docs"
                        className="btn-primary inline-flex items-center gap-2"
                    >
                        <Rocket className="w-4 h-4" />
                        Start Building Now
                    </Link>
                </motion.div>
            </div>
        </section>
    );
};
