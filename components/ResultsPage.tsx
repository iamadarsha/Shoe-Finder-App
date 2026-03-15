import { useState, useEffect } from 'react';
import { ShoeRecommendation } from '../types';

interface ResultsPageProps {
  recommendations: ShoeRecommendation[];
  onRetake: () => void;
  onChat: () => void;
  onBrowse: () => void;
}

function ReviewScoreBadge({ score }: { score: number }) {
  const color = score >= 90 ? '#00C896' : score >= 80 ? '#7C5CFC' : '#FF9F43';
  const label = score >= 90 ? 'Excellent' : score >= 80 ? 'Very Good' : 'Good';
  return (
    <div className="flex items-center gap-2">
      <div
        className="relative w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold"
        style={{
          background: `conic-gradient(${color} ${score}%, #1A1A2A ${score}%)`,
        }}
      >
        <div
          className="absolute inset-[3px] rounded-full flex items-center justify-center text-xs font-bold"
          style={{ background: '#111118', color }}
        >
          {score}
        </div>
      </div>
      <div>
        <span className="block text-[10px] font-bold tracking-wider uppercase" style={{ color: '#55556A' }}>
          REVIEW
        </span>
        <span className="block text-xs font-medium" style={{ color }}>
          {label}
        </span>
      </div>
    </div>
  );
}

