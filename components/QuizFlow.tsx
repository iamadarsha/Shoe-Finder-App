import { useState, useEffect } from 'react';
import { UserPreferences, UseCase, Experience, FootType, Mileage, Budget, ShoeRecommendation, Shoe } from '../types';
import { getShoeRecommendations } from '../services/gemini';

interface QuizFlowProps {
  onComplete: (prefs: UserPreferences, recs: ShoeRecommendation[]) => void;
  onBack: () => void;
  shoeDatabase: Shoe[];
}

interface QuizOption {
  value: string;
  label: string;
  icon: string;
  desc?: string;
}

const steps: { title: string; subtitle: string; options: QuizOption[] }[] = [
  {
    title: 'What do you use shoes for?',
    subtitle: 'Pick your primary activity',
    options: [
      { value: 'running', label: 'Running', icon: '🏃', desc: 'Daily runs, races, marathons' },
      { value: 'casual', label: 'Casual', icon: '👟', desc: 'Everyday wear, walking' },
      { value: 'training', label: 'Training', icon: '💪', desc: 'Gym, HIIT, cross-training' },
      { value: 'walking', label: 'Walking', icon: '🚶', desc: 'Long walks, commuting' },
      { value: 'trail', label: 'Trail', icon: '🏔️', desc: 'Off-road, mountain paths' },
      { value: 'racing', label: 'Racing', icon: '⚡', desc: '5K, 10K, marathon racing' },
    ],
  },
  {
    title: 'Your running experience?',
    subtitle: 'This helps us match shoe complexity',
    options: [
      { value: 'beginner', label: 'Beginner', icon: '🌱', desc: 'Just starting out, < 1 year' },
      { value: 'intermediate', label: 'Intermediate', icon: '⚡', desc: '1-3 years of regular running' },
      { value: 'advanced', label: 'Advanced', icon: '🏆', desc: '3+ years, races, specific goals' },
    ],
  },
  {
    title: "What's your foot type?",
    subtitle: 'Check your wet footprint or old shoe wear pattern',
    options: [
      { value: 'neutral', label: 'Neutral', icon: '🦶', desc: 'Even wear pattern' },
      { value: 'flat', label: 'Flat Feet', icon: '🦶', desc: 'Full footprint, inward roll' },
      { value: 'high_arch', label: 'High Arch', icon: '🦶', desc: 'Thin print, outward roll' },
    ],
  },
  {
    title: 'Weekly running mileage?',
    subtitle: 'How far you typically run each week',
    options: [
      { value: 'low', label: '0–20 km', icon: '🏁', desc: 'Light runner / beginner' },
      { value: 'medium', label: '20–50 km', icon: '🏁', desc: 'Regular runner' },
      { value: 'high', label: '50+ km', icon: '🏁', desc: 'High mileage / competitive' },
    ],
  },
  {
    title: "What's your budget?",
    subtitle: 'All prices in Indian Rupees (₹)',
    options: [
      { value: 'budget', label: 'Under ₹8,000', icon: '💰', desc: 'Great value options available' },
      { value: 'mid', label: '₹8,000 – ₹15,000', icon: '💎', desc: 'Best price-performance range' },
      { value: 'premium', label: '₹15,000+', icon: '👑', desc: 'Premium & elite tech' },
    ],
  },
];

const prefKeys: (keyof UserPreferences)[] = ['useCase', 'experience', 'footType', 'mileage', 'budget'];

