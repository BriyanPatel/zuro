import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { LandingFooter } from '@/components/landing/sections/LandingFooter';
import { LandingHeader } from '@/components/landing/sections/LandingHeader';
import { JsonLd } from '@/components/seo/JsonLd';
import { SeoConversionPanel } from '@/components/seo/SeoConversionPanel';
import { buildBreadcrumbJsonLd, buildFaqJsonLd } from '@/lib/seo/jsonld';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { getSeoLandingPage, SEO_LANDING_SLUGS } from '@/lib/seo/landing-pages';

type PageParams = {
  seoSlug: string;
};

type LandingExpansion = {
  deepDiveTitle: string;
  deepDiveParagraphs: [string, string, string];
  highlightHeadings: [string, string, string];
};

const LANDING_EXPANSIONS: Record<string, LandingExpansion> = {
  'nodejs-backend-starter': {
    deepDiveTitle: 'How teams use this starter in real MVP cycles',
    deepDiveParagraphs: [
      'Teams that ship fast with Express usually fail at the same point: the first week after launch, when ad-hoc setup decisions start leaking into every new feature branch. A starter is not about saving one hour on day one. It is about preventing repeated rework across auth, validation, error contracts, and deploy hygiene while product priorities keep changing.',
      'A practical backend starter should define a stable baseline for structure, environment management, and request lifecycle behavior. That baseline lowers onboarding cost for new contributors and keeps quality from drifting between rushed commits. Zuro focuses on this exact layer so teams can spend implementation time on product logic instead of rebuilding the same middleware stack repeatedly.',
      'For founders and small teams, this also improves decision speed. When your routing conventions, error shape, and module boundaries are already predictable, adding a feature becomes a scoped product decision instead of an architecture detour. This is where a starter provides compounding value beyond the initial command output.',
    ],
    highlightHeadings: ['Lower setup variance', 'Predictable baseline', 'Faster iteration loops'],
  },
  'express-typescript-boilerplate': {
    deepDiveTitle: 'Why this boilerplate matters after the first release',
    deepDiveParagraphs: [
      'Most TypeScript boilerplates look similar until a team starts changing things under pressure. The difference shows up in maintenance: route boundaries, validation placement, and error flow consistency determine whether the codebase remains easy to reason about in month three. That is why boilerplate quality should be evaluated by editability, not by flashy generator output.',
      'For MVP teams, clean boilerplate is risk management. Product experiments require rapid endpoint changes and frequent schema updates. If structure is weak, each update introduces hidden coupling and unexpected regressions. A good baseline minimizes this by keeping conventions explicit and reducing the amount of project-specific tribal knowledge needed for safe changes.',
      'This page exists to help teams choose a boilerplate strategy that preserves momentum without introducing framework lock-in. When conventions are transparent and generated files stay fully editable, teams can move faster now and still refactor safely later.',
    ],
    highlightHeadings: ['Clear onboarding path', 'Safer defaults in production', 'Maintainable growth path'],
  },
  'backend-auth-module-express': {
    deepDiveTitle: 'Auth delivery without destabilizing your backend',
    deepDiveParagraphs: [
      'Authentication is often the first module that triggers hidden complexity in backend projects. Session handling, token lifecycle, credential storage, and route protection patterns all create edge cases that are hard to debug after launch. Teams need a module that solves the baseline correctly while keeping extension points explicit.',
      'A practical auth module should integrate with existing database and validation patterns rather than introducing isolated abstractions. This is critical for long-term ownership: teams can inspect every generated file, adapt business rules, and align auth behavior with product requirements such as invite flows, account linking, or role checks.',
      'From an SEO and conversion perspective, this page should communicate real implementation confidence. Developers evaluating auth tooling are looking for clear dependency behavior, predictable file output, and migration flexibility. The surrounding docs and command examples are structured around those trust signals.',
    ],
    highlightHeadings: ['Dependency chain clarity', 'Editable auth flows', 'Production-safe defaults'],
  },
  'drizzle-starter-express': {
    deepDiveTitle: 'Database setup that supports long-term schema evolution',
    deepDiveParagraphs: [
      'Database choices affect every backend layer, so initial setup quality has outsized impact. Teams need a starter that makes migrations, schema ownership, and query boundaries obvious from day one. Without that clarity, growth introduces scattered data access patterns and fragile migration history.',
      'A Drizzle-oriented setup should optimize for everyday engineering flow: schema updates, migration review, local testing, and deployment consistency. The goal is not only type safety, but operational confidence. When schema files and migration commands are predictable, teams can move quickly without gambling on data integrity.',
      'This landing page positions the module as a practical bridge between scaffold speed and maintainable persistence architecture. It should help engineers evaluate whether generated defaults align with their expected workload: rapid feature iteration, controlled schema changes, and clear rollback paths.',
    ],
    highlightHeadings: ['Migration-ready structure', 'Type-safe persistence', 'Operational confidence'],
  },
  'express-upload-module': {
    deepDiveTitle: 'Upload workflows built for product realities',
    deepDiveParagraphs: [
      'File uploads become complex quickly when products move beyond simple form posts. Teams often need multiple flows, private access control, and storage portability across providers. A module should expose these capabilities without forcing teams into opaque storage abstractions that are hard to audit.',
      'For production workloads, reliability matters more than demo simplicity. Multipart support, secure delivery routes, and optional metadata persistence are essential for real use cases such as user-generated media, report exports, and ingestion pipelines. Generated defaults should make those paths straightforward to implement and test.',
      'This page is designed to show implementation depth, not just feature checklists. Developers need confidence that provider switching, auth-protected assets, and metadata-backed ownership checks are all possible without rewriting the project structure from scratch.',
    ],
    highlightHeadings: ['Provider flexibility', 'Secure delivery patterns', 'Metadata-ready growth'],
  },
  'openapi-starter-express': {
    deepDiveTitle: 'API documentation as an engineering workflow',
    deepDiveParagraphs: [
      'OpenAPI is most valuable when it is treated as a daily workflow artifact rather than a one-time integration task. Teams use it for QA handoff, client SDK generation, contract review, and debugging. A starter should make spec updates and docs rendering part of normal development, not a separate documentation project.',
      'Practical API docs setup needs both machine readability and developer ergonomics. Generated routes should expose predictable JSON specs while maintaining a clean interactive UI for internal and external consumers. This is especially useful for early-stage teams that iterate endpoints quickly and need fast alignment across frontend and backend.',
      'This landing page expands on those use cases so teams can evaluate fit before implementation. The intent is to communicate that docs quality directly affects delivery speed, integration reliability, and long-term API consistency.',
    ],
    highlightHeadings: ['Contract visibility', 'Faster QA cycles', 'SDK-ready endpoints'],
  },
  'zuro-vs-manual-express-setup': {
    deepDiveTitle: 'Manual setup tradeoffs teams should evaluate honestly',
    deepDiveParagraphs: [
      'Manual setup is not inherently wrong. In some projects it is the right call, especially when architecture is highly specialized. The issue is that many teams underestimate how often repeated setup work appears across new services and MVP experiments. Those hidden costs compound through onboarding, review time, and production inconsistency.',
      'A realistic comparison should weigh both speed and ownership. Manual setup gives direct control, but that control requires disciplined standards and repeated implementation effort. Zuro targets teams that want to keep full code ownership while reducing repeated baseline work that does not differentiate their product.',
      'This comparison page supports implementation decisions by making tradeoffs explicit: setup time, output consistency, and long-term maintainability. The linked docs are meant to validate claims with concrete generated patterns, not marketing promises.',
    ],
    highlightHeadings: ['Time-to-feature impact', 'Quality consistency tradeoff', 'Ownership without repetition'],
  },
  'zuro-vs-framework-backend-starters': {
    deepDiveTitle: 'Choosing between framework leverage and plain-code flexibility',
    deepDiveParagraphs: [
      'Framework starters can be excellent when teams intentionally buy into framework conventions. They accelerate setup and provide batteries-included workflows, but they also shape architecture decisions over time. For some teams that is an advantage; for others it introduces coupling they later need to unwind.',
      'A plain-code generator strategy keeps migration cost lower because output stays close to baseline Express patterns. This can be useful for teams with mixed experience levels, evolving product direction, or long-term requirements that are not fully known at project start. The tradeoff is that teams must own conventions directly.',
      'This page is structured to help technical decision-makers evaluate fit by context, not hype. It compares lock-in surface area, onboarding implications, and maintainability expectations so teams can choose the path that matches their product horizon.',
    ],
    highlightHeadings: ['Convention lock-in analysis', 'Team onboarding impact', 'Migration flexibility'],
  },
};

