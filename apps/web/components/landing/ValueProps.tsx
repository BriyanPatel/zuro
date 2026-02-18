"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { Blocks, FileCode2, Shield } from 'lucide-react';

const VALUE_PROPS = [
    {
        icon: Blocks,
        title: 'Modular by Design',
        description: 'Start small. Add authentication, database, or logging only when you need them.',
        code: 'npx zuro-cli add auth',
        highlight: 'No bloat. Just what you need.',
    },
    {
        icon: FileCode2,
        title: 'You Own the Code',
        description: 'This isn\'t a framework runtime. We generate actual files into your project.',
        code: 'src/routes/auth.routes.ts',
        highlight: 'Customize, refactor, or delete whatever you want.',
    },
    {
        icon: Shield,
        title: 'Type-Safe & Secure',
        description: 'Pre-configured TypeScript, Zod validation, and security headers.',
        code: 'Production-ready defaults',
        highlight: 'No security afterthoughts.',
    },
];

export const ValueProps: React.FC = () => {
    return (
        <section className="py-24 px-4 relative">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-green-950/5 to-transparent pointer-events-none" />

            <div className="container mx-auto max-w-6xl relative z-10">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        Why developers choose <span className="gradient-text">Zuro</span>
                    </h2>
                    <p className="text-zinc-400 max-w-2xl mx-auto">
                        Stop wasting hours on boilerplate. Focus on what makes your product unique.
                    </p>
                </motion.div>

                {/* Cards Grid */}
                <div className="grid md:grid-cols-3 gap-6">
                    {VALUE_PROPS.map((prop, index) => (
                        <motion.div
                            key={prop.title}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.15 }}
                            className="group relative p-8 rounded-2xl bg-zinc-900/50 border border-white/5 hover:border-green-500/20 transition-all duration-300"
                        >
                            {/* Glow effect on hover */}
                            <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                            {/* Icon */}
                            <div className="relative w-12 h-12 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center mb-6 group-hover:bg-green-500/20 transition-colors">
                                <prop.icon className="w-6 h-6 text-green-500" />
                            </div>

                            {/* Content */}
                            <div className="relative">
                                <h3 className="text-xl font-semibold text-white mb-3">{prop.title}</h3>
                                <p className="text-zinc-400 mb-4 leading-relaxed">{prop.description}</p>

                                {/* Code snippet */}
                                <div className="font-mono text-sm text-green-400 bg-black/30 px-3 py-2 rounded-lg border border-white/5 mb-4">
                                    {prop.code}
                                </div>

                                <p className="text-sm text-zinc-500">{prop.highlight}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};
