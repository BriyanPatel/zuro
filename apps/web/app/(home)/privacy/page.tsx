import type { Metadata } from 'next';
import Link from 'next/link';
import { buildPageMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = buildPageMetadata({
  title: 'Privacy Policy | Zuro',
  description: 'Privacy policy for Zuro — what data we collect, how we use it, and how to opt out.',
  path: '/privacy',
  keywords: ['privacy policy', 'zuro privacy'],
});

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="mb-10 inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-200"
        >
          ← Back to Zuro
        </Link>

        <h1 className="text-3xl font-semibold tracking-tight text-white">Privacy Policy</h1>
        <p className="mt-2 text-sm text-zinc-500">Last updated: March 13, 2026</p>

        <div className="mt-10 space-y-10 text-sm leading-7 text-zinc-400">
          <section>
            <h2 className="text-base font-medium text-zinc-200">Overview</h2>
            <p className="mt-3">
              Zuro is a free, open-source CLI tool. This website (zuro-cli.devbybriyan.com) is a
              documentation and marketing site. We do not sell your data, create user accounts, or
              process payments. This policy explains what analytics data is collected when you visit
              this site and how it is used.
            </p>
          </section>

          <section>
            <h2 className="text-base font-medium text-zinc-200">Data We Collect</h2>
            <p className="mt-3">
              This site uses two analytics tools that automatically collect standard web analytics
              data when you visit:
            </p>
            <ul className="mt-4 space-y-3 pl-4">
              <li>
                <span className="font-medium text-zinc-300">Google Analytics 4 (GA4)</span> —
                collects anonymised data including pages visited, time on page, approximate
                geographic location (country/city level), device type, browser, and referral source.
                Google Analytics uses cookies to distinguish between sessions.
              </li>
              <li>
                <span className="font-medium text-zinc-300">Vercel Analytics & Speed Insights</span>{' '}
                — collects page view counts and Core Web Vitals performance metrics. Vercel Analytics
                is cookieless and does not track individual users across sessions.
              </li>
            </ul>
            <p className="mt-4">
              We do not collect names, email addresses, or any personally identifiable information.
              No forms, accounts, or payment flows exist on this site.
            </p>
          </section>

          <section>
            <h2 className="text-base font-medium text-zinc-200">How We Use This Data</h2>
            <p className="mt-3">Analytics data is used solely to:</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Understand which documentation pages are most useful</li>
              <li>Measure site performance (page speed, Core Web Vitals)</li>
              <li>Identify broken pages or navigation issues</li>
              <li>Improve content and site structure over time</li>
            </ul>
            <p className="mt-4">
              We do not use analytics data for advertising, profiling, or any purpose beyond
              improving this site.
            </p>
          </section>

          <section>
            <h2 className="text-base font-medium text-zinc-200">Third-Party Services</h2>
            <div className="mt-3 space-y-4">
              <div>
                <p className="font-medium text-zinc-300">Google LLC (Google Analytics 4)</p>
                <p className="mt-1">
                  Google processes analytics data on our behalf. Data may be transferred to and
                  stored on servers in the United States. Google&apos;s data processing is governed
                  by their{' '}
                  <a
                    href="https://policies.google.com/privacy"
                    target="_blank"
                    rel="noreferrer"
                    className="text-emerald-400 hover:text-emerald-300"
                  >
                    Privacy Policy
                  </a>
                  . You can opt out of Google Analytics tracking using the{' '}
                  <a
                    href="https://tools.google.com/dlpage/gaoptout"
                    target="_blank"
                    rel="noreferrer"
                    className="text-emerald-400 hover:text-emerald-300"
                  >
                    Google Analytics Opt-out Browser Add-on
                  </a>
                  .
                </p>
              </div>
              <div>
                <p className="font-medium text-zinc-300">Vercel Inc.</p>
                <p className="mt-1">
                  This site is hosted on Vercel. Vercel collects standard server-side request logs
                  (IP address, request path, timestamp) for infrastructure operation. These logs are
                  retained for a limited period per Vercel&apos;s{' '}
                  <a
                    href="https://vercel.com/legal/privacy-policy"
                    target="_blank"
                    rel="noreferrer"
                    className="text-emerald-400 hover:text-emerald-300"
                  >
                    Privacy Policy
                  </a>
                  .
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-base font-medium text-zinc-200">Cookies</h2>
            <p className="mt-3">
              Google Analytics 4 sets first-party cookies (prefixed <code className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-xs text-zinc-300">_ga</code>,{' '}
              <code className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-xs text-zinc-300">_ga_*</code>) to distinguish between
              sessions and users. These cookies expire after 2 years. Vercel Analytics does not set
              cookies.
            </p>
            <p className="mt-3">
              You can disable or delete cookies at any time through your browser settings. Disabling
              cookies will not affect your ability to use this site.
            </p>
          </section>

          <section>
            <h2 className="text-base font-medium text-zinc-200">Your Rights (GDPR / CCPA)</h2>
            <p className="mt-3">
              If you are located in the European Economic Area or California, you have the right to:
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Access the personal data we hold about you</li>
              <li>Request deletion of your data</li>
              <li>Opt out of analytics data collection</li>
            </ul>
            <p className="mt-4">
              Since we collect only anonymised analytics data and do not maintain user accounts,
              most requests can be fulfilled by opting out of Google Analytics using the browser
              add-on linked above.
            </p>
          </section>

          <section>
            <h2 className="text-base font-medium text-zinc-200">CLI Tool</h2>
            <p className="mt-3">
              The <code className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-xs text-zinc-300">zuro-cli</code> npm package runs
              locally on your machine and does not collect, transmit, or store any data. No telemetry
              is built into the CLI.
            </p>
          </section>

          <section>
            <h2 className="text-base font-medium text-zinc-200">Changes to This Policy</h2>
            <p className="mt-3">
              We may update this policy if new analytics tools are added or the site changes
              significantly. The &quot;last updated&quot; date at the top of this page will always
              reflect the most recent revision.
            </p>
          </section>

          <section>
            <h2 className="text-base font-medium text-zinc-200">Contact</h2>
            <p className="mt-3">
              Questions about this privacy policy can be directed to{' '}
              <a
                href="https://x.com/briyan_dev"
                target="_blank"
                rel="noreferrer"
                className="text-emerald-400 hover:text-emerald-300"
              >
                @briyan_dev
              </a>{' '}
              or via{' '}
              <a
                href="https://github.com/BriyanPatel/zuro/issues"
                target="_blank"
                rel="noreferrer"
                className="text-emerald-400 hover:text-emerald-300"
              >
                GitHub Issues
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
