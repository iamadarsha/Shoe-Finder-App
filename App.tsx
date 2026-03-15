import { useState, useEffect } from 'react';
import { AppScreen, UserPreferences, ShoeRecommendation, ChatMessage } from './types';
import { SHOE_DATABASE } from './data/shoe-database';
import LandingPage from './components/LandingPage';
import QuizFlow from './components/QuizFlow';
import ResultsPage from './components/ResultsPage';
import BrowsePage from './components/BrowsePage';
import ChatDrawer from './components/ChatDrawer';

const defaultPrefs: UserPreferences = {
  useCase: null,
  experience: null,
  footType: null,
  mileage: null,
  budget: null,
};

export default function App() {
  const [screen, setScreen] = useState<AppScreen>('landing');
  const [displayScreen, setDisplayScreen] = useState<AppScreen>('landing');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [_prefs, setPrefs] = useState<UserPreferences>(defaultPrefs);
  const [recommendations, setRecommendations] = useState<ShoeRecommendation[]>([]);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  // Handle page transitions
  const navigateTo = (newScreen: AppScreen) => {
    if (newScreen === screen) return;
    setIsTransitioning(true);
    // Old screen fades out: duration-200
    setTimeout(() => {
      setDisplayScreen(newScreen);
      setScreen(newScreen);
      // New screen fades in: delay-100, wait a small tick before removing transitioning state
      setTimeout(() => {
        setIsTransitioning(false);
      }, 100);
    }, 200);
  };

  return (
    <div className="min-h-screen bg-sole-bg text-sole-text font-body selection:bg-sole-accent/30 selection:text-sole-text overflow-x-hidden">
      <div 
        className={`transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100 delay-100'}`}
      >
        {displayScreen === 'landing' && (
          <LandingPage
            onStart={() => navigateTo('quiz')}
            onChat={() => setChatOpen(true)}
            onBrowse={() => navigateTo('browse')}
          />
        )}

        {displayScreen === 'quiz' && (
          <QuizFlow
            shoeDatabase={SHOE_DATABASE}
            onComplete={(p, recs) => {
              setPrefs(p);
              setRecommendations(recs);
              navigateTo('results');
            }}
            onBack={() => navigateTo('landing')}
          />
        )}

        {displayScreen === 'results' && (
          <ResultsPage
            recommendations={recommendations}
            onRetake={() => {
              setPrefs(defaultPrefs);
              setRecommendations([]);
              navigateTo('quiz');
            }}
            onChat={() => setChatOpen(true)}
            onBrowse={() => navigateTo('browse')}
          />
        )}

        {displayScreen === 'browse' && (
          <BrowsePage
            shoeDatabase={SHOE_DATABASE}
            onBack={() => navigateTo('landing')}
            onChat={() => setChatOpen(true)}
          />
        )}
      </div>

      {chatOpen && (
        <ChatDrawer
          messages={chatMessages}
          setMessages={setChatMessages}
          onClose={() => setChatOpen(false)}
        />
      )}
    </div>
  );
}
