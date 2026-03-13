import { source } from '@/lib/source';
import { DocsPage, DocsBody, DocsTitle, DocsDescription } from 'fumadocs-ui/page';
import { notFound } from 'next/navigation';
import defaultMdxComponents from 'fumadocs-ui/mdx';
import { Tab, Tabs } from 'fumadocs-ui/components/tabs';
import { Accordion, Accordions } from 'fumadocs-ui/components/accordion';
import { File, Folder, Files } from 'fumadocs-ui/components/files';
import { Step, Steps } from 'fumadocs-ui/components/steps';
import { Callout } from 'fumadocs-ui/components/callout';
import { SeoEnhancements } from '@/components/docs/SeoEnhancements';
import { JsonLd } from '@/components/seo/JsonLd';
import { buildBreadcrumbJsonLd } from '@/lib/seo/jsonld';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { seoConfig } from '@/lib/seo/config';

const mdxComponents = {
  ...defaultMdxComponents,
  Tab,
  Tabs,
  Accordion,
  Accordions,
  File,
  Folder,
  Files,
  Step,
  Steps,
  Callout,
};

function humanizeSlugPart(value: string): string {
  return value
    .split('-')
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join(' ');
}

function buildDocsPath(slug?: string[]): string {
  if (!slug || slug.length === 0) {
    return '/docs';
  }

  return `/docs/${slug.join('/')}`;
}

export default async function Page(props: { params: Promise<{ slug?: string[] }> }) {
  const params = await props.params;
  const page = source.getPage(params.slug);

  if (!page) {
    notFound();
  }

  const MDX = page.data.body;
  const pageDescription = page.data.description ?? seoConfig.defaultDescription;
  const breadcrumb = buildBreadcrumbJsonLd([
    { name: 'Home', path: '/' },
    { name: 'Docs', path: '/docs' },
    ...(params.slug ?? []).map((part, index, parts) => {
      const path = `/docs/${parts.slice(0, index + 1).join('/')}`;
      const isLast = index === parts.length - 1;

      return {
        name: isLast ? page.data.title : humanizeSlugPart(part),
        path,
      };
    }),
  ]);

  return (
    <>
      <JsonLd data={breadcrumb} />
      <DocsPage toc={page.data.toc} full={page.data.full}>
        <DocsTitle>{page.data.title}</DocsTitle>
        <DocsDescription>{pageDescription}</DocsDescription>
        <DocsBody>
          <MDX components={mdxComponents} />
          <SeoEnhancements slug={params.slug} />
        </DocsBody>
      </DocsPage>
    </>
  );
}

export async function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata(props: { params: Promise<{ slug?: string[] }> }) {
  const params = await props.params;
  const page = source.getPage(params.slug);

  if (!page) {
    notFound();
  }

  const pageDescription = page.data.description ?? seoConfig.defaultDescription;

  return buildPageMetadata({
    title: page.data.title,
    description: pageDescription,
    path: buildDocsPath(params.slug),
    keywords: [page.data.title, 'zuro docs', 'express backend modules'],
    type: 'article',
  });
}
