import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { JsonLd } from '@/components/seo/JsonLd';
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
    <main className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8">
      <JsonLd data={buildFaqJsonLd(page.faq)} />

      <header className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">
          {page.type === 'comparison' ? 'Comparison' : 'Commercial guide'}
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">{page.h1}</h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-zinc-600">{page.intro}</p>

        <div className="mt-6 flex flex-wrap gap-2 text-xs">
          <span className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-zinc-600">
            Primary keyword: {page.primaryKeyword}
          </span>
          {page.secondaryKeywords.map((keyword) => (
            <span key={keyword} className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-zinc-600">
              {keyword}
            </span>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href={page.ctaHref}
            className="inline-flex items-center rounded-md border border-blue-600 bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            {page.ctaLabel}
          </Link>
          <Link
            href="/docs"
            className="inline-flex items-center rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
          >
            Browse all docs
          </Link>
        </div>
      </header>

      <section className="mt-10 grid gap-6 rounded-2xl border border-zinc-200 bg-white p-8 md:grid-cols-3">
        {page.highlights.map((highlight) => (
          <article key={highlight} className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
            <h2 className="text-base font-semibold text-zinc-900">Why it matters</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-600">{highlight}</p>
          </article>
        ))}
      </section>

      <section className="mt-10 rounded-2xl border border-zinc-200 bg-white p-8">
        <h2 className="text-2xl font-semibold tracking-tight text-zinc-900">Recommended documentation paths</h2>
        <p className="mt-2 text-sm text-zinc-600">
          Use these pages to go from evaluation to implementation with practical examples.
        </p>
        <ul className="mt-5 list-disc space-y-2 pl-5 text-sm text-zinc-700">
          {page.relatedDocs.map((doc) => (
            <li key={doc.href}>
              <Link href={doc.href} className="text-blue-700 hover:underline">
                {doc.label}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10 rounded-2xl border border-zinc-200 bg-white p-8">
        <h2 className="text-2xl font-semibold tracking-tight text-zinc-900">Frequently asked questions</h2>
        <div className="mt-5 space-y-4">
          {page.faq.map((item) => (
            <article key={item.question} className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
              <h3 className="text-base font-semibold text-zinc-900">{item.question}</h3>
              <p className="mt-2 text-sm leading-6 text-zinc-600">{item.answer}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-10 rounded-2xl border border-zinc-200 bg-zinc-900 p-8 text-white">
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
    </main>
  );
}
