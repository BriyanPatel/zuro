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

type NpmDownloadsResponse = {
  downloads?: number;
};

type GitHubRepoResponse = {
  stargazers_count?: number;
};

async function getMonthlyNpmDownloads(): Promise<number | null> {
  try {
    const response = await fetch('https://api.npmjs.org/downloads/point/last-month/zuro-cli', {
      next: { revalidate: 60 * 60 * 12 },
    });

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as NpmDownloadsResponse;
    return typeof data.downloads === 'number' ? data.downloads : null;
  } catch {
    return null;
  }
}

async function getGitHubStars(): Promise<number | null> {
  try {
    const response = await fetch('https://api.github.com/repos/BriyanPatel/zuro', {
      next: { revalidate: 60 * 60 * 12 },
      headers: { Accept: 'application/vnd.github+json' },
    });

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as GitHubRepoResponse;
    return typeof data.stargazers_count === 'number' ? data.stargazers_count : null;
  } catch {
    return null;
  }
}

export default async function Home() {
  const [monthlyDownloads, githubStars] = await Promise.all([
    getMonthlyNpmDownloads(),
    getGitHubStars(),
  ]);

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
      <ProfessionalLanding monthlyDownloads={monthlyDownloads} githubStars={githubStars} />
    </>
  );
}
