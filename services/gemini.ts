import { GoogleGenerativeAI } from '@google/generative-ai';
import { SHOE_DATABASE } from '../data/shoe-database';
import { ChatMessage, Shoe, ShoeRecommendation, UserPreferences } from '../types';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
if (!API_KEY) {
  console.warn('⚠️ VITE_GEMINI_API_KEY is not set. Using server API only.');
}

const clientGenAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;
const MODEL_CANDIDATES = [
  'gemini-3.1-flash-lite',
  'gemini-2.5-flash-lite',
  'gemini-2.5-flash',
] as const;
const CHAT_SYSTEM_INSTRUCTION =
  'You are SoleMate, a human-friendly shoe advisor for the Indian running market. ' +
  'Your tone should be warm, practical, and concise. ' +
  'Rules: keep replies short and easy to scan; avoid markdown symbols like **, #, or ```; ' +
  'ask at most ONE clarifying question per reply; do not ask long questionnaires; ' +
  'when recommending, share up to 3 options with price range in INR and one-line reason each; ' +
  'prefer plain text with brief sections and line breaks; avoid repeating greetings every turn.';

const BUDGET_MAP: Record<'budget' | 'mid' | 'premium', number> = {
  budget: 8000,
  mid: 15000,
  premium: 100000,
};

const USE_CASE_MAP: Record<string, string[]> = {
  running: ['daily', 'cushion', 'speed', 'racing'],
  casual: ['casual', 'daily', 'budget'],
  training: ['training', 'daily'],
  walking: ['casual', 'cushion', 'stability', 'budget'],
  trail: ['trail'],
  racing: ['racing', 'speed'],
};

type AiPick = {
  id: string;
  matchScore: number;
  whyThisShoe: string;
  reviewSummary: string;
  reviewScore: number;
  pros: string[];
  cons: string[];
  bestFor: string;
};

function toNumber(value: unknown, fallback: number, min: number, max: number): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }
  return Math.max(min, Math.min(max, Math.round(parsed)));
}

function normalizeBuyLinks(shoe: Shoe): ShoeRecommendation['buyLinks'] {
  const query = encodeURIComponent(`${shoe.brand} ${shoe.model}`);
  return {
    amazon: shoe.buyLinks?.amazon || `https://www.amazon.in/s?k=${query}`,
    flipkart: shoe.buyLinks?.flipkart || `https://www.flipkart.com/search?q=${query}`,
    official: shoe.buyLinks?.official || '',
    googleShopping:
      shoe.buyLinks?.googleShopping ||
      `https://www.google.com/search?tbm=shop&q=${query}`,
  };
}

function filterShoes(preferences: UserPreferences, shoes: Shoe[]): Shoe[] {
  let filtered = [...shoes];

  if (preferences.budget) {
    const maxPrice = Math.round(BUDGET_MAP[preferences.budget] * 1.25);
    filtered = filtered.filter((shoe) => shoe.priceMin <= maxPrice);
  }

  if (preferences.useCase) {
    const relevantCases = USE_CASE_MAP[preferences.useCase] || [];
    const byUseCase = filtered.filter((shoe) =>
      shoe.useCases.some((useCase) => relevantCases.includes(useCase))
    );
    if (byUseCase.length >= 5) {
      filtered = byUseCase;
    }
  }

  if (preferences.experience) {
    const byExperience = filtered.filter((shoe) =>
      shoe.experienceLevel.includes(preferences.experience as string)
    );
    if (byExperience.length >= 5) {
      filtered = byExperience;
    }
  }

  if (filtered.length > 40) {
    filtered = filtered.slice(0, 40);
  }

  if (filtered.length < 5) {
    return [...shoes].sort((a, b) => a.priceMin - b.priceMin).slice(0, 15);
  }

  return filtered;
}

function buildRecommendationPrompt(preferences: UserPreferences, filteredShoes: Shoe[]): string {
  const payload = filteredShoes.map((shoe) => ({
    id: shoe.id,
    brand: shoe.brand,
    model: shoe.model,
    category: shoe.category,
    price: shoe.priceDisplay,
    foam: shoe.foam,
    plate: shoe.plate,
    tech: shoe.tech,
    useCases: shoe.useCases,
    experienceLevel: shoe.experienceLevel,
  }));

  return `You are SoleMate AI, an expert shoe advisor combining RunRepeat scoring, SoleReview foam analysis, and RunTesters real-world testing.

USER PROFILE:
- useCase: ${preferences.useCase}
- experience: ${preferences.experience}
- footType: ${preferences.footType}
- mileage: ${preferences.mileage}
- budget: ${preferences.budget}

FILTERED SHOES:
${JSON.stringify(payload, null, 2)}

Select TOP 5. Return ONLY raw JSON array.
Each object must have:
- id
- matchScore (85-99)
- whyThisShoe (2-3 personal sentences)
- reviewSummary (1-2 sentences from expert perspective)
- reviewScore (78-95, RunRepeat-style objective score)
- pros (3 technical specifics)
- cons (2 honest weaknesses)
- bestFor (one line)`;
}

function parsePicks(rawText: string): AiPick[] {
  const cleaned = rawText.replace(/```json|```/g, '').trim();
  const parsed = JSON.parse(cleaned) as unknown;

  if (Array.isArray(parsed)) {
    return parsed as AiPick[];
  }
  if (
    parsed &&
    typeof parsed === 'object' &&
    Array.isArray((parsed as { recommendations?: unknown[] }).recommendations)
  ) {
    return (parsed as { recommendations: AiPick[] }).recommendations;
  }
  return [];
}

