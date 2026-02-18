"use client";
import React from 'react';
import { motion } from 'framer-motion';
import {
    Database,
    Key,
    AlertCircle,
    CheckCircle2,
    Sparkles,
    CreditCard,
    Mail,
    Radio,
    ShoppingCart,
    FileText,
    Bot,
    ArrowRight
} from 'lucide-react';
import Link from 'next/link';

const CURRENT_MODULES = [
    {
        name: 'database',
        title: 'Database',
        description: 'PostgreSQL or MySQL with Drizzle ORM',
        icon: Database,
        color: 'from-blue-500/20 to-cyan-500/10',
        borderColor: 'border-blue-500/30',
        iconColor: 'text-blue-400',
    },
    {
        name: 'auth',
        title: 'Authentication',
        description: 'Signup, login, sessions with Better-Auth',
        icon: Key,
        color: 'from-purple-500/20 to-pink-500/10',
        borderColor: 'border-purple-500/30',
        iconColor: 'text-purple-400',
    },
    {
        name: 'error-handler',
        title: 'Error Handler',
        description: 'Custom error classes & consistent responses',
        icon: AlertCircle,
        color: 'from-red-500/20 to-orange-500/10',
        borderColor: 'border-red-500/30',
        iconColor: 'text-red-400',
    },
    {
        name: 'validator',
        title: 'Validator',
        description: 'Zod middleware for request validation',
        icon: CheckCircle2,
        color: 'from-yellow-500/20 to-amber-500/10',
        borderColor: 'border-yellow-500/30',
        iconColor: 'text-yellow-400',
    },
];

const COMING_SOON = [
    {
        name: 'ai',
        title: 'AI Integration',
        description: 'Vercel AI SDK with OpenAI, Anthropic, and more',
        icon: Bot,
    },
    {
        name: 'payments',
        title: 'Payments',
        description: 'Stripe integration with webhooks',
        icon: CreditCard,
    },
    {
        name: 'email',
        title: 'Email',
        description: 'Resend/Nodemailer with templates',
        icon: Mail,
    },
    {
        name: 'websocket',
        title: 'WebSockets',
        description: 'Real-time with Socket.io',
        icon: Radio,
    },
    {
        name: 'ecommerce',
        title: 'E-commerce Starter',
        description: 'Full store with cart, orders, inventory',
        icon: ShoppingCart,
    },
    {
        name: 'docs',
        title: 'API Docs',
        description: 'Auto-generated OpenAPI/Swagger',
        icon: FileText,
    },
];

export const Roadmap: React.FC = () => {
    return (
        <section className="py-24 px-4 relative overflow-hidden border-t border-white/[0.04]">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-green-950/5 to-transparent pointer-events-none" />

            <div className="container mx-auto max-w-6xl relative z-10">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-medium mb-6">
                        <Sparkles className="w-3.5 h-3.5" />
                        Growing Ecosystem
                    </div>
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-tight">
                        Modules for <span className="gradient-text">everything</span>
                    </h2>
                    <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
                        Start with what you need today. Add more as your project grows.
                        Each module is a single command away.
                    </p>
                </motion.div>

                {/* Current Modules */}
                <div className="mb-16">
                    <motion.h3
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-sm uppercase tracking-wider text-green-400 font-medium mb-6 flex items-center gap-2"
                    >
                        <CheckCircle2 className="w-4 h-4" />
                        Available Now
                    </motion.h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {CURRENT_MODULES.map((module, index) => (
                            <motion.div
                                key={module.name}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Link
                                    href={`/docs/${module.name === 'error-handler' ? 'error-handler' : module.name}`}
                                    className={`block p-5 rounded-xl border ${module.borderColor} bg-gradient-to-br ${module.color} hover:scale-[1.02] transition-all duration-300 group h-full`}
                                >
                                    <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg bg-white/5 ${module.iconColor} mb-4`}>
                                        <module.icon className="w-5 h-5" />
                                    </div>
                                    <h4 className="text-white font-semibold mb-1 flex items-center gap-2">
                                        {module.title}
                                        <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                                    </h4>
                                    <p className="text-sm text-zinc-400">{module.description}</p>
                                    <div className="mt-3 font-mono text-xs text-zinc-500">
                                        zuro add {module.name}
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Coming Soon */}
                <div>
                    <motion.h3
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-sm uppercase tracking-wider text-zinc-500 font-medium mb-6 flex items-center gap-2"
                    >
                        <Sparkles className="w-4 h-4" />
                        Coming Soon
                    </motion.h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {COMING_SOON.map((module, index) => (
                            <motion.div
                                key={module.name}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.05 }}
                                className="p-5 rounded-xl border border-white/[0.06] bg-zinc-900/30 hover:border-white/[0.12] transition-all duration-300"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-white/5 text-zinc-500">
                                        <module.icon className="w-5 h-5" />
                                    </div>
                                </div>
                                <h4 className="text-white font-medium mb-1">{module.title}</h4>
                                <p className="text-sm text-zinc-500">{module.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mt-16 text-center"
                >
                    <p className="text-zinc-500 mb-4">Have a module idea?</p>
                    <a
                        href="https://github.com/BriyanPatel/zuro/issues"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-green-400 hover:text-green-300 font-medium transition-colors"
                    >
                        Request a feature on GitHub
                        <ArrowRight className="w-4 h-4" />
                    </a>
                </motion.div>
            </div>
        </section>
    );
};

export default Roadmap;
