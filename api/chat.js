const { GoogleGenerativeAI } = require('@google/generative-ai');

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
    const model = genAI.getGenerativeModel({ model: 'gemini-3.1-flash-lite' });
    const chat = model.startChat({
      history,
      systemInstruction:
        'You are SoleMate, an expert AI shoe advisor for the Indian running market. ' +
        'Recommend practical shoe options with INR-aware context, give concise biomechanical guidance, ' +
        'and keep responses clear and friendly.',
    });

    const result = await chat.sendMessage(body.userMessage);
    const reply = result.response.text().trim();

    sendJson(res, 200, { reply });
  } catch (error) {
    console.error('chat api error:', error);
    sendJson(res, 500, { error: error instanceof Error ? error.message : 'Unknown server error' });
  }
};
