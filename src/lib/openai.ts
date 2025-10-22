// Anthropic-powered Treatment API client
// Use /api proxy in development to avoid CORS issues
const API_BASE_URL = import.meta.env.DEV ? '/api' : 'https://treatment.sloboda-agency.com';
const API_KEY = '141ecc9cdf225273e7ccc07596ca36f156b3b4227bd65f8d6ee8098ef87cff98';
const DEFAULT_MODEL = 'claude-sonnet-4-5-20250929';

interface GenerateRequest {
  session_id: string;
  task: string;
  model?: string;
  style?: string;
  additional_context?: string;
  temperature?: number;
  top_p?: number;
  top_k?: number;
  max_tokens?: number;
}

interface GenerateResponse {
  text: string;
}

export interface GenerationParams {
  temperature?: number;
  max_tokens?: number;
  style?: string;
  additional_context?: string;
  top_p?: number;
  top_k?: number;
}

// Generate unique session ID per paragraph/block
export function generateSessionId(
  treatmentId: string,
  chapterId: string,
  blockId?: string
): string {
  const timestamp = Date.now();
  const blockPart = blockId || 'main';
  return `${treatmentId}-${chapterId}-${blockPart}-${timestamp}`;
}

// Legacy API compatibility
export function getApiKey(): string {
  return API_KEY;
}

export function setApiKey(_key: string): void {
  // No-op for backwards compatibility
}

export function clearApiKey(): void {
  // No-op for backwards compatibility
}

async function callAnthropicAPI(
  request: GenerateRequest,
  signal?: AbortSignal
): Promise<string> {
  try {
    const response = await fetch(`${API_BASE_URL}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY,
      },
      body: JSON.stringify(request),
      signal,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error: ${response.status} - ${errorText}`);
    }

    const data: GenerateResponse = await response.json();
    return data.text;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      throw new Error('Generation cancelled');
    }
    throw error;
  }
}

export async function generateText(
  prompt: string,
  systemPrompt: string,
  onChunk?: (text: string) => void,
  signal?: AbortSignal,
  sessionId?: string,
  params?: GenerationParams
): Promise<string> {
  // Combine system prompt and user prompt into task
  const task = systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt;
  
  const request: GenerateRequest = {
    session_id: sessionId || `session-${Date.now()}`,
    task,
    model: DEFAULT_MODEL,
    temperature: params?.temperature ?? 0.8,
    max_tokens: params?.max_tokens ?? 2000,
    style: params?.style,
    additional_context: params?.additional_context,
    top_p: params?.top_p ?? 0.9,
    top_k: params?.top_k ?? 50,
  };

  const text = await callAnthropicAPI(request, signal);
  
  // If onChunk is provided, call it with the full text
  // (API doesn't support streaming, so we deliver it all at once)
  if (onChunk) {
    onChunk(text);
  }
  
  return text;
}

export async function generateCompletion(
  prompt: string,
  systemPrompt: string,
  signal?: AbortSignal,
  sessionId?: string,
  params?: GenerationParams
): Promise<string> {
  // Combine system prompt and user prompt into task
  const task = systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt;
  
  const request: GenerateRequest = {
    session_id: sessionId || `session-${Date.now()}`,
    task,
    model: DEFAULT_MODEL,
    temperature: params?.temperature ?? 0.7,
    max_tokens: params?.max_tokens ?? 1000,
    style: params?.style,
    additional_context: params?.additional_context,
    top_p: params?.top_p ?? 0.9,
    top_k: params?.top_k ?? 50,
  };

  return callAnthropicAPI(request, signal);
}

