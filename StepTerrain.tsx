import React from 'react';
import { UserProfile } from '../types';

interface Props {
  data: UserProfile;
  updateData: (key: keyof UserProfile, value: any) => void;
  onNext: () => void;
  onBack: () => void;
}

const StepTerrain: React.FC<Props> = ({ data, updateData, onNext }) => {
  const terrains = [
    { id: 'concrete', icon: 'add_road', title: 'Concrete', subtitle: 'Pavements & Sidewalks' },
    { id: 'broken', icon: 'edit_road', title: 'Broken Tar', subtitle: 'Rough & Uneven' },
    { id: 'treadmill', icon: 'directions_run', title: 'Treadmill', subtitle: 'Indoor Gym' },
    { id: 'trails', icon: 'landscape', title: 'Mud Tracks', subtitle: 'Trails & Dirt' },
  ];

  const toggleTerrain = (id: string) => {
    const current = data.terrain;
    if (current.includes(id)) {
      updateData('terrain', current.filter((t) => t !== id));
    } else {
      updateData('terrain', [...current, id]);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 pt-6 pb-4">
        <h1 className="text-slate-900 dark:text-white tracking-tight text-[32px] font-extrabold leading-[1.15] mb-3">
          Where do you <br />
          usually <span className="text-primary underline decoration-4 decoration-primary/30 underline-offset-4">run?</span>
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-base font-medium leading-relaxed">
          Indian roads can be tough. Let us know so we can pick the right sole.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-6">
        <div className="grid grid-cols-2 gap-4">
          {terrains.map((t) => {
            const isSelected = data.terrain.includes(t.id);
            return (
              <label key={t.id} className="group relative cursor-pointer">
                <input
                  type="checkbox"
                  className="peer sr-only"
                  checked={isSelected}
                  onChange={() => toggleTerrain(t.id)}
                />
                <div className={`flex flex-col h-40 w-full items-start justify-between rounded-2xl border-2 p-4 transition-all duration-300 ease-out 
                  ${isSelected 
                    ? 'border-primary bg-slate-50 dark:bg-white/10 shadow-[0_0_20px_rgba(242,242,13,0.15)]' 
                    : 'border-transparent bg-white dark:bg-surface-dark'
                  }`}
                >
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors 
                    ${isSelected 
                      ? 'bg-primary text-background-dark' 
                      : 'bg-slate-100 dark:bg-white/5 text-slate-900 dark:text-white'
                    }`}
                  >
                    <span className="material-symbols-outlined">{t.icon}</span>
                  </div>
                  <div>
                    <p className={`font-bold text-lg leading-tight mb-1 transition-colors ${isSelected ? 'text-slate-900 dark:text-white' : 'text-slate-900 dark:text-white group-hover:text-primary'}`}>
                      {t.title}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-normal">
                      {t.subtitle}
                    </p>
                  </div>
                  {isSelected && (
                    <div className="absolute top-4 right-4 text-primary animate-in fade-in zoom-in">
                      <span className="material-symbols-outlined fill-1">check_circle</span>
                    </div>
                  )}
                </div>
              </label>
            );
          })}
        </div>
      </div>

      <div className="relative z-20 w-full bg-transparent px-6 pb-8 pt-4">
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2 mb-4 opacity-60">
            <span className="material-symbols-outlined text-sm text-slate-500 dark:text-slate-400">info</span>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">You can select more than one</p>
          </div>
          <button
            onClick={onNext}
            disabled={data.terrain.length === 0}
            className="group relative flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-full h-14 bg-primary text-background-dark text-lg font-bold leading-normal tracking-wide shadow-[0_0_20px_rgba(242,242,13,0.3)] transition-transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="relative z-10">Continue</span>
            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity"></div>
            <span className="material-symbols-outlined relative z-10 ml-2 text-xl group-hover:translate-x-1 transition-transform">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default StepTerrain;