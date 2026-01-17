import React from 'react';
import { UserProfile } from '../types';

interface Props {
  data: UserProfile;
  updateData: (key: keyof UserProfile, value: any) => void;
  onNext: () => void;
  onBack: () => void;
}

const StepFeel: React.FC<Props> = ({ data, updateData, onNext }) => {
  const options = [
    { 
      id: 'plush', 
      title: 'Plush Cloud', 
      desc: 'Maximum softness for easy recovery.', 
      icon: 'cloud',
      color: 'text-blue-300',
      bg: 'bg-blue-500/20'
    },
    { 
      id: 'balanced', 
      title: 'Balanced', 
      desc: 'Versatile mix of comfort & response.', 
      icon: 'balance',
      color: 'text-primary',
      bg: 'bg-primary/20'
    },
    { 
      id: 'firm', 
      title: 'Firm & Snappy', 
      desc: 'Fast feel for speed work and racing.', 
      icon: 'bolt',
      color: 'text-orange-400',
      bg: 'bg-orange-500/20'
    },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 pt-6 pb-2">
        <h1 className="text-[32px] font-extrabold leading-[1.1] tracking-tight text-slate-900 dark:text-white mb-2">
          How should the <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-[#ccff00]">
            run feel?
          </span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Select the cushioning level that matches your ride.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-6 pt-4 space-y-4">
        {options.map((opt) => (
          <label key={opt.id} className="group cursor-pointer block relative z-10">
            {/* Hidden Input ensuring clickability */}
            <input
              type="radio"
              name="feel"
              className="peer sr-only"
              value={opt.id}
              checked={data.feel === opt.id}
              onChange={() => updateData('feel', opt.id)}
            />
            
            {/* The Visual Card */}
            <div className={`relative flex items-center justify-between p-5 rounded-[2rem] border-2 transition-all duration-200 
              border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 
              hover:border-primary/50 
              peer-checked:border-primary peer-checked:bg-white/10 peer-checked:shadow-[0_0_15px_rgba(242,242,13,0.1)]
            `}>
              
              <div className="flex flex-col gap-1 z-10 relative">
                <span className={`text-lg font-bold transition-colors text-slate-900 dark:text-white group-hover:text-primary peer-checked:text-primary`}>
                  {opt.title}
                </span>
                <span className="text-sm font-medium text-slate-500 dark:text-[#cbcb90] max-w-[160px]">
                  {opt.desc}
                </span>
              </div>

              {/* Icon Visual */}
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border border-white/5 transition-all 
                 ${opt.bg} ${opt.color} 
                 peer-checked:bg-primary peer-checked:text-black
              `}>
                <span className="material-symbols-outlined text-3xl">
                  {opt.icon}
                </span>
              </div>

              {/* Checkmark Overlay */}
              <div className="absolute top-4 right-4 opacity-0 peer-checked:opacity-100 text-primary transition-opacity">
                <span className="material-symbols-outlined text-xl filled">check_circle</span>
              </div>
            </div>
          </label>
        ))}
      </div>

      <div className="flex-none px-6 py-6 pb-8 border-t border-slate-200 dark:border-white/5">
        <button
          onClick={onNext}
          disabled={!data.feel}
          className="w-full h-14 rounded-full bg-primary hover:bg-[#d9d90d] disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] text-background-dark text-base font-bold tracking-wide transition-all flex items-center justify-center shadow-[0_0_25px_rgba(242,242,13,0.2)]"
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default StepFeel;
