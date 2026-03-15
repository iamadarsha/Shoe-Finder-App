import { lazy, Suspense, useState } from 'react';
import {
  AppScreen,
  UserPreferences,
  ShoeRecommendation,
  ChatMessage,
  Shoe,
} from './types';
import LandingPage from './components/LandingPage';
import LoadingScreen from './components/LoadingScreen';

const QuizFlow = lazy(() => import('./components/QuizFlow'));
const ResultsPage = lazy(() => import('./components/ResultsPage'));
const BrowsePage = lazy(() => import('./components/BrowsePage'));
const ChatDrawer = lazy(() => import('./components/ChatDrawer'));

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
  const [shoeDatabase, setShoeDatabase] = useState<Shoe[] | null>(null);
  const [isDatabaseLoading, setIsDatabaseLoading] = useState(false);
  const [_prefs, setPrefs] = useState<UserPreferences>(defaultPrefs);
  const [recommendations, setRecommendations] = useState<ShoeRecommendation[]>([]);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  const loadShoeDatabase = async (): Promise<Shoe[]> => {
    if (shoeDatabase) {
      return shoeDatabase;
    }

    setIsDatabaseLoading(true);
    try {
      const module = await import('./data/shoe-database');
      setShoeDatabase(module.SHOE_DATABASE);
      return module.SHOE_DATABASE;
    } finally {
      setIsDatabaseLoading(false);
    }
  };

  // Handle page transitions
  const navigateTo = async (newScreen: AppScreen) => {
    if (newScreen === screen) return;

    if ((newScreen === 'quiz' || newScreen === 'browse') && !shoeDatabase) {
      try {
        await loadShoeDatabase();
      } catch (error) {
        console.error('Failed to load shoe database:', error);
        setShoeDatabase([]);
      }
    }

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

  if (isDatabaseLoading) {
    return <LoadingScreen message="Loading shoe database..." />;
  }

  return (
    <div className="min-h-screen bg-sole-bg text-sole-text font-body selection:bg-sole-accent/30 selection:text-sole-text overflow-x-hidden">
      <div 
        className={`transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100 delay-100'}`}
      >
        <Suspense fallback={<LoadingScreen />}>
          {displayScreen === 'landing' && (
            <LandingPage
              onStart={() => navigateTo('quiz')}
              onChat={() => setChatOpen(true)}
              onBrowse={() => navigateTo('browse')}
            />
          )}

          {displayScreen === 'quiz' &&
            (shoeDatabase ? (
              <QuizFlow
                shoeDatabase={shoeDatabase}
                onComplete={(p, recs) => {
                  setPrefs(p);
                  setRecommendations(recs);
                  navigateTo('results');
                }}
                onBack={() => navigateTo('landing')}
              />
            ) : (
              <LoadingScreen message="Loading shoe database..." />
            ))}

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

          {displayScreen === 'browse' &&
            (shoeDatabase ? (
              <BrowsePage
                shoeDatabase={shoeDatabase}
                onBack={() => navigateTo('landing')}
                onChat={() => setChatOpen(true)}
              />
            ) : (
              <LoadingScreen message="Loading shoe database..." />
            ))}
        </Suspense>
      </div>

      {chatOpen && (
        <Suspense fallback={null}>
          <ChatDrawer
            messages={chatMessages}
            setMessages={setChatMessages}
            onClose={() => setChatOpen(false)}
          />
        </Suspense>
      )}
    </div>
  );
}
