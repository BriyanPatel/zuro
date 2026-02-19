"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Database, Check, Clock, Upload, Gauge } from 'lucide-react';

const REGISTRY_ITEMS = [
    {
        name: 'auth',
        title: 'Authentication',
        description: 'Better-Auth setup with user routes, sessions, and database schema',
        icon: Shield,
        status: 'available',
        command: 'npx zuro-cli add auth',
    },
    {
        name: 'database',
        title: 'Database',
        description: 'Drizzle ORM with PostgreSQL or MySQL, migrations, and schema',
        icon: Database,
        status: 'available',
        command: 'npx zuro-cli add database',
    },
    {
        name: 'validator',
        title: 'Validation',
        description: 'Zod-based request validation middleware',
        icon: Check,
        status: 'available',
        command: 'npx zuro-cli add validator',
    },
    {
        name: 'rate-limit',
        title: 'Rate Limiting',
        description: 'Redis-backed rate limiting for API protection',
        icon: Gauge,
        status: 'coming-soon',
        command: 'Coming Soon',
    },
    {
        name: 'upload',
        title: 'File Upload',
        description: 'S3 presigned URLs for secure file uploads',
        icon: Upload,
        status: 'coming-soon',
        command: 'Coming Soon',
    },
    {
        name: 'cron',
        title: 'Scheduled Jobs',
        description: 'Background job scheduling with node-cron',
        icon: Clock,
        status: 'coming-soon',
        command: 'Coming Soon',
    },
];

export const Registry: React.FC = () => {
    return (
        <section className="py-24 px-4">
            <div className="container mx-auto max-w-6xl">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mb-16"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-sm font-mono text-green-400 uppercase tracking-wider">Registry</span>
                    </div>
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                        The Registry.
                    </h2>
                    <p className="text-xl text-zinc-400 max-w-xl">
                        Drop-in features for your backend. Pick what you need, skip what you don't.
                    </p>
                </motion.div>

                {/* Registry Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {REGISTRY_ITEMS.map((item, index) => (
                        <motion.div
                            key={item.name}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className={`group relative p-6 rounded-xl border transition-all duration-300 ${item.status === 'available'
                                ? 'bg-zinc-900/50 border-white/10 hover:border-green-500/30 hover:bg-zinc-900/80'
                                : 'bg-zinc-900/20 border-white/5 opacity-60'
                                }`}
                        >
                            {/* Status Badge */}
                            {item.status === 'coming-soon' && (
                                <div className="absolute top-4 right-4 px-2 py-1 rounded-full bg-zinc-800 border border-zinc-700 text-xs text-zinc-400">
                                    Soon
                                </div>
                            )}

                            {/* Icon & Title */}
                            <div className="flex items-start gap-4 mb-4">
                                <div className={`p-3 rounded-xl ${item.status === 'available'
                                    ? 'bg-green-500/10 border border-green-500/20'
                                    : 'bg-zinc-800 border border-zinc-700'
                                    }`}>
                                    <item.icon className={`w-5 h-5 ${item.status === 'available' ? 'text-green-500' : 'text-zinc-500'
                                        }`} />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-white mb-1">{item.title}</h3>
                                    <p className="text-sm text-zinc-500">{item.description}</p>
                                </div>
                            </div>

                            {/* Command */}
                            {item.status === 'available' ? (
                                <div className="flex items-center gap-2 px-3 py-2 bg-black/30 rounded-lg border border-white/5 font-mono text-sm">
                                    <span className="text-green-500">$</span>
                                    <span className="text-zinc-300">{item.command}</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 px-3 py-2 bg-black/20 rounded-lg border border-white/5 font-mono text-sm text-zinc-600">
                                    {item.command}
                                </div>
                            )}
                        </motion.div>
                    ))}
                </div>

                {/* CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mt-12 text-center"
                >
                    <p className="text-zinc-500 mb-4">
                        More modules shipping soon. Check docs for updates.
                    </p>
                    <a
                        href="/docs"
                        className="inline-flex items-center gap-2 text-green-400 hover:text-green-300 font-medium transition-colors"
                    >
                        Explore docs →
                    </a>
                </motion.div>
            </div>
        </section>
    );
};
