import { GoogleGenAI, Type, Schema } from "@google/genai";
import { UserProfile, ShoeRecommendation } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const recommendationSchema: Schema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      id: { type: Type.STRING },
      name: { type: Type.STRING, description: "Full shoe name with version (e.g., Nike Pegasus 41)" },
      price: { type: Type.STRING, description: "Current market price in Indian Rupees (e.g., ₹12,999)" },
      matchPercentage: { type: Type.NUMBER, description: "0-100" },
      cushionRating: { type: Type.NUMBER, description: "Rating out of 5" },
      durabilityRating: { type: Type.NUMBER, description: "Rating out of 5 for Indian roads" },
      energyReturnRating: { type: Type.NUMBER, description: "Rating out of 5" },
      reason: { type: Type.STRING, description: "Why it fits the profile and Indian conditions" },
      brand: { type: Type.STRING }
    },
    required: ["name", "price", "matchPercentage", "cushionRating", "durabilityRating", "energyReturnRating", "reason"]
  }
};

export async function getShoeRecommendations(profile: UserProfile): Promise<ShoeRecommendation[]> {
  const prompt = `
    Act as a professional running shoe expert for the Indian market.
    
    Data Sources (incorporate insights from):
    Run Testers, Ben Parkes, Run Repeat, Runners World, Road Trail Run, Run to the Finish, Run Shoes Guru, Marathon Handbook, and reputable YouTube channels.

    Target Database:
    - Focus on 2024, 2025, and early 2026 releases (if announced).
    - MUST include brands available in India: Nike, Saucony, Hoka, Puma, Adidas, Asics, New Balance, Skechers, Reebok, Under Armour.
    - IMPORTANT: Include emerging/value brands strong in India: Anta, Xtep, Decathlon (Kiprun/KD/KS series).

    User Profile:
    - Goal: ${profile.goal}
    - Terrain: ${profile.terrain.join(', ')}
    - Weight: ${profile.weight} kg (Consider durability for heavier runners)
    - Arch: ${profile.arch}
    - Injuries: ${profile.injuries.length > 0 ? profile.injuries.join(', ') : 'None'} (Prioritize stability/cushion if injured)
    - Feel: ${profile.feel}
    - Budget: ₹${profile.budget}

    Indian Context Rules:
    1. Availability: Suggest shoes currently buyable in India (Myntra, Flipkart, Amazon, Tata Cliq, Brand Sites).
    2. Heat/Humidity: Penalize shoes with thick/warm uppers; praise breathable mesh.
    3. Road Conditions: Indian roads are tough. Boost ratings for thick rubber outsoles (PumaGrip, Continental, AHAR).
    4. Budget Flexibility: If the budget is low (< ₹5000), prioritize Decathlon/Campus/Skechers or older discounted models. If high, suggest top-tier plated or super-trainers.

    Task:
    Recommend the top 5 shoes.
    - For "durabilityRating", be critical about outsole life on concrete/tarmac.
    - For "reason", mention specific tech (e.g., "ZoomX foam", "PumaGrip") and why it solves the user's specific problems (e.g., "stable for flat arches", "durable for broken tar").
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: recommendationSchema,
        temperature: 0.4, // Lower temperature for more factual/accurate product retrieval
      },
    });

    if (response.text) {
      const data = JSON.parse(response.text);
      return data.map((item: any, index: number) => ({
        ...item,
        id: item.id || `shoe-${index}`,
      }));
    }
    return [];
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
}
