import { UserPreferences, ShoeRecommendation, ChatMessage } from '../types';

interface RecommendationApiResponse {
  recommendations?: ShoeRecommendation[];
  error?: string;
}

interface ChatApiResponse {
  reply?: string;
  error?: string;
}

async function parseApiError(response: Response): Promise<string> {
  try {
    const payload = await response.json();
    if (payload && typeof payload.error === 'string') {
      return payload.error;
    }
  } catch {
    // ignore JSON parse failure
  }

  return `Request failed with status ${response.status}.`;
}

/**
 * Requests recommendations from the server-side API route.
 * The second argument is kept for backwards compatibility with existing callers.
 */
export async function getShoeRecommendations(
  prefs: UserPreferences,
  _shoeDatabase?: unknown
): Promise<ShoeRecommendation[]> {
  const response = await fetch('/api/recommend', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(prefs),
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  const payload = (await response.json()) as RecommendationApiResponse;
  if (payload.error) {
    console.warn('Recommendation API warning:', payload.error);
  }

  return Array.isArray(payload.recommendations) ? payload.recommendations : [];
}

/**
 * Free-form chat with SoleMate AI via the server-side proxy.
 */
export async function chatWithSoleMate(
  messages: ChatMessage[],
  userMessage: string
): Promise<string> {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, userMessage }),
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  const payload = (await response.json()) as ChatApiResponse;
  if (payload.error) {
    throw new Error(payload.error);
  }

  return payload.reply ?? '';
}
