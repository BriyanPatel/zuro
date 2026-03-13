export type SeoFaq = {
  question: string;
  answer: string;
};

export type SeoLandingPage = {
  slug: string;
  type: 'commercial' | 'comparison';
  title: string;
  description: string;
  h1: string;
  intro: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  highlights: string[];
  relatedDocs: Array<{ href: string; label: string }>;
  faq: SeoFaq[];
  ctaLabel: string;
  ctaHref: string;
};

export const SEO_LANDING_PAGES: SeoLandingPage[] = [
  {
    slug: 'nodejs-backend-starter',
    type: 'commercial',
    title: 'Node.js Backend Starter for Fast MVP Delivery',
    description:
      'Launch a production-ready Node.js backend starter with Express and TypeScript in minutes. Ship faster with Zuro modules.',
    h1: 'Node.js backend starter for teams shipping MVPs fast.',
    intro:
      'Zuro gives you a practical Node.js backend starter: security middleware, logging, env validation, and modular upgrades without framework lock-in.',
    primaryKeyword: 'nodejs backend starter',
    secondaryKeywords: ['node backend boilerplate', 'backend starter for mvp', 'express starter template'],
    highlights: [
      'Start with `zuro-cli init` and get production-ready defaults in about 60 seconds.',
      'Add features with focused commands instead of copying random snippets.',
      'Keep ownership of plain TypeScript code with no runtime wrapper.',
    ],
    relatedDocs: [
      { href: '/docs/init', label: 'Init command guide' },
      { href: '/docs/database', label: 'Database module' },
      { href: '/docs/auth', label: 'Auth module' },
      { href: '/docs/error-handler', label: 'Error Handler module' },
    ],
    faq: [
      {
        question: 'Is this a framework replacement?',
        answer: 'No. Zuro scaffolds plain Express + TypeScript code that your team fully owns and edits.',
      },
      {
        question: 'Can I use only one module?',
        answer: 'Yes. Start with init and add only the modules you need as your product scope grows.',
      },
    ],
    ctaLabel: 'Read setup docs',
    ctaHref: '/docs/init',
  },
  {
    slug: 'express-typescript-boilerplate',
    type: 'commercial',
    title: 'Express TypeScript Boilerplate with Production Defaults',
    description:
      'Use a modern Express TypeScript boilerplate with logging, security, and validation built in. Avoid repetitive setup work.',
    h1: 'Express TypeScript boilerplate built for production workflows.',
    intro:
      'Skip repetitive bootstrap tasks and use a consistent Express TypeScript baseline that supports auth, uploads, API docs, and more.',
    primaryKeyword: 'express typescript boilerplate',
    secondaryKeywords: ['express ts starter', 'typescript express template', 'production express setup'],
    highlights: [
      'Opinionated structure for faster onboarding and cleaner maintenance.',
      'Add validator, rate limiter, and error handling with guided commands.',
      'Works well for solo founders and early-stage engineering teams.',
    ],
    relatedDocs: [
      { href: '/docs/init', label: 'Init module' },
      { href: '/docs/validator', label: 'Validator module' },
      { href: '/docs/rate-limiter', label: 'Rate Limiter module' },
      { href: '/docs/error-handler', label: 'Error Handler module' },
    ],
    faq: [
      {
        question: 'Does this boilerplate force architectural patterns?',
        answer: 'No. It gives solid defaults while keeping every generated file editable and replaceable.',
      },
      {
        question: 'Can teams standardize multiple projects with this?',
        answer: 'Yes. Zuro helps enforce a consistent backend baseline across MVPs and internal tools.',
      },
    ],
    ctaLabel: 'See module docs',
    ctaHref: '/docs',
  },
  {
    slug: 'backend-auth-module-express',
    type: 'commercial',
    title: 'Backend Auth Module for Express with Better-Auth',
    description:
      'Add signup, login, and sessions to Express quickly. Zuro auth module installs dependencies and wires secure defaults.',
    h1: 'Backend auth module for Express without auth setup chaos.',
    intro:
      'Add authentication to your Express backend with Better-Auth integrations and predictable project structure.',
    primaryKeyword: 'backend auth module express',
    secondaryKeywords: ['express auth starter', 'better auth express', 'session auth for node api'],
    highlights: [
      'Auth module wires required dependencies automatically when missing.',
      'Session flows and auth routes are scaffolded with clear, editable files.',
      'You can extend or replace auth logic without framework constraints.',
    ],
    relatedDocs: [
      { href: '/docs/auth', label: 'Auth module docs' },
      { href: '/docs/database', label: 'Database setup' },
      { href: '/docs/error-handler', label: 'Error handling with auth' },
      { href: '/docs/validator', label: 'Validation for auth routes' },
    ],
    faq: [
      {
        question: 'Do I need a database before adding auth?',
        answer: 'No manual setup required. The auth flow can trigger required database setup automatically.',
      },
      {
        question: 'Can I customize signup and session behavior?',
        answer: 'Yes. Generated auth files are plain TypeScript and meant to be customized.',
      },
    ],
    ctaLabel: 'Open auth documentation',
    ctaHref: '/docs/auth',
  },
  {
    slug: 'drizzle-starter-express',
    type: 'commercial',
    title: 'Drizzle Starter for Express APIs',
    description:
      'Bootstrap Drizzle ORM with Express quickly. Configure PostgreSQL or MySQL and start shipping data-backed features.',
    h1: 'Drizzle starter for Express teams that need type-safe data access.',
    intro:
      'Zuro database module helps you stand up Drizzle with practical defaults and a clean structure for migrations and schema growth.',
    primaryKeyword: 'drizzle starter express',
    secondaryKeywords: ['drizzle express setup', 'drizzle orm boilerplate', 'postgres express starter'],
    highlights: [
      'Add database support quickly with guided prompts and sane defaults.',
      'Keep schema and DB code in predictable locations for team readability.',
      'Pair with auth, uploads, and validator modules as your API grows.',
    ],
    relatedDocs: [
      { href: '/docs/database', label: 'Database module docs' },
      { href: '/docs/auth', label: 'Auth + database integration' },
      { href: '/docs/uploads', label: 'Upload metadata with database' },
      { href: '/docs/init', label: 'Base project initialization' },
    ],
    faq: [
      {
        question: 'Does this work with PostgreSQL and MySQL?',
        answer: 'Yes. The database module supports both providers during setup.',
      },
      {
        question: 'Can I run migrations in CI/CD?',
        answer: 'Yes. Generated Drizzle structure is compatible with standard migration workflows.',
      },
    ],
    ctaLabel: 'Read database guide',
    ctaHref: '/docs/database',
  },
  {
    slug: 'express-upload-module',
    type: 'commercial',
    title: 'Express Upload Module for S3, R2, and Cloudinary',
    description:
      'Ship file uploads in Express with proxy, direct, and multipart flows. Supports S3, Cloudflare R2, and Cloudinary providers.',
    h1: 'Express upload module for real-world file workflows.',
    intro:
      'Implement robust uploads with storage provider support, route handlers, and optional metadata persistence without custom scaffolding overhead.',
    primaryKeyword: 'express upload module',
    secondaryKeywords: ['s3 upload express', 'cloudinary express upload', 'r2 upload api node'],
    highlights: [
      'Support proxy, direct, and multipart upload flows from one module.',
      'Choose between S3, R2, and Cloudinary based on your use case.',
      'Secure private upload access with optional metadata-backed ownership checks.',
    ],
    relatedDocs: [
      { href: '/docs/uploads', label: 'Uploads module docs' },
      { href: '/docs/auth', label: 'Protect upload routes with auth' },
      { href: '/docs/database', label: 'Store upload metadata' },
      { href: '/docs/error-handler', label: 'Error handling for upload failures' },
    ],
    faq: [
      {
        question: 'Can I start without database metadata?',
        answer: 'Yes. You can run uploads without metadata and add database-backed tracking later.',
      },
      {
        question: 'Is multipart upload supported for large files?',
        answer: 'Yes. Multipart flows are supported for providers that need chunked uploads.',
      },
    ],
    ctaLabel: 'Explore uploads docs',
    ctaHref: '/docs/uploads',
  },
  {
    slug: 'openapi-starter-express',
    type: 'commercial',
    title: 'OpenAPI Starter for Express with Scalar Docs',
    description:
      'Generate OpenAPI specs and serve interactive API docs in Express quickly using Zuro docs module.',
    h1: 'OpenAPI starter for Express APIs that need clear docs fast.',
    intro:
      'Expose interactive API docs and machine-readable OpenAPI output with a module that integrates cleanly into your backend.',
    primaryKeyword: 'openapi starter express',
    secondaryKeywords: ['express api docs', 'scalar openapi express', 'openapi generator node'],
    highlights: [
      'Interactive docs endpoint and JSON OpenAPI spec are scaffolded instantly.',
      'Use specs for client SDK generation and QA/UAT workflows.',
      'Works naturally with auth, uploads, validator, and other modules.',
    ],
    relatedDocs: [
      { href: '/docs/docs', label: 'API Docs module docs' },
      { href: '/docs/validator', label: 'Validation and OpenAPI schemas' },
      { href: '/docs/auth', label: 'Document auth endpoints' },
      { href: '/docs/uploads', label: 'Document upload workflows' },
    ],
    faq: [
      {
        question: 'Where is the generated OpenAPI JSON?',
        answer: 'The docs module exposes OpenAPI JSON under the API docs route for tooling and integration.',
      },
      {
        question: 'Can I add custom endpoint schemas?',
        answer: 'Yes. You can register additional paths and schemas in the generated OpenAPI setup files.',
      },
    ],
    ctaLabel: 'Open API Docs guide',
    ctaHref: '/docs/docs',
  },
  {
    slug: 'zuro-vs-manual-express-setup',
    type: 'comparison',
    title: 'Zuro vs Manual Express Setup: Time, Quality, and Ownership',
    description:
      'Compare Zuro with manual Express setup across delivery speed, consistency, and long-term maintainability.',
    h1: 'Zuro vs manual Express setup for teams that value speed and code ownership.',
    intro:
      'Manual setup gives full control but often costs repeated setup time. Zuro preserves ownership while reducing repetitive bootstrap effort.',
    primaryKeyword: 'zuro vs manual express setup',
    secondaryKeywords: ['manual express boilerplate', 'express setup comparison', 'backend scaffolding comparison'],
    highlights: [
      'Manual setup can consume hours before any product work starts.',
      'Zuro keeps plain-code ownership while reducing setup variability.',
      'Teams get consistent project structure without framework lock-in.',
    ],
    relatedDocs: [
      { href: '/docs/init', label: 'Init module' },
      { href: '/docs/database', label: 'Database module' },
      { href: '/docs/auth', label: 'Auth module' },
      { href: '/docs', label: 'Full docs index' },
    ],
    faq: [
      {
        question: 'When is manual setup still better?',
        answer: 'Manual setup can be useful for niche architectures where every primitive is highly custom from day one.',
      },
      {
        question: 'Does Zuro hide important implementation details?',
        answer: 'No. Generated output is plain TypeScript files you can inspect, edit, and replace.',
      },
    ],
    ctaLabel: 'Review full docs',
    ctaHref: '/docs',
  },
  {
    slug: 'zuro-vs-framework-backend-starters',
    type: 'comparison',
    title: 'Zuro vs Framework-Based Backend Starters',
    description:
      'See how Zuro compares with framework-led backend starters on flexibility, lock-in, and team onboarding.',
    h1: 'Zuro vs framework-based backend starters for pragmatic teams.',
    intro:
      'Framework starters can accelerate setup but may increase long-term coupling. Zuro aims for quick starts with plain-code freedom.',
    primaryKeyword: 'zuro vs framework backend starters',
    secondaryKeywords: ['backend starter comparison', 'express vs framework starter', 'no lockin backend tooling'],
    highlights: [
      'Framework starters can be fast, but conventions may increase coupling.',
      'Zuro balances rapid setup with straightforward Express file ownership.',
      'Useful for teams that want reusable patterns without framework migration risk.',
    ],
    relatedDocs: [
      { href: '/docs/init', label: 'Core setup guide' },
      { href: '/docs/validator', label: 'Validation patterns' },
      { href: '/docs/error-handler', label: 'Error handling patterns' },
      { href: '/docs/docs', label: 'API documentation module' },
    ],
    faq: [
      {
        question: 'Can I migrate away from Zuro-generated code later?',
        answer: 'Yes. Since output is plain code, migration is similar to refactoring any Express codebase.',
      },
      {
        question: 'Is this suitable for teams with mixed experience levels?',
        answer: 'Yes. Explicit structure and readable code help onboarding and reduce context drift.',
      },
    ],
    ctaLabel: 'Explore module docs',
    ctaHref: '/docs',
  },
];

export const SEO_LANDING_SLUGS = SEO_LANDING_PAGES.map((page) => page.slug);
export const SEO_LANDING_PATHS = SEO_LANDING_PAGES.map((page) => `/${page.slug}`);

export const SEO_LANDING_PAGE_MAP = new Map(SEO_LANDING_PAGES.map((page) => [page.slug, page]));

export function getSeoLandingPage(slug: string): SeoLandingPage | undefined {
  return SEO_LANDING_PAGE_MAP.get(slug);
}
