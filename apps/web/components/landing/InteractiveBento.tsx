"use client";
import React, { useRef } from 'react';
import { motion, useMotionTemplate, useMotionValue } from 'framer-motion';
import { Settings, Layers, Terminal, FileCode } from 'lucide-react';

export const InteractiveBento: React.FC = () => {
  return (
    <section className="py-24 px-4 relative z-10">
      <div className="container mx-auto max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 auto-rows-[300px]">

          {/* Card 1: Config Pain */}
          <SpotlightCard className="col-span-1 md:col-span-2 group">
            <div className="relative h-full flex flex-col justify-between p-8">
              <div className="flex justify-between items-start">
                <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                  <Settings className="w-6 h-6 text-zinc-300" />
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-zinc-500 uppercase">Config.sys</span>
                  <div className="w-12 h-6 bg-green-500/20 rounded-full p-1 relative">
                    <motion.div
                      layoutId="toggle"
                      className="w-4 h-4 bg-green-500 rounded-full shadow-lg absolute right-1"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-white mb-2">Zero Configuration</h3>
                <p className="text-zinc-400 max-w-md">
                  We handle the boring stuff. Env validation, TypeScript paths, Security headers—pre-solved.
                </p>
              </div>

              {/* Background Decoration */}
              <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-5 pointer-events-none">
                <Settings className="w-64 h-64 text-white" />
              </div>
            </div>
          </SpotlightCard>

          {/* Card 2: Ownership */}
          <SpotlightCard className="col-span-1">
            <div className="relative h-full flex flex-col justify-between p-8">
              <div className="p-3 bg-white/5 w-fit rounded-lg border border-white/10">
                <FileCode className="w-6 h-6 text-cyan-400" />
              </div>

              <div className="flex-1 flex items-center justify-center my-4">
                <div className="relative">
                  <motion.div
                    animate={{ rotateY: 180 }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                    className="w-20 h-24 bg-zinc-900 border border-zinc-700 rounded flex items-center justify-center shadow-lg shadow-cyan-900/20"
                  >
                    <span className="text-2xl font-mono text-zinc-500">{'{}'}</span>
                  </motion.div>
                  <div className="absolute -bottom-2 -right-2 bg-green-500/20 border border-green-500 text-green-400 text-xs px-2 py-0.5 rounded-full">
                    Ejected
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold text-white mb-1">No Black Boxes</h3>
                <p className="text-sm text-zinc-400">Standard code ejected into your src folder.</p>
              </div>
            </div>
          </SpotlightCard>

          {/* Card 3: The Stack */}
          <SpotlightCard className="col-span-1">
            <div className="relative h-full flex flex-col justify-between p-8 overflow-hidden">
              <div className="p-3 bg-white/5 w-fit rounded-lg border border-white/10">
                <Layers className="w-6 h-6 text-violet-400" />
              </div>

              <div className="flex-1 flex flex-col justify-center gap-3 relative z-10">
                {['Better-Auth', 'Drizzle ORM', 'Pino Logging', 'Zod'].map((tech, i) => (
                  <motion.div
                    key={tech}
                    initial={{ x: -20, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-2 p-2 rounded bg-white/5 border border-white/5 hover:border-violet-500/30 transition-colors"
                  >
                    <div className="w-2 h-2 rounded-full bg-violet-500 shadow-[0_0_10px_rgba(139,92,246,0.5)]" />
                    <span className="font-mono text-sm text-zinc-300">{tech}</span>
                  </motion.div>
                ))}
              </div>

              <div>
                <h3 className="text-xl font-bold text-white mb-1">Modern Stack</h3>
                <p className="text-sm text-zinc-400">Industry standard Logging & Auth included.</p>
              </div>
            </div>
          </SpotlightCard>

          {/* Card 4: Smart Init */}
          <SpotlightCard className="col-span-1 md:col-span-2">
            <div className="relative h-full flex flex-col justify-between p-8 overflow-hidden">
              {/* Tech Circles Background */}
              <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] border border-cyan-500/30 rounded-full animate-[spin_10s_linear_infinite]" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] border border-cyan-500/50 rounded-full animate-[spin_7s_linear_infinite_reverse]" />
              </div>

              <div className="flex justify-between items-start relative z-10">
                <div className="p-3 bg-white/5 w-fit rounded-lg border border-white/10">
                  <Terminal className="w-6 h-6 text-white" />
                </div>
                <div className="text-xs font-mono text-cyan-400 border border-cyan-900 bg-cyan-900/20 px-2 py-1 rounded">
                  CLI v1.0.0
                </div>
              </div>

              <div className="relative z-10 mt-8">
                <h3 className="text-2xl font-bold text-white mb-2">The CLI Suite</h3>
                <div className="flex gap-4 mb-3">
                  <code className="text-sm bg-black/40 border border-white/10 px-3 py-1.5 rounded text-cyan-300 font-mono shadow-[0_0_10px_rgba(34,211,238,0.1)]">
                    npx zuro-cli init
                  </code>
                  <code className="text-sm bg-black/40 border border-white/10 px-3 py-1.5 rounded text-violet-300 font-mono shadow-[0_0_10px_rgba(167,139,250,0.1)]">
                    npx zuro db
                  </code>
                </div>
                <p className="text-zinc-400 max-w-md">
                  Initialize a new project from scratch, or add Zuro to an existing folder.
                  We respect your legacy code while giving you modern powers.
                </p>
              </div>
            </div>
          </SpotlightCard>

        </div>
      </div>
    </section>
  );
};

// Spotlight Card Component
const SpotlightCard: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => {
  const divRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { current } = divRef;
    if (!current) return;
    const { left, top } = current.getBoundingClientRect();
    mouseX.set(e.clientX - left);
    mouseY.set(e.clientY - top);
  };

  return (
    <motion.div
      ref={divRef}
      onMouseMove={handleMouseMove}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`relative rounded-none border border-white/10 bg-zinc-900/40 overflow-hidden group ${className}`}
    >
      {/* HUD Corners */}
      <div className="absolute top-0 left-0 w-2 h-2 border-l border-t border-white/20 group-hover:border-white/50 transition-colors z-20" />
      <div className="absolute top-0 right-0 w-2 h-2 border-r border-t border-white/20 group-hover:border-white/50 transition-colors z-20" />
      <div className="absolute bottom-0 left-0 w-2 h-2 border-l border-b border-white/20 group-hover:border-white/50 transition-colors z-20" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-r border-b border-white/20 group-hover:border-white/50 transition-colors z-20" />

      <motion.div
        className="pointer-events-none absolute -inset-px opacity-0 transition duration-300 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              650px circle at ${mouseX}px ${mouseY}px,
              rgba(255, 255, 255, 0.1),
              transparent 80%
            )
          `,
        }}
      />
      <div className="relative h-full">{children}</div>
    </motion.div>
  );
};