import Link from 'next/link';

type DocSeoConfig = {
  intent: string;
  quickCommand: string;
  exampleSteps: string[];
  faq: Array<{ question: string; answer: string }>;
  relatedDocs: Array<{ href: string; label: string }>;
  landingLink: { href: string; label: string };
};

const DEFAULT_SEO_CONFIG: DocSeoConfig = {
  intent:
    'Use this guide to ship production-ready backend behavior quickly with clear defaults and minimal setup friction.',
  quickCommand: 'npx zuro-cli init my-app',
  exampleSteps: ['Initialize your project', 'Add the module from this page', 'Run locally and validate endpoints'],
  faq: [
    {
      question: 'Can I edit generated files?',
      answer: 'Yes. Generated output is plain TypeScript intended for customization.',
    },
    {
      question: 'Do I need all modules upfront?',
      answer: 'No. Add modules incrementally based on your product needs.',
    },
  ],
  relatedDocs: [
    { href: '/docs/init', label: 'Init guide' },
    { href: '/docs/database', label: 'Database guide' },
    { href: '/docs/error-handler', label: 'Error Handler guide' },
  ],
  landingLink: {
    href: '/nodejs-backend-starter',
    label: 'Node.js backend starter landing page',
  },
};

const DOC_SEO_MAP: Record<string, DocSeoConfig> = {
  init: {
    intent: 'Start your backend in minutes with secure defaults and a production-ready folder structure.',
    quickCommand: 'npx zuro-cli init my-app',
    exampleSteps: ['Run init', 'Open generated project', 'Add first feature module'],
    faq: [
      {
        question: 'What does init configure?',
        answer: 'It scaffolds Express, TypeScript, security middleware, logging, and env validation defaults.',
      },
      {
        question: 'Can I rename generated structure?',
        answer: 'Yes. You own the code and can refactor naming and layout as needed.',
      },
    ],
    relatedDocs: [
      { href: '/docs/database', label: 'Database module next step' },
      { href: '/docs/auth', label: 'Auth module next step' },
      { href: '/docs/error-handler', label: 'Error handling next step' },
    ],
    landingLink: { href: '/nodejs-backend-starter', label: 'Node.js backend starter' },
  },
  database: {
    intent: 'Add type-safe database access with Drizzle and move from scaffold to real persistence quickly.',
    quickCommand: 'npx zuro-cli add database',
    exampleSteps: ['Add database module', 'Choose PostgreSQL or MySQL', 'Run migration and test connection'],
    faq: [
      {
        question: 'Can I switch providers later?',
        answer: 'Yes, but treat provider changes as normal DB migration work with testing.',
      },
      {
        question: 'Is schema code generated?',
        answer: 'Yes, and it remains fully editable in your project.',
      },
    ],
    relatedDocs: [
      { href: '/docs/auth', label: 'Auth + database integration' },
      { href: '/docs/uploads', label: 'Uploads metadata integration' },
      { href: '/docs/init', label: 'Init module' },
    ],
    landingLink: { href: '/drizzle-starter-express', label: 'Drizzle starter for Express' },
  },
  auth: {
    intent: 'Enable signup/login/session workflows without rebuilding auth primitives from scratch.',
    quickCommand: 'npx zuro-cli add auth',
    exampleSteps: ['Install auth module', 'Configure env secrets', 'Test signup and login routes'],
    faq: [
      {
        question: 'Does auth need database support?',
        answer: 'Yes, and required dependencies are installed when missing.',
      },
      {
        question: 'Can I customize auth behavior?',
        answer: 'Yes. Auth routes and logic are plain project files.',
      },
    ],
    relatedDocs: [
      { href: '/docs/database', label: 'Database module' },
      { href: '/docs/validator', label: 'Validation module' },
      { href: '/docs/error-handler', label: 'Error handling module' },
    ],
    landingLink: { href: '/backend-auth-module-express', label: 'Backend auth module for Express' },
  },
  uploads: {
    intent: 'Ship reliable file upload flows for real products using S3, R2, or Cloudinary providers.',
    quickCommand: 'npx zuro-cli add uploads',
    exampleSteps: ['Install uploads module', 'Select storage provider', 'Verify upload + retrieval route flow'],
    faq: [
      {
        question: 'Can uploads work without DB metadata?',
        answer: 'Yes. Metadata persistence is optional and can be added later.',
      },
      {
        question: 'Which upload flows are supported?',
        answer: 'Proxy, direct, and multipart flows are available.',
      },
    ],
    relatedDocs: [
      { href: '/docs/auth', label: 'Protect uploads with auth' },
      { href: '/docs/database', label: 'Persist upload metadata' },
      { href: '/docs/error-handler', label: 'Handle upload failures' },
    ],
    landingLink: { href: '/express-upload-module', label: 'Express upload module' },
  },
  docs: {
    intent: 'Publish high-quality API documentation with machine-readable OpenAPI output and interactive UI.',
    quickCommand: 'npx zuro-cli add docs',
    exampleSteps: ['Install docs module', 'Open generated docs route', 'Register custom endpoints in OpenAPI setup'],
    faq: [
      {
        question: 'Can I expose JSON spec for SDK generation?',
        answer: 'Yes. OpenAPI JSON endpoint is generated for tooling and client generation.',
      },
      {
        question: 'Can module endpoints be documented together?',
        answer: 'Yes. Auth/uploads and custom routes can be registered in one spec.',
      },
    ],
    relatedDocs: [
      { href: '/docs/validator', label: 'Validation schema module' },
      { href: '/docs/auth', label: 'Auth documentation path' },
      { href: '/docs/uploads', label: 'Uploads documentation path' },
    ],
    landingLink: { href: '/openapi-starter-express', label: 'OpenAPI starter for Express' },
  },
};

