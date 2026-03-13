import type { FAQPage, Organization, SoftwareApplication, WithContext, BreadcrumbList } from 'schema-dts';
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
