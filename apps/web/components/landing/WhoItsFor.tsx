"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, GraduationCap, Users, Rocket, ArrowRight, Clock, Zap } from 'lucide-react';
import Link from 'next/link';

const AUDIENCE_SEGMENTS = [
    {
        icon: Trophy,
        title: 'Hackathon Warriors',
        subtitle: '24-48 hours to ship',
        description: 'Every minute counts. While others are still setting up Express, you\'re already building features. Auth, database, validation—ready in 60 seconds.',
        highlight: 'Win hackathons, not setup battles',
        color: 'from-yellow-500/20 to-orange-500/10',
        borderColor: 'border-yellow-500/20',
        iconColor: 'text-yellow-400',
        stat: '60s',
        statLabel: 'to production-ready',
    },
    {
        icon: GraduationCap,
        title: 'CS Students',
        subtitle: 'Learning by building',
        description: 'See what production code actually looks like. No magic, no decorators, no confusion. Just clean Express + TypeScript you can understand and modify.',
        highlight: 'Learn real-world patterns',
        color: 'from-blue-500/20 to-cyan-500/10',
        borderColor: 'border-blue-500/20',
        iconColor: 'text-blue-400',
        stat: '100%',
        statLabel: 'readable code',
    },
    {
        icon: Users,
        title: 'Bootcamp & Cohorts',
        subtitle: 'Consistent starting point',
        description: 'Every student starts with the same solid foundation. No more "it works on my machine." Focus on teaching concepts, not debugging configs.',
        highlight: 'Same setup, every time',
        color: 'from-purple-500/20 to-pink-500/10',
        borderColor: 'border-purple-500/20',
        iconColor: 'text-purple-400',
        stat: '0',
        statLabel: 'config headaches',
    },
    {
        icon: Rocket,
        title: 'Side Project Builders',
        subtitle: 'Ship on weekends',
        description: 'Got an idea on Friday night? Be live by Sunday. Stop spending your precious free time on boilerplate you\'ve written a hundred times.',
        highlight: 'Idea to MVP, fast',
        color: 'from-green-500/20 to-emerald-500/10',
        borderColor: 'border-green-500/20',
        iconColor: 'text-green-400',
        stat: '2',
        statLabel: 'commands to ship',
    },
];

export const WhoItsFor: React.FC = () => {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    return (
        <section className="py-24 px-4 relative overflow-hidden border-t border-white/[0.04]">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-b from-zinc-900/50 via-transparent to-transparent pointer-events-none" />

            <div className="container mx-auto max-w-6xl relative z-10">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    className="text-center mb-16"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-medium mb-6">
                        <Zap className="w-3.5 h-3.5" />
                        Perfect for fast-paced environments
                    </div>
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-tight">
                        Built for people who <span className="gradient-text">ship</span>
                    </h2>
                    <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
                        Whether you're racing against a hackathon clock or learning to code,
                        Zuro gets you to the fun part faster.
                    </p>
                </motion.div>

                {/* Audience Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5">
                    {AUDIENCE_SEGMENTS.map((segment, index) => (
                        <motion.div
                            key={segment.title}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            onMouseEnter={() => setHoveredIndex(index)}
                            onMouseLeave={() => setHoveredIndex(null)}
                            className={`group relative p-6 lg:p-8 rounded-2xl border ${segment.borderColor} bg-gradient-to-br ${segment.color} backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-xl`}
                        >
                            <div className="flex items-start justify-between mb-5">
                                {/* Icon */}
                                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white/5 border border-white/10 ${segment.iconColor}`}>
                                    <segment.icon className="w-6 h-6" />
                                </div>

                                {/* Stat */}
                                <div className="text-right">
                                    <div className={`text-2xl font-bold ${segment.iconColor}`}>{segment.stat}</div>
                                    <div className="text-xs text-zinc-500">{segment.statLabel}</div>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="mb-4">
                                <h3 className="text-xl font-semibold text-white mb-1">{segment.title}</h3>
                                <p className="text-sm text-zinc-500 font-medium">{segment.subtitle}</p>
                            </div>

                            <p className="text-zinc-400 text-[15px] leading-relaxed mb-5">
                                {segment.description}
                            </p>

                            {/* Highlight */}
                            <div className="flex items-center gap-2 text-sm font-medium text-white">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                {segment.highlight}
                            </div>

                            {/* Hover arrow */}
                            <motion.div
                                className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                animate={{ x: hoveredIndex === index ? 0 : -8 }}
                            >
                                <ArrowRight className="w-5 h-5 text-white/50" />
                            </motion.div>
                        </motion.div>
                    ))}
                </div>

                {/* Bottom CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mt-16 text-center"
                >
                    <div className="inline-flex flex-col sm:flex-row items-center gap-4 sm:gap-6 p-6 rounded-2xl bg-zinc-900/50 border border-white/[0.06]">
                        <div className="flex items-center gap-3">
                            <Clock className="w-5 h-5 text-green-500" />
                            <p className="text-zinc-400">
                                Ready to start building?
                            </p>
                        </div>
                        <Link
                            href="/docs"
                            className="btn-primary flex items-center gap-2 text-sm"
                        >
                            Get Started Free <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default WhoItsFor;
