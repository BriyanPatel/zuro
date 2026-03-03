import { MODULES, ROADMAP_MODULES } from "../content";

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
          <article
            key={module.name}
            className="rounded-xl border border-white/10 bg-zinc-900/60 p-5 transition hover:border-emerald-400/30"
          >
            <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg border border-emerald-400/30 bg-emerald-400/10 text-emerald-300">
              <module.icon className="h-5 w-5" />
            </div>
            <h3 className="text-base font-semibold text-white">{module.name}</h3>
            <p className="mt-2 text-sm leading-6 text-zinc-400">{module.description}</p>
            <code className="mt-4 inline-flex rounded-md border border-white/10 bg-black/40 px-2.5 py-1 font-mono text-[11px] text-zinc-300">
              {module.command}
            </code>
          </article>
        ))}
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
