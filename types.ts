export interface UserProfile {
  goal: string;
  terrain: string[];
  weight: number;
  arch: 'flat' | 'neutral' | 'high';
  injuries: string[];
  feel: string;
  budget: number;
}

export interface ShoeRecommendation {
  id: string;
  name: string;
  price: string;
  matchPercentage: number;
  cushionRating: number;
  durabilityRating: number;
  energyReturnRating: number;
  reason: string;
  brand?: string;
}

export enum Step {
  GOAL = 1,
  TERRAIN = 2,
  PROFILE = 3,
  FEEL = 4,
  RESULTS = 5
}
