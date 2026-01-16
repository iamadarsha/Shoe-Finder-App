import React from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const RatingsModal: React.FC<Props> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-[#0f0f06]/80 backdrop-blur-sm z-40 transition-opacity duration-300"
        onClick={onClose}
      />
      <div className="fixed bottom-0 left-0 right-0 z-50 flex flex-col bg-[#222210] rounded-t-[2.5rem] shadow-2xl border-t border-white/5 max-h-[90vh] overflow-y-auto animate-slide-up">
        {/* Handle */}
        <div className="w-full flex justify-center pt-4 pb-2" onClick={onClose}>
          <div className="h-1.5 w-12 rounded-full bg-[#494922]"></div>
        </div>
        
        {/* Header */}
        <div className="px-6 pt-2 pb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white tracking-tight">Understanding Your Ratings</h2>
          <button onClick={onClose} className="text-white/50 hover:text-white transition-colors p-2 -mr-2">
            <span className="material-symbols-outlined text-[1.5rem]">close</span>
          </button>
        </div>

        {/* Content Sections */}
        <div className="px-6 space-y-8 pb-8">
          {/* Section 1: Cushion */}
          <div className="flex gap-5 items-start group">
            <div className="shrink-0 relative">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center border border-primary/5 group-hover:bg-primary/20 transition-colors duration-300">
                <span className="material-symbols-outlined text-primary text-[1.75rem]">cloud</span>
              </div>
            </div>
            <div className="flex flex-col pt-0.5">
              <h3 className="text-lg font-bold text-white mb-1.5">Cushion Rating</h3>
              <p className="text-text-muted text-[0.95rem] leading-relaxed">
                Measures softness upon impact. High cushion is essential for protecting joints on hard concrete.
              </p>
            </div>
          </div>

          {/* Section 2: Durability */}
          <div className="flex gap-5 items-start group">
            <div className="shrink-0 relative">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center border border-primary/5 group-hover:bg-primary/20 transition-colors duration-300">
                <span className="material-symbols-outlined text-primary text-[1.75rem]">terrain</span>
              </div>
            </div>
            <div className="flex flex-col pt-0.5">
              <h3 className="text-lg font-bold text-white mb-1.5">Durability <span className="text-white/50 text-base font-normal">(Indian Roads)</span></h3>
              <p className="text-text-muted text-[0.95rem] leading-relaxed">
                Toughness of the outsole. Designed to withstand abrasive tarmac and uneven surfaces common in India.
              </p>
            </div>
          </div>

          {/* Section 3: Energy Return */}
          <div className="flex gap-5 items-start group">
            <div className="shrink-0 relative">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center border border-primary/5 group-hover:bg-primary/20 transition-colors duration-300">
                <span className="material-symbols-outlined text-primary text-[1.75rem]">bolt</span>
              </div>
            </div>
            <div className="flex flex-col pt-0.5">
              <h3 className="text-lg font-bold text-white mb-1.5">Energy Return</h3>
              <p className="text-text-muted text-[0.95rem] leading-relaxed">
                The 'pop' you feel in every stride. Higher return means more propulsion and less fatigue.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Action */}
        <div className="p-6 pt-2 pb-8 mt-auto sticky bottom-0 bg-gradient-to-t from-[#222210] via-[#222210] to-transparent">
          <button 
            onClick={onClose}
            className="w-full bg-primary hover:bg-[#dada0b] active:scale-[0.98] transition-all duration-200 text-black font-bold text-lg py-4 rounded-full shadow-[0_4px_20px_-5px_rgba(242,242,13,0.3)] flex items-center justify-center gap-2"
          >
            <span>Got it, thanks!</span>
            <span className="material-symbols-outlined text-xl">check</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default RatingsModal;
