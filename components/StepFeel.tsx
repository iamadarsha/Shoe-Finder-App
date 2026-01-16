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
      icon: 'cloud',
      title: 'Plush Cloud',
      desc: 'Maximum softness for easy recovery days.',
      bg: 'https://images.unsplash.com/photo-1533241249-147314545274?auto=format&fit=crop&q=80&w=200&h=200'
    },
    {
      id: 'balanced',
      icon: 'balance',
      title: 'Balanced',
      desc: 'Versatile mix of comfort and response.',
      bg: 'https://images.unsplash.com/photo-1614850523060-8da1d56e37ad?auto=format&fit=crop&q=80&w=200&h=200'
    },
    {
      id: 'firm',
      icon: 'bolt',
      title: 'Firm & Snappy',
      desc: 'Fast feel for speed work and racing.',
      bg: 'https://images.unsplash.com/photo-1495819903255-00fdf138a320?auto=format&fit=crop&q=80&w=200&h=200'
    },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 pt-6 pb-2">
        <h1 className="text-gray-900 dark:text-white text-3xl md:text-4xl font-extrabold leading-tight tracking-tight">
          How should the <br />
          <span className="text-primary">run feel?</span>
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-base font-medium leading-normal pt-3">
          Select the cushioning level that matches your preferred ride.
        </p>
      </div>

      <main className="flex-1 px-4 py-6 flex flex-col gap-4 overflow-y-auto">
        {options.map((opt) => (
          <label key={opt.id} className="group relative flex cursor-pointer items-center justify-between gap-4 rounded-xl bg-white dark:bg-surface-dark p-4 shadow-sm ring-1 ring-transparent transition-all hover:scale-[1.01] active:scale-[0.99]">
            <input
              type="radio"
              name="feel"
              className="peer sr-only"
              checked={data.feel === opt.id}
              onChange={() => updateData('feel', opt.id)}
            />
            {/* Outline logic handled by CSS or conditional classes manually if needed, peer-checked usually works but ring utility is easier */}
            <div className={`absolute inset-0 rounded-xl ring-2 pointer-events-none transition-all ${data.feel === opt.id ? 'ring-primary' : 'ring-transparent'}`}></div>

            <div className="flex flex-col gap-1 flex-[2_2_0px] z-10">
              <div className="flex items-center gap-2 mb-1">
                <span className={`material-symbols-outlined transition-colors ${data.feel === opt.id ? 'text-primary' : 'text-gray-400 dark:text-gray-500'}`}>
                  {opt.icon}
                </span>
                <p className="text-gray-900 dark:text-white text-lg font-bold leading-tight">{opt.title}</p>
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-sm font-normal leading-normal">
                {opt.desc}
              </p>
            </div>
            
            <div className="h-20 w-24 shrink-0 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800 relative">
               <img src={opt.bg} alt="" className="w-full h-full object-cover opacity-80 mix-blend-overlay" />
               <div className="absolute inset-0 bg-gradient-to-r from-transparent to-blue-900/20 pointer-events-none"></div>
            </div>

            {data.feel === opt.id && (
              <div className="absolute right-4 top-4 h-6 w-6 flex items-center justify-center rounded-full bg-primary text-black z-20">
                <span className="material-symbols-outlined text-sm font-bold">check</span>
              </div>
            )}
          </label>
        ))}
      </main>

      <div className="sticky bottom-0 z-20 w-full bg-gradient-to-t from-background-light via-background-light to-transparent dark:from-background-dark dark:via-background-dark dark:to-transparent pb-8 pt-4 px-6">
        <button
          onClick={onNext}
          disabled={!data.feel}
          className="w-full rounded-full bg-primary py-4 px-6 text-black font-extrabold text-lg shadow-[0_0_15px_rgba(242,242,13,0.3)] hover:shadow-[0_0_25px_rgba(242,242,13,0.5)] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
        >
          Find My Shoes
          <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
        </button>
      </div>
    </div>
  );
};

export default StepFeel;
