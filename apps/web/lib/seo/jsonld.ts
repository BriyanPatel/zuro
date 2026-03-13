import type { BreadcrumbList, FAQPage, Organization, SoftwareApplication, TechArticle, WebSite, WithContext } from 'schema-dts';
import { siteUrl } from '@/lib/seo/config';

export type FaqEntry = {
  question: string;
  answer: string;
};

export function buildOrganizationJsonLd(): WithContext<Organization> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Zuro',
    url: siteUrl,
    sameAs: ['https://github.com/BriyanPatel/zuro', 'https://x.com/briyan_dev'],
  };
}

export function buildSoftwareApplicationJsonLd(): WithContext<SoftwareApplication> {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Zuro',
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'macOS, Linux, Windows',
    url: siteUrl,
    softwareHelp: {
      '@type': 'CreativeWork',
      name: 'Zuro Documentation',
      url: `${siteUrl}/docs`,
    },
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    description:
      'Production-ready backend modules for Express and TypeScript with no framework lock-in.',
  };
}

export function buildFaqJsonLd(entries: FaqEntry[]): WithContext<FAQPage> {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: entries.map((entry) => ({
      '@type': 'Question',
      name: entry.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: entry.answer,
      },
    })),
  };
}

export function buildBreadcrumbJsonLd(
  items: Array<{ name: string; path: string }>,
): WithContext<BreadcrumbList> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${siteUrl}${item.path}`,
    })),
  };
}

export function buildWebSiteJsonLd(): WithContext<WebSite> {
  const searchAction = {
    '@type': 'SearchAction',
    target: `${siteUrl}/docs?q={search_term_string}`,
    'query-input': 'required name=search_term_string',
  } as const;

  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Zuro',
    url: siteUrl,
    potentialAction: searchAction as unknown as WebSite['potentialAction'],
  };
}

type BuildTechArticleJsonLdArgs = {
  path: string;
  headline: string;
  description: string;
  datePublished?: string;
  dateModified?: string;
  authorName?: string;
};

export function buildTechArticleJsonLd({
  path,
  headline,
  description,
  datePublished,
  dateModified,
  authorName = 'Briyan Patel',
}: BuildTechArticleJsonLdArgs): WithContext<TechArticle> {
  const normalizedDateModified = dateModified ?? datePublished;

  return {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline,
    description,
    url: `${siteUrl}${path}`,
    mainEntityOfPage: `${siteUrl}${path}`,
    ...(datePublished ? { datePublished } : {}),
    ...(normalizedDateModified ? { dateModified: normalizedDateModified } : {}),
    author: {
      '@type': 'Person',
      name: authorName,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Zuro',
      url: siteUrl,
    },
  };
}
