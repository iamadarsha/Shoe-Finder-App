import { UserProfile, ShoeRecommendation } from '../types';

export const getShoeRecommendations = async (profile: UserProfile): Promise<ShoeRecommendation[]> => {
  try {
    // This calls your new Vercel Backend Function
    const response = await fetch('/api/recommend', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profile),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch recommendations');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching shoes:", error);
    throw error;
  }
};
