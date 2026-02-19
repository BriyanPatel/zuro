"use client";
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check, ArrowRight, Sparkles, Terminal, Layers } from 'lucide-react';
import Link from 'next/link';

const HERO_MODULES = [
  { name: 'database', color: 'text-blue-400' },
  { name: 'auth', color: 'text-purple-400' },
  { name: 'error-handler', color: 'text-red-400' },
  { name: 'validator', color: 'text-yellow-400' },
  { name: 'ai', color: 'text-cyan-400', comingSoon: true },
];

export const Hero: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [activeModule, setActiveModule] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveModule((prev) => (prev + 1) % HERO_MODULES.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const copyCommand = () => {
    navigator.clipboard.writeText('npx zuro-cli init');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center pt-24 pb-20 px-4 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        {/* Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:60px_60px]" />

        {/* Gradient Orbs */}
        <div className="absolute top-1/4 left-1/4 w-[800px] h-[800px] bg-green-500/[0.07] rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-emerald-500/[0.05] rounded-full blur-[120px]" />
        <div className="absolute top-1/2 right-1/3 w-[400px] h-[400px] bg-cyan-500/[0.03] rounded-full blur-[100px]" />
      </div>

      <div className="container mx-auto max-w-6xl relative z-10">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="flex justify-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.08] backdrop-blur-sm">
            <Sparkles className="w-4 h-4 text-green-400" />
            <span className="text-sm text-zinc-300">The Backend CLI for Modern Developers</span>
          </div>
        </motion.div>

        {/* Main Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-6"
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-[-0.02em] leading-[1.1]">
            <span className="text-white">Build and ship backends,</span>
            <br />
            <span className="gradient-text glow-text">minus the setup.</span>
          </h1>
        </motion.div>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="text-lg md:text-xl text-zinc-400 text-center max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Production-ready Express + TypeScript setup in seconds.
          Add auth, database, AI, and more with single commands.
          <span className="text-zinc-300 block mt-2">Your code. Your stack. Zero lock-in.</span>
        </motion.p>

        {/* Command Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="flex justify-center mb-6"
        >
          <div
            onClick={copyCommand}
            className="group relative flex items-center gap-4 px-6 py-4 bg-zinc-900/80 border border-white/[0.08] rounded-xl cursor-pointer hover:border-green-500/30 transition-all duration-300"
          >
            <Terminal className="w-5 h-5 text-zinc-500" />
            <code className="text-base md:text-lg font-mono text-white">npx zuro-cli init</code>
            <button className="p-2 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] transition-colors">
              {copied ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <Copy className="w-4 h-4 text-zinc-400" />
              )}
            </button>
          </div>
        </motion.div>

        {/* Module Pills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="flex justify-center mb-10"
        >
          <div className="flex items-center gap-2 px-4 py-2 bg-zinc-900/50 border border-white/[0.06] rounded-lg">
            <span className="text-sm text-zinc-500 font-mono">zuro add</span>
            <div className="flex items-center gap-1.5">
              {HERO_MODULES.map((mod, i) => (
                <motion.span
                  key={mod.name}
                  className={`px-2 py-0.5 rounded text-xs font-mono transition-all duration-300 ${
                    i === activeModule
                      ? `${mod.color} bg-white/[0.08]`
                      : 'text-zinc-600'
                  }`}
                  animate={{ opacity: i === activeModule ? 1 : 0.4 }}
                >
                  {mod.name}
                  {mod.comingSoon && <span className="ml-1 text-[10px] opacity-60">soon</span>}
                </motion.span>
              ))}
            </div>
          </div>
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
        >
          <Link href="/docs" className="btn-primary flex items-center gap-2">
            Get Started <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href="https://github.com/BriyanPatel/zuro"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
            </svg>
            View on GitHub
          </a>
        </motion.div>

        {/* Code Preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-4xl mx-auto"
        >
          <CodePreview />
        </motion.div>

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-16 flex flex-col items-center gap-4"
        >
          <div className="flex items-center gap-6 text-sm text-zinc-500">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4" />
              <span>Express + TypeScript</span>
            </div>
            <span className="text-zinc-700">•</span>
            <span>Drizzle ORM</span>
            <span className="text-zinc-700">•</span>
            <span>Better-Auth</span>
            <span className="text-zinc-700">•</span>
            <span>Zod</span>
          </div>
          <p className="text-xs text-zinc-600">
            Trusted by developers at hackathons, bootcamps, and production apps
          </p>
        </motion.div>
      </div>
    </section>
  );
};

// Modern Code Preview with tabs
const CodePreview = () => {
  const [activeTab, setActiveTab] = useState<'init' | 'add' | 'code'>('init');

  const tabs = [
    { id: 'init' as const, label: 'Create Project' },
    { id: 'add' as const, label: 'Add Modules' },
    { id: 'code' as const, label: 'Generated Code' },
  ];

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-zinc-900/50 overflow-hidden shadow-2xl shadow-black/50">
      {/* Tab Bar */}
      <div className="flex items-center gap-1 px-4 py-3 bg-zinc-900/80 border-b border-white/[0.06]">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-white/[0.08] text-white'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-6 font-mono text-sm min-h-[240px]">
        {activeTab === 'init' && <InitPreview />}
        {activeTab === 'add' && <AddPreview />}
        {activeTab === 'code' && <CodeOutput />}
      </div>
    </div>
  );
};

