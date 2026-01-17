import React, { useState } from 'react';
import { ShoeRecommendation, UserProfile } from '../types';

interface Props {
  recommendations: ShoeRecommendation[];
  profile: UserProfile;
  onBack: () => void;
}

const StepResults: React.FC<Props> = ({ recommendations, profile, onBack }) => {
  const [selectedShoe, setSelectedShoe] = useState<number | null>(null);

  // 1. HANDLE NO RESULTS FOUND (Strict Budget Check)
  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="flex flex-col h-full items-center justify-center px-6 text-center">
        <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-6">
          <span className="material-symbols-outlined text-4xl text-slate-400">search_off</span>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">No Shoes Found</h2>
        <p className="text-slate-400 mb-8 max-w-[280px]">
          We couldn't find any shoes that match your specific criteria, especially within the budget of 
          <span className="text-primary font-bold"> ₹{profile.budget}</span>.
        </p>
        <button 
          onClick={onBack}
          className="bg-primary text-black px-8 py-3 rounded-full font-bold hover:bg-[#d9d90d] transition-all"
        >
          Adjust Preferences
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full relative">
      <header className="px-6 py-4 flex items-center justify-between bg-transparent z-10">
        <button 
          onClick={onBack}
          className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div className="flex gap-2">
          <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-slate-300 uppercase">
             {profile.goal}
          </span>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 pb-24 scroll-smooth no-scrollbar">
        <h1 className="text-2xl font-bold text-white px-2 mb-6">
          Your Top <span className="text-primary">Matches</span>
        </h1>

        <div className="space-y-4">
          {recommendations.map((shoe, index) => (
            <div 
              key={index}
              onClick={() => setSelectedShoe(selectedShoe === index ? null : index)}
              className={`relative bg-[#1a2233] border ${selectedShoe === index ? 'border-primary' : 'border-white/5'} rounded-2xl overflow-hidden transition-all duration-300 active:scale-[0.99]`}
            >
              {/* Header: Name, Price, Badge */}
              <div className="p-5 pb-2">
                 <div className="flex justify-between items-start mb-2">
                    <div>
                       {index === 0 && (
                         <span className="inline-block bg-primary text-black text-[10px] font-bold px-2 py-0.5 rounded-sm mb-2 uppercase tracking-wide">
                           Top Pick
                         </span>
                       )}
                       <h3 className="text-xl font-bold text-white leading-tight">{shoe.name}</h3>
                       <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">{shoe.brand}</p>
                    </div>
                    <div className="text-right">
                       <span className="block text-lg font-bold text-primary">{shoe.price}</span>
                       <span className="text-[10px] font-bold text-slate-500 bg-white/5 px-2 py-1 rounded-full">{shoe.matchPercentage}% Match</span>
                    </div>
                 </div>
              </div>

              {/* Ratings & Content */}
              <div className="px-5 pb-5">
                {/* Ratings Bars */}
                <div className="space-y-3 mb-5 mt-2">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold text-slate-500 w-16 uppercase">Cushion</span>
                    <div className="flex-1 h-1.5 bg-black/30 rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${(shoe.cushionRating / 5) * 100}%` }}></div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold text-slate-500 w-16 uppercase">Durability</span>
                    <div className="flex-1 h-1.5 bg-black/30 rounded-full overflow-hidden">
                      <div className="h-full bg-secondary rounded-full" style={{ width: `${(shoe.durabilityRating / 5) * 100}%` }}></div>
                    </div>
                  </div>
                </div>

                {/* AI Explanation */}
                <div className="bg-black/20 rounded-xl p-3 border border-white/5">
                   <div className="flex gap-2 items-start">
                     <span className="material-symbols-outlined text-primary text-sm mt-0.5 shrink-0">auto_awesome</span>
                     <p className="text-xs text-slate-300 leading-relaxed">
                       {shoe.reason}
                     </p>
                   </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Disclaimer */}
        <div className="mt-8 mb-4 p-4 rounded-xl bg-white/5 border border-white/5">
          <div className="flex gap-2 items-start opacity-60">
            <span className="material-symbols-outlined text-sm mt-0.5">info</span>
            <p className="text-[10px] text-slate-300 leading-relaxed">
              <strong>Note:</strong> These results are specific to the Indian market. Availability and pricing may vary.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StepResults;
