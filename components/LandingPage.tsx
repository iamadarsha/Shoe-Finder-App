import { useState, useEffect } from 'react';

interface LandingPageProps {
  onStart: () => void;
  onChat: () => void;
  onBrowse: () => void;
}

export default function LandingPage({ onStart, onChat, onBrowse }: LandingPageProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden flex flex-col" style={{ background: '#050507' }}>
      {/* ── Animated gradient orbs ── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute w-[600px] h-[600px] rounded-full opacity-[0.07] blur-[120px]"
          style={{
            background: 'radial-gradient(circle, #7C5CFC 0%, transparent 70%)',
            top: '-10%',
            right: '-10%',
            animation: 'float-orb 20s ease-in-out infinite',
          }}
        />
        <div
          className="absolute w-[500px] h-[500px] rounded-full opacity-[0.05] blur-[100px]"
          style={{
            background: 'radial-gradient(circle, #00C896 0%, transparent 70%)',
            bottom: '-5%',
            left: '-5%',
            animation: 'float-orb 25s ease-in-out infinite reverse',
          }}
        />
        <div
          className="absolute w-[300px] h-[300px] rounded-full opacity-[0.04] blur-[80px]"
          style={{
            background: 'radial-gradient(circle, #3B82F6 0%, transparent 70%)',
            top: '40%',
            left: '30%',
            animation: 'float-orb 18s ease-in-out infinite',
          }}
        />
        {/* Grid lines (kernel.sh style) */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(124, 92, 252, 0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(124, 92, 252, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* ── Navigation ── */}
      <nav
        className={`relative z-10 flex items-center justify-between px-6 md:px-12 py-5 transition-all duration-700 ${
          mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
        }`}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
            style={{ background: 'linear-gradient(135deg, #7C5CFC, #00C896)' }}
          >
            👟
          </div>
          <span
            className="text-lg font-semibold tracking-tight"
            style={{ color: '#E8E8ED', fontFamily: "'DM Sans', sans-serif" }}
          >
            SoleMate
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onBrowse}
            className="px-4 py-2 text-sm rounded-lg transition-all duration-200 hover:bg-white/5"
            style={{
              color: '#8888A0',
              fontFamily: "'Figtree', sans-serif",
              border: '1px solid #1A1A2A',
            }}
          >
            Browse All 260 Shoes
          </button>
          <button
            onClick={onChat}
            className="px-4 py-2 text-sm rounded-lg transition-all duration-200 hover:bg-white/5"
            style={{
              color: '#8888A0',
              fontFamily: "'Figtree', sans-serif",
              border: '1px solid #1A1A2A',
            }}
          >
            Chat Mode
          </button>
        </div>
      </nav>

      {/* ── Hero ── */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 text-center">
        {/* Pill badge */}
        <div
          className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs mb-8 transition-all duration-700 delay-200 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
          style={{
            background: '#7C5CFC12',
            border: '1px solid #7C5CFC33',
            color: '#A78BFA',
            fontFamily: "'Figtree', sans-serif",
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#00C896] animate-pulse" />
          260 shoes · 16 brands · India market
        </div>

        {/* Main heading */}
        <h1
          className={`text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[0.95] mb-6 transition-all duration-700 delay-300 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          <span style={{ color: '#E8E8ED' }}>Find Your</span>
          <br />
          <span
            style={{
              background: 'linear-gradient(135deg, #7C5CFC 0%, #00C896 50%, #3B82F6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Perfect Sole
          </span>
        </h1>

        {/* Subtitle */}
        <p
          className={`text-base md:text-lg max-w-lg mb-10 transition-all duration-700 delay-400 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
          style={{ color: '#8888A0', fontFamily: "'Figtree', sans-serif", lineHeight: 1.6 }}
        >
          Answer 5 quick questions. Our AI matches you with the best running shoes
          from {' '}
          <span style={{ color: '#A78BFA' }}>Nike, Adidas, Asics, Hoka</span>
          {' '} and 12 more brands — all available in India.
        </p>

        {/* CTA Buttons */}
        <div
          className={`flex flex-col sm:flex-row items-center gap-4 transition-all duration-700 delay-500 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          <button
            onClick={onStart}
            className="group relative px-8 py-3.5 rounded-xl text-white font-semibold text-base transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: 'linear-gradient(135deg, #7C5CFC 0%, #6B4EE8 100%)',
              boxShadow: '0 4px 25px rgba(124, 92, 252, 0.35), inset 0 1px 0 rgba(255,255,255,0.1)',
              fontFamily: "'DM Sans', sans-serif",
            }}
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
            className="px-8 py-3.5 rounded-xl text-sm font-medium transition-all duration-200 hover:bg-white/5"
            style={{
              color: '#8888A0',
              border: '1px solid #1A1A2A',
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Explore All Shoes →
          </button>
        </div>

        {/* Brand logos bar */}
        <div
          className={`flex items-center gap-6 mt-16 transition-all duration-700 delay-700 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          {['Nike', 'Adidas', 'Asics', 'Hoka', 'Brooks', 'Puma', 'Saucony', 'New Balance'].map((brand) => (
            <span
              key={brand}
              className="text-xs font-medium tracking-widest uppercase"
              style={{ color: '#33334A', fontFamily: "'DM Sans', sans-serif" }}
            >
              {brand}
            </span>
          ))}
        </div>
      </div>

      {/* ── Footer ── */}
      <div
        className={`relative z-10 text-center py-6 transition-all duration-700 delay-700 ${
          mounted ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <p
          className="text-xs"
          style={{ color: '#33334A', fontFamily: "'Figtree', sans-serif" }}
        >
          Trusted by runners across India 🇮🇳 · Powered by AI
        </p>
      </div>

      {/* ── Keyframes ── */}
      <style>{`
        @keyframes float-orb {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -30px) scale(1.05); }
          66% { transform: translate(-20px, 20px) scale(0.95); }
        }
      `}</style>
    </div>
  );
}
