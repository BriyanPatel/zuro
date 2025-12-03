"use client";
import React from 'react';
import { ShoppingCart, Brain, Shield, Gauge, Lock, Server, Cpu } from 'lucide-react';

const ROADMAP_ITEMS = [
  { icon: Brain, label: "Private AI Agents", sub: "Local LLM & RAG Support", highlight: true },
  { icon: Server, label: "Multi-Framework", sub: "Fastify, NestJS, & Go", highlight: true },
  { icon: Shield, label: "Rate Limiting", sub: "Redis Backed Protection" },
  { icon: Cpu, label: "Edge Runtime", sub: "Cloudflare Workers Adapter" },
  { icon: Gauge, label: "Metrics Dashboard", sub: "Real-time Telemetry" },
  { icon: Lock, label: "RBAC System", sub: "Role-based Access Control" },
  { icon: ShoppingCart, label: "E-Commerce Kit", sub: "Stripe & Orders" },
];

export const FutureCarousel: React.FC = () => {
  return (
    <section className="py-24 border-y border-white/5 bg-black relative overflow-hidden">
      
      {/* Background Grid Accent */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="container mx-auto max-w-7xl px-4 mb-12 flex flex-col md:flex-row items-end justify-between gap-6 relative z-10">
         <div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
              The <span className="text-cyan-400">Master Plan</span>
            </h2>
            <p className="text-zinc-400 max-w-xl">
              We are starting with Express.js to solve the immediate pain. 
              But our vision is a universal CLI for all backend infrastructure.
            </p>
         </div>
         <div className="flex items-center gap-2">
           <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
           <span className="text-xs font-mono text-green-400 uppercase tracking-widest">
              System Online
           </span>
         </div>
      </div>

      <div className="flex relative overflow-hidden group">
        {/* Fade Masks */}
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-zuro-black to-transparent z-20 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-zuro-black to-transparent z-20 pointer-events-none" />

        {/* Scrolling Track */}
        <div className="flex animate-scroll group-hover:[animation-play-state:paused] gap-6 w-max px-4">
          {[...ROADMAP_ITEMS, ...ROADMAP_ITEMS, ...ROADMAP_ITEMS].map((item, idx) => (
            <div 
              key={idx}
              className={`relative flex items-center gap-4 px-6 py-5 w-[340px] shrink-0 bg-zinc-900/20 backdrop-blur-sm border transition-all duration-300
                ${item.highlight 
                  ? 'border-cyan-500/30 bg-cyan-950/10' 
                  : 'border-white/10 hover:border-white/20'
                }
              `}
            >
               {/* HUD Corners */}
               <div className="absolute top-0 left-0 w-2 h-2 border-l border-t border-white/20" />
               <div className="absolute top-0 right-0 w-2 h-2 border-r border-t border-white/20" />
               <div className="absolute bottom-0 left-0 w-2 h-2 border-l border-b border-white/20" />
               <div className="absolute bottom-0 right-0 w-2 h-2 border-r border-b border-white/20" />

               <div className={`p-3 rounded-lg border ${item.highlight ? 'bg-cyan-500/10 border-cyan-500/20' : 'bg-white/5 border-white/10'}`}>
                  <item.icon className={`w-5 h-5 ${item.highlight ? 'text-cyan-400' : 'text-zinc-400'}`} />
               </div>
               
               <div>
                  <div className={`font-medium ${item.highlight ? 'text-cyan-100' : 'text-white'}`}>
                    {item.label}
                  </div>
                  <div className={`text-xs mt-1 font-mono ${item.highlight ? 'text-cyan-400' : 'text-zinc-500'}`}>
                    {item.sub}
                  </div>
               </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};