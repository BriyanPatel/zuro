import type { Metadata } from 'next';
import { ProfessionalLanding } from '@/components/landing/ProfessionalLanding';
import { FAQ_ITEMS } from '@/components/landing/content';
import { JsonLd } from '@/components/seo/JsonLd';
import { buildFaqJsonLd, buildOrganizationJsonLd, buildSoftwareApplicationJsonLd, buildWebSiteJsonLd } from '@/lib/seo/jsonld';
import { buildPageMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = buildPageMetadata({
  title: 'Node.js Backend Starter and Express Modules | Zuro',
  description:
    'Launch production-ready Express + TypeScript backends with modular commands for auth, database, uploads, validation, and API docs.',
  path: '/',
  keywords: [
    'nodejs backend starter',
    'express typescript boilerplate',
    'backend modules',
    'express auth module',
    'openapi starter express',
  ],
});

export default function Home() {
  return (
    <>
      <JsonLd data={buildOrganizationJsonLd()} />
      <JsonLd data={buildSoftwareApplicationJsonLd()} />
      <JsonLd data={buildWebSiteJsonLd()} />
      <JsonLd
        data={
          buildFaqJsonLd(
            FAQ_ITEMS.map((item) => ({
              question: item.question,
              answer: item.answer,
            })),
          )
        }
      />
      <ProfessionalLanding />
    </>
  );
}
