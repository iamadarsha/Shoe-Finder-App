const { GoogleGenerativeAI } = require('@google/generative-ai');
const { SHOE_DATABASE } = require('./shoe-data');

const ALLOWED = {
  useCase: new Set(['running', 'casual', 'training', 'walking', 'trail', 'racing']),
  experience: new Set(['beginner', 'intermediate', 'advanced']),
  footType: new Set(['neutral', 'flat', 'high_arch']),
  mileage: new Set(['low', 'medium', 'high']),
  budget: new Set(['budget', 'mid', 'premium']),
};

const BUDGET_MAP = {
  budget: 8000,
  mid: 15000,
  premium: 100000,
};

const USE_CASE_MAP = {
  running: ['daily', 'cushion', 'speed', 'racing'],
  casual: ['casual', 'daily', 'budget'],
  training: ['training', 'daily'],
  walking: ['casual', 'cushion', 'stability', 'budget'],
  trail: ['trail'],
  racing: ['racing', 'speed'],
};

function sendJson(res, status, payload) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(payload));
}

async function readBody(req) {
  if (typeof req.body === 'string') {
    return req.body;
  }
  if (req.body && typeof req.body === 'object') {
    return JSON.stringify(req.body);
  }

  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
    });
    req.on('end', () => resolve(raw));
    req.on('error', reject);
  });
}

function parseJsonSafely(raw) {
  try {
    return JSON.parse(raw || '{}');
  } catch (_err) {
    return null;
  }
}

function validatePreferences(prefs) {
  if (!prefs || typeof prefs !== 'object' || Array.isArray(prefs)) {
    return 'preferences must be an object';
  }

  const requiredFields = ['useCase', 'experience', 'footType', 'mileage', 'budget'];
  for (const field of requiredFields) {
    const value = prefs[field];
    if (typeof value !== 'string') {
      return `${field} must be a string`;
    }
    if (!ALLOWED[field].has(value)) {
      return `${field} has an invalid value`;
    }
  }

  return null;
}

function normalizeBuyLinks(shoe) {
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

function filterShoes(preferences, shoeDatabase) {
  let filtered = [...shoeDatabase];

  const maxPrice = Math.round(BUDGET_MAP[preferences.budget] * 1.25);
  filtered = filtered.filter((shoe) => shoe.priceMin <= maxPrice);

  const relevantCases = USE_CASE_MAP[preferences.useCase] || [];
  const byUseCase = filtered.filter((shoe) =>
    shoe.useCases.some((useCase) => relevantCases.includes(useCase))
  );
  if (byUseCase.length >= 5) {
    filtered = byUseCase;
  }

  const byExperience = filtered.filter((shoe) =>
    shoe.experienceLevel.includes(preferences.experience)
  );
  if (byExperience.length >= 5) {
    filtered = byExperience;
  }

  if (filtered.length > 40) {
    filtered = filtered.slice(0, 40);
  }

  if (filtered.length < 5) {
    return [...shoeDatabase].sort((a, b) => a.priceMin - b.priceMin).slice(0, 15);
  }

  return filtered;
}

function buildPrompt(preferences, filteredShoes) {
  const shoePayload = filteredShoes.map((shoe) => ({
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
${JSON.stringify(shoePayload, null, 2)}

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

function parseGeminiResponse(rawText) {
  const cleaned = rawText.replace(/```json|```/g, '').trim();
  const parsed = JSON.parse(cleaned);
  if (Array.isArray(parsed)) {
    return parsed;
  }
  if (parsed && Array.isArray(parsed.recommendations)) {
    return parsed.recommendations;
  }
  return [];
}

function toNumber(value, fallback, min, max) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return fallback;
  }
  return Math.max(min, Math.min(max, Math.round(numeric)));
}

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  if (req.method !== 'POST') {
    sendJson(res, 405, { error: 'Method not allowed' });
    return;
  }

  if (!process.env.GEMINI_API_KEY) {
    sendJson(res, 500, { error: 'GEMINI_API_KEY is not configured on server' });
    return;
  }

  try {
    const raw = await readBody(req);
    const body = parseJsonSafely(raw);
    if (!body) {
      sendJson(res, 400, { error: 'Invalid JSON body' });
      return;
    }

    const preferences = body.preferences || body;
    const validationError = validatePreferences(preferences);
    if (validationError) {
      sendJson(res, 400, { error: validationError });
      return;
    }

    const filteredShoes = filterShoes(preferences, SHOE_DATABASE);
    const prompt = buildPrompt(preferences, filteredShoes);

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-3.1-flash-lite' });
    const result = await model.generateContent(prompt);
    const rawText = result.response.text();
    const picks = parseGeminiResponse(rawText);

    const recommendations = picks
      .map((pick) => {
        const shoe = SHOE_DATABASE.find((item) => item.id === pick.id);
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
        };
      })
      .filter(Boolean)
      .slice(0, 5);

    sendJson(res, 200, { recommendations });
  } catch (error) {
    console.error('recommend api error:', error);
    sendJson(res, 500, { error: error instanceof Error ? error.message : 'Unknown server error' });
  }
};
