"use client";

import Link from "next/link";
import { motion, useInView, type Variants } from "framer-motion";
import { useEffect, useState, useRef, useCallback } from "react";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Copy,
  Check,
  GraduationCap,
  Layers3,
  Rocket,
  ShieldCheck,
  Sparkles,
  Terminal,
  Code2,
  Zap,
  Github,
} from "lucide-react";

/* ─── data ─── */
const modules = ["auth", "database", "validator", "error-handler"];
const flowSteps = ["Initialize", "Compose", "Ship"];
const techStack = [
  { name: "Express", color: "#68A063" },
  { name: "TypeScript", color: "#3178C6" },
  { name: "Drizzle", color: "#C5F74F" },
  { name: "Zod", color: "#3068B7" },
  { name: "Better-Auth", color: "#8B5CF6" },
];

/* ─── animations ─── */
const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.5 } },
};

/* ─── Counter hook ─── */
function useCounter(end: number, duration = 1800) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = end / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [inView, end, duration]);

  return { count, ref };
}

/* ─── Glow Card ─── */
function GlowCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [hovering, setHovering] = useState(false);

  const handleMove = useCallback((e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const r = cardRef.current.getBoundingClientRect();
    setPos({ x: e.clientX - r.left, y: e.clientY - r.top });
  }, []);

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMove}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      className={`zl-glow-card ${className}`}
      style={
        {
          "--glow-x": `${pos.x}px`,
          "--glow-y": `${pos.y}px`,
          "--glow-opacity": hovering ? 1 : 0,
        } as React.CSSProperties
      }
    >
      {children}
    </div>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   MAIN COMPONENT
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
export function ProfessionalLanding() {
  const [activeModule, setActiveModule] = useState(0);
  const [activeStep, setActiveStep] = useState(0);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"init" | "add" | "code">("init");

  useEffect(() => {
    const modTimer = setInterval(
      () => setActiveModule((p) => (p + 1) % modules.length),
      1700
    );
    const stepTimer = setInterval(
      () => setActiveStep((p) => (p + 1) % flowSteps.length),
      2200
    );
    return () => {
      clearInterval(modTimer);
      clearInterval(stepTimer);
    };
  }, []);

  const copyCmd = () => {
    navigator.clipboard.writeText("npx zuro-cli init");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  /* counters */
  const c1 = useCounter(60, 1200);
  const c2 = useCounter(4, 800);
  const c3 = useCounter(0, 400);

  return (
    <div className="zl-root">
      {/* bg layers */}
      <div className="zl-bg-grid" aria-hidden="true" />
      <div className="zl-bg-glow-1" aria-hidden="true" />
      <div className="zl-bg-glow-2" aria-hidden="true" />

      {/* ── HEADER ── */}
      <header className="zl-header">
        <div className="zl-container zl-header-inner">
          <Link href="/" className="zl-logo">
            <span className="zl-logo-mark">Z</span>
            <span className="zl-logo-text">Zuro</span>
          </Link>
          <nav className="zl-nav">
            <Link href="/docs" className="zl-nav-link">Docs</Link>
            <a
              href="https://github.com/BriyanPatel/zuro"
              target="_blank"
              rel="noopener noreferrer"
              className="zl-nav-link"
            >
              GitHub
            </a>
            <Link href="/docs/init" className="zl-cta-btn">
              Get Started
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </nav>
        </div>
      </header>

      <main className="zl-container">
        {/* ── HERO ── */}
        <section className="zl-hero">
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className="zl-hero-content"
          >
            <motion.span variants={fadeUp} className="zl-badge">
              <Sparkles className="h-3.5 w-3.5" />
              Opinionated backend scaffolding for builders
            </motion.span>

            <motion.h1 variants={fadeUp} className="zl-headline">
              Ship backends,{" "}
              <span className="zl-gradient-text">not boilerplate.</span>
            </motion.h1>

            <motion.p variants={fadeUp} className="zl-subline">
              Production-ready Express + TypeScript in seconds. Add auth, database,
              validation with single commands.{" "}
              <span className="zl-subline-accent">Your code. Zero lock-in.</span>
            </motion.p>

            {/* command box */}
            <motion.div variants={fadeUp} className="zl-cmd-wrap">
              <button onClick={copyCmd} className="zl-cmd-box">
                <Terminal className="h-4 w-4 zl-cmd-icon" />
                <code className="zl-cmd-text">npx zuro-cli init</code>
                <span className="zl-cmd-copy">
                  {copied ? (
                    <Check className="h-3.5 w-3.5 zl-cmd-copied" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </span>
              </button>
            </motion.div>

            {/* CTAs */}
            <motion.div variants={fadeUp} className="zl-hero-actions">
              <Link href="/docs/init" className="zl-btn zl-btn-primary">
                Start in 60 seconds
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/docs" className="zl-btn zl-btn-ghost">
                <BookOpen className="h-4 w-4" />
                Explore Docs
              </Link>
            </motion.div>

            {/* trust */}
            <motion.div variants={fadeUp} className="zl-trust">
              {["No hidden runtime", "Modular add-ons", "Team-ready structure"].map(
                (t) => (
                  <span key={t} className="zl-trust-item">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {t}
                  </span>
                )
              )}
            </motion.div>
          </motion.div>

          {/* hero panel — terminal */}
          <motion.aside
            initial={{ opacity: 0, y: 32, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="zl-terminal-card"
          >
            <div className="zl-term-dots">
              <span /><span /><span />
              <p className="zl-term-title">Live scaffold preview</p>
              <span className="zl-term-pill">CLI session</span>
            </div>

            {/* tabs */}
            <div className="zl-term-tabs">
              {(["init", "add", "code"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setActiveTab(t)}
                  className={`zl-term-tab ${activeTab === t ? "active" : ""}`}
                >
                  {t === "init" ? "Create" : t === "add" ? "Add Modules" : "Output"}
                </button>
              ))}
            </div>

            {/* terminal content */}
            <div className="zl-term-body">
              {activeTab === "init" && (
                <div className="zl-code-block">
                  <p><span className="zl-t-green">$</span> npx zuro-cli init my-app</p>
                  <p className="zl-t-dim">Creating project...</p>
                  <p className="zl-t-green">✓ Express + TypeScript configured</p>
                  <p className="zl-t-green">✓ Security middleware (Helmet, CORS)</p>
                  <p className="zl-t-green">✓ Environment validation (Zod)</p>
                  <p className="zl-t-green">✓ Structured logging (Pino)</p>
                  <p className="zl-term-done">
                    <span className="zl-t-green">Done!</span>{" "}
                    <span className="zl-t-dim">Run:</span>{" "}
                    <span className="zl-t-cyan">cd my-app && npm run dev</span>
                  </p>
                </div>
              )}
              {activeTab === "add" && (
                <div className="zl-code-block">
                  <p><span className="zl-t-green">$</span> npx zuro-cli add database</p>
                  <p className="zl-t-green">✓ PostgreSQL + Drizzle ORM ready</p>
                  <br />
                  <p><span className="zl-t-green">$</span> npx zuro-cli add auth</p>
                  <p className="zl-t-green">✓ Signup, login, sessions configured</p>
                  <br />
                  <p><span className="zl-t-green">$</span> npx zuro-cli add error-handler</p>
                  <p className="zl-t-green">✓ Custom error classes + middleware</p>
                  <p className="zl-t-dim zl-term-soon">Coming soon: ai, payments, email, websockets...</p>
                </div>
              )}
              {activeTab === "code" && (
                <div className="zl-code-block">
                  <p className="zl-t-dim">// Generated code you own 100%</p>
                  <p><span className="zl-t-purple">import</span> <span className="zl-t-blue">express</span> <span className="zl-t-purple">from</span> <span className="zl-t-green">"express"</span>;</p>
                  <p><span className="zl-t-purple">import</span> {"{"} <span className="zl-t-blue">auth</span> {"}"} <span className="zl-t-purple">from</span> <span className="zl-t-green">"./lib/auth"</span>;</p>
                  <p><span className="zl-t-purple">import</span> {"{"} <span className="zl-t-blue">db</span> {"}"} <span className="zl-t-purple">from</span> <span className="zl-t-green">"./db"</span>;</p>
                  <br />
                  <p><span className="zl-t-purple">const</span> <span className="zl-t-blue">app</span> = <span className="zl-t-yellow">express</span>();</p>
                  <p><span className="zl-t-blue">app</span>.<span className="zl-t-yellow">use</span>(<span className="zl-t-yellow">helmet</span>());</p>
                  <p><span className="zl-t-blue">app</span>.<span className="zl-t-yellow">use</span>(<span className="zl-t-yellow">cors</span>());</p>
                  <br />
                  <p className="zl-t-dim">// Your routes, your logic, your code</p>
                </div>
              )}
            </div>

            {/* metrics strip inside terminal */}
            <div className="zl-term-metrics">
              <div ref={c1.ref}>
                <strong>{c1.count}s</strong>
                <span>first scaffold</span>
              </div>
              <div ref={c2.ref}>
                <strong>{c2.count}</strong>
                <span>core modules</span>
              </div>
              <div ref={c3.ref}>
                <strong>{c3.count}</strong>
                <span>lock-in layer</span>
              </div>
            </div>
          </motion.aside>
        </section>

        {/* ── TECH STACK STRIP ── */}
        <motion.section
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.5 }}
          variants={fadeIn}
          className="zl-stack-strip"
        >
          <p className="zl-stack-label">Powered by</p>
          <div className="zl-stack-logos">
            {techStack.map((t) => (
              <span key={t.name} className="zl-stack-item" style={{ "--stack-color": t.color } as React.CSSProperties}>
                {t.name}
              </span>
            ))}
          </div>
        </motion.section>

        {/* ── FEATURES BENTO ── */}
        <section className="zl-bento">
          {/* Composable Modules */}
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeUp}
            className="zl-bento-span-7"
          >
            <GlowCard className="zl-bento-card">
              <div className="zl-card-icon">
                <Layers3 className="h-5 w-5" />
              </div>
              <p className="zl-card-label">Composable Modules</p>
              <h3 className="zl-card-title">
                Add capabilities without rewriting your base architecture.
              </h3>
              <p className="zl-card-desc">
                Install only what your project needs. Zuro resolves dependencies and
                keeps every module readable in plain TypeScript.
              </p>
              <div className="zl-pill-track">
                {modules.map((m, i) => (
                  <span
                    key={m}
                    className={`zl-pill ${i === activeModule ? "active" : ""}`}
                  >
                    {m}
                  </span>
                ))}
              </div>
            </GlowCard>
          </motion.div>

          {/* Best Fit */}
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeUp}
            transition={{ delay: 0.06 }}
            className="zl-bento-span-5"
          >
            <GlowCard className="zl-bento-card">
              <div className="zl-card-icon">
                <GraduationCap className="h-5 w-5" />
              </div>
              <p className="zl-card-label">Built for Learners</p>
              <h3 className="zl-card-title">
                Production standards for learning teams.
              </h3>
              <ul className="zl-card-list">
                <li><Zap className="h-3.5 w-3.5" /> College student builders</li>
                <li><Zap className="h-3.5 w-3.5" /> Hackathon teams</li>
                <li><Zap className="h-3.5 w-3.5" /> Cohorts & bootcamps</li>
              </ul>
            </GlowCard>
          </motion.div>

          {/* Code Ownership */}
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeUp}
            transition={{ delay: 0.1 }}
            className="zl-bento-span-5"
          >
            <GlowCard className="zl-bento-card">
              <div className="zl-card-icon">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <p className="zl-card-label">Code Ownership</p>
              <h3 className="zl-card-title">No black-box backend runtime.</h3>
              <p className="zl-card-desc">
                Your generated project remains fully editable. Refactor, swap tooling,
                and grow the codebase without framework friction.
              </p>
              <div className="zl-ownership-badge">
                <Code2 className="h-4 w-4" />
                <span>100% your code</span>
              </div>
            </GlowCard>
          </motion.div>

          {/* Build Flow */}
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeUp}
            transition={{ delay: 0.14 }}
            className="zl-bento-span-7"
          >
            <GlowCard className="zl-bento-card">
              <div className="zl-card-icon">
                <Rocket className="h-5 w-5" />
              </div>
              <p className="zl-card-label">Build Flow</p>
              <h3 className="zl-card-title">Initialize. Compose. Ship.</h3>
              <div className="zl-flow-row">
                {flowSteps.map((step, i) => (
                  <div
                    key={step}
                    className={`zl-flow-step ${i === activeStep ? "active" : ""}`}
                  >
                    <span className="zl-flow-num">{`0${i + 1}`}</span>
                    <p className="zl-flow-label">{step}</p>
                    {i === activeStep && (
                      <motion.div
                        layoutId="flow-indicator"
                        className="zl-flow-indicator"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                  </div>
                ))}
              </div>
            </GlowCard>
          </motion.div>
        </section>

        {/* ── CTA ── */}
        <motion.section
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeUp}
          className="zl-cta"
        >
          <div className="zl-cta-glow" aria-hidden="true" />
          <h2 className="zl-cta-title">
            Professional backend starts,{" "}
            <span className="zl-gradient-text">without the setup tax.</span>
          </h2>
          <p className="zl-cta-desc">
            If you're mentoring a cohort or shipping with a student team, Zuro gives
            everyone the same clean backend baseline from day one.
          </p>
          <div className="zl-cta-actions">
            <Link href="/docs" className="zl-btn zl-btn-primary">
              Open Docs
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="https://github.com/BriyanPatel/zuro"
              target="_blank"
              rel="noopener noreferrer"
              className="zl-btn zl-btn-ghost"
            >
              <Github className="h-4 w-4" />
              View GitHub
            </a>
          </div>
        </motion.section>

        {/* ── FOOTER ── */}
        <footer className="zl-footer">
          <div className="zl-footer-inner">
            <span className="zl-footer-brand">
              <span className="zl-logo-mark zl-logo-mark-sm">Z</span> Zuro
            </span>
            <div className="zl-footer-links">
              <Link href="/docs">Docs</Link>
              <a href="https://github.com/BriyanPatel/zuro" target="_blank" rel="noopener noreferrer">
                GitHub
              </a>
            </div>
          </div>
          <p className="zl-footer-copy">
            © {new Date().getFullYear()} Zuro · Built for builders.
          </p>
        </footer>
      </main>
    </div>
  );
}
