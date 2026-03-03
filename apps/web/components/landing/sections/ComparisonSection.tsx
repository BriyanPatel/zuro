import { COMPARISON_ROWS } from "../content";

export function ComparisonSection() {
  return (
    <section className="space-y-8 border-t border-white/10 py-16">
      <div className="max-w-3xl">
        <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Comparison</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Faster than manual setup and AI prompt scaffolding.
        </h2>
        <p className="mt-4 text-base leading-7 text-zinc-400">
          Ship quickly without losing implementation context. Zuro updates your project files directly, so the code
          you ship is the code you understand.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-white/10 bg-zinc-900/60">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-black/30 text-xs uppercase tracking-[0.14em] text-zinc-500">
                <th className="px-4 py-3 text-left">Feature</th>
                <th className="px-4 py-3 text-left text-emerald-300">Zuro</th>
                <th className="px-4 py-3 text-left">Manual + AI prompts</th>
                <th className="px-4 py-3 text-left">Heavy frameworks</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON_ROWS.map((row) => (
                <tr key={row.feature} className="border-b border-white/[0.07] last:border-0">
                  <td className="px-4 py-3 font-medium text-zinc-200">{row.feature}</td>
                  <td className="px-4 py-3 font-medium text-emerald-300">{row.zuro}</td>
                  <td className="px-4 py-3 text-zinc-400">{row.manual}</td>
                  <td className="px-4 py-3 text-zinc-400">{row.framework}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
