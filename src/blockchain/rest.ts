import { supabaseAnonKey, supabaseProjectUrl } from "@/lib/supabase";

export const SUPABASE_URL = supabaseProjectUrl;
export const SUPABASE_ANON_KEY = supabaseAnonKey;

function buildUrl(path: string, query?: Record<string, string | number | undefined>) {
  if (!SUPABASE_URL) {
    throw new Error("Supabase is not configured.");
  }

  const url = new URL(path, SUPABASE_URL);
  Object.entries(query || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.set(key, String(value));
    }
  });
  return url;
}

export function buildSupabaseHeaders(token?: string, isJson = true) {
  if (!SUPABASE_ANON_KEY) {
    throw new Error("Supabase anon key is missing.");
  }

  const headers: Record<string, string> = {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${token || SUPABASE_ANON_KEY}`,
  };

  if (isJson) {
    headers["Content-Type"] = "application/json";
  }

  return headers;
}

function safeJsonParse(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export async function supabaseRequest<T>(
  path: string,
  options: {
    method?: string;
    token?: string;
    body?: unknown;
    query?: Record<string, string | number | undefined>;
    headers?: Record<string, string>;
    rawBody?: BodyInit | null;
    isJson?: boolean;
  } = {},
): Promise<T> {
  const {
    method = "GET",
    token,
    body,
    query,
    headers: extraHeaders = {},
    rawBody,
    isJson = true,
  } = options;

  const response = await fetch(buildUrl(path, query).toString(), {
    method,
    headers: {
      ...buildSupabaseHeaders(token, isJson),
      ...extraHeaders,
    },
    body: rawBody ?? (body !== undefined ? JSON.stringify(body) : undefined),
  });

  const text = await response.text();
  const payload = text ? safeJsonParse(text) : null;

  if (!response.ok) {
    const message =
      payload && typeof payload === "object" && "message" in payload
        ? String((payload as any).message)
        : `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return payload as T;
}
