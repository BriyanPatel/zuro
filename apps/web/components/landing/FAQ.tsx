"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle } from 'lucide-react';

const FAQ_ITEMS = [
    {
        question: 'Is this a framework I need to learn?',
        answer: 'Nope! Zuro is a scaffolding tool, not a framework. It generates plain Express.js + TypeScript code that you already know (or are learning). Once the files are created, Zuro is completely out of the picture. No runtime dependency, no lock-in.',
    },
    {
        question: 'Can I use this for my hackathon?',
        answer: 'Absolutely—that\'s exactly what it\'s built for! Run one command, get auth + database + validation ready in under a minute. Spend your 24-48 hours building features, not fighting with boilerplate.',
    },
    {
        question: 'I\'m learning backend development. Will this help?',
        answer: 'Yes! Unlike NestJS or other frameworks with "magic" (decorators, dependency injection), Zuro generates simple, readable Express code. You can follow every line, understand how it works, and learn production patterns without confusion.',
    },
    {
        question: 'What if I want to change something?',
        answer: 'Change anything you want! The generated code is 100% yours. Move files, rename functions, delete what you don\'t need. There\'s no Zuro runtime watching over your shoulder. It\'s just standard TypeScript code.',
    },
    {
        question: 'Do I need to know TypeScript?',
        answer: 'Basic TypeScript knowledge helps, but even if you\'re just learning, the generated code is a great way to see how TypeScript is used in real projects. Types are there to help catch bugs early—your IDE will guide you.',
    },
    {
        question: 'What databases are supported?',
        answer: 'PostgreSQL and MySQL, both with Drizzle ORM for type-safe queries. Run `zuro add database` and pick your flavor. Schema, migrations, connection—all configured and ready to use.',
    },
];

export const FAQ: React.FC = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
        <section className="py-24 px-4 border-t border-white/[0.04]">
            <div className="container mx-auto max-w-2xl">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-12"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-800/50 border border-zinc-700/50 text-zinc-400 text-sm font-medium mb-6">
                        <HelpCircle className="w-3.5 h-3.5" />
                        Got questions?
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 tracking-tight">
                        Frequently Asked Questions
                    </h2>
                    <p className="text-zinc-500">
                        Everything you need to know before your next hackathon.
                    </p>
                </motion.div>

                {/* FAQ Items */}
                <div className="space-y-3">
                    {FAQ_ITEMS.map((item, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.05 }}
                            className="rounded-xl border border-white/[0.06] overflow-hidden bg-zinc-900/30"
                        >
                            <button
                                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                className="w-full flex items-center justify-between p-5 text-left hover:bg-white/[0.02] transition-colors"
                            >
                                <span className="font-medium text-white pr-4 text-[15px]">{item.question}</span>
                                <motion.div
                                    animate={{ rotate: openIndex === index ? 180 : 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="shrink-0"
                                >
                                    <ChevronDown className="w-4 h-4 text-zinc-500" />
                                </motion.div>
                            </button>

                            <AnimatePresence>
                                {openIndex === index && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="px-5 pb-5 text-zinc-400 text-[15px] leading-relaxed">
                                            {item.answer}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </div>

                {/* Bottom note */}
                <motion.p
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="text-center text-sm text-zinc-600 mt-8"
                >
                    More questions? Check our{' '}
                    <a href="/docs" className="text-green-500 hover:text-green-400 transition-colors">
                        documentation
                    </a>.
                </motion.p>
            </div>
        </section>
    );
};
