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

export const HERO_METRICS: Metric[] = [
  { value: "60s", label: "to production-ready core" },
  { value: "6", label: "modules available today" },
  { value: "0", label: "runtime lock-in" },
];

export const AUDIENCE_PERSONAS: Persona[] = [
  {
    title: "Solo Developers",
    subtitle: "Shipping nights and weekends",
    description:
      "Start clean on Friday and ship by Sunday. Zuro removes setup drag so your limited hours go to product work.",
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
    text: "Losing 2+ hours setting up TypeScript, middleware, env validation, and logging before any feature work.",
  },
  {
    icon: AlertTriangle,
    text: "Copy-pasting backend snippets from old repos and hoping they still match current production needs.",
  },
  {
    icon: FolderTree,
    text: "No consistent structure across projects, which slows shipping and onboarding even in tiny teams.",
  },
];

export const MODULES: ModuleItem[] = [
  {
    name: "Database",
    command: "zuro-cli add database",
    description: "Drizzle ORM with PostgreSQL or MySQL support.",
    icon: Database,
  },
  {
    name: "Auth",
    command: "zuro-cli add auth",
    description: "Signup, login, and session flows with Better-Auth.",
    icon: Lock,
  },
  {
    name: "Error Handler",
    command: "zuro-cli add error-handler",
    description: "Consistent API errors with custom classes and middleware.",
    icon: ShieldCheck,
  },
  {
    name: "Validator",
    command: "zuro-cli add validator",
    description: "Request validation middleware using Zod.",
    icon: FileText,
  },
  {
    name: "Mailer",
    command: "zuro-cli add mailer",
    description: "Resend or SMTP with ready-to-edit templates.",
    icon: Mail,
  },
  {
    name: "API Docs",
    command: "zuro-cli add docs",
    description: "OpenAPI generation with Scalar UI.",
    icon: Code2,
  },
];

export const ROADMAP_MODULES = ["Rate limiting", "File upload", "Caching"];

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
      "AI prompt loops can drift and produce inconsistent structure across iterations. Zuro applies the same production-ready module patterns directly to your existing project files every time.",
  },
  {
    question: "Will I be locked into Zuro after generation?",
    answer:
      "No. Zuro is a scaffolding CLI. It writes plain backend project files, then gets out of the way.",
  },
  {
    question: "Can I modify generated files freely?",
    answer:
      "Yes. Rename files, refactor folders, and rewrite logic as needed. The code is fully yours.",
  },
  {
    question: "Is this useful for MVPs that may scale later?",
    answer:
      "Yes. You start with production defaults (security, logging, validation) and add modules only when needed, which keeps early velocity high without painting yourself into a corner.",
  },
];
