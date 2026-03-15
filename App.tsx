import { useState } from 'react';
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
  const [_prefs, setPrefs] = useState<UserPreferences>(defaultPrefs);
  const [recommendations, setRecommendations] = useState<ShoeRecommendation[]>([]);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  return (
    <div
      style={{
        fontFamily: "'Figtree', sans-serif",
        background: '#050507',
        minHeight: '100vh',
        color: '#E8E8ED',
      }}
    >
      {screen === 'landing' && (
        <LandingPage
          onStart={() => setScreen('quiz')}
          onChat={() => setChatOpen(true)}
          onBrowse={() => setScreen('browse')}
        />
      )}

      {screen === 'quiz' && (
        <QuizFlow
          shoeDatabase={SHOE_DATABASE}
          onComplete={(p, recs) => {
            setPrefs(p);
            setRecommendations(recs);
            setScreen('results');
          }}
          onBack={() => setScreen('landing')}
        />
      )}

      {screen === 'results' && (
        <ResultsPage
          recommendations={recommendations}
          onRetake={() => {
            setPrefs(defaultPrefs);
            setRecommendations([]);
            setScreen('quiz');
          }}
          onChat={() => setChatOpen(true)}
          onBrowse={() => setScreen('browse')}
        />
      )}

      {screen === 'browse' && (
        <BrowsePage
          shoeDatabase={SHOE_DATABASE}
          onBack={() => setScreen('landing')}
          onChat={() => setChatOpen(true)}
        />
      )}

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
