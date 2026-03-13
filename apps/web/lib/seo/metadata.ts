import type { Metadata } from 'next';
import { seoConfig, siteUrl } from '@/lib/seo/config';

type BuildPageMetadataArgs = {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  type?: 'website' | 'article';
  noIndex?: boolean;
};

export function absoluteUrl(path: string): string {
  return new URL(path, siteUrl).toString();
}

export function buildOgImageUrl(title: string, subtitle?: string): string {
  const url = new URL('/api/og', siteUrl);
  url.searchParams.set('title', title);

  if (subtitle) {
    url.searchParams.set('subtitle', subtitle);
  }

  return url.toString();
}

export function buildPageMetadata({
  title,
  description,
  path,
  keywords,
  type = 'website',
  noIndex = false,
}: BuildPageMetadataArgs): Metadata {
  const canonical = absoluteUrl(path);
  const image = buildOgImageUrl(title, description);

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical,
    },
    robots: {
      index: !noIndex,
      follow: !noIndex,
      googleBot: {
        index: !noIndex,
        follow: !noIndex,
        'max-image-preview': 'large',
        'max-snippet': -1,
        'max-video-preview': -1,
      },
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: seoConfig.siteName,
      locale: seoConfig.defaultLocale,
      type,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      creator: seoConfig.twitterHandle,
      images: [image],
    },
  };
}
