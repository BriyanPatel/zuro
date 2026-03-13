import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { LandingFooter } from '@/components/landing/sections/LandingFooter';
import { LandingHeader } from '@/components/landing/sections/LandingHeader';
import { JsonLd } from '@/components/seo/JsonLd';
import { SeoConversionPanel } from '@/components/seo/SeoConversionPanel';
import { buildFaqJsonLd } from '@/lib/seo/jsonld';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { getSeoLandingPage, SEO_LANDING_SLUGS } from '@/lib/seo/landing-pages';

type PageParams = {
  seoSlug: string;
};

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

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <JsonLd data={buildFaqJsonLd(page.faq)} />
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

              <div className="mt-6 flex flex-wrap gap-2 text-xs">
                <span className="rounded-full border border-white/15 bg-white/[0.04] px-3 py-1 text-zinc-300">
                  Primary keyword: {page.primaryKeyword}
                </span>
                {page.secondaryKeywords.map((keyword) => (
                  <span key={keyword} className="rounded-full border border-white/15 bg-white/[0.04] px-3 py-1 text-zinc-300">
                    {keyword}
                  </span>
                ))}
              </div>

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
          {page.highlights.map((highlight) => (
            <article key={highlight} className="rounded-lg border border-white/10 bg-black/30 p-4">
              <h2 className="text-base font-semibold text-white">Why it matters</h2>
              <p className="mt-2 text-sm leading-6 text-zinc-300">{highlight}</p>
            </article>
          ))}
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
