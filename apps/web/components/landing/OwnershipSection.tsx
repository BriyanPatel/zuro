"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { Cloud, FolderOpen, FileCode } from 'lucide-react';

export const OwnershipSection: React.FC = () => {
  return (
    <section className="py-32 px-4 relative">
      <div className="container mx-auto max-w-5xl">
        <div className="flex flex-col md:flex-row items-center gap-16">
          
          {/* Text Content */}
          <div className="flex-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold text-white mb-6">Vendor Lock-in: <span className="text-red-500">0%</span></h2>
              <p className="text-zinc-400 text-lg leading-relaxed mb-8">
                Most platforms rent you a backend. We give you one. If Zuro disappears tomorrow, your project keeps working. 
                It's just standard TypeScript and Express.
              </p>
              
              <ul className="space-y-4">
                {[
                  "No proprietary runtimes",
                  "Host anywhere (AWS, Railway, VPS)",
                  "Full access to middleware"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-zinc-300">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          {/* Visualizer */}
          <div className="flex-1 w-full max-w-md">
             <div className="relative p-8 rounded-2xl border border-white/10 bg-zinc-900/50 backdrop-blur-sm">
                
                {/* Zuro Cloud (Source) */}
                <div className="flex items-center gap-4 mb-16 opacity-50">
                   <div className="p-4 rounded-xl bg-zinc-800 border border-zinc-700">
                      <Cloud className="w-8 h-8 text-zinc-400" />
                   </div>
                   <div className="text-zinc-500 font-mono text-sm">Zuro Generator</div>
                </div>

                {/* Animated File */}
                <motion.div
                   animate={{ 
                      y: [0, 80, 0],
                      opacity: [0, 1, 0],
                      scale: [0.8, 1, 0.8]
                   }}
                   transition={{ 
                      duration: 3, 
                      repeat: Infinity,
                      ease: "easeInOut" 
                   }}
                   className="absolute left-12 top-20 z-20"
                >
                   <div className="p-3 bg-cyan-500/20 border border-cyan-500/50 rounded-lg text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.4)]">
                      <FileCode className="w-6 h-6" />
                   </div>
                </motion.div>

                {/* Connection Line */}
                <div className="absolute left-[3.25rem] top-20 bottom-20 w-0.5 bg-gradient-to-b from-transparent via-zinc-700 to-transparent border-l border-dashed border-zinc-700 h-[100px]" />

                {/* Your Project (Destination) */}
                <div className="flex items-center gap-4 mt-8">
                   <motion.div 
                      animate={{ boxShadow: ["0 0 0px rgba(56,189,248,0)", "0 0 20px rgba(56,189,248,0.3)", "0 0 0px rgba(56,189,248,0)"] }}
                      transition={{ duration: 3, repeat: Infinity, delay: 1.5 }}
                      className="p-4 rounded-xl bg-gradient-to-br from-zinc-800 to-black border border-zinc-700 relative z-10"
                   >
                      <FolderOpen className="w-8 h-8 text-white" />
                   </motion.div>
                   <div>
                      <div className="text-white font-medium">Your Project</div>
                      <div className="text-green-400 text-xs font-mono">src/server.ts</div>
                   </div>
                </div>

             </div>
          </div>

        </div>
      </div>
    </section>
  );
};