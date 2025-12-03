"use client";
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '../ui/Button';
import Link from 'next/link';

export const Hero: React.FC = () => {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center pt-32 pb-20 px-4 overflow-hidden">

      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-indigo-900/20 opacity-30 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-cyan-900/20 opacity-20 blur-[100px] rounded-full pointer-events-none" />

      {/* Futuristic Grid Floor */}
      <div className="absolute bottom-0 inset-x-0 h-[400px] opacity-20 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:linear-gradient(to_top,#000_0%,transparent_100%)] pointer-events-none" />

      {/* Content */}
      <div className="container mx-auto max-w-6xl relative z-10">

        {/* Header Text */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-6 backdrop-blur-md"
          >
            <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-pulse"></span>
            <span className="text-xs font-mono text-cyan-200 tracking-wider">SYSTEM OPERATIONAL</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold tracking-tight mb-6"
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
              Skip the
            </span>
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-violet-500">
              Configuration Hell.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-zinc-400 mb-8 leading-relaxed max-w-2xl mx-auto"
          >
            Zuro generates production-ready backend infrastructure in seconds.
            Currently powering <strong className="text-white">Express.js</strong>, with multi-framework support coming soon.
            Stop fighting config files. Start shipping.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/docs" className="w-full sm:w-auto text-base px-8 py-4">
              <Button className="w-full sm:w-auto text-base px-8 py-4 cursor-pointer">
                Start Building <ArrowRight className="w-4 h-4" />
              </Button>            </Link>
            <Link href="/docs" className="w-full sm:w-auto text-base px-8 py-4">
              <Button variant="secondary" className="w-full sm:w-auto text-base px-8 py-4 cursor-pointer">
                Read Documentation
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* The Visual Centerpiece: Time Machine Terminal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, type: "spring", bounce: 0.2 }}
          className="relative rounded-xl border border-white/10 bg-black/80 backdrop-blur-xl shadow-2xl shadow-indigo-500/10 overflow-hidden mx-auto max-w-5xl group"
        >
          {/* Subtle Glow Border */}
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 via-violet-500/20 to-cyan-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 blur-lg" />

          {/* Terminal Window Header */}
          <div className="relative flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-white/5 z-10">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/50" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
              <div className="w-3 h-3 rounded-full bg-green-500/50" />
            </div>
            <div className="flex-1 text-center">
              <span className="text-xs text-zinc-500 font-mono">terminal — -zsh</span>
            </div>
          </div>

          {/* Split Screen Content */}
          <div className="relative grid md:grid-cols-2 h-[400px] font-mono text-sm z-10">

            {/* Left: The Old Way */}
            <div className="p-6 border-r border-white/5 relative overflow-hidden bg-red-950/5">
              <div className="absolute top-4 right-4 text-red-500/50 text-xs font-bold uppercase tracking-widest border border-red-900 px-2 py-1 rounded">
                The Old Way
              </div>
              <div className="opacity-60 space-y-1">
                <p className="text-zinc-500">$ npm init -y</p>
                <p className="text-zinc-500">$ npm i express typescript ts-node @types/node @types/express</p>
                <p className="text-zinc-300">installing...</p>
                <ScrollingErrorLog />
              </div>
            </div>

            {/* Right: The Zuro Way */}
            <div className="p-6 bg-gradient-to-br from-green-950/10 to-cyan-950/5 relative">
              <div className="absolute top-4 right-4 text-green-500/50 text-xs font-bold uppercase tracking-widest border border-green-900 px-2 py-1 rounded">
                The Zuro Way
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-green-500 font-bold">➜</span>
                  <span className="text-white">npx zuro-cli init</span>
                </div>

                <div className="pl-4 space-y-2 text-zinc-400">
                  <TypewriterEffect />
                </div>
              </div>
            </div>

          </div>
        </motion.div>
      </div>
    </section>
  );
};

// Helper Components for Terminal Animation
const ScrollingErrorLog = () => {
  return (
    <div className="text-xs text-red-400 mt-4 leading-relaxed opacity-70">
      <p>npm WARN deprecated request@2.88.2: request has been deprecated...</p>
      <p>gyp ERR! build error</p>
      <p>gyp ERR! stack Error: `make` failed with exit code: 2</p>
      <p>ts-node: error TS2307: Cannot find module './config' or its corresponding type declarations.</p>
      <p>[eslint] Failed to load plugin '@typescript-eslint' declared in '.eslintrc.json'</p>
      <p>Error: EADDRINUSE: address already in use :::3000</p>
      <p>SyntaxError: Unexpected token '?' in file auth.ts</p>
      <p>TypeError: Cannot read property 'env' of undefined</p>
      <p>UnhandledPromiseRejectionWarning: Error: connect ECONNREFUSED 127.0.0.1:5432</p>
      <p className="mt-4 text-red-500 font-bold">✖ Failed to compile.</p>
    </div>
  );
};

const TypewriterEffect = () => {
  const steps = [
    { text: "✔ Validating environment...", delay: 500 },
    { text: "✔ Configuring Express + TypeScript...", delay: 1200 },
    { text: "✔ Setting up Pino Logger...", delay: 1800 },
    { text: "✔ Generating database schema...", delay: 2400 },
    { text: "✨ Project ready in ./my-app", delay: 3000, highlight: true }
  ];

  const [visibleStep, setVisibleStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setVisibleStep((prev) => (prev < steps.length ? prev + 1 : prev));
    }, 800);
    return () => clearInterval(timer);
  }, [steps.length]);

  return (
    <>
      {steps.map((step, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, x: -10 }}
          animate={visibleStep >= idx ? { opacity: 1, x: 0 } : {}}
          className={`flex items-center gap-2 ${step.highlight ? 'text-green-400 font-bold mt-4 text-base' : ''}`}
        >
          {!step.highlight && visibleStep >= idx && <CheckCircle2 className="w-3 h-3 text-green-500" />}
          {visibleStep >= idx ? step.text : ''}
        </motion.div>
      ))}
      {visibleStep === steps.length && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-6 flex items-center gap-2 text-white"
        >
          <span className="text-green-500 font-bold">➜</span>
          <span className="animate-pulse">_</span>
        </motion.div>
      )}
    </>
  );
};