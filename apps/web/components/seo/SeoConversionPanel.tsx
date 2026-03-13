'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ArrowRight, Check, Copy } from 'lucide-react';
import { trackSeoEvent } from '@/lib/seo/analytics';

type SeoConversionPanelProps = {
  ctaHref: string;
  ctaLabel: string;
  pageSlug: string;
  primaryKeyword: string;
};

const COMMAND_BY_DOC: Record<string, string> = {
  '/docs/init': 'npx zuro-cli init my-mvp',
  '/docs/auth': 'npx zuro-cli add auth',
  '/docs/database': 'npx zuro-cli add database',
  '/docs/uploads': 'npx zuro-cli add uploads',
  '/docs/docs': 'npx zuro-cli add docs',
};

function resolveCommand(href: string): string {
  return COMMAND_BY_DOC[href] ?? 'npx zuro-cli init my-mvp';
}

export function SeoConversionPanel({ ctaHref, ctaLabel, pageSlug, primaryKeyword }: SeoConversionPanelProps) {
  const [copied, setCopied] = useState(false);
  const command = resolveCommand(ctaHref);

  const copyCommand = async () => {
    await navigator.clipboard.writeText(command);
    trackSeoEvent('init_command_copy', {
      location: 'seo_landing',
      page_slug: pageSlug,
      command,
      keyword: primaryKeyword,
    });
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <aside className="rounded-xl border border-white/10 bg-black/35 p-5">
      <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Fast start</p>
      <h2 className="mt-2 text-lg font-semibold tracking-tight text-white">Try it in your terminal</h2>
      <p className="mt-2 text-sm leading-6 text-zinc-400">Use one command, then customize generated code freely in your project.</p>

      <code className="mt-4 block overflow-x-auto rounded-md border border-white/10 bg-black/60 px-3 py-2 font-mono text-xs text-zinc-200">
        {command}
      </code>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={copyCommand}
          className="inline-flex items-center gap-2 rounded-md border border-white/20 bg-white/10 px-3 py-2 text-xs font-medium text-zinc-100 hover:bg-white/20"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-300" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? 'Copied' : 'Copy command'}
        </button>

        <Link
          href={ctaHref}
          onClick={() =>
            trackSeoEvent('docs_cta_click', {
              location: 'seo_landing_primary',
              page_slug: pageSlug,
              target: ctaHref,
              keyword: primaryKeyword,
            })
          }
          className="inline-flex items-center gap-2 rounded-md border border-emerald-400/40 bg-emerald-400/10 px-3 py-2 text-xs font-medium text-emerald-300 hover:bg-emerald-400/20"
        >
          {ctaLabel}
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-md border border-white/10 bg-white/[0.03] p-2">
          <p className="text-sm font-semibold text-white">60s</p>
          <p className="text-[11px] text-zinc-500">core setup</p>
        </div>
        <div className="rounded-md border border-white/10 bg-white/[0.03] p-2">
          <p className="text-sm font-semibold text-white">8</p>
          <p className="text-[11px] text-zinc-500">modules</p>
        </div>
        <div className="rounded-md border border-white/10 bg-white/[0.03] p-2">
          <p className="text-sm font-semibold text-white">0</p>
          <p className="text-[11px] text-zinc-500">lock-in</p>
        </div>
      </div>
    </aside>
  );
}
