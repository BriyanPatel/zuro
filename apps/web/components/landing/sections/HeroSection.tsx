"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen, Check, Copy, Terminal } from "lucide-react";
import { trackSeoEvent } from "@/lib/seo/analytics";

const tabs = ["init", "add", "output"] as const;
type HeroTab = (typeof tabs)[number];

export function HeroSection() {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<HeroTab>("init");

  const copyCmd = () => {
    navigator.clipboard.writeText("npx zuro-cli init my-mvp");
    trackSeoEvent("init_command_copy", {
      location: "hero",
      command: "npx zuro-cli init my-mvp",
    });
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <section className="grid gap-10 pb-10 pt-14 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <span className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-zinc-300">
          Production-ready modules for Express + TypeScript
        </span>

        <h1 className="mt-6 text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
          Production-ready backend modules you own.
        </h1>

        <p className="mt-5 max-w-2xl text-base leading-7 text-zinc-400 sm:text-lg">
          No framework lock-in. No hidden runtime. Add production backend patterns as plain TypeScript code you fully control.
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-zinc-300">
            Code lives in your project
          </span>
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-zinc-300">
            No runtime dependency
          </span>
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-zinc-300">
            Modify everything freely
          </span>
        </div>

        <div className="mt-7 flex flex-wrap items-center gap-3">
          <Link
            href="/docs/init"
            onClick={() =>
              trackSeoEvent("docs_cta_click", {
                location: "hero_primary",
                target: "/docs/init",
              })
            }
            className="inline-flex items-center gap-2 rounded-md border border-emerald-400/40 bg-emerald-400/10 px-4 py-2.5 text-sm font-medium text-emerald-300 transition hover:bg-emerald-400/20"
          >
            Get started
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/docs"
            onClick={() =>
              trackSeoEvent("docs_cta_click", {
                location: "hero_secondary",
                target: "/docs",
              })
            }
            className="inline-flex items-center gap-2 rounded-md border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-medium text-zinc-200 transition hover:bg-white/10"
          >
            <BookOpen className="h-4 w-4" />
            Read docs
          </Link>
        </div>

        <p className="mt-6 text-xs text-zinc-500">Modules: auth, database, validator, docs, mailer, error-handler, rate-limiter.</p>
      </motion.div>

      <motion.aside
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.12 }}
        className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/70 shadow-[0_20px_70px_-32px_rgba(0,0,0,0.9)]"
      >
        <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
          <span className="h-2 w-2 rounded-full bg-zinc-600" />
          <span className="h-2 w-2 rounded-full bg-zinc-600" />
          <span className="h-2 w-2 rounded-full bg-zinc-600" />
          <p className="ml-2 text-xs text-zinc-500">zuro-cli</p>
        </div>

        <div className="border-b border-white/10 px-3">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative px-3 py-2 text-xs font-medium transition ${
                activeTab === tab ? "text-zinc-100" : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {tab === "init" ? "Init" : tab === "add" ? "Add Modules" : "Generated"}
              {activeTab === tab && <span className="absolute inset-x-2 -bottom-px h-px bg-emerald-400/70" />}
            </button>
          ))}
        </div>

        <div className="px-5 py-5 font-mono text-xs leading-6 text-zinc-300">
          {activeTab === "init" && (
            <div className="space-y-1.5">
              <p className="inline-flex items-center gap-2 text-zinc-300">
                <Terminal className="h-3.5 w-3.5 text-zinc-500" />$ npx zuro-cli init my-mvp
              </p>
              <p className="text-emerald-300">✓ Core backend scaffolded</p>
              <p className="text-emerald-300">✓ Helmet, CORS, env validation configured</p>
              <p className="text-emerald-300">✓ Pino logging + health route ready</p>
            </div>
          )}

          {activeTab === "add" && (
            <div className="space-y-1.5">
              <p>$ npx zuro-cli add database</p>
              <p className="text-emerald-300">✓ Drizzle + PostgreSQL/MySQL ready</p>
              <p>$ npx zuro-cli add auth</p>
              <p className="text-zinc-500">↳ auto-installs: database, error-handler</p>
              <p className="text-emerald-300">✓ Sessions, signup, login configured</p>
            </div>
          )}

          {activeTab === "output" && (
            <div className="space-y-1">
              <p className="text-zinc-500">// Generated code you fully own</p>
              <p>import {`{ env }`} from "./env";</p>
              <p>import {`{ createServer }`} from "./server";</p>
              <p>import {`{ applyModules }`} from "./modules";</p>
              <p>const app = createServer();</p>
              <p>applyModules(app);</p>
              <p>app.listen(env.PORT);</p>
            </div>
          )}

          <button
            onClick={copyCmd}
            className="mt-4 inline-flex items-center gap-2 rounded-md border border-white/10 bg-black/40 px-3 py-1.5 text-[11px] text-zinc-300 transition hover:bg-black/70"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-300" /> : <Copy className="h-3.5 w-3.5" />} 
            Copy init command
          </button>
        </div>
      </motion.aside>
    </section>
  );
}
