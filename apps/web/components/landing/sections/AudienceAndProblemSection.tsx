import { AUDIENCE_PERSONAS, PAIN_POINTS } from "../content";

export function AudienceAndProblemSection() {
  return (
    <section className="space-y-8 border-t border-white/10 py-16">
      <div className="max-w-3xl">
        <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Who it is for</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Built for developers and teams shipping production backends.
        </h2>
        <p className="mt-4 text-base leading-7 text-zinc-400">
          Zuro gives you production-ready defaults without framework lock-in, so MVP velocity does not come at the
          cost of maintainability.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {AUDIENCE_PERSONAS.map((persona) => (
          <article key={persona.title} className="rounded-xl border border-white/10 bg-zinc-900/60 p-5">
            <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-black/40 text-zinc-200">
              <persona.icon className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-semibold text-white">{persona.title}</h3>
            <p className="mt-1 text-xs uppercase tracking-[0.14em] text-zinc-500">{persona.subtitle}</p>
            <p className="mt-3 text-sm leading-6 text-zinc-400">{persona.description}</p>
          </article>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {PAIN_POINTS.map((item) => (
          <article
            key={item.text}
            className="rounded-xl border border-red-500/20 bg-red-500/[0.04] p-5 transition hover:border-red-400/30"
          >
            <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-400/25 bg-red-500/10 text-red-300">
              <item.icon className="h-4.5 w-4.5" />
            </div>
            <p className="text-sm leading-6 text-zinc-300">{item.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
