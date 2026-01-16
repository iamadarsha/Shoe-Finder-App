import React, { useState } from 'react';
import { UserProfile, ShoeRecommendation, Step } from './types';
import StepGoal from './components/StepGoal';
import StepTerrain from './components/StepTerrain';
import StepProfile from './components/StepProfile';
import StepFeel from './components/StepFeel';
import StepResults from './components/StepResults';
import { getShoeRecommendations } from './services/geminiService';

const initialProfile: UserProfile = {
  goal: '',
  terrain: [],
  weight: 70,
  arch: 'neutral',
  injuries: [],
  feel: '',
  budget: 12000
};

const App: React.FC = () => {
  const [step, setStep] = useState<Step>(Step.GOAL);
  const [profile, setProfile] = useState<UserProfile>(initialProfile);
  const [recommendations, setRecommendations] = useState<ShoeRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateData = (key: keyof UserProfile, value: any) => {
    setProfile(prev => ({ ...prev, [key]: value }));
  };

  const nextStep = () => {
    if (step === Step.FEEL) {
      fetchRecommendations();
    } else {
      setStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (step > Step.GOAL) {
      setStep(prev => prev - 1);
    }
  };

  const restartOnboarding = () => {
    setProfile(initialProfile);
    setRecommendations([]);
    setError(null);
    setStep(Step.GOAL);
  };

  const fetchRecommendations = async () => {
    setLoading(true);
    setError(null);
    try {
      const results = await getShoeRecommendations(profile);
      setRecommendations(results);
      setStep(Step.RESULTS);
    } catch (err) {
      setError("We couldn't connect to the shoe database. Please check your internet connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  // Render Logic
  if (loading) {
    return (
      <div className="min-h-screen bg-background-dark flex flex-col items-center justify-center p-6 text-center">
        <div className="relative w-24 h-24 mb-8">
          <div className="absolute inset-0 border-4 border-white/10 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
             <span className="material-symbols-outlined text-4xl text-primary animate-pulse">sprint</span>
          </div>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Analyzing your profile...</h2>
        <p className="text-white/60">Scouring runner databases for your perfect match.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background-dark flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
            <span className="material-symbols-outlined text-4xl text-red-500">wifi_off</span>
        </div>
        <h2 className="text-2xl font-bold text-white mb-3">Connection Issue</h2>
        <p className="text-white/60 mb-8 max-w-[280px] leading-relaxed">{error}</p>
        
        <div className="flex flex-col w-full max-w-[280px] gap-3">
            <button 
              onClick={fetchRecommendations}
              className="w-full bg-primary text-black px-6 py-4 rounded-full font-bold hover:bg-[#d9d90d] transition-colors flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined">refresh</span>
              Try Again
            </button>
            
            <button 
              onClick={restartOnboarding}
              className="w-full bg-white/5 text-white px-6 py-4 rounded-full font-bold hover:bg-white/10 transition-colors"
            >
              Start Over
            </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col min-h-screen w-full max-w-md mx-auto bg-background-light dark:bg-background-dark shadow-2xl overflow-hidden">
      {/* Progress Header for Steps 1-4 */}
      {step < Step.RESULTS && (
        <div className="absolute top-0 left-0 w-full p-6 z-20 pointer-events-none">
          <div className="flex items-center justify-between">
            <button 
              onClick={prevStep} 
              className={`flex items-center justify-center w-10 h-10 -ml-2 rounded-full text-slate-900 dark:text-white/60 bg-white/5 backdrop-blur-sm pointer-events-auto transition-opacity ${step === 1 ? 'opacity-0' : 'opacity-100'}`}
            >
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((s) => (
                <div 
                  key={s} 
                  className={`h-1.5 w-8 rounded-full transition-all duration-300 ${s <= step ? 'bg-primary shadow-[0_0_8px_rgba(242,242,13,0.5)]' : 'bg-slate-200 dark:bg-white/10'}`}
                ></div>
              ))}
            </div>
            <div className="w-10"></div>
          </div>
        </div>
      )}

      {/* Screen Content */}
      <div className={`flex-1 h-full ${step < Step.RESULTS ? 'pt-20' : ''}`}>
        {step === Step.GOAL && (
          <StepGoal 
            data={profile} 
            updateData={updateData} 
            onNext={nextStep} 
            onBack={prevStep} 
          />
        )}
        {step === Step.TERRAIN && (
          <StepTerrain 
            data={profile} 
            updateData={updateData} 
            onNext={nextStep} 
            onBack={prevStep} 
          />
        )}
        {step === Step.PROFILE && (
          <StepProfile 
            data={profile} 
            updateData={updateData} 
            onNext={nextStep} 
            onBack={prevStep} 
          />
        )}
        {step === Step.FEEL && (
          <StepFeel 
            data={profile} 
            updateData={updateData} 
            onNext={nextStep} 
            onBack={prevStep} 
          />
        )}
        {step === Step.RESULTS && (
          <StepResults 
            recommendations={recommendations} 
            profile={profile}
            onBack={() => setStep(Step.FEEL)}
          />
        )}
      </div>
    </div>
  );
};

export default App;