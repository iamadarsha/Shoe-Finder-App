import { GoogleGenerativeAI } from '@google/generative-ai';
import { validateChatRequest } from './validate.js';

const ALLOWED_ORIGIN = 'https://shoe-finder-app-gsdz.vercel.app';
const DEFAULT_TIMEOUT_MS = 12_000;

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

function withTimeout(promise, timeoutMs = DEFAULT_TIMEOUT_MS) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Gemini chat request timed out.')), timeoutMs);
    }),
  ]);
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

  const validation = validateChatRequest(requestBody);
  if (!validation.valid) {
    return res.status(400).json({ error: validation.error });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: 'Missing GEMINI_API_KEY server environment variable.',
    });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const history = requestBody.messages.map((message) => ({
      role: message.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: message.content }],
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

    const result = await withTimeout(chat.sendMessage(requestBody.userMessage));
    const reply = result.response.text();

    return res.status(200).json({ reply });
  } catch (error) {
    console.error('Chat API error:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Chat request failed.',
    });
  }
}