function getLandingExpansion(slug: string): LandingExpansion {
  const fallback: LandingExpansion = {
    deepDiveTitle: 'Implementation context',
    deepDiveParagraphs: [
      'Use this page to evaluate how this backend workflow fits your team constraints and timeline.',
      'Focus on generated output quality, editability, and operational behavior before adopting any starter workflow.',
      'Each linked document expands on commands, architecture patterns, and production safeguards for this use case.',
    ],
    highlightHeadings: ['Outcome 1', 'Outcome 2', 'Outcome 3'],
  };

  return LANDING_EXPANSIONS[slug] ?? fallback;
}

export async function generateStaticParams() {
  return SEO_LANDING_SLUGS.map((seoSlug) => ({ seoSlug }));
}

export async function generateMetadata(props: { params: Promise<PageParams> }): Promise<Metadata> {
  const { seoSlug } = await props.params;
  const page = getSeoLandingPage(seoSlug);

  if (!page) {
    return {};
  }

  return buildPageMetadata({
    title: page.title,
    description: page.description,
    path: `/${page.slug}`,
    keywords: [page.primaryKeyword, ...page.secondaryKeywords],
    type: 'article',
  });
}

export default async function SeoLandingPage(props: { params: Promise<PageParams> }) {
  const { seoSlug } = await props.params;
  const page = getSeoLandingPage(seoSlug);

  if (!page) {
    notFound();
  }

  const expansion = getLandingExpansion(page.slug);
  const breadcrumb = buildBreadcrumbJsonLd([
    { name: 'Home', path: '/' },
    { name: page.h1, path: `/${page.slug}` },
  ]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <JsonLd data={buildFaqJsonLd(page.faq)} />
      <JsonLd data={breadcrumb} />
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:68px_68px]" />
      <div className="pointer-events-none fixed left-0 top-0 h-[520px] w-[620px] rounded-full bg-white/[0.03] blur-3xl" />
      <div className="pointer-events-none fixed bottom-0 right-0 h-[420px] w-[520px] rounded-full bg-emerald-400/[0.06] blur-3xl" />

      <LandingHeader />

      <main className="relative z-10 mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        <header className="rounded-2xl border border-white/10 bg-zinc-900/60 p-8 shadow-[0_20px_70px_-32px_rgba(0,0,0,0.9)]">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">
                {page.type === 'comparison' ? 'Comparison guide' : 'Commercial guide'}
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">{page.h1}</h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-zinc-300">{page.intro}</p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/docs/init"
                  className="inline-flex items-center rounded-md border border-emerald-400/40 bg-emerald-400/10 px-4 py-2 text-sm font-medium text-emerald-300 hover:bg-emerald-400/20"
                >
                  Start with init
                </Link>
                <Link
                  href="/docs"
                  className="inline-flex items-center rounded-md border border-white/20 bg-white/5 px-4 py-2 text-sm font-medium text-zinc-200 hover:bg-white/10"
                >
                  Browse all docs
                </Link>
              </div>
            </div>
            <SeoConversionPanel
              ctaHref={page.ctaHref}
              ctaLabel={page.ctaLabel}
              pageSlug={page.slug}
              primaryKeyword={page.primaryKeyword}
            />
          </div>
        </header>

        <section className="mt-10 grid gap-6 rounded-2xl border border-white/10 bg-zinc-900/50 p-8 lg:grid-cols-[1.1fr_0.9fr]">
          <article className="rounded-lg border border-white/10 bg-black/30 p-5">
            <h2 className="text-lg font-semibold text-white">Proof from generated backend output</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-300">
              Teams convert better when they see what they get before signup. This is the practical output path from Zuro commands.
            </p>
            <pre className="mt-4 overflow-x-auto rounded-md border border-white/10 bg-black/70 p-3 text-xs leading-6 text-zinc-300">
{`$ npx zuro-cli init my-mvp
✓ Express + TypeScript scaffolded
✓ Helmet, CORS, env validation
✓ Logger + health route ready

$ npx zuro-cli add auth
✓ Auth routes configured
↳ auto-installs database + error-handler if missing`}
            </pre>
          </article>

          <article className="rounded-lg border border-white/10 bg-black/30 p-5">
            <h2 className="text-lg font-semibold text-white">Implementation path</h2>
            <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-zinc-300">
              <li>Initialize your backend foundation with one command.</li>
              <li>Install only the module needed for this use case.</li>
              <li>Validate route behavior and move to product feature work.</li>
            </ol>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link
                href={page.ctaHref}
                className="inline-flex items-center rounded-md border border-emerald-400/40 bg-emerald-400/10 px-3 py-2 text-xs font-medium text-emerald-300 hover:bg-emerald-400/20"
              >
                {page.ctaLabel}
              </Link>
              <Link
                href="/docs"
                className="inline-flex items-center rounded-md border border-white/20 bg-white/5 px-3 py-2 text-xs font-medium text-zinc-200 hover:bg-white/10"
              >
                Review full docs
              </Link>
            </div>
          </article>
        </section>

        <section className="mt-10 grid gap-6 rounded-2xl border border-white/10 bg-zinc-900/50 p-8 md:grid-cols-3">
          <div className="md:col-span-3">
            <h2 className="text-2xl font-semibold tracking-tight text-white">What changes for your implementation workflow</h2>
          </div>
          {page.highlights.map((highlight, index) => (
            <article key={highlight} className="rounded-lg border border-white/10 bg-black/30 p-4">
              <h3 className="text-base font-semibold text-white">{expansion.highlightHeadings[index] ?? `Outcome ${index + 1}`}</h3>
              <p className="mt-2 text-sm leading-6 text-zinc-300">{highlight}</p>
            </article>
          ))}
        </section>

        <section className="mt-10 rounded-2xl border border-white/10 bg-zinc-900/50 p-8">
          <h2 className="text-2xl font-semibold tracking-tight text-white">{expansion.deepDiveTitle}</h2>
          <div className="mt-5 space-y-4 text-sm leading-7 text-zinc-300">
            {expansion.deepDiveParagraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </section>

        <section className="mt-10 rounded-2xl border border-white/10 bg-zinc-900/50 p-8">
          <h2 className="text-2xl font-semibold tracking-tight text-white">Recommended documentation paths</h2>
          <p className="mt-2 text-sm text-zinc-400">
            Use these pages to go from evaluation to implementation with practical examples.
          </p>
          <ul className="mt-5 list-disc space-y-2 pl-5 text-sm text-zinc-300">
            {page.relatedDocs.map((doc) => (
              <li key={doc.href}>
                <Link href={doc.href} className="text-emerald-300 hover:underline">
                  {doc.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-10 rounded-2xl border border-white/10 bg-zinc-900/50 p-8">
          <h2 className="text-2xl font-semibold tracking-tight text-white">Frequently asked questions</h2>
          <div className="mt-5 space-y-4">
            {page.faq.map((item) => (
              <article key={item.question} className="rounded-lg border border-white/10 bg-black/30 p-4">
                <h3 className="text-base font-semibold text-white">{item.question}</h3>
                <p className="mt-2 text-sm leading-6 text-zinc-300">{item.answer}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-10 rounded-2xl border border-white/10 bg-zinc-900 p-8 text-white">
          <h2 className="text-2xl font-semibold tracking-tight">Next step</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-300">
            Start with one module, validate your product path, and expand features as demand grows.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href={page.ctaHref}
              className="inline-flex items-center rounded-md border border-emerald-400/40 bg-emerald-400/20 px-4 py-2 text-sm font-medium text-emerald-200 hover:bg-emerald-400/30"
            >
              {page.ctaLabel}
            </Link>
            <Link
              href="/zuro-vs-manual-express-setup"
              className="inline-flex items-center rounded-md border border-white/25 bg-white/10 px-4 py-2 text-sm font-medium text-zinc-100 hover:bg-white/20"
            >
              Compare approaches
            </Link>
          </div>
        </section>

        <LandingFooter />
      </main>
    </div>
  );
}
