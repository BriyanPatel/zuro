import Link from "next/link";
import { FEATURED_LANDING_GUIDES, MODULES, ROADMAP_MODULES } from "../content";

export function ModulesSection() {
  return (
    <section className="space-y-8 border-t border-white/10 py-16">
      <div className="max-w-3xl">
        <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Modules</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Add production patterns in commands, not days.
        </h2>
        <p className="mt-4 text-base leading-7 text-zinc-400">
          Each module stays transparent and editable. No runtime wrapper, no hidden abstractions.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {MODULES.map((module) => (
          <Link
            key={module.name}
            href={module.href}
            className="rounded-xl border border-white/10 bg-zinc-900/60 p-5 transition hover:border-emerald-400/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/70"
          >
            <article>
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg border border-emerald-400/30 bg-emerald-400/10 text-emerald-300">
                <module.icon className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold text-white">{module.name}</h3>
              <p className="mt-2 text-sm leading-6 text-zinc-400">{module.description}</p>
              <div className="mt-4 flex items-center justify-between gap-2">
                <code className="inline-flex rounded-md border border-white/10 bg-black/40 px-2.5 py-1 font-mono text-[11px] text-zinc-300">
                  {module.command}
                </code>
                <span className="text-xs font-medium text-emerald-300">Read docs</span>
              </div>
            </article>
          </Link>
        ))}
      </div>

      <div className="rounded-xl border border-white/10 bg-zinc-900/40 p-5">
        <p className="text-sm font-medium text-zinc-200">Explore key implementation guides</p>
        <p className="mt-2 text-sm text-zinc-400">Use these landing pages to compare approaches before you scaffold your backend.</p>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {FEATURED_LANDING_GUIDES.map((guide) => (
            <Link
              key={guide.href}
              href={guide.href}
              className="rounded-lg border border-white/10 bg-black/30 p-3 transition hover:border-emerald-400/30"
            >
              <p className="text-sm font-medium text-white">{guide.label}</p>
              <p className="mt-1 text-xs leading-5 text-zinc-400">{guide.description}</p>
            </Link>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-black/50 p-5">
        <p className="text-sm font-medium text-zinc-200">Roadmap for MVP-heavy teams</p>
        <p className="mt-2 text-sm text-zinc-400">Next modules in active planning:</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {ROADMAP_MODULES.map((item) => (
            <span key={item} className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-zinc-300">
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
