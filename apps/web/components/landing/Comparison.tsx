"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { Check, X, Zap } from 'lucide-react';

const COMPARISONS = [
    {
        feature: 'Time to first API endpoint',
        zuro: '60 seconds',
        nestjs: '30+ minutes',
        manual: '2+ hours',
    },
    {
        feature: 'Learning curve',
        zuro: 'Know Express? Done',
        nestjs: 'Decorators, DI, modules...',
        manual: 'Googling configs',
    },
    {
        feature: 'Code readability',
        zuro: true,
        nestjs: false,
        manual: true,
    },
    {
        feature: 'Auth ready',
        zuro: '1 command',
        nestjs: 'Install + configure',
        manual: 'Build from scratch',
    },
    {
        feature: 'Database setup',
        zuro: '1 command',
        nestjs: 'TypeORM config',
        manual: 'Manual setup',
    },
    {
        feature: 'Lock-in risk',
        zuro: 'None',
        nestjs: 'High',
        manual: 'None',
    },
];

const StatusCell = ({ value }: { value: boolean | string }) => {
    if (typeof value === 'boolean') {
        return value ? (
            <div className="flex justify-center">
                <Check className="w-5 h-5 text-green-500" />
            </div>
        ) : (
            <div className="flex justify-center">
                <X className="w-5 h-5 text-zinc-600" />
            </div>
        );
    }
    return <span className="text-sm">{value}</span>;
};

export const Comparison: React.FC = () => {
    return (
        <section className="py-24 px-4 relative overflow-hidden">
            <div className="container mx-auto max-w-4xl relative z-10">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-12"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-medium mb-6">
                        <Zap className="w-3.5 h-3.5" />
                        Why Zuro?
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
                        Hackathon hours are precious
                    </h2>
                    <p className="text-zinc-400 max-w-xl mx-auto">
                        Don't spend them on setup. Here's how Zuro compares to your alternatives.
                    </p>
                </motion.div>

                {/* Comparison Table */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="rounded-2xl border border-white/[0.06] overflow-hidden bg-zinc-900/30"
                >
                    {/* Header */}
                    <div className="grid grid-cols-4 gap-4 p-4 bg-zinc-900/50 border-b border-white/[0.06]">
                        <div className="text-sm text-zinc-500"></div>
                        <div className="text-center">
                            <span className="text-sm font-semibold text-green-400">Zuro</span>
                            <div className="text-xs text-zinc-600 mt-0.5">CLI tool</div>
                        </div>
                        <div className="text-center">
                            <span className="text-sm text-zinc-500">NestJS</span>
                            <div className="text-xs text-zinc-600 mt-0.5">Framework</div>
                        </div>
                        <div className="text-center">
                            <span className="text-sm text-zinc-500">Manual</span>
                            <div className="text-xs text-zinc-600 mt-0.5">From scratch</div>
                        </div>
                    </div>

                    {/* Rows */}
                    {COMPARISONS.map((row, index) => (
                        <motion.div
                            key={row.feature}
                            initial={{ opacity: 0, x: -10 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.05 }}
                            className={`grid grid-cols-4 gap-4 p-4 items-center ${index !== COMPARISONS.length - 1 ? 'border-b border-white/[0.04]' : ''
                                } hover:bg-white/[0.02] transition-colors`}
                        >
                            <div className="text-sm text-zinc-300 font-medium">{row.feature}</div>
                            <div className="text-center text-green-400">
                                <StatusCell value={row.zuro} />
                            </div>
                            <div className="text-center text-zinc-500">
                                <StatusCell value={row.nestjs} />
                            </div>
                            <div className="text-center text-zinc-500">
                                <StatusCell value={row.manual} />
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Caption */}
                <motion.p
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="text-center text-sm text-zinc-600 mt-6"
                >
                    Speed of scaffolding + simplicity of plain Express. Best of both worlds.
                </motion.p>
            </div>
        </section>
    );
};

export default Comparison;
