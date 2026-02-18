"use client";
import React from 'react';
import { motion } from 'framer-motion';

const TECH_STACK = [
    { name: 'Express', color: 'hover:text-white' },
    { name: 'TypeScript', color: 'hover:text-blue-400' },
    { name: 'Drizzle ORM', color: 'hover:text-green-400' },
    { name: 'Zod', color: 'hover:text-orange-400' },
    { name: 'Better-Auth', color: 'hover:text-purple-400' },
];

export const TechStack: React.FC = () => {
    return (
        <section className="py-12 border-y border-white/[0.04]">
            <div className="container mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4"
                >
                    <span className="text-xs text-zinc-600 uppercase tracking-wider">Powered by</span>
                    {TECH_STACK.map((tech, index) => (
                        <motion.span
                            key={tech.name}
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className={`text-sm text-zinc-500 ${tech.color} transition-colors cursor-default font-medium`}
                        >
                            {tech.name}
                        </motion.span>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};