export default function QuizFlow({ onComplete, onBack, shoeDatabase }: QuizFlowProps) {
  const [step, setStep] = useState(0);
  const [prefs, setPrefs] = useState<UserPreferences>({
    useCase: null,
    experience: null,
    footType: null,
    mileage: null,
    budget: null,
  });
  const [selected, setSelected] = useState<string | null>(null);
  const [transitioning, setTransitioning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [quizError, setQuizError] = useState<string | null>(null);
  const [lastSubmittedPrefs, setLastSubmittedPrefs] = useState<UserPreferences | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);

  const currentStep = steps[step];
  const progress = ((step + 1) / 5) * 100;

  // Restore selection if going back
  useEffect(() => {
    const key = prefKeys[step];
    setSelected((prefs[key] as string) || null);
  }, [step, prefs]);

  const handleSelect = (value: string) => {
    setSelected(value);
    setQuizError(null);
  };

  const fetchRecommendations = async (finalPrefs: UserPreferences) => {
    setLoading(true);
    setQuizError(null);
    setLastSubmittedPrefs(finalPrefs);

    try {
      const recs = await getShoeRecommendations(finalPrefs, shoeDatabase);
      if (!Array.isArray(recs) || recs.length === 0) {
        setQuizError('Something went wrong. Please try again.');
        setLoading(false);
        return;
      }
      onComplete(finalPrefs, recs);
    } catch (err) {
      console.error('AI recommendation failed:', err);
      setQuizError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  const handleNext = async () => {
    if (!selected) return;

    const key = prefKeys[step];
    const newPrefs = { ...prefs, [key]: selected };
    setPrefs(newPrefs);

    if (step < 4) {
      setTransitioning(true);
      setTimeout(() => {
        setStep(step + 1);
        setSelected(null);
        setTransitioning(false);
      }, 200);
    } else {
      // Final step — call AI
      await fetchRecommendations(newPrefs);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setTransitioning(true);
      setTimeout(() => {
        setStep(step - 1);
        setTransitioning(false);
      }, 200);
    } else {
      onBack();
    }
  };

  // ── Loading State ──
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ background: '#050507' }}>
        <div className="relative mb-8">
          <div
            className="w-20 h-20 rounded-2xl animate-pulse"
            style={{ background: 'linear-gradient(135deg, #7C5CFC, #00E59B)' }}
          />
          <div
            className="absolute inset-0 w-20 h-20 rounded-2xl animate-ping opacity-20"
            style={{ background: '#7C5CFC' }}
          />
        </div>
        <h2
          className="text-xl font-semibold mb-3"
          style={{ color: '#E8E8ED', fontFamily: "'DM Sans', sans-serif" }}
        >
          Analyzing 260 shoes...
        </h2>
        <p className="text-sm" style={{ color: '#8888A0', fontFamily: "'Figtree', sans-serif" }}>
          SoleMate AI is matching your profile across 16 brands
        </p>

        {/* Loading skeleton cards */}
        <div className="flex gap-4 mt-10">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-24 h-32 rounded-xl animate-pulse"
              style={{
                background: '#0C0C12',
                border: '1px solid #1A1A2A',
                animationDelay: `${i * 150}ms`,
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#050507' }}>
      {/* ── Header / Progress ── */}
      <div className="px-6 md:px-12 pt-6">
        {/* Back + step counter */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-sm transition-colors duration-200 hover:text-white"
            style={{ color: '#8888A0', fontFamily: "'Figtree', sans-serif" }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 13L5 8L10 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back
          </button>
          <span className="text-xs font-medium" style={{ color: '#44445A', fontFamily: "'DM Sans', sans-serif" }}>
            Step {step + 1} of 5
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1 rounded-full overflow-hidden" style={{ background: '#1A1A2A' }}>
          <div
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #7C5CFC, #00E59B)',
            }}
          />
        </div>
      </div>

      {/* ── Question Area ── */}
      <div
        className={`flex-1 flex flex-col items-center justify-center px-6 py-12 transition-all duration-200 ${
          transitioning ? 'opacity-0 translate-y-4' : mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        <h2
          className="text-3xl md:text-4xl font-bold mb-2 text-center"
          style={{ color: '#E8E8ED', fontFamily: "'DM Sans', sans-serif" }}
        >
          {currentStep.title}
        </h2>
        <p
          className="text-sm mb-10 text-center"
          style={{ color: '#8888A0', fontFamily: "'Figtree', sans-serif" }}
        >
          {currentStep.subtitle}
        </p>

        {/* Option cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 w-full max-w-2xl">
          {currentStep.options.map((opt) => {
            const isSelected = selected === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => handleSelect(opt.value)}
                className="group relative text-left p-5 rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background: isSelected ? '#7C5CFC15' : '#0C0C12',
                  border: `1px solid ${isSelected ? '#7C5CFC' : '#1A1A2A'}`,
                  boxShadow: isSelected ? '0 0 30px rgba(124, 92, 252, 0.1)' : 'none',
                }}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{opt.icon}</span>
                  <div>
                    <span
                      className="block text-base font-semibold"
                      style={{
                        color: isSelected ? '#A78BFA' : '#E8E8ED',
                        fontFamily: "'DM Sans', sans-serif",
                      }}
                    >
                      {opt.label}
                    </span>
                    {opt.desc && (
                      <span
                        className="block text-xs mt-1"
                        style={{ color: '#44445A', fontFamily: "'Figtree', sans-serif" }}
                      >
                        {opt.desc}
                      </span>
                    )}
                  </div>
                </div>
                {/* Selection indicator */}
                <div
                  className="absolute top-4 right-4 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200"
                  style={{
                    borderColor: isSelected ? '#7C5CFC' : '#2A2A40',
                    background: isSelected ? '#7C5CFC' : 'transparent',
                  }}
                >
                  {isSelected && (
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M2 5L4 7L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {quizError && step === 4 && (
          <div
            className="mt-6 w-full max-w-2xl rounded-xl p-4"
            style={{ background: '#0C0C12', border: '1px solid #3A1A1A' }}
          >
            <p className="text-sm mb-3" style={{ color: '#FF9FA8', fontFamily: "'Figtree', sans-serif" }}>
              {quizError}
            </p>
            <button
              onClick={() => lastSubmittedPrefs && fetchRecommendations(lastSubmittedPrefs)}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:opacity-90"
              style={{
                background: 'linear-gradient(135deg, #7C5CFC 0%, #6B4EE8 100%)',
                color: '#FFFFFF',
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              Try Again
            </button>
          </div>
        )}

        {/* Next button */}
        <button
          onClick={handleNext}
          disabled={!selected}
          className="mt-10 px-10 py-3.5 rounded-xl text-white font-semibold text-base transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100"
          style={{
            background: selected
              ? 'linear-gradient(135deg, #7C5CFC 0%, #6B4EE8 100%)'
              : '#1A1A2A',
            boxShadow: selected ? '0 4px 25px rgba(124, 92, 252, 0.3)' : 'none',
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          {step === 4 ? 'Get My Recommendations' : 'Continue'}
        </button>
      </div>
    </div>
  );
}
