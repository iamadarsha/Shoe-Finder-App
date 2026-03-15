const RECOMMEND_ENUMS = {
  useCase: ['running', 'casual', 'training', 'walking', 'trail', 'racing'],
  experience: ['beginner', 'intermediate', 'advanced'],
  footType: ['neutral', 'flat', 'high_arch'],
  mileage: ['low', 'medium', 'high'],
  budget: ['budget', 'mid', 'premium'],
};

const RECOMMEND_FIELDS = Object.keys(RECOMMEND_ENUMS);
const CHAT_FIELDS = ['messages', 'userMessage'];
const SCRIPT_TAG_REGEX = /<\s*\/?\s*script\b[^>]*>/i;
const HTML_TAG_REGEX = /<[^>]+>/;
const MAX_RECOMMEND_BODY_BYTES = 1024;
const MAX_CHAT_MESSAGE_LENGTH = 500;
const MAX_CHAT_HISTORY = 20;

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function containsHtmlLikeContent(value) {
  if (typeof value !== 'string') {
    return false;
  }
  return SCRIPT_TAG_REGEX.test(value) || HTML_TAG_REGEX.test(value);
}

function getBodySizeInBytes(body) {
  try {
    return Buffer.byteLength(JSON.stringify(body), 'utf8');
  } catch {
    return Number.POSITIVE_INFINITY;
  }
}

export function validateRecommendRequest(body) {
  if (!isObject(body)) {
    return { valid: false, error: 'Request body must be a JSON object.' };
  }

  if (getBodySizeInBytes(body) > MAX_RECOMMEND_BODY_BYTES) {
    return { valid: false, error: 'Request body exceeds 1KB limit.' };
  }

  const keys = Object.keys(body);
  const unknownFields = keys.filter((key) => !RECOMMEND_FIELDS.includes(key));
  if (unknownFields.length > 0) {
    return {
      valid: false,
      error: `Unexpected field(s): ${unknownFields.join(', ')}`,
    };
  }

  for (const field of RECOMMEND_FIELDS) {
    const value = body[field];
    if (typeof value !== 'string') {
      return { valid: false, error: `${field} must be a string.` };
    }
    if (!RECOMMEND_ENUMS[field].includes(value)) {
      return { valid: false, error: `${field} has an invalid value.` };
    }
  }

  return { valid: true };
}

export function validateChatRequest(body) {
  if (!isObject(body)) {
    return { valid: false, error: 'Request body must be a JSON object.' };
  }

  const keys = Object.keys(body);
  const unknownFields = keys.filter((key) => !CHAT_FIELDS.includes(key));
  if (unknownFields.length > 0) {
    return {
      valid: false,
      error: `Unexpected field(s): ${unknownFields.join(', ')}`,
    };
  }

  if (!Array.isArray(body.messages)) {
    return { valid: false, error: 'messages must be an array.' };
  }

  if (body.messages.length > MAX_CHAT_HISTORY) {
    return {
      valid: false,
      error: `messages cannot exceed ${MAX_CHAT_HISTORY} entries.`,
    };
  }

  for (const [index, message] of body.messages.entries()) {
    if (!isObject(message)) {
      return { valid: false, error: `messages[${index}] must be an object.` };
    }

    if (message.role !== 'user' && message.role !== 'assistant') {
      return {
        valid: false,
        error: `messages[${index}].role must be 'user' or 'assistant'.`,
      };
    }

    if (typeof message.content !== 'string') {
      return {
        valid: false,
        error: `messages[${index}].content must be a string.`,
      };
    }

    if (containsHtmlLikeContent(message.content)) {
      return {
        valid: false,
        error: `messages[${index}].content cannot contain HTML/script tags.`,
      };
    }
  }

  if (typeof body.userMessage !== 'string') {
    return { valid: false, error: 'userMessage must be a string.' };
  }

  if (body.userMessage.length > MAX_CHAT_MESSAGE_LENGTH) {
    return {
      valid: false,
      error: `userMessage cannot exceed ${MAX_CHAT_MESSAGE_LENGTH} characters.`,
    };
  }

  if (containsHtmlLikeContent(body.userMessage)) {
    return { valid: false, error: 'userMessage cannot contain HTML/script tags.' };
  }

  return { valid: true };
}

