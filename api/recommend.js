import { GoogleGenerativeAI } from '@google/generative-ai';
import { SHOE_DATABASE } from './shoe-data.js';
import { filterAndScoreShoes } from './filter-engine.js';
import { validateRecommendRequest } from './validate.js';
import {
  buildPreferenceCacheKey,
  getCachedResponse,
  setCachedResponse,
  clearCache,
} from './cache.js';

const ALLOWED_ORIGIN = 'https://shoe-finder-app-gsdz.vercel.app';
const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const DEFAULT_TIMEOUT_MS = 12_000;
const rateLimitStore = new Map();
let geminiTimeoutMs = DEFAULT_TIMEOUT_MS;

function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Vary', 'Origin');
}

function parseBody(req) {
  if (req.body && typeof req.body === 'object') {
    return req.body;
  }

  if (typeof req.body === 'string' && req.body.length > 0) {
    try {
      return JSON.parse(req.body);
    } catch {
      return null;
    }
  }

  return req.body ?? null;
}

function getClientIp(req) {
  const forwardedFor = req.headers?.['x-forwarded-for'];
  if (typeof forwardedFor === 'string' && forwardedFor.trim().length > 0) {
    return forwardedFor.split(',')[0].trim();
  }

  const realIp = req.headers?.['x-real-ip'];
  if (typeof realIp === 'string' && realIp.trim().length > 0) {
    return realIp.trim();
  }

  return 'unknown-ip';
}

function checkRateLimit(ip) {
  const now = Date.now();
  const bucket = rateLimitStore.get(ip) ?? [];
  const activeRequests = bucket.filter((timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS);

  if (activeRequests.length >= RATE_LIMIT_MAX) {
    const retryAfter = Math.max(
      1,
      Math.ceil((RATE_LIMIT_WINDOW_MS - (now - activeRequests[0])) / 1000)
    );

    rateLimitStore.set(ip, activeRequests);
    return { allowed: false, retryAfter };
  }

  activeRequests.push(now);
  rateLimitStore.set(ip, activeRequests);
  return { allowed: true, retryAfter: 0 };
}

function withTimeout(promise, timeoutMs) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Gemini request timed out')), timeoutMs);
    }),
  ]);
}

