const { GoogleGenerativeAI } = require('@google/generative-ai');

const MODEL_CANDIDATES = [
  'gemini-3.1-flash-lite',
  'gemini-2.5-flash-lite',
  'gemini-2.5-flash',
];

const SYSTEM_INSTRUCTION =
  'You are SoleMate, an expert AI shoe advisor for the Indian running market. ' +
  'Recommend practical shoe options with INR-aware context, give concise biomechanical guidance, ' +
  'and keep responses clear and friendly.';

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

function validateChatPayload(payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return 'Request body must be an object';
  }

  if (typeof payload.userMessage !== 'string') {
    return 'userMessage must be a string';
  }
  if (payload.userMessage.trim().length === 0) {
    return 'userMessage cannot be empty';
  }
  if (payload.userMessage.length > 500) {
    return 'userMessage must be at most 500 characters';
  }

  if (!Array.isArray(payload.messages)) {
    return 'messages must be an array';
  }

  for (const message of payload.messages) {
    if (!message || typeof message !== 'object' || Array.isArray(message)) {
      return 'each message must be an object';
    }
    if (!['user', 'assistant'].includes(message.role)) {
      return 'message role must be user or assistant';
    }
    if (typeof message.content !== 'string') {
      return 'message content must be a string';
    }
  }

  return null;
}

function shouldTryNextModel(error) {
  const message = error instanceof Error ? error.message : String(error);
  return /404|not found|is not supported|unsupported|for API version/i.test(message);
}

async function sendChatWithModelFallback(genAI, history, userMessage) {
  let lastError = null;

  for (const modelName of MODEL_CANDIDATES) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: SYSTEM_INSTRUCTION,
      });
      const chat = model.startChat({ history });
      const result = await chat.sendMessage(userMessage);
      return { reply: result.response.text().trim(), modelName };
    } catch (error) {
      lastError = error;
      console.warn(`[chat] model ${modelName} failed:`, error);
      if (!shouldTryNextModel(error)) {
        break;
      }
    }
  }

  throw lastError || new Error('No compatible Gemini model available for chat');
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

    const validationError = validateChatPayload(body);
    if (validationError) {
      sendJson(res, 400, { error: validationError });
      return;
    }

    const history = body.messages.map((message) => ({
      role: message.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: message.content }],
    }));

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const { reply, modelName } = await sendChatWithModelFallback(
      genAI,
      history,
      body.userMessage
    );

    console.log(`[chat] replied using ${modelName}`);
    sendJson(res, 200, { reply });
  } catch (error) {
    console.error('chat api error:', error);
    sendJson(res, 500, { error: error instanceof Error ? error.message : 'Unknown server error' });
  }
};
