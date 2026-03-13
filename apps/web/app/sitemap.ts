import type { MetadataRoute } from 'next';
import { source } from '@/lib/source';
import { SEO_LANDING_PATHS } from '@/lib/seo/landing-pages';
import { absoluteUrl } from '@/lib/seo/metadata';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const docsParams = source.generateParams();

  const docsPaths = docsParams.map((params) => {
    if (!params.slug || params.slug.length === 0) {
      return '/docs';
    }

    return `/docs/${params.slug.join('/')}`;
  });

  const staticPaths = ['/', '/docs', '/privacy', ...SEO_LANDING_PATHS];
  const uniquePaths = Array.from(new Set([...staticPaths, ...docsPaths]));

  return uniquePaths.map((path) => {
    const isDocs = path.startsWith('/docs');

    return {
      url: absoluteUrl(path),
      changeFrequency: isDocs ? 'weekly' : 'monthly',
      priority: path === '/' ? 1 : isDocs ? 0.8 : 0.7,
    };
  });
}
