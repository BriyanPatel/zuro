"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { Clock, ShieldCheck, Server } from 'lucide-react';

export const Explainer: React.FC = () => {
  return (
    <section className="py-24 px-4 bg-zinc-900/20 border-y border-white/5 relative overflow-hidden">
      
      {/* Subtle Grid Background */}
      <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:40px_40px]" />

      <div className="container mx-auto max-w-6xl relative z-10">
        
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold text-white mb-6"
          >
            What is <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-500">Zuro</span>?
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-zinc-400 text-lg max-w-2xl mx-auto"
          >
            Zuro is an infrastructure generator. It eliminates the first 20 hours of project setup by scaffolding production-ready code in seconds.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <ExplainerCard 
            icon={Server} 
            title="Framework Expansion" 
            delay={0}
          >
            <p className="text-zinc-400 mb-4">
              We are starting with <strong className="text-white">Express.js</strong> today. Fastify, NestJS, and Go support is currently in the lab.
            </p>
            <div className="text-xs font-mono text-zinc-500 bg-black/50 p-2 rounded border border-white/5">
              Status: Express (Live) • Others (Alpha)
            </div>
          </ExplainerCard>

          <ExplainerCard 
            icon={Clock} 
            title="Instant Setup" 
            delay={0.1}
          >
            <p className="text-zinc-400 mb-4">
              Don't waste time on <code className="text-cyan-400">tsconfig.json</code> or linting rules. 
              <strong className="text-white"> zuro init</strong> sets up a perfect environment instantly.
            </p>
             <div className="text-xs font-mono text-zinc-500 bg-black/50 p-2 rounded border border-white/5">
              Saved: ~4 hours per project
            </div>
          </ExplainerCard>

          <ExplainerCard 
            icon={ShieldCheck} 
            title="Enterprise Standard" 
            delay={0.2}
          >
            <p className="text-zinc-400 mb-4">
              Security and Logging are not optional. We include <strong className="text-white">Pino</strong>, Helmet, and Rate Limiting logic out of the box.
            </p>
             <div className="text-xs font-mono text-zinc-500 bg-black/50 p-2 rounded border border-white/5">
              Grade: Production Ready
            </div>
          </ExplainerCard>

        </div>

      </div>
    </section>
  );
};

const ExplainerCard: React.FC<{ icon: any, title: string, children: React.ReactNode, delay: number }> = ({ icon: Icon, title, children, delay }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
      className="group relative p-8 bg-zinc-900/30 border border-white/5 hover:border-cyan-500/30 transition-colors"
    >
      {/* Decorative Corner Brackets */}
      <div className="absolute top-0 left-0 w-3 h-3 border-l border-t border-white/10 group-hover:border-cyan-500/50 transition-colors" />
      <div className="absolute bottom-0 right-0 w-3 h-3 border-r border-b border-white/10 group-hover:border-cyan-500/50 transition-colors" />

      <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center mb-6 text-white group-hover:text-cyan-400 transition-colors">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
      <div className="text-sm leading-relaxed">
        {children}
      </div>
    </motion.div>
  )
}