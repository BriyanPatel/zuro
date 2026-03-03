import Link from "next/link";
import { ArrowRight, Github } from "lucide-react";

export function CtaSection() {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/70 px-6 py-14 text-center sm:px-10">
      <div className="pointer-events-none absolute left-1/2 top-0 h-52 w-96 -translate-x-1/2 rounded-full bg-emerald-400/10 blur-3xl" />
      <p className="relative text-xs uppercase tracking-[0.2em] text-zinc-500">Start shipping</p>
      <h2 className="relative mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
        Launch your MVP backend without rewriting boilerplate again.
      </h2>
      <p className="relative mx-auto mt-4 max-w-2xl text-base leading-7 text-zinc-400">
        One command to start, modular commands to scale. Zuro gives you production patterns with full ownership.
      </p>
      <div className="relative mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/docs/init"
          className="inline-flex items-center gap-2 rounded-md border border-emerald-400/40 bg-emerald-400/10 px-4 py-2.5 text-sm font-medium text-emerald-300 transition hover:bg-emerald-400/20"
        >
          Initialize project
          <ArrowRight className="h-4 w-4" />
        </Link>
        <a
          href="https://github.com/BriyanPatel/zuro"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-md border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-medium text-zinc-200 transition hover:bg-white/10"
        >
          <Github className="h-4 w-4" />
          View source
        </a>
      </div>
    </section>
  );
}
