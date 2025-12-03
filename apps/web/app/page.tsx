
import { Explainer } from "@/components/landing/Explainer";
import { FutureCarousel } from "@/components/landing/FutureCarousel";
import { Hero } from "@/components/landing/Hero";
import { InteractiveBento } from "@/components/landing/InteractiveBento";
import { OwnershipSection } from "@/components/landing/OwnershipSection";

export default function Home() {
   return (
    <div className="min-h-screen bg-zuro-black text-white selection:bg-cyan-500/30 selection:text-cyan-200 overflow-x-hidden font-sans">
      
      {/* Texture Overlay */}
      <div className="fixed inset-0 pointer-events-none z-50 opacity-[0.03] bg-noise mix-blend-overlay"></div>

      {/* Navigation (Simple Sticky) */}
      <nav className="fixed top-0 inset-x-0 z-40 border-b border-white/5 bg-zuro-black/80 backdrop-blur-md">
         <div className="container mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
               <div className="w-5 h-5 bg-gradient-to-br from-cyan-400 to-violet-500 rounded-sm" />
               <span className="font-bold tracking-tight text-lg">Zuro</span>
            </div>
            <div className="flex items-center gap-6">
               <a href="/docs" className="text-sm text-zinc-400 hover:text-white transition-colors hidden sm:block">Docs</a>
               <a href="/docs" className="text-sm font-medium bg-white text-black px-4 py-2 rounded-full hover:bg-zinc-200 transition-colors">
                  Get Started
               </a>
            </div>
         </div>
      </nav>

      <main>
        <Hero />
        <Explainer />
        <InteractiveBento />
        <OwnershipSection />
        <FutureCarousel />
        
        {/* Footer */}
        <footer className="py-12 border-t border-white/5 mt-20">
           <div className="container mx-auto px-6 text-center text-zinc-600 text-sm">
              <p className="mb-4">Designed for the backend developers of tomorrow.</p>
              <p className="mt-8 opacity-50">&copy; {new Date().getFullYear()} Zuro Inc.</p>
           </div>
        </footer>
      </main>
    </div>
  );
}
