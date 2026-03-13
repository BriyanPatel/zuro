import type { Metadata } from 'next';
import { GoogleAnalytics } from '@next/third-parties/google';
import { RootProvider } from 'fumadocs-ui/provider/next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { ga4MeasurementId, googleSiteVerification, seoConfig, siteUrl } from '@/lib/seo/config';
import { buildOgImageUrl } from '@/lib/seo/metadata';
import './globals.css';

const defaultOgImage = buildOgImageUrl(seoConfig.defaultTitle, seoConfig.defaultDescription);

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: seoConfig.defaultTitle,
    template: seoConfig.titleTemplate,
  },
  description: seoConfig.defaultDescription,
  applicationName: seoConfig.siteName,
  category: 'technology',
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  openGraph: {
    type: 'website',
    siteName: seoConfig.siteName,
    locale: seoConfig.defaultLocale,
    title: seoConfig.defaultTitle,
    description: seoConfig.defaultDescription,
    url: siteUrl,
    images: [
      {
        url: defaultOgImage,
        width: 1200,
        height: 630,
        alt: seoConfig.siteName,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: seoConfig.defaultTitle,
    description: seoConfig.defaultDescription,
    creator: seoConfig.twitterHandle,
    images: [defaultOgImage],
  },
  verification: {
    google: googleSiteVerification,
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`} suppressHydrationWarning>
      <body className="font-sans">
        <RootProvider>{children}</RootProvider>
        {ga4MeasurementId ? <GoogleAnalytics gaId={ga4MeasurementId} /> : null}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