function tryParseJson(rawText) {
  const cleaned = rawText.replace(/```json|```/gi, '').trim();

  try {
    const parsed = JSON.parse(cleaned);
    if (Array.isArray(parsed)) return parsed;
  } catch {
    // fall through to regex extraction
  }

  const arrayMatch = cleaned.match(/\[[\s\S]*\]/);
  if (!arrayMatch) {
    return null;
  }

  try {
    const parsed = JSON.parse(arrayMatch[0]);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function buildPrompt(preferences, candidates) {
  const mileageLabel =
    preferences.mileage === 'low'
      ? '0–20 km/week'
      : preferences.mileage === 'medium'
        ? '20–50 km/week'
        : '50+ km/week';

  const budgetLabel =
    preferences.budget === 'budget'
      ? 'Under ₹8,000'
      : preferences.budget === 'mid'
        ? '₹8,000–15,000'
        : '₹15,000+';

  const footTypeLabel =
    preferences.footType === 'flat'
      ? 'Flat feet (overpronation)'
      : preferences.footType === 'high_arch'
        ? 'High arch (underpronation)'
        : 'Neutral';

  const candidateJson = JSON.stringify(
    candidates.map((shoe) => ({
      id: shoe.id,
      brand: shoe.brand,
      model: shoe.model,
      category: shoe.category,
      priceDisplay: shoe.priceDisplay,
      foam: shoe.foam,
      plate: shoe.plate,
      tech: shoe.tech,
      baseScore: shoe.baseScore,
    })),
    null,
    2
  );

  return `You are SoleMate AI, an expert shoe advisor for the Indian market.

USER PROFILE:
- Use case: ${preferences.useCase}
- Experience: ${preferences.experience}
- Foot type: ${footTypeLabel}
- Weekly mileage: ${mileageLabel}
- Budget: ${budgetLabel}

TOP CANDIDATE SHOES (pre-filtered and scored):
${candidateJson}

IMPORTANT:
- baseScore is a pre-computed relevance signal from our rules engine. Use it as a strong ranking signal.
- Pick exactly 5 shoes from this list only.
- Return raw JSON only (no markdown, no prose, no code fences).

Return this JSON array shape:
[
  {
    "id": "shoe-id",
    "matchScore": 0-100,
    "whyThisShoe": "2-3 sentences personalized to the profile",
    "reviewSummary": "1-2 sentence objective summary",
    "reviewScore": 0-100,
    "pros": ["pro 1", "pro 2", "pro 3"],
    "cons": ["con 1", "con 2"],
    "bestFor": "one line"
  }
]`;
}

function mergeRecommendations(aiPicks, candidatesById) {
  return aiPicks
    .map((pick) => {
      const shoe = candidatesById.get(pick?.id);
      if (!shoe) return null;

      return {
        id: shoe.id,
        name: `${shoe.brand} ${shoe.model}`,
        brand: shoe.brand,
        model: shoe.model,
        matchScore: Number.isFinite(pick.matchScore) ? pick.matchScore : shoe.baseScore,
        price: shoe.priceDisplay,
        category: shoe.category,
        foam: shoe.foam,
        plate: shoe.plate,
        tech: shoe.tech,
        whyThisShoe: String(pick.whyThisShoe ?? ''),
        reviewSummary: String(pick.reviewSummary ?? ''),
        reviewScore: Number.isFinite(pick.reviewScore) ? pick.reviewScore : 80,
        pros: Array.isArray(pick.pros) ? pick.pros.map((item) => String(item)) : [],
        cons: Array.isArray(pick.cons) ? pick.cons.map((item) => String(item)) : [],
        bestFor: String(pick.bestFor ?? ''),
        buyLinks: shoe.buyLinks,
      };
    })
    .filter(Boolean)
    .slice(0, 5);
}

async function fetchGeminiRecommendations(preferences, candidates, apiKey) {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  const prompt = buildPrompt(preferences, candidates);

  const result = await withTimeout(model.generateContent(prompt), geminiTimeoutMs);
  const responseText = result.response.text();
  const parsed = tryParseJson(responseText);

  if (!parsed) {
    throw new Error('Gemini returned malformed JSON.');
  }

  const candidateMap = new Map(candidates.map((shoe) => [shoe.id, shoe]));
  return mergeRecommendations(parsed, candidateMap);
}

export default async function handler(req, res) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  const requestBody = parseBody(req);
  if (!requestBody) {
    return res.status(400).json({ error: 'Invalid JSON body.' });
  }

  const validation = validateRecommendRequest(requestBody);
  if (!validation.valid) {
    return res.status(400).json({ error: validation.error });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: 'Missing GEMINI_API_KEY server environment variable.',
    });
  }

  const ip = getClientIp(req);
  const { allowed, retryAfter } = checkRateLimit(ip);
  if (!allowed) {
    res.setHeader('Retry-After', String(retryAfter));
    return res.status(429).json({ error: 'Rate limit exceeded. Try again soon.' });
  }

  const cacheKey = buildPreferenceCacheKey(requestBody);
  const cachedRecommendations = getCachedResponse(cacheKey);
  if (cachedRecommendations) {
    return res.status(200).json({
      recommendations: cachedRecommendations,
      cached: true,
    });
  }

  try {
    const candidates = filterAndScoreShoes(requestBody, SHOE_DATABASE).slice(0, 20);
    if (candidates.length === 0) {
      return res.status(200).json({ recommendations: [] });
    }

    const recommendations = await fetchGeminiRecommendations(
      requestBody,
      candidates,
      apiKey
    );

    setCachedResponse(cacheKey, recommendations);
    return res.status(200).json({ recommendations });
  } catch (error) {
    console.error('Recommendation error:', error);
    return res.status(200).json({
      recommendations: [],
      error: error instanceof Error ? error.message : 'Recommendation failed.',
    });
  }
}

export function __setGeminiTimeoutForTests(timeoutMs) {
  geminiTimeoutMs = timeoutMs;
}

export function __resetRecommendTestState() {
  rateLimitStore.clear();
  clearCache();
  geminiTimeoutMs = DEFAULT_TIMEOUT_MS;
}

