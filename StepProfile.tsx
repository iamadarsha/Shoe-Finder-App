import React from 'react';
import { UserProfile } from '../types';

interface Props {
  data: UserProfile;
  updateData: (key: keyof UserProfile, value: any) => void;
  onNext: () => void;
  onBack: () => void;
}

const StepProfile: React.FC<Props> = ({ data, updateData, onNext }) => {
  const toggleInjury = (id: string) => {
    const current = data.injuries;
    if (id === 'none') {
      updateData('injuries', []);
      return;
    }
    // If 'none' was selected, clear it when selecting specific injuries
    let newInjuries = current.filter(i => i !== 'none');
    
    if (newInjuries.includes(id)) {
      newInjuries = newInjuries.filter((i) => i !== id);
    } else {
      newInjuries = [...newInjuries, id];
    }
    updateData('injuries', newInjuries);
  };

  const injuriesList = [
    { id: 'shin', label: 'Shin Splints' },
    { id: 'knee', label: 'Knee Pain' },
    { id: 'achilles', label: 'Achilles Issue' },
    { id: 'plantar', label: 'Plantar Fasciitis' },
    { id: 'none', label: 'None' },
  ];

  return (
    <div className="flex flex-col h-full relative">
      <div className="px-6 pt-4 pb-2">
        <h1 className="text-3xl font-bold leading-tight mb-2 text-white">Tell us about your stride.</h1>
        <p className="text-white/70 text-base leading-relaxed">This helps us find shoes with the right cushioning and support.</p>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-24 no-scrollbar space-y-8">
        {/* Weight */}
        <div>
          <label className="block text-sm font-semibold text-white/90 mb-3 ml-1 uppercase tracking-wide">Current Weight</label>
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-[28px]">monitor_weight</span>
            </div>
            <input
              type="number"
              value={data.weight || ''}
              onChange={(e) => updateData('weight', parseFloat(e.target.value))}
              className="w-full bg-surface-dark border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary text-white text-2xl font-semibold rounded-2xl py-5 pl-14 pr-16 outline-none transition-all placeholder:text-white/20"
              placeholder="0"
            />
            <div className="absolute right-6 top-1/2 -translate-y-1/2 text-white/50 font-medium text-lg pointer-events-none">
              kg
            </div>
          </div>
        </div>

        {/* Budget */}
        <div>
          <label className="block text-sm font-semibold text-white/90 mb-3 ml-1 uppercase tracking-wide">Budget (INR)</label>
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-[28px]">currency_rupee</span>
            </div>
            <input
              type="number"
              value={data.budget || ''}
              onChange={(e) => updateData('budget', parseFloat(e.target.value))}
              className="w-full bg-surface-dark border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary text-white text-2xl font-semibold rounded-2xl py-5 pl-14 pr-4 outline-none transition-all placeholder:text-white/20"
              placeholder="10000"
            />
          </div>
        </div>

        {/* Arch Type */}
        <div>
          <label className="block text-sm font-semibold text-white/90 mb-3 ml-1 uppercase tracking-wide">Arch Type</label>
          <div className="grid grid-cols-3 gap-3">
            {['flat', 'neutral', 'high'].map((type) => (
              <label key={type} className="cursor-pointer group relative">
                <input
                  type="radio"
                  name="arch"
                  className="peer sr-only"
                  checked={data.arch === type}
                  onChange={() => updateData('arch', type)}
                />
                <div className="flex flex-col items-center justify-center p-4 rounded-2xl border border-white/10 bg-surface-dark peer-checked:bg-primary/20 peer-checked:border-primary transition-all h-28">
                  <span 
                    className="material-symbols-outlined text-3xl mb-2 text-white/60 peer-checked:text-primary transition-colors"
                    style={type === 'high' ? { transform: 'scaleY(0.8)' } : {}}
                  >
                    footprint
                  </span>
                  <span className="text-sm font-medium text-white/80 peer-checked:text-primary peer-checked:font-bold capitalize">
                    {type}
                  </span>
                </div>
                {data.arch === type && (
                  <div className="absolute top-2 right-2 text-primary transition-opacity">
                    <span className="material-symbols-outlined text-lg filled">check_circle</span>
                  </div>
                )}
              </label>
            ))}
          </div>
        </div>

        {/* Injuries */}
        <div>
          <label className="block text-sm font-semibold text-white/90 mb-3 ml-1 uppercase tracking-wide">Past Injuries</label>
          <div className="flex flex-wrap gap-3">
            {injuriesList.map((item) => {
              const checked = item.id === 'none' ? data.injuries.length === 0 : data.injuries.includes(item.id);

              return (
                <label key={item.id} className="cursor-pointer">
                  <input
                    type="checkbox"
                    className="peer sr-only"
                    checked={checked}
                    onChange={() => toggleInjury(item.id)}
                  />
                  <div className={`px-5 py-3 rounded-full border font-medium transition-all hover:border-primary/50 flex items-center gap-2
                    ${checked 
                      ? 'bg-primary text-black border-primary' 
                      : 'bg-surface-dark text-white/80 border-white/10'
                    }
                  `}>
                    <span>{item.label}</span>
                    {checked && item.id !== 'none' && <span className="material-symbols-outlined text-lg">close</span>}
                  </div>
                </label>
              );
            })}
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-background-dark via-background-dark to-transparent">
        <button
          onClick={onNext}
          disabled={!data.weight || !data.budget}
          className="w-full bg-primary hover:bg-yellow-400 disabled:opacity-50 text-black font-bold text-lg py-4 rounded-full shadow-lg shadow-yellow-900/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          Continue
          <span className="material-symbols-outlined">arrow_forward</span>
        </button>
      </div>
    </div>
  );
};

export default StepProfile;