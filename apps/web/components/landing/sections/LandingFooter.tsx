import Link from "next/link";

export function LandingFooter() {
  return (
    <footer className="mt-16 border-t border-white/10 py-10">
      <div className="grid gap-10 text-sm text-zinc-400 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <p className="text-base font-semibold text-white">Zuro</p>
          <p className="mt-2 max-w-xs text-zinc-500">Production-ready backend modules you own, without framework lock-in.</p>
        </div>

        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Product</p>
          <Link href="/nodejs-backend-starter" className="block hover:text-zinc-200">Node.js Starter</Link>
          <Link href="/express-typescript-boilerplate" className="block hover:text-zinc-200">Express TypeScript Boilerplate</Link>
          <Link href="/docs/init" className="block hover:text-zinc-200">Init</Link>
          <Link href="/docs" className="block hover:text-zinc-200">Documentation</Link>
          <Link href="/docs/database" className="block hover:text-zinc-200">Database</Link>
          <Link href="/docs/uploads" className="block hover:text-zinc-200">Uploads</Link>
          <Link href="/docs/auth" className="block hover:text-zinc-200">Auth</Link>
        </div>

        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Modules</p>
          <Link href="/openapi-starter-express" className="block hover:text-zinc-200">OpenAPI Starter</Link>
          <Link href="/backend-auth-module-express" className="block hover:text-zinc-200">Auth Module</Link>
          <Link href="/docs/validator" className="block hover:text-zinc-200">Validator</Link>
          <Link href="/docs/error-handler" className="block hover:text-zinc-200">Error Handler</Link>
          <Link href="/docs/mailer" className="block hover:text-zinc-200">Mailer</Link>
          <Link href="/docs/docs" className="block hover:text-zinc-200">API Docs</Link>
          <Link href="/docs/rate-limiter" className="block hover:text-zinc-200">Rate Limiter</Link>
        </div>

        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Community</p>
          <Link href="/zuro-vs-manual-express-setup" className="block hover:text-zinc-200">Zuro vs Manual Setup</Link>
          <Link href="/zuro-vs-framework-backend-starters" className="block hover:text-zinc-200">Zuro vs Framework Starters</Link>
          <a href="https://github.com/BriyanPatel/zuro" target="_blank" rel="noreferrer" className="block hover:text-zinc-200">
            GitHub
          </a>
          <a href="https://github.com/BriyanPatel/zuro/issues" target="_blank" rel="noreferrer" className="block hover:text-zinc-200">
            Issues
          </a>
          <a
            href="https://github.com/BriyanPatel/zuro/blob/main/LICENSE"
            target="_blank"
            rel="noreferrer"
            className="block hover:text-zinc-200"
          >
            MIT License
          </a>
        </div>
      </div>

      <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-5 text-xs text-zinc-500 sm:flex-row">
        <p>
          Built by <a href="https://x.com/briyan_dev" target="_blank" rel="noreferrer" className="text-zinc-400 hover:text-zinc-200">Briyan Patel</a>
        </p>
        <p>© {new Date().getFullYear()} Zuro</p>
      </div>
    </footer>
  );
}
