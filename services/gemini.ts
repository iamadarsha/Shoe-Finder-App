import { GoogleGenerativeAI } from '@google/generative-ai';
import { UserPreferences, ShoeRecommendation, ChatMessage, Shoe } from '../types';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

/**
 * Filters the shoe database based on user preferences, then asks Gemini
 * to pick the top 5 with detailed reviews, scores, and personalized explanations.
 */
export async function getShoeRecommendations(
  prefs: UserPreferences,
  shoeDatabase: Shoe[]
): Promise<ShoeRecommendation[]> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  // ── Step 1: Pre-filter shoes from the 260-shoe database ──
  let filtered = shoeDatabase;

  const budgetMap: Record<string, number> = {
    budget: 8000,
    mid: 15000,
    premium: 100000,
  };
  const maxPrice = prefs.budget
    ? Math.round(budgetMap[prefs.budget] * 1.25)
    : 100000;

  filtered = filtered.filter((s) => s.priceMin <= maxPrice);

  const useCaseMap: Record<string, string[]> = {
    running: ['daily', 'cushion', 'speed', 'racing'],
    casual: ['casual', 'daily', 'budget'],
    training: ['training', 'daily'],
    walking: ['casual', 'cushion', 'stability', 'budget'],
    trail: ['trail'],
    racing: ['racing', 'speed'],
  };

  if (prefs.useCase) {
    const relevantCases = useCaseMap[prefs.useCase] || [];
    const useCaseFiltered = filtered.filter((s) =>
      s.useCases.some((uc) => relevantCases.includes(uc))
    );
    if (useCaseFiltered.length >= 5) {
      filtered = useCaseFiltered;
    }
  }

  if (prefs.experience) {
    const expFiltered = filtered.filter((s) =>
      s.experienceLevel.includes(prefs.experience!)
    );
    if (expFiltered.length >= 5) {
      filtered = expFiltered;
    }
  }

  if (filtered.length > 40) {
    filtered = filtered.slice(0, 40);
  }

  let contextMessage = '';
  if (filtered.length < 5) {
    filtered = [...shoeDatabase]
      .sort((a, b) => a.priceMin - b.priceMin)
      .slice(0, 15);
    contextMessage =
      'NOTE: No shoes perfectly match this user\'s exact combination. Apologize briefly, then recommend the closest budget-friendly alternatives from the list below.';
  }

  // ── Step 2: Build the enhanced prompt ──
  const mileageLabel =
    prefs.mileage === 'low' ? '0–20 km/week' :
    prefs.mileage === 'medium' ? '20–50 km/week' : '50+ km/week';

  const budgetLabel =
    prefs.budget === 'budget' ? 'Under ₹8,000' :
    prefs.budget === 'mid' ? '₹8,000–15,000' : '₹15,000+';

  const footLabel =
    prefs.footType === 'flat' ? 'Flat feet (overpronator)' :
    prefs.footType === 'high_arch' ? 'High arch (underpronator)' :
    'Neutral';

  const shoeListJSON = JSON.stringify(
    filtered.map((s) => ({
      id: s.id,
      brand: s.brand,
      model: s.model,
      category: s.category,
      price: s.priceDisplay,
      foam: s.foam,
      plate: s.plate,
      tech: s.tech,
    })),
    null,
    2
  );

  const prompt = `You are SoleMate AI, an expert running shoe advisor combining the analytical depth of RunRepeat (data-driven 0-100 scoring), the technical precision of Sole Review (foam density teardowns), and the real-world testing approach of RunTesters / The Run Testers.

${contextMessage}

USER PROFILE:
- Use case: ${prefs.useCase}
- Experience: ${prefs.experience}
- Foot type: ${footLabel}
- Weekly mileage: ${mileageLabel}
- Budget: ${budgetLabel}

AVAILABLE SHOES (pre-filtered from our 260-shoe India database):
${shoeListJSON}

YOUR TASK:
Select the TOP 5 shoes from this list. Return ONLY a raw JSON array — no markdown, no code fences, no text before or after.

Each object MUST have ALL these fields:
{
  "id": "the shoe id from the list",
  "matchScore": 85-99,
  "whyThisShoe": "2-3 sentences. Be specific about foam tech, stack height, drop. Reference the user's foot type and mileage. Sound like a running store expert.",
  "reviewSummary": "1-2 sentences summarizing what major review sites (RunRepeat, SoleReview, RunTesters) say about this shoe. Mention specific praise or criticism.",
  "reviewScore": 78-95 (a realistic RunRepeat-style score out of 100 — NOT the same as matchScore. This is the shoe's objective quality rating regardless of user fit.),
  "pros": ["3 specific pros — e.g. 'Lightstrike Pro foam returns 68% energy', 'Only 235g in US 10', 'Excellent heel-to-toe transition'"],
  "cons": ["2 specific cons — e.g. 'Narrow toe box', 'Outsole wears fast on concrete', 'Not ideal for speeds below 5:00/km'"],
  "bestFor": "One line — e.g. 'Long runs and marathon training at moderate pace'"
}

RULES:
- ONLY select shoes from the provided list — never invent shoes
- matchScore = how well this shoe matches THIS USER (85-99, best match highest)
- reviewScore = the shoe's objective quality rating from expert reviews (78-95, independent of user)
- whyThisShoe must reference the specific user's profile — foot type, mileage, experience
- pros must include at least one technical spec (foam name, weight, stack height, drop)
- cons must be honest — every shoe has weaknesses
- If user has flat feet, prioritize stability shoes
- If high arch, prioritize neutral cushion
- For beginners, avoid elite carbon racers
- For trail use case, ONLY pick trail shoes`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  try {
    const cleaned = text.replace(/```json|```/g, '').trim();
    const aiPicks: Array<{
      id: string;
      matchScore: number;
      whyThisShoe: string;
      reviewSummary: string;
      reviewScore: number;
      pros: string[];
      cons: string[];
      bestFor: string;
    }> = JSON.parse(cleaned);

    const recommendations: ShoeRecommendation[] = aiPicks
      .map((pick) => {
        const shoe = filtered.find((s) => s.id === pick.id);
        if (!shoe) return null;
        return {
          id: shoe.id,
          name: `${shoe.brand} ${shoe.model}`,
          brand: shoe.brand,
          model: shoe.model,
          matchScore: pick.matchScore,
          price: shoe.priceDisplay,
          category: shoe.category,
          foam: shoe.foam,
          plate: shoe.plate,
          tech: shoe.tech,
          whyThisShoe: pick.whyThisShoe,
          reviewSummary: pick.reviewSummary || '',
          reviewScore: pick.reviewScore || 80,
          pros: pick.pros || [],
          cons: pick.cons || [],
          bestFor: pick.bestFor || '',
          buyLinks: shoe.buyLinks,
        };
      })
      .filter(Boolean) as ShoeRecommendation[];

    return recommendations.slice(0, 5);
  } catch (err) {
    console.error('Failed to parse Gemini response:', text, err);
    return [];
  }
}

/**
 * Free-form chat with SoleMate AI
 */
export async function chatWithSoleMate(
  messages: ChatMessage[],
  userMessage: string
): Promise<string> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const history = messages.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  const chat = model.startChat({
    history,
    systemInstruction:
      'You are SoleMate, an expert AI shoe advisor for the Indian running market. ' +
      'You combine the analytical depth of RunRepeat (data-driven scores), Sole Review (foam density analysis), ' +
      'and RunTesters (real-world comparative testing). ' +
      'Keep replies concise, warm, and conversational. ' +
      'Always recommend specific shoe models with INR pricing. ' +
      'You deeply understand running biomechanics, gait types, pronation, shoe stack heights, drop angles, ' +
      'foam technologies (ZoomX, NITRO, FlyteFoam, PEBA, TPU, EVA), and carbon plate mechanics. ' +
      'Reference Indian retailers (Amazon.in, Flipkart, Myntra, Tata Cliq) for purchase links. ' +
      'If unsure, say so honestly rather than guessing.',
  });

  const result = await chat.sendMessage(userMessage);
  return result.response.text();
}
