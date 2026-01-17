export interface UserProfile {
  goal: string;
  terrain: string[];
  weight: number | '';
  arch: string;
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
  brand: string;
}

// UPDATE THIS ENUM
export enum Step {
  GOAL = 1,
  TERRAIN = 2,
  PROFILE = 3,
  FEEL = 4,
  BUDGET = 5, // <--- ADDED THIS
  RESULTS = 6
}