function ShoeCard({ shoe, rank }: { shoe: ShoeRecommendation; rank: number }) {
  const [mounted, setMounted] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 150 * rank);
    return () => clearTimeout(t);
  }, [rank]);

  const isTopPick = rank === 0;

  return (
    <div
      className={`relative rounded-2xl p-6 transition-all duration-500 hover:scale-[1.005] ${
        mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
      }`}
      style={{
        background: '#111118',
        border: `1px solid ${isTopPick ? '#7C5CFC44' : '#1A1A2A'}`,
        boxShadow: isTopPick
          ? '0 0 40px rgba(124, 92, 252, 0.1), 0 4px 20px rgba(0,0,0,0.3)'
          : '0 1px 3px rgba(0,0,0,0.3)',
      }}
    >
      {/* Top Pick Badge */}
      {isTopPick && (
        <div
          className="absolute -top-3 left-6 px-3 py-1 rounded-full text-xs font-bold tracking-wide"
          style={{
            background: 'linear-gradient(135deg, #7C5CFC, #6B4EE8)',
            color: 'white',
            boxShadow: '0 2px 10px rgba(124, 92, 252, 0.4)',
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          ★ TOP PICK
        </div>
      )}

      {/* Header: Brand + Model + Scores */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <span
            className="text-[10px] font-bold tracking-[0.15em] uppercase block mb-1"
            style={{ color: '#55556A', fontFamily: "'DM Sans', sans-serif" }}
          >
            {shoe.brand}
          </span>
          <h3
            className="text-xl font-bold mb-1"
            style={{ color: '#E8E8ED', fontFamily: "'DM Sans', sans-serif" }}
          >
            {shoe.model}
          </h3>
          {/* Category tag */}
          <span
            className="inline-block px-2.5 py-0.5 rounded-md text-[11px] font-medium"
            style={{ background: '#1A1A2A', color: '#8888A0', fontFamily: "'Figtree', sans-serif" }}
          >
            {shoe.category}
          </span>
        </div>
        <div className="flex flex-col items-end gap-2">
          {/* Match score */}
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold"
            style={{ background: '#00C89618', color: '#00C896', fontFamily: "'DM Sans', sans-serif" }}
          >
            {shoe.matchScore}% match
          </div>
          {/* Review score */}
          <ReviewScoreBadge score={shoe.reviewScore} />
        </div>
      </div>

      {/* Best For line */}
      {shoe.bestFor && (
        <div
          className="flex items-center gap-2 mb-4 px-3 py-2 rounded-lg"
          style={{ background: '#0A0A0F', border: '1px solid #1A1A2A' }}
        >
          <span className="text-xs" style={{ color: '#55556A' }}>Best for:</span>
          <span className="text-xs font-medium" style={{ color: '#A78BFA', fontFamily: "'Figtree', sans-serif" }}>
            {shoe.bestFor}
          </span>
        </div>
      )}

      {/* Tech Specs */}
      <div className="space-y-1.5 mb-4">
        {shoe.foam && (
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold tracking-wider uppercase w-12" style={{ color: '#55556A' }}>FOAM</span>
            <span className="text-xs" style={{ color: '#A78BFA', fontFamily: "'Figtree', sans-serif" }}>{shoe.foam}</span>
          </div>
        )}
        {shoe.plate && (
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold tracking-wider uppercase w-12" style={{ color: '#55556A' }}>PLATE</span>
            <span className="text-xs" style={{ color: '#FF9F43', fontFamily: "'Figtree', sans-serif" }}>{shoe.plate}</span>
          </div>
        )}
      </div>

      {/* AI Explanation */}
      <div className="p-4 rounded-xl mb-4" style={{ background: '#0A0A0F', border: '1px solid #1A1A2A' }}>
        <p className="text-sm leading-relaxed italic" style={{ color: '#8888A0', fontFamily: "'Figtree', sans-serif" }}>
          "{shoe.whyThisShoe}"
        </p>
      </div>

      {/* Expandable: Review + Pros/Cons */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-3 py-2 rounded-lg mb-4 text-xs transition-all hover:bg-white/5"
        style={{ border: '1px solid #1A1A2A', color: '#8888A0', fontFamily: "'Figtree', sans-serif" }}
      >
        <span>{expanded ? 'Hide details' : 'Show review details, pros & cons'}</span>
        <svg
          width="12" height="12" viewBox="0 0 12 12" fill="none"
          style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 200ms' }}
        >
          <path d="M3 5L6 8L9 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {expanded && (
        <div className="mb-4 space-y-3 animate-in" style={{ animation: 'fadeIn 200ms ease' }}>
          {/* Review Summary */}
          {shoe.reviewSummary && (
            <div className="p-3 rounded-lg" style={{ background: '#0A0A0F', border: '1px solid #1A1A2A' }}>
              <span className="text-[10px] font-bold tracking-wider uppercase block mb-1" style={{ color: '#55556A' }}>
                EXPERT REVIEWS
              </span>
              <p className="text-xs leading-relaxed" style={{ color: '#8888A0', fontFamily: "'Figtree', sans-serif" }}>
                {shoe.reviewSummary}
              </p>
            </div>
          )}

          {/* Pros */}
          {shoe.pros && shoe.pros.length > 0 && (
            <div>
              <span className="text-[10px] font-bold tracking-wider uppercase block mb-1.5" style={{ color: '#00C896' }}>
                PROS
              </span>
              <div className="space-y-1">
                {shoe.pros.map((pro, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-xs mt-0.5" style={{ color: '#00C896' }}>+</span>
                    <span className="text-xs" style={{ color: '#8888A0', fontFamily: "'Figtree', sans-serif" }}>{pro}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Cons */}
          {shoe.cons && shoe.cons.length > 0 && (
            <div>
              <span className="text-[10px] font-bold tracking-wider uppercase block mb-1.5" style={{ color: '#FF4757' }}>
                CONS
              </span>
              <div className="space-y-1">
                {shoe.cons.map((con, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-xs mt-0.5" style={{ color: '#FF4757' }}>-</span>
                    <span className="text-xs" style={{ color: '#8888A0', fontFamily: "'Figtree', sans-serif" }}>{con}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Price */}
      <div className="mb-4">
        <span className="text-2xl font-bold" style={{ color: '#E8E8ED', fontFamily: "'DM Sans', sans-serif" }}>
          {shoe.price}
        </span>
      </div>

      {/* Buy Links — including Google Shopping "Find Cheapest" */}
      <div className="space-y-2">
        {/* Primary: Find Cheapest Price */}
        {shoe.buyLinks.googleShopping && (
          <a
            href={shoe.buyLinks.googleShopping}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: 'linear-gradient(135deg, #7C5CFC, #6B4EE8)',
              color: 'white',
              boxShadow: '0 4px 20px rgba(124, 92, 252, 0.3)',
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M9.5 9.5L13 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            Find Cheapest Price
          </a>
        )}

        {/* Secondary: Retailer links */}
        <div className="flex gap-2">
          {shoe.buyLinks.amazon && (
            <a
              href={shoe.buyLinks.amazon}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-2.5 rounded-lg text-center text-xs font-medium transition-all duration-200 hover:bg-white/10"
              style={{ border: '1px solid #2A2A40', color: '#E8E8ED', fontFamily: "'Figtree', sans-serif" }}
            >
              Amazon.in
            </a>
          )}
          {shoe.buyLinks.flipkart && (
            <a
              href={shoe.buyLinks.flipkart}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-2.5 rounded-lg text-center text-xs font-medium transition-all duration-200 hover:bg-white/10"
              style={{ border: '1px solid #2A2A40', color: '#E8E8ED', fontFamily: "'Figtree', sans-serif" }}
            >
              Flipkart
            </a>
          )}
          {shoe.buyLinks.official && (
            <a
              href={shoe.buyLinks.official}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-2.5 rounded-lg text-center text-xs font-medium transition-all duration-200 hover:opacity-90"
              style={{ background: '#7C5CFC18', border: '1px solid #7C5CFC44', color: '#A78BFA', fontFamily: "'Figtree', sans-serif" }}
            >
              Official
            </a>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl p-6 animate-pulse" style={{ background: '#111118', border: '1px solid #1A1A2A' }}>
      <div className="flex justify-between mb-4">
        <div>
          <div className="h-3 w-16 rounded mb-2" style={{ background: '#1A1A2A' }} />
          <div className="h-6 w-40 rounded" style={{ background: '#1A1A2A' }} />
        </div>
        <div className="h-8 w-20 rounded-full" style={{ background: '#1A1A2A' }} />
      </div>
      <div className="h-4 w-32 rounded mb-4" style={{ background: '#1A1A2A' }} />
      <div className="space-y-2 mb-5">
        <div className="h-3 w-full rounded" style={{ background: '#1A1A2A' }} />
        <div className="h-3 w-3/4 rounded" style={{ background: '#1A1A2A' }} />
      </div>
      <div className="h-24 rounded-xl mb-5" style={{ background: '#0A0A0F' }} />
      <div className="h-8 w-28 rounded mb-5" style={{ background: '#1A1A2A' }} />
      <div className="h-12 rounded-xl mb-2" style={{ background: '#1A1A2A' }} />
      <div className="flex gap-2">
        <div className="flex-1 h-10 rounded-lg" style={{ background: '#1A1A2A' }} />
        <div className="flex-1 h-10 rounded-lg" style={{ background: '#1A1A2A' }} />
      </div>
    </div>
  );
}

export default function ResultsPage({ recommendations, onRetake, onChat, onBrowse }: ResultsPageProps) {
  const isEmpty = recommendations.length === 0;

  return (
    <div className="min-h-screen" style={{ background: '#050507' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 md:px-12 py-6">
        <div>
          <h1
            className="text-2xl md:text-3xl font-bold"
            style={{ color: '#E8E8ED', fontFamily: "'DM Sans', sans-serif" }}
          >
            Your Perfect Matches
          </h1>
          <p className="text-sm mt-1" style={{ color: '#55556A', fontFamily: "'Figtree', sans-serif" }}>
            AI-curated from 260 shoes across 16 brands · Review scores from RunRepeat, SoleReview & RunTesters
          </p>
        </div>
        <button
          onClick={onRetake}
          className="px-4 py-2 rounded-lg text-sm transition-all duration-200 hover:bg-white/5"
          style={{ border: '1px solid #1A1A2A', color: '#8888A0', fontFamily: "'Figtree', sans-serif" }}
        >
          Retake Quiz
        </button>
      </div>

      {/* Results Grid */}
      <div className="px-6 md:px-12 pb-12">
        {isEmpty ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendations.map((shoe, i) => (
                <ShoeCard key={shoe.id} shoe={shoe} rank={i} />
              ))}
            </div>

            {/* Footer CTA */}
            <div className="text-center mt-12 space-y-4">
              <p className="text-sm" style={{ color: '#55556A', fontFamily: "'Figtree', sans-serif" }}>
                Not satisfied? Get more specific advice.
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={onChat}
                  className="px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-[1.02]"
                  style={{
                    background: 'linear-gradient(135deg, #7C5CFC, #6B4EE8)',
                    color: 'white',
                    boxShadow: '0 4px 20px rgba(124, 92, 252, 0.3)',
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  Chat with SoleMate →
                </button>
                <button
                  onClick={onBrowse}
                  className="px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200 hover:bg-white/5"
                  style={{ border: '1px solid #1A1A2A', color: '#8888A0', fontFamily: "'DM Sans', sans-serif" }}
                >
                  Browse All Shoes
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
