import React from 'react';
import { UserProfile } from '../types';

interface Props {
  data: UserProfile;
  updateData: (key: keyof UserProfile, value: any) => void;
  onNext: () => void;
  onBack: () => void;
}

const StepBudget: React.FC<Props> = ({ data, updateData, onNext }) => {
  const budget = data.budget || 5000;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateData('budget', parseInt(e.target.value));
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 pt-6 pb-2">
        <h1 className="text-[32px] font-extrabold leading-[1.1] tracking-tight text-slate-900 dark:text-white mb-4">
          What is your <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-[#ccff00]">
            budget?
          </span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          We'll prioritize shoes that fit comfortably within your price range.
        </p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6">
        
        {/* Visual Graphic */}
        <div className="relative mb-12">
          <div className="w-48 h-48 rounded-full bg-gradient-to-tr from-slate-800 to-slate-900 shadow-2xl flex items-center justify-center border border-white/5 relative z-10">
             <div className="flex flex-col items-center">
                <span className="material-symbols-outlined text-4xl text-primary mb-2">payments</span>
                <span className="text-3xl font-bold text-white tracking-tight">
                  ₹{(budget).toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">Target Price</span>
             </div>
          </div>
          <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full z-0 transform scale-110"></div>
        </div>

        {/* Slider Section */}
        <div className="w-full max-w-xs space-y-6">
          <input
            type="range"
            min="1500"      // Updated to 1.5k
            max="45000"     // Updated to 45k
            step="500"
            value={budget}
            onChange={handleChange}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary"
          />
          
          <div className="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
            <span>₹1.5k</span>
            <span>₹20k</span>
            <span>₹45k</span>
          </div>
        </div>
      </div>

      <div className="flex-none px-6 py-6 pb-8 border-t border-slate-200 dark:border-white/5">
        <button
          onClick={onNext}
          className="w-full h-14 rounded-full bg-primary hover:bg-[#d9d90d] active:scale-[0.98] text-background-dark text-base font-bold tracking-wide transition-all flex items-center justify-center shadow-[0_0_25px_rgba(242,242,13,0.2)] gap-2"
        >
          Find My Shoes
          <span className="material-symbols-outlined">search</span>
        </button>
      </div>
    </div>
  );
};

export default StepBudget;
