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

      <div className="fixed bottom-3 right-3 z-30 pointer-events-none">
        <div
          className="px-3 py-1.5 rounded-full border text-[11px] sm:text-xs pointer-events-auto"
          style={{
            background: 'rgba(12,12,18,0.72)',
            borderColor: '#1A1A28',
            color: '#7A7A90',
            backdropFilter: 'blur(8px)',
          }}
        >
          <span>Made by a fellow runner - Adarsha</span>
          <span style={{ color: '#44445A' }}> · </span>
          <a
            href="https://www.instagram.com/iamadarsha/"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-[#C4B5FD]"
            style={{ color: '#A78BFA' }}
          >
            Follow me
          </a>
        </div>
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
