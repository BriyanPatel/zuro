const DEFAULT_SITE_URL = 'https://zuro-cli.devbybriyan.com';

function sanitizeSiteUrl(value: string): string {
  const normalized = value.trim().replace(/\/+$/, '');

  try {
    return new URL(normalized).toString().replace(/\/+$/, '');
  } catch {
    return DEFAULT_SITE_URL;
  }
}

export const seoConfig = {
  siteName: 'Zuro',
  titleTemplate: '%s | Zuro',
  defaultTitle: 'Zuro - Backend Engineering, Reimagined',
  defaultDescription:
    'Build production-ready Node.js backends with a single command. Type-safe, secure, and modular by default.',
  defaultLocale: 'en_US',
  twitterHandle: '@briyan_dev',
};

export const siteUrl = sanitizeSiteUrl(process.env.SITE_URL ?? DEFAULT_SITE_URL);

export const googleSiteVerification = process.env.GOOGLE_SITE_VERIFICATION;
export const ga4MeasurementId = process.env.GA4_MEASUREMENT_ID;
