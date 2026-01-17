import { UserProfile, ShoeRecommendation } from '../types';

export const getShoeRecommendations = async (profile: UserProfile): Promise<ShoeRecommendation[]> => {
  try {
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

    const rawData = await response.json();

    // FAILSAFE: Map Backend (snake_case) to Frontend (camelCase)
    // This ensures your UI never breaks even if AI changes keys slightly.
    const mappedData: ShoeRecommendation[] = rawData.map((shoe: any) => ({
      id: shoe.name || 'unknown', // Fallback ID
      name: shoe.name,
      brand: shoe.brand || 'Running Shoe',
      price: shoe.price, // Keep as number/string based on backend
      
      // Critical Mappings
      matchPercentage: shoe.match_percentage || shoe.matchPercentage || 90,
      cushionRating: shoe.ratings?.cushion || 4,
      durabilityRating: shoe.ratings?.durability || 4,
      energyReturnRating: shoe.ratings?.energy_return || 4,
      
      // Map 'why_it_fits' from backend to 'reason' for frontend
      reason: shoe.why_it_fits || shoe.reason || 'Great match for your profile.',
      
      // New Link Fields
      purchase_link: shoe.purchase_link,
      retailer_name: shoe.retailer_name
    }));

    return mappedData;

  } catch (error) {
    console.error("Error fetching shoes:", error);
    throw error;
  }
};
