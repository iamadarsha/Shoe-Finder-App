import React, { useState } from 'react';
import { ShoeRecommendation, UserProfile } from '../types';
import RatingsModal from './RatingsModal';

interface Props {
  recommendations: ShoeRecommendation[];
  profile: UserProfile;
  onBack: () => void;
}

const StepResults: React.FC<Props> = ({ recommendations, profile, onBack }) => {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="flex flex-col h-full bg-background-light dark:bg-background-dark">
      {/* Header Section */}
      <header className="sticky top-0 z-30 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md border-b border-black/5 dark:border-white/5 pb-2">
        <div className="flex items-center justify-between p-4 pb-2">
          <button 
            onClick={onBack}
            className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          >
            <span className="material-symbols-outlined text-gray-900 dark:text-white">arrow_back</span>
          </button>
          <h1 className="text-xl font-bold tracking-tight text-center flex-1 pr-10 text-slate-900 dark:text-white">Your Top Matches</h1>
        </div>
        
        {/* Profile Chips */}
        <div className="px-4 pb-2">
          <div className="flex flex-wrap gap-2 justify-center">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-200 dark:bg-chip-dark border border-transparent dark:border-white/5">
              <span className="material-symbols-outlined text-sm text-gray-700 dark:text-primary">monitor_weight</span>
              <span className="text-xs font-medium text-gray-700 dark:text-gray-200">{profile.weight}kg</span>
            </div>
            {profile.terrain.length > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-200 dark:bg-chip-dark border border-transparent dark:border-white/5">
                <span className="material-symbols-outlined text-sm text-gray-700 dark:text-primary">terrain</span>
                <span className="text-xs font-medium text-gray-700 dark:text-gray-200 capitalize">{profile.terrain[0]}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-200 dark:bg-chip-dark border border-transparent dark:border-white/5">
              <span className="material-symbols-outlined text-sm text-gray-700 dark:text-primary">payments</span>
              <span className="text-xs font-medium text-gray-700 dark:text-gray-200">&lt; ₹{(profile.budget / 1000).toFixed(0)}k</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content List */}
      <main className="flex-1 flex flex-col gap-6 p-4 overflow-y-auto">
        {recommendations.map((shoe, idx) => (
          <article key={shoe.id} className="group relative flex flex-col bg-white dark:bg-card-dark rounded-xl overflow-hidden shadow-sm border border-gray-100 dark:border-white/5 transition-transform active:scale-[0.99] p-5">
            
            {/* Header: Badge, Name, Price */}
            <div className="flex justify-between items-start mb-6">
              <div className="flex flex-col gap-2">
                {/* Match Badge */}
                <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full w-fit
                  ${idx === 0 ? 'bg-primary text-black shadow-lg shadow-primary/20' : 'bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 border border-transparent dark:border-white/10'}`}>
                  {idx === 0 && <span className="material-symbols-outlined text-sm">local_fire_department</span>}
                  <span className="text-xs font-bold">{shoe.matchPercentage}% Match</span>
                </div>
                
                {/* Title */}
                <div>
                  {idx === 0 && <p className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Top Pick</p>}
                  <h2 className="text-2xl font-bold leading-tight text-slate-900 dark:text-white tracking-tight">{shoe.name}</h2>
                </div>
              </div>
              
              {/* Price */}
              <div className="text-right shrink-0">
                <span className="block text-xl font-bold text-slate-900 dark:text-primary">{shoe.price}</span>
              </div>
            </div>

            {/* Specs Progress Bars */}
            <div className="flex flex-col gap-4">
              {[
                { label: 'Cushioning', value: shoe.cushionRating },
                { label: 'Durability (Indian Roads)', value: shoe.durabilityRating },
                { label: 'Energy Return', value: shoe.energyReturnRating }
              ].map((spec) => (
                <div key={spec.label} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-medium dark:text-gray-300">
                    <button 
                      className="flex items-center gap-1.5 hover:text-primary transition-colors focus:outline-none group/btn" 
                      onClick={() => setShowModal(true)}
                    >
                      {spec.label} 
                      <span className="material-symbols-outlined text-[14px] text-gray-400 group-hover/btn:text-primary transition-colors">help</span>
                    </button>
                    <span className="text-primary font-bold">{spec.value}/5</span>
                  </div>
                  <div className="h-2 w-full bg-gray-100 dark:bg-black/40 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full transition-all duration-1000 ease-out" 
                      style={{ width: `${(spec.value / 5) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>

            {/* AI Summary Box */}
            <div className="mt-6 p-4 bg-gray-50 dark:bg-black/20 rounded-xl border border-gray-100 dark:border-white/5">
              <div className="flex gap-3">
                <div className="shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                   <span className="material-symbols-outlined text-primary text-lg">auto_awesome</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-text-muted leading-relaxed pt-1">
                  <span className="text-gray-900 dark:text-white font-semibold block mb-1">Why it fits you</span>
                  {shoe.reason}
                </p>
              </div>
            </div>
          </article>
        ))}
        <div className="h-8"></div>
      </main>

      <RatingsModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </div>
  );
};

export default StepResults;
