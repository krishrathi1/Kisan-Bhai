import Groq from "groq-sdk";

const groqApiKey =
  process.env.GROQ_API_KEY ||
  process.env.NEXT_PUBLIC_GROQ_API_KEY ||
  "";

export const isGroqConfigured = Boolean(groqApiKey && groqApiKey.trim().length > 0);

export const groqClient = isGroqConfigured
  ? new Groq({ apiKey: groqApiKey.trim() })
  : null;

export const DEFAULT_GROQ_MODEL = "llama-3.3-70b-versatile";
export const FAST_GROQ_MODEL = "llama-3.1-8b-instant";

export interface GroqChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface CallGroqChatOptions {
  messages: GroqChatMessage[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
  jsonMode?: boolean;
}

/**
 * Call Groq Cloud API for ultra-fast LLM responses
 */
export async function callGroqChat({
  messages,
  model = DEFAULT_GROQ_MODEL,
  temperature = 0.3,
  maxTokens = 1024,
  jsonMode = false,
}: CallGroqChatOptions): Promise<string> {
  if (!groqClient) {
    throw new Error("GROQ_API_KEY is not configured in environment variables.");
  }

  const completion = await groqClient.chat.completions.create({
    model,
    messages,
    temperature,
    max_tokens: maxTokens,
    response_format: jsonMode ? { type: "json_object" } : undefined,
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error("Empty response received from Groq.");
  }

  return content;
}