function getSeoConfig(slug?: string[]): DocSeoConfig {
  if (!slug || slug.length === 0) {
    return DEFAULT_SEO_CONFIG;
  }

  return DOC_SEO_MAP[slug[0]] ?? DEFAULT_SEO_CONFIG;
}

type SeoEnhancementsProps = {
  slug?: string[];
};

export function SeoEnhancements({ slug }: SeoEnhancementsProps) {
  const seo = getSeoConfig(slug);

  return (
    <section className="mt-10 space-y-8 rounded-xl border border-fd-border bg-fd-card p-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-fd-foreground">Implementation Intent</h2>
        <p className="mt-2 text-sm text-fd-muted-foreground">{seo.intent}</p>
      </div>

      <div>
        <h3 className="text-base font-semibold text-fd-foreground">Quick Command</h3>
        <code className="mt-2 inline-flex rounded-md border border-fd-border bg-fd-muted px-3 py-1.5 text-xs text-fd-foreground">
          {seo.quickCommand}
        </code>
      </div>

      <div>
        <h3 className="text-base font-semibold text-fd-foreground">Example Workflow</h3>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-fd-muted-foreground">
          {seo.exampleSteps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </div>

      <div>
        <h3 className="text-base font-semibold text-fd-foreground">Common Questions</h3>
        <div className="mt-2 space-y-3">
          {seo.faq.map((item) => (
            <article key={item.question} className="rounded-md border border-fd-border bg-fd-background p-3">
              <p className="text-sm font-medium text-fd-foreground">{item.question}</p>
              <p className="mt-1 text-sm text-fd-muted-foreground">{item.answer}</p>
            </article>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-base font-semibold text-fd-foreground">Related Guides</h3>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
          {seo.relatedDocs.map((doc) => (
            <li key={doc.href}>
              <Link href={doc.href} className="text-blue-600 hover:underline">
                {doc.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-md border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
        Prefer a commercial overview first?{' '}
        <Link href={seo.landingLink.href} className="font-medium underline underline-offset-2">
          {seo.landingLink.label}
        </Link>
      </div>
    </section>
  );
}
