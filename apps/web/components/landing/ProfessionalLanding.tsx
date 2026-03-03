import { LandingHeader } from "./sections/LandingHeader";
import { HeroSection } from "./sections/HeroSection";
import { AudienceAndProblemSection } from "./sections/AudienceAndProblemSection";
import { ModulesSection } from "./sections/ModulesSection";
import { ComparisonSection } from "./sections/ComparisonSection";
import { FaqSection } from "./sections/FaqSection";
import { CtaSection } from "./sections/CtaSection";
import { LandingFooter } from "./sections/LandingFooter";

export function ProfessionalLanding() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:68px_68px]" />
      <div className="pointer-events-none fixed left-0 top-0 h-[520px] w-[620px] rounded-full bg-white/[0.035] blur-3xl" />
      <div className="pointer-events-none fixed bottom-0 right-0 h-[420px] w-[520px] rounded-full bg-emerald-400/[0.06] blur-3xl" />

      <LandingHeader />

      <main className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <HeroSection />
        <AudienceAndProblemSection />
        <ModulesSection />
        <ComparisonSection />
        <FaqSection />
        <div className="py-12">
          <CtaSection />
        </div>
        <LandingFooter />
      </main>
    </div>
  );
}
