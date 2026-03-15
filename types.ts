// ═══════════════════════════════════════════════════════
// SoleMate v2.0 — Master Type Definitions
// 233 shoes · 15 brands · India market focus
// ═══════════════════════════════════════════════════════

// ── Quiz Types ──
export type UseCase = 'running' | 'casual' | 'training' | 'walking' | 'trail' | 'racing';
export type Experience = 'beginner' | 'intermediate' | 'advanced';
export type FootType = 'neutral' | 'flat' | 'high_arch';
export type Mileage = 'low' | 'medium' | 'high';
export type Budget = 'budget' | 'mid' | 'premium';

export interface UserPreferences {
  useCase: UseCase | null;
  experience: Experience | null;
  footType: FootType | null;
  mileage: Mileage | null;
  budget: Budget | null;
}

// ── Shoe Database Types ──
export interface Shoe {
  id: string;
  brand: string;
  model: string;
  category: string;
  priceMin: number;
  priceMax: number;
  priceDisplay: string;
  foam: string;
  plate: string;
  tech: string;
  availability: string;
  useCases: string[];
  experienceLevel: string[];
  budgetTier: 'budget' | 'mid' | 'premium';
  buyLinks: {
    amazon?: string;
    flipkart?: string;
    official?: string;
  };
}

// ── AI Recommendation Types ──
export interface ShoeRecommendation {
  id: string;
  name: string;
  brand: string;
  model: string;
  matchScore: number;
  price: string;
  category: string;
  foam: string;
  plate: string;
  tech: string;
  whyThisShoe: string;
  buyLinks: {
    amazon?: string;
    flipkart?: string;
    official?: string;
  };
}

// ── App Navigation ──
export type AppScreen = 'landing' | 'quiz' | 'results' | 'browse' | 'shoe-detail';

// ── Chat Types ──
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: number;
}

// ── Browse / Filter Types ──
export type SortOption = 'price-low' | 'price-high' | 'brand' | 'category';

export interface FilterState {
  brands: string[];
  categories: string[];
  budgetTier: string[];
  useCases: string[];
  searchQuery: string;
}
