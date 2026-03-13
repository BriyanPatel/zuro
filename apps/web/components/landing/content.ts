import type { LucideIcon } from "lucide-react";
import { AlertTriangle, Clock3, FolderTree, Lock, Database, ShieldCheck, FileText, Mail, Code2, UserRound, Rocket, Users } from "lucide-react";

export type Metric = {
  label: string;
  value: string;
};

export type Persona = {
  title: string;
  subtitle: string;
  description: string;
  icon: LucideIcon;
};

export type ModuleItem = {
  name: string;
  command: string;
  description: string;
  href: string;
  icon: LucideIcon;
};

export type ComparisonRow = {
  feature: string;
  zuro: string;
  manual: string;
  framework: string;
};

export type FaqItem = {
  question: string;
  answer: string;
};

export type LandingGuide = {
  href: string;
  label: string;
  description: string;
};

export const HERO_METRICS: Metric[] = [
  { value: "60s", label: "to production-ready core" },
  { value: "8", label: "modules available today" },
  { value: "0", label: "runtime lock-in" },
];

export const AUDIENCE_PERSONAS: Persona[] = [
  {
    title: "Solo Developers",
    subtitle: "Shipping production side projects",
    description:
      "Ship quickly without compromising architecture. Zuro removes setup drag while keeping your backend easy to maintain.",
    icon: UserRound,
  },
  {
    title: "Technical Founders",
    subtitle: "From idea to v1 quickly",
    description:
      "Get auth, database, validation, and docs in place fast, so you can validate demand before overengineering.",
    icon: Rocket,
  },
  {
    title: "Early-Stage Teams",
    subtitle: "Shared backend standards",
    description:
      "Keep velocity while staying consistent across projects with one clean baseline your whole team understands.",
    icon: Users,
  },
];

export const PAIN_POINTS = [
  {
    icon: Clock3,
    text: "Losing hours setting up TypeScript, middleware, env validation, and logging before any feature work.",
  },
  {
    icon: AlertTriangle,
    text: "Reusing old snippets with unknown quality and spending time re-validating production readiness.",
  },
  {
    icon: FolderTree,
    text: "No consistent structure across projects, which slows shipping and onboarding even in tiny teams.",
  },
];

export const MODULES: ModuleItem[] = [
  {
    name: "Uploads",
    command: "zuro-cli add uploads",
    description: "S3, R2, or Cloudinary uploads with proxy, direct, and multipart flows.",
    href: "/docs/uploads",
    icon: FileText,
  },
  {
    name: "Database",
    command: "zuro-cli add database",
    description: "Drizzle ORM with PostgreSQL or MySQL support.",
    href: "/docs/database",
    icon: Database,
  },
  {
    name: "Auth",
    command: "zuro-cli add auth",
    description: "Signup, login, and session flows with Better-Auth.",
    href: "/docs/auth",
    icon: Lock,
  },
  {
    name: "Error Handler",
    command: "zuro-cli add error-handler",
    description: "Consistent API errors with custom classes and middleware.",
    href: "/docs/error-handler",
    icon: ShieldCheck,
  },
  {
    name: "Validator",
    command: "zuro-cli add validator",
    description: "Request validation middleware using Zod.",
    href: "/docs/validator",
    icon: FileText,
  },
  {
    name: "Mailer",
    command: "zuro-cli add mailer",
    description: "Resend or SMTP with ready-to-edit templates.",
    href: "/docs/mailer",
    icon: Mail,
  },
  {
    name: "API Docs",
    command: "zuro-cli add docs",
    description: "OpenAPI generation with Scalar UI.",
    href: "/docs/docs",
    icon: Code2,
  },
  {
    name: "Rate Limiter",
    command: "zuro-cli add rate-limiter",
    description: "IP-based rate limiting with express-rate-limit.",
    href: "/docs/rate-limiter",
    icon: ShieldCheck,
  },
];

export const ROADMAP_MODULES = ["File upload", "Caching (Redis)", "Cron jobs", "WebSockets", "Payments (Stripe)"];

export const FEATURED_LANDING_GUIDES: LandingGuide[] = [
  {
    href: "/nodejs-backend-starter",
    label: "Node.js Backend Starter",
    description: "Understand the fastest path from blank repo to production-ready Express foundation.",
  },
  {
    href: "/express-typescript-boilerplate",
    label: "Express TypeScript Boilerplate",
    description: "Compare baseline structure decisions before you commit to architecture patterns.",
  },
  {
    href: "/backend-auth-module-express",
    label: "Backend Auth Module",
    description: "Review auth module setup choices and integration flow with database + validation.",
  },
];

export const COMPARISON_ROWS: ComparisonRow[] = [
  {
    feature: "First API endpoint",
    zuro: "~60 seconds",
    manual: "30-60 minutes",
    framework: "5-10 minutes",
  },
  {
    feature: "Auth + database setup",
    zuro: "2 commands",
    manual: "2-4 hours",
    framework: "Fast but abstracted",
  },
  {
    feature: "Prompt/context drift while scaffolding",
    zuro: "None",
    manual: "Common with AI prompt iteration",
    framework: "Lower, but framework-coupled",
  },
  {
    feature: "Code ownership",
    zuro: "100% plain code",
    manual: "100% plain code",
    framework: "Tied to framework patterns",
  },
  {
    feature: "Team readability",
    zuro: "High",
    manual: "Varies by repo",
    framework: "Depends on framework expertise",
  },
];

export const FAQ_ITEMS: FaqItem[] = [
  {
    question: "How is this different from using AI to scaffold a backend?",
    answer:
      "AI generates different code every time and can drift between prompts. Zuro gives you tested, consistent module patterns — like shadcn/ui does for frontend components.",
  },
  {
    question: "Will I be locked into Zuro?",
    answer:
      "No. Zuro copies code into your project and gets out of the way. There's no runtime dependency, no import from 'zuro'. It's your code.",
  },
  {
    question: "Can I modify the generated files?",
    answer:
      "Yes — that's the whole point. Every file is plain TypeScript in your project. Rename, refactor, or rewrite anything.",
  },
  {
    question: "Why Express and not Fastify/Hono/Elysia?",
    answer:
      "Express has the largest ecosystem and hiring pool. Most tutorials, middleware, and answers online are Express-based. We go where the developers are.",
  },
];