const InitPreview = () => (
  <div className="space-y-3">
    <div className="flex items-center gap-2">
      <span className="text-green-500">$</span>
      <span className="text-white">npx zuro-cli init my-app</span>
    </div>
    <div className="text-zinc-500 ml-4 space-y-1">
      <p>Creating project...</p>
      <p className="text-green-400">✓ Express + TypeScript configured</p>
      <p className="text-green-400">✓ Security middleware (Helmet, CORS)</p>
      <p className="text-green-400">✓ Environment validation (Zod)</p>
      <p className="text-green-400">✓ Structured logging (Pino)</p>
    </div>
    <div className="pt-2">
      <span className="text-green-500 font-semibold">Done!</span>
      <span className="text-zinc-400"> Run: </span>
      <span className="text-cyan-400">cd my-app && npm run dev</span>
    </div>
  </div>
);

const AddPreview = () => (
  <div className="space-y-4">
    <div>
      <div className="flex items-center gap-2">
        <span className="text-green-500">$</span>
        <span className="text-white">npx zuro-cli add database</span>
      </div>
      <p className="text-zinc-500 ml-4 mt-1">✓ PostgreSQL + Drizzle ORM ready</p>
    </div>
    <div>
      <div className="flex items-center gap-2">
        <span className="text-green-500">$</span>
        <span className="text-white">npx zuro-cli add auth</span>
      </div>
      <p className="text-zinc-500 ml-4 mt-1">✓ Signup, login, sessions configured</p>
    </div>
    <div>
      <div className="flex items-center gap-2">
        <span className="text-green-500">$</span>
        <span className="text-white">npx zuro-cli add error-handler</span>
      </div>
      <p className="text-zinc-500 ml-4 mt-1">✓ Custom error classes + middleware</p>
    </div>
    <div className="text-zinc-600 text-xs mt-4">
      Coming soon: ai, payments, email, websockets...
    </div>
  </div>
);

const CodeOutput = () => (
  <div className="space-y-1">
    <p className="text-zinc-500">// Generated code you own 100%</p>
    <p><span className="text-purple-400">import</span> <span className="text-blue-400">express</span> <span className="text-purple-400">from</span> <span className="text-green-400">"express"</span>;</p>
    <p><span className="text-purple-400">import</span> {'{'} <span className="text-blue-400">auth</span> {'}'} <span className="text-purple-400">from</span> <span className="text-green-400">"./lib/auth"</span>;</p>
    <p><span className="text-purple-400">import</span> {'{'} <span className="text-blue-400">db</span> {'}'} <span className="text-purple-400">from</span> <span className="text-green-400">"./db"</span>;</p>
    <p></p>
    <p><span className="text-purple-400">const</span> <span className="text-blue-400">app</span> = <span className="text-yellow-400">express</span>();</p>
    <p><span className="text-blue-400">app</span>.<span className="text-yellow-400">use</span>(<span className="text-yellow-400">helmet</span>());</p>
    <p><span className="text-blue-400">app</span>.<span className="text-yellow-400">use</span>(<span className="text-yellow-400">cors</span>());</p>
    <p></p>
    <p className="text-zinc-500">// Your routes, your logic, your code</p>
  </div>
);

export default Hero;
