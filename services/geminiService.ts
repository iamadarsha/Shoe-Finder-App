import { UserProfile, ShoeRecommendation } from "../types";

export async function getShoeRecommendations(profile: UserProfile): Promise<ShoeRecommendation[]> {
  try {
    // 1. Call your secure Vercel Backend API
    // We do NOT use process.env.API_KEY here anymore.
    const response = await fetch('/api/recommend', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profile),
    });

    if (!response.ok) {
      throw new Error(`Server returned error: ${response.status}`);
    }

    // 2. Get the raw data from the backend
    const backendData = await response.json();

    // 3. Convert backend data to match your Frontend "ShoeRecommendation" type
    // This mapping ensures your UI components (cards, ratings) work perfectly.
    return backendData.map((item: any, index: number) => ({
      id: `shoe-${index}`,
      name: item.name,
      // Backend sends number (12000), Frontend expects string ("₹12,000")
      price: `₹${item.price_current.toLocaleString('en-IN')}`, 
      matchPercentage: item.match_percentage,
      cushionRating: item.ratings?.cushion || 0,
      durabilityRating: item.ratings?.durability || 0,
      energyReturnRating: item.ratings?.energy_return || 0,
      reason: item.why_it_fits,
      // Simple logic to extract brand from the first word of the shoe name
      brand: item.name.split(' ')[0] 
    }));

  } catch (error) {
    console.error("Error fetching recommendations:", error);
    // Return empty array so the app doesn't crash
    return [];
  }
}