function cleanReplyText(reply: string): string {
  return String(reply || '')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/^#{1,6}\s*/gm, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
}

function shouldTryNextModel(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return /404|not found|is not supported|unsupported|for API version/i.test(message);
}

async function generateContentWithModelFallback(prompt: string): Promise<string> {
  if (!clientGenAI) {
    throw new Error('Client Gemini is not initialized');
  }

  let lastError: unknown = null;

  for (const modelName of MODEL_CANDIDATES) {
    try {
      const model = clientGenAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      lastError = error;
      console.error(`[SoleMate] Client model ${modelName} failed:`, error);
      if (!shouldTryNextModel(error)) {
        break;
      }
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error('No compatible Gemini model available for recommendation');
}

async function sendChatWithModelFallback(
  messages: ChatMessage[],
  userMessage: string
): Promise<string> {
  if (!clientGenAI) {
    throw new Error('Client Gemini is not initialized');
  }

  const history = messages.map((message) => ({
    role: message.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: message.content }],
  }));

  let lastError: unknown = null;

  for (const modelName of MODEL_CANDIDATES) {
    try {
      const model = clientGenAI.getGenerativeModel({
        model: modelName,
        systemInstruction: CHAT_SYSTEM_INSTRUCTION,
      });
      const chat = model.startChat({ history });
      const result = await chat.sendMessage(userMessage);
      return cleanReplyText(result.response.text());
    } catch (error) {
      lastError = error;
      console.error(`[SoleMate] Client chat model ${modelName} failed:`, error);
      if (!shouldTryNextModel(error)) {
        break;
      }
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error('No compatible Gemini model available for chat');
}

function mergePicksWithShoes(picks: AiPick[], shoeDatabase: Shoe[]): ShoeRecommendation[] {
  return picks
    .map((pick) => {
      const shoe = shoeDatabase.find((item) => item.id === pick.id);
      if (!shoe) {
        return null;
      }

      return {
        id: shoe.id,
        name: `${shoe.brand} ${shoe.model}`,
        brand: shoe.brand,
        model: shoe.model,
        matchScore: toNumber(pick.matchScore, 88, 85, 99),
        price: shoe.priceDisplay,
        category: shoe.category,
        foam: shoe.foam,
        plate: shoe.plate,
        tech: shoe.tech,
        whyThisShoe: String(pick.whyThisShoe || '').trim(),
        reviewSummary: String(pick.reviewSummary || '').trim(),
        reviewScore: toNumber(pick.reviewScore, 82, 78, 95),
        pros: Array.isArray(pick.pros) ? pick.pros.slice(0, 3).map(String) : [],
        cons: Array.isArray(pick.cons) ? pick.cons.slice(0, 2).map(String) : [],
        bestFor: String(pick.bestFor || '').trim(),
        buyLinks: normalizeBuyLinks(shoe),
      } satisfies ShoeRecommendation;
    })
    .filter(Boolean) as ShoeRecommendation[];
}

async function fetchRecommendationsFromServer(preferences: UserPreferences): Promise<ShoeRecommendation[]> {
  const response = await fetch('/api/recommend', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ preferences }),
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(payload?.error || `Server recommend API failed (${response.status})`);
  }
  if (!payload || !Array.isArray(payload.recommendations)) {
    throw new Error('Server recommend API returned invalid payload');
  }

  return payload.recommendations as ShoeRecommendation[];
}

async function fetchChatFromServer(messages: ChatMessage[], userMessage: string): Promise<string> {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, userMessage }),
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(payload?.error || `Server chat API failed (${response.status})`);
  }
  if (!payload || typeof payload.reply !== 'string') {
    throw new Error('Server chat API returned invalid payload');
  }
  return cleanReplyText(payload.reply);
}

export async function getShoeRecommendations(
  preferences: UserPreferences,
  shoeDatabase: Shoe[] = SHOE_DATABASE
): Promise<ShoeRecommendation[]> {
  try {
    return await fetchRecommendationsFromServer(preferences);
  } catch (serverError) {
    console.error('[SoleMate] /api/recommend failed. Falling back to client Gemini:', serverError);
  }

  if (!clientGenAI) {
    console.error('[SoleMate] Client fallback unavailable: VITE_GEMINI_API_KEY is missing.');
    return [];
  }

  try {
    const filteredShoes = filterShoes(preferences, shoeDatabase);
    const prompt = buildRecommendationPrompt(preferences, filteredShoes);
    const responseText = await generateContentWithModelFallback(prompt);
    const picks = parsePicks(responseText);
    const recommendations = mergePicksWithShoes(picks, shoeDatabase).slice(0, 5);
    return recommendations;
  } catch (clientError) {
    console.error('[SoleMate] Client fallback recommendation failed:', clientError);
    return [];
  }
}

export async function chatWithSoleMate(
  messages: ChatMessage[],
  userMessage: string
): Promise<string> {
  try {
    return await fetchChatFromServer(messages, userMessage);
  } catch (serverError) {
    console.error('[SoleMate] /api/chat failed. Falling back to client Gemini:', serverError);
  }

  if (!clientGenAI) {
    console.error('[SoleMate] Client fallback chat unavailable: VITE_GEMINI_API_KEY is missing.');
    return 'Sorry, chat is temporarily unavailable. Please try again in a bit.';
  }

  try {
    return await sendChatWithModelFallback(messages, userMessage);
  } catch (clientError) {
    console.error('[SoleMate] Client fallback chat failed:', clientError);
    return 'Sorry, I ran into an error. Please try again.';
  }
}
