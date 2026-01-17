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
  id?: string; // Optional
  name: string;
  price: number | string; // Allow both just in case
  matchPercentage: number;
  cushionRating: number;
  durabilityRating: number;
  energyReturnRating: number;
  reason: string;
  brand: string;
  purchase_link?: string;
  retailer_name?: string;
}

export enum Step {
  GOAL = 1,
  TERRAIN = 2,
  PROFILE = 3,
  FEEL = 4,
  BUDGET = 5,
  RESULTS = 6
}
