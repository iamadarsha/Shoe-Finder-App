import React from 'react';
import { UserProfile } from '../types';

interface Props {
  data: UserProfile;
  updateData: (key: keyof UserProfile, value: any) => void;
  onNext: () => void;
  onBack: () => void; // Usually disabled on step 1
}

const StepGoal: React.FC<Props> = ({ data, updateData, onNext }) => {
  const goals = [
    { id: 'beginner', icon: 'spa', title: 'Beginner', subtitle: 'Comfort first' },
    { id: 'fitness', icon: 'directions_run', title: 'Daily Fitness', subtitle: '5K / 10K runs' },
    { id: 'speed', icon: 'speed', title: 'Race Day Speed', subtitle: 'PB chasing' },
    { id: 'marathon', icon: 'flag', title: 'Marathon Training', subtitle: 'The long haul' },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 pt-6 pb-2">
        <h1 className="text-[32px] font-extrabold leading-[1.1] tracking-tight text-slate-900 dark:text-white mb-6">
          What's your <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-[#ccff00]">
            running goal?
          </span>
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-6 scroll-smooth space-y-4">
        {goals.map((g) => (
          <label key={g.id} className="group cursor-pointer block">
            <input
              type="radio"
              name="running_goal"
              className="peer sr-only"
              value={g.id}
              checked={data.goal === g.id}
              onChange={() => updateData('goal', g.id)}
            />
            <div className="relative flex items-center gap-5 p-5 rounded-[2rem] border-2 border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 hover:border-primary/50 dark:hover:bg-white/10 transition-all duration-300">
              <div className="h-14 w-14 rounded-full bg-[#ccff00]/20 flex items-center justify-center shrink-0 text-[#a3e635]">
                <span className="material-symbols-outlined text-[28px]">{g.icon}</span>
              </div>
              <div className="flex flex-col grow">
                <span className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">
                  {g.title}
                </span>
                <span className="text-sm font-medium text-slate-500 dark:text-[#cbcb90]">
                  {g.subtitle}
                </span>
              </div>
              <div className="radio-indicator h-6 w-6 rounded-full border-2 border-slate-300 dark:border-white/20 relative flex items-center justify-center transition-all duration-300">
                {data.goal === g.id && (
                  <div className="w-2.5 h-2.5 bg-background-dark rounded-full animate-bounce" style={{ backgroundColor: '#f2f20d' }}></div>
                )}
              </div>
            </div>
          </label>
        ))}
      </div>

      <div className="flex-none px-6 py-6 pb-8 border-t border-slate-200 dark:border-white/5">
        <button
          onClick={onNext}
          disabled={!data.goal}
          className="w-full h-14 rounded-full bg-primary hover:bg-[#d9d90d] disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] text-background-dark text-base font-bold tracking-wide transition-all flex items-center justify-center shadow-[0_0_25px_rgba(242,242,13,0.2)]"
        >
          Continue
        </button>

        {/* --- ADDED FOOTER SECTION --- */}
        <div className="mt-8 text-center pb-2">
          <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">
            Made by{' '}
            <a 
              href="https://www.instagram.com/iamadarsha/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:text-white transition-colors underline decoration-primary/50 underline-offset-4"
            >
              Adarsha
            </a>
          </p>
          <p className="text-slate-400 dark:text-slate-600 text-[10px] font-medium italic opacity-70">
            disclaimer - not a coder, not an engineer.
          </p>
        </div>
      </div>
    </div>
  );
};

export default StepGoal;
