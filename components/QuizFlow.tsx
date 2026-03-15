import { useState, useEffect } from 'react';
import { UserPreferences, ShoeRecommendation, Shoe } from '../types';
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
      setLoading(true);
      try {
        const recs = await getShoeRecommendations(newPrefs, shoeDatabase);
        onComplete(newPrefs, recs);
      } catch (err) {
        console.error('AI recommendation failed:', err);
        onComplete(newPrefs, []);
      }
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
      <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-[#050507]">
        <div className="relative mb-8 flex items-center justify-center">
          <div className="w-20 h-20 rounded-2xl animate-pulse bg-gradient-to-br from-[#7C5CFC] to-[#00C896]" />
          <div className="absolute inset-0 w-20 h-20 rounded-2xl animate-ping opacity-20 bg-[#7C5CFC]" />
        </div>
        <h2 className="text-xl font-semibold mb-3 text-[#E8E8ED] font-heading">
          Analyzing 233 shoes...
        </h2>
        <p className="text-sm text-[#8888A0] font-body">
          SoleMate AI is matching your profile across 15 brands
        </p>

        {/* Loading skeleton cards */}
        <div className="flex gap-4 mt-10">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-24 h-32 rounded-xl animate-pulse bg-[#111118] border border-[#1A1A2A]"
              style={{ animationDelay: `${i * 150}ms` }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#050507]">
      {/* ── Header / Progress ── */}
      <div className="px-6 md:px-12 pt-6">
        {/* Back + step counter */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-sm transition-colors duration-200 text-[#8888A0] hover:text-white font-body"
          >
            ← Back
          </button>
          <span className="text-xs font-medium text-[#55556A] font-heading">
            Step {step + 1} of 5
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1 rounded-full overflow-hidden bg-[#1A1A2A]">
          <div
            className="h-full rounded-full transition-all duration-500 ease-out bg-gradient-to-r from-[#7C5CFC] to-[#00C896]"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* ── Question Area ── */}
      <div
        className={`flex-1 flex flex-col items-center justify-center px-6 py-12 transition-all duration-200 ${
          transitioning ? 'opacity-0 translate-y-1' : mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'
        }`}
      >
        <h2 className="text-3xl md:text-4xl font-bold mb-2 text-center text-[#E8E8ED] font-heading">
          {currentStep.title}
        </h2>
        <p className="text-sm mb-10 text-center text-[#8888A0] font-body">
          {currentStep.subtitle}
        </p>

        {/* Option cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-2xl sm:gap-6">
          {currentStep.options.map((opt) => {
            const isSelected = selected === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => handleSelect(opt.value)}
                className={`group relative text-left p-5 rounded-xl transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-[#7C5CFC44] ${
                  isSelected
                    ? 'scale-[0.98] bg-[#7C5CFC15] border-[#7C5CFC] shadow-[0_0_30px_rgba(124,92,252,0.1)]'
                    : 'hover:scale-[1.02] active:scale-[0.98] bg-[#111118] border-[#1A1A2A] hover:border-[#2A2A40]'
                } border`}
              >
                <div className="flex items-start gap-4">
                  <span className="text-3xl">{opt.icon}</span>
                  <div>
                    <span className={`block text-base font-semibold font-heading ${isSelected ? 'text-[#A78BFA]' : 'text-[#E8E8ED]'}`}>
                      {opt.label}
                    </span>
                    {opt.desc && (
                      <span className="block text-xs mt-1 text-[#55556A] font-body">
                        {opt.desc}
                      </span>
                    )}
                  </div>
                </div>
                {/* Selection indicator */}
                <div
                  className={`absolute top-4 right-4 w-5 h-5 rounded-full border-[2px] flex items-center justify-center transition-all duration-200 ${
                    isSelected ? 'border-[#7C5CFC] bg-[#7C5CFC]' : 'border-[#2A2A40] bg-transparent group-hover:border-[#7C5CFC44]'
                  }`}
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

        {/* Next button */}
        <button
          onClick={handleNext}
          disabled={!selected}
          className={`mt-10 px-10 py-3.5 rounded-xl text-white font-semibold text-base transition-all duration-200 font-heading focus:outline-none ${
            selected
              ? 'hover:scale-[1.02] active:scale-[0.98] focus:ring-1 focus:ring-[#7C5CFC44] bg-gradient-to-br from-[#7C5CFC] to-[#6B4EE8] shadow-[0_4px_25px_rgba(124,92,252,0.35)]'
              : 'opacity-30 cursor-not-allowed bg-[#1A1A2A]'
          }`}
        >
          {step === 4 ? 'Get My Recommendations' : 'Continue'}
        </button>
      </div>
    </div>
  );
}
