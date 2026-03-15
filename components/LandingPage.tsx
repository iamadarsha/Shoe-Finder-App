import { useState, useEffect } from 'react';
import ShaderBackground from './ui/ShaderBackground';

interface LandingPageProps {
  onStart: () => void;
  onChat: () => void;
  onBrowse: () => void;
}

export default function LandingPage({ onStart, onChat, onBrowse }: LandingPageProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // 50ms timeout for entrance animations
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden flex flex-col bg-sole-bg">
      {/* ── Shader Background ── */}
      <ShaderBackground />

      {/* ── Navigation ── */}
      <nav
        className={`relative z-10 flex items-center justify-between px-6 md:px-12 py-5 transition-all duration-700 delay-0 ${
          mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
        }`}
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm bg-gradient-to-br from-[#7C5CFC] to-[#00C896]">
            👟
          </div>
          <span className="text-lg font-semibold tracking-tight text-white font-heading">
            SoleMate
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onBrowse}
            className="px-4 py-2 text-sm rounded-lg transition-all duration-200 hover:bg-white/5 text-[#8888A0] border border-[#1A1A2A] font-body"
          >
            Browse All 233 Shoes
          </button>
          <button
            onClick={onChat}
            className="px-4 py-2 text-sm rounded-lg transition-all duration-200 hover:bg-white/5 text-[#8888A0] border border-[#1A1A2A] font-body"
          >
            Chat Mode
          </button>
        </div>
      </nav>

      {/* ── Hero ── */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 text-center">
        {/* Pill badge */}
        <div
          className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs mb-8 transition-all duration-700 delay-200 bg-[#7C5CFC12] border border-[#7C5CFC33] text-[#A78BFA] font-body ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#00C896] animate-pulse" />
          233 shoes · 15 brands · India market
        </div>

        {/* Main heading */}
        <h1
          className={`text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[0.95] mb-6 transition-all duration-700 delay-300 font-heading ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
          }`}
        >
          <span className="text-white">Find Your</span>
          <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-br from-[#7C5CFC] via-[#00C896] to-[#3B82F6]">
            Perfect Sole
          </span>
        </h1>

        {/* Subtitle */}
        <p
          className={`text-base md:text-lg max-w-lg mb-10 transition-all duration-700 delay-400 text-[#8888A0] font-body leading-[1.6] ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
          }`}
        >
          Answer 5 quick questions. Our AI matches you with the best running shoes
          from <span className="text-[#A78BFA]">Nike, Adidas, Asics, Hoka</span>{' '}
          and 11 more brands — all available in India.
        </p>

        {/* CTA Buttons */}
        <div
          className={`flex flex-col sm:flex-row items-center gap-4 transition-all duration-700 delay-500 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
          }`}
        >
          <button
            onClick={onStart}
            className="group relative px-8 py-3.5 rounded-xl text-white font-semibold text-base transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-1 focus:ring-[#7C5CFC44] bg-gradient-to-br from-[#7C5CFC] to-[#6B4EE8] shadow-[0_4px_25px_rgba(124,92,252,0.35),inset_0_1px_0_rgba(255,255,255,0.1)] font-heading"
          >
            <span className="relative z-10 flex items-center gap-2">
              Start the Quiz
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="transition-transform duration-200 group-hover:translate-x-1">
                <path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </button>

          <button
            onClick={onBrowse}
            className="px-8 py-3.5 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] hover:bg-white/5 focus:outline-none focus:ring-1 focus:ring-[#7C5CFC44] text-[#8888A0] border border-[#1A1A2A] font-heading"
          >
            Explore All Shoes →
          </button>
        </div>

        {/* Brand logos bar */}
        <div
          className={`flex items-center gap-6 mt-16 transition-all duration-700 delay-[700ms] ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
          }`}
        >
          {['Nike', 'Adidas', 'Asics', 'Hoka', 'Brooks', 'Puma', 'Saucony', 'New Balance'].map((brand) => (
            <span
              key={brand}
              className="text-[10px] font-medium tracking-[0.15em] uppercase font-heading text-[#33334A] opacity-50 select-none"
            >
              {brand}
            </span>
          ))}
        </div>
      </div>

      {/* ── Footer ── */}
      <div
        className={`relative z-10 text-center py-6 transition-all duration-700 delay-[800ms] ${
          mounted ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <p className="text-xs text-[#33334A] font-body">
          Trusted by runners across India 🇮🇳 · Powered by AI
        </p>
      </div>
    </div>
  );
}
