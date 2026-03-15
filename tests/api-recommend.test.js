import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { filterAndScoreShoes } from '../api/filter-engine.js';
import { SHOE_DATABASE } from '../api/shoe-data.js';

const { mockGenerateContent } = vi.hoisted(() => ({
  mockGenerateContent: vi.fn(),
}));

vi.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: class {
    getGenerativeModel() {
      return {
        generateContent: (...args) => mockGenerateContent(...args),
      };
    }
  },
}));

let handler;
let resetRecommendState;
let setGeminiTimeoutForTests;

const validPreferences = {
  useCase: 'running',
  experience: 'intermediate',
  footType: 'neutral',
  mileage: 'medium',
  budget: 'mid',
};

function createReq(body, ip = '10.0.0.1') {
  return {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-forwarded-for': ip,
    },
    body,
  };
}

function createRes() {
  return {
    statusCode: 200,
    headers: {},
    body: null,
    ended: false,
    setHeader(name, value) {
      this.headers[name] = value;
      return this;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
    end() {
      this.ended = true;
      return this;
    },
  };
}

function buildGeminiResult(jsonPayload) {
  return {
    response: {
      text: () => JSON.stringify(jsonPayload),
    },
  };
}

beforeAll(async () => {
  const module = await import('../api/recommend.js');
  handler = module.default;
  resetRecommendState = module.__resetRecommendTestState;
  setGeminiTimeoutForTests = module.__setGeminiTimeoutForTests;
});

beforeEach(() => {
  process.env.GEMINI_API_KEY = 'test-gemini-key';
  resetRecommendState();
  mockGenerateContent.mockReset();
});

describe('/api/recommend', () => {
  it('Valid request returns 5 recommendations', async () => {
    const topCandidates = filterAndScoreShoes(validPreferences, SHOE_DATABASE).slice(0, 5);
    const geminiPayload = topCandidates.map((shoe, index) => ({
      id: shoe.id,
      matchScore: 95 - index,
      whyThisShoe: `Great fit ${index + 1}`,
      reviewSummary: `Solid review ${index + 1}`,
      reviewScore: 88 + index,
      pros: ['Great cushioning', 'Good traction', 'Reliable upper'],
      cons: ['Slightly heavy', 'Expensive'],
      bestFor: 'Daily running',
    }));

    mockGenerateContent.mockResolvedValue(buildGeminiResult(geminiPayload));

    const req = createReq(validPreferences);
    const res = createRes();
    await handler(req, res);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.recommendations)).toBe(true);
    expect(res.body.recommendations).toHaveLength(5);
  });

  it('Invalid preferences return an error message', async () => {
    const req = createReq({
      ...validPreferences,
      useCase: 'invalid-use-case',
    });
    const res = createRes();
    await handler(req, res);

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/invalid/i);
  });

  it('Gemini API timeout returns empty array with error', async () => {
    setGeminiTimeoutForTests(10);
    mockGenerateContent.mockImplementation(
      () =>
        new Promise(() => {
          // intentionally unresolved promise
        })
    );

    const req = createReq(validPreferences);
    const res = createRes();
    await handler(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.body.recommendations).toEqual([]);
    expect(String(res.body.error).toLowerCase()).toContain('timed out');
  });

  it('Malformed Gemini JSON is handled gracefully', async () => {
    mockGenerateContent.mockResolvedValue({
      response: {
        text: () => 'not-valid-json',
      },
    });

    const req = createReq(validPreferences);
    const res = createRes();
    await handler(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.body.recommendations).toEqual([]);
    expect(String(res.body.error).toLowerCase()).toContain('malformed');
  });

  it('Rate limit exceeded returns 429 status', async () => {
    const topCandidates = filterAndScoreShoes(validPreferences, SHOE_DATABASE).slice(0, 5);
    mockGenerateContent.mockResolvedValue(
      buildGeminiResult(
        topCandidates.map((shoe) => ({
          id: shoe.id,
          matchScore: 90,
          whyThisShoe: 'Good fit',
          reviewSummary: 'Good review',
          reviewScore: 85,
          pros: ['Good'],
          cons: ['Costly'],
          bestFor: 'Running',
        }))
      )
    );

    for (let i = 0; i < 10; i += 1) {
      const res = createRes();
      await handler(createReq(validPreferences, '42.42.42.42'), res);
      expect(res.statusCode).toBe(200);
    }

    const limitedRes = createRes();
    await handler(createReq(validPreferences, '42.42.42.42'), limitedRes);

    expect(limitedRes.statusCode).toBe(429);
    expect(String(limitedRes.body.error).toLowerCase()).toContain('rate limit');
  });

  it('Missing API key returns 500 with helpful error', async () => {
    delete process.env.GEMINI_API_KEY;

    const req = createReq(validPreferences);
    const res = createRes();
    await handler(req, res);

    expect(res.statusCode).toBe(500);
    expect(String(res.body.error)).toContain('GEMINI_API_KEY');
  });
});
