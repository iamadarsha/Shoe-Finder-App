import React, { useState } from 'react';
import { UserProfile } from '../types';

interface Props {
  data: UserProfile;
  updateData: (key: keyof UserProfile, value: any) => void;
  onNext: () => void;
  onBack: () => void;
}

const StepProfile: React.FC<Props> = ({ data, updateData, onNext, onBack }) => {
  // State to handle which info modal is open
  const [activeInfo, setActiveInfo] = useState<string | null>(null);

  const injuries = [
    'Shin Splints', 'Knee Pain', 'Achilles Issue', 'Plantar Fasciitis', 'Ankle Instability', 'Calf Strain'
  ];

  const arches = [
    { 
      id: 'flat', 
      title: 'Low Arch (Flat Feet)', 
      icon_scale: 'scale-x-125', // Wider footprint
      description: 'Your feet roll inward (overpronation) when you run. You likely need "Stability" or "Motion Control" shoes to prevent injury.'
    },
    { 
      id: 'neutral', 
      title: 'Medium Arch (Normal)', 
      icon_scale: 'scale-100', // Normal
      description: 'Your feet roll inward slightly to absorb shock, which is healthy. You can wear most "Neutral" or "Daily Trainer" shoes.'
    },
    { 
      id: 'high', 
      title: 'High Arch', 
      icon_scale: 'scale-x-75', // Narrower footprint
      description: 'Your feet are rigid and don\'t roll inward much (supination). You need "Cushioned" shoes to absorb shock.'
    },
  ];

  const toggleInjury = (injury: string) => {
    const current = data.injuries;
    if (current.includes(injury)) {
      updateData('injuries', current.filter(i => i !== injury));
    } else {
      updateData('injuries', [...current, injury]);
    }
  };

  const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateData('weight', parseInt(e.target.value) || '');
  };

  return (
    <div className="flex flex-col h-full relative">
      <div className="px-6 pt-6 pb-2">
        <h1 className="text-[32px] font-extrabold leading-[1.1] tracking-tight text-slate-900 dark:text-white mb-2">
          Tell us about <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-[#ccff00]">
            your stride.
          </span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          This helps us find shoes with the right cushioning and support.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-6 scroll-smooth">
        
        {/* Weight Section */}
        <div className="mb-8">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 ml-1">
            Current Weight
          </label>
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-[24px]">monitor_weight</span>
            </div>
            <input
              className="w-full bg-white dark:bg-white/5 border-2 border-slate-200 dark:border-white/10 focus:border-primary focus:ring-0 text-slate-900 dark:text-white text-2xl font-bold rounded-2xl py-4 pl-12 pr-16 outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-white/20"
              placeholder="0"
              type="number"
              value={data.weight || ''}
              onChange={handleWeightChange}
            />
            <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg pointer-events-none">
              kg
            </div>
          </div>
        </div>

        {/* Arch Type Section */}
        <div className="mb-8">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 ml-1">
            Arch Type
          </label>
          <div className="grid grid-cols-3 gap-3">
            {arches.map((arch) => (
              <div key={arch.id} className="relative">
                <label className="cursor-pointer group block h-full">
                  <input
                    type="radio"
                    name="arch"
                    className="peer sr-only"
                    checked={data.arch === arch.id}
                    onChange={() => updateData('arch', arch.id)}
                  />
                  <div className="flex flex-col items-center justify-center p-3 rounded-2xl border-2 border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 peer-checked:bg-primary/10 peer-checked:border-primary transition-all h-32 hover:border-primary/50 relative">
                    
                    {/* Footprint Icon with CSS Transform for Shape */}
                    <span className={`material-symbols-outlined text-4xl mb-3 text-slate-300 dark:text-white/20 peer-checked:text-primary transition-all duration-300 ${arch.icon_scale}`} style={{ transformOrigin: 'center' }}>
                      footprint
                    </span>
                    
                    <span className="text-xs font-bold text-center text-slate-600 dark:text-white/80 peer-checked:text-slate-900 dark:peer-checked:text-white leading-tight">
                      {arch.title}
                    </span>

                    {/* Checkmark */}
                    <div className="absolute top-2 right-2 opacity-0 peer-checked:opacity-100 text-primary transition-opacity">
                      <span className="material-symbols-outlined text-base filled">check_circle</span>
                    </div>
                  </div>
                </label>

                {/* Info Button */}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveInfo(activeInfo === arch.id ? null : arch.id);
                  }}
                  className="absolute top-2 left-2 w-6 h-6 rounded-full bg-slate-100 dark:bg-white/10 hover:bg-primary hover:text-black flex items-center justify-center text-slate-400 transition-colors z-10"
                >
                  <span className="material-symbols-outlined text-[14px]">info</span>
                </button>

                {/* Info Popover */}
                {activeInfo === arch.id && (
                  <div className="absolute bottom-full left-0 w-[200%] z-20 mb-2 p-3 bg-slate-800 text-white text-xs rounded-xl shadow-xl border border-white/10 animate-fade-in pointer-events-none">
                    {arch.description}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Injuries Section */}
        <div className="mb-4">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 ml-1">
            Past Injuries / Concerns
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => updateData('injuries', [])}
              className={`px-4 py-2 rounded-full border-2 text-sm font-bold transition-all ${
                data.injuries.length === 0
                  ? 'bg-primary border-primary text-black'
                  : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500 dark:text-white/60 hover:border-primary/50'
              }`}
            >
              None
            </button>
            {injuries.map((injury) => (
              <button
                key={injury}
                onClick={() => toggleInjury(injury)}
                className={`px-4 py-2 rounded-full border-2 text-sm font-bold transition-all ${
                  data.injuries.includes(injury)
                    ? 'bg-primary border-primary text-black'
                    : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500 dark:text-white/60 hover:border-primary/50'
                }`}
              >
                {injury}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-none px-6 py-6 pb-8 border-t border-slate-200 dark:border-white/5">
        <button
          onClick={onNext}
          className="w-full h-14 rounded-full bg-primary hover:bg-[#d9d90d] active:scale-[0.98] text-background-dark text-base font-bold tracking-wide transition-all flex items-center justify-center shadow-[0_0_25px_rgba(242,242,13,0.2)]"
        >
          Continue
        </button>
      </div>
      
      {/* Click outside to close info logic overlay */}
      {activeInfo && (
        <div 
          className="fixed inset-0 z-0 bg-transparent" 
          onClick={() => setActiveInfo(null)}
        />
      )}
    </div>
  );
};

export default StepProfile;
