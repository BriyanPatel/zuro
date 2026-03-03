import Link from "next/link";
import { ArrowRight, Github } from "lucide-react";

export function LandingHeader() {
  return (
    <header className="sticky top-3 z-40">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between rounded-xl border border-white/10 bg-black/65 px-4 backdrop-blur-xl">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold tracking-tight text-zinc-100">
            <span className="grid h-7 w-7 place-items-center rounded-md border border-white/20 bg-zinc-900 text-[11px] font-bold text-white">
              Z
            </span>
            Zuro
          </Link>

          <nav className="inline-flex items-center gap-1">
            <Link href="/docs" className="rounded-md px-3 py-1.5 text-sm text-zinc-300 transition hover:bg-white/5 hover:text-white">
              Docs
            </Link>
            <a
              href="https://github.com/BriyanPatel/zuro"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm text-zinc-300 transition hover:bg-white/5 hover:text-white"
            >
              <Github className="h-4 w-4" />
              <span className="hidden sm:inline">GitHub</span>
            </a>
            <Link
              href="/docs/init"
              className="inline-flex items-center gap-2 rounded-md border border-emerald-400/40 bg-emerald-400/10 px-3 py-1.5 text-sm font-medium text-emerald-300 transition hover:bg-emerald-400/20"
            >
              Start MVP
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
