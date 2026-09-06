import { AppTimestamp } from "@/lib/app-timestamp";

function normalizeSupabaseUrl(rawUrl: string) {
  const trimmed = rawUrl.trim().replace(/\/$/, "");
  if (!trimmed) return "";

  try {
    return new URL(trimmed).toString().replace(/\/$/, "");
  } catch {
    return `https://${trimmed}`;
  }
}

const SUPABASE_URL = normalizeSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL || "");
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const SUPABASE_STORAGE_BUCKET = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || "profile-images";

export const supabaseConfigured = Boolean(SUPABASE_URL && supabaseAnonKey);
export const supabaseProjectUrl = SUPABASE_URL;
export const supabaseBucket = SUPABASE_STORAGE_BUCKET;

const SESSION_STORAGE_KEY = "beejmantra.supabase.session";
const OAUTH_FLOW_STORAGE_KEY = "beejmantra.supabase.oauth.flow";
const GOOGLE_REDIRECT_PATH = "/auth/callback";

export interface SupabaseAuthUser {
  id: string;
  email: string | null;
  user_metadata?: Record<string, any>;
  app_metadata?: Record<string, any>;
}

export interface SupabaseSession {
  access_token: string;
  refresh_token: string;
  expires_at?: number | null;
  token_type?: string;
  user: SupabaseAuthUser;
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  location?: string;
  language?: string;
  crops?: string;
}

export interface TransactionRow {
  id: string;
  user_id: string;
  description: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  date: string;
}

export interface AppUser {
  id: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export interface StoredSession {
  access_token: string;
  refresh_token: string;
  expires_at?: number | null;
  token_type?: string;
  user: SupabaseAuthUser;
}

export interface AuthResult {
  user: AppUser;
  profile: UserProfile;
  transactions: Transaction[];
  session: StoredSession;
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  date: AppTimestamp;
}

export interface TransactionData {
  description: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  date: Date;
}

const defaultProfile = (user: SupabaseAuthUser): UserProfile => ({
  uid: user.id,
  email: user.email,
  displayName: user.user_metadata?.full_name || user.user_metadata?.name || user.email,
  photoURL: user.user_metadata?.avatar_url || null,
  location: "Pune, Maharashtra",
  language: "en",
  crops: "",
});

const mapUser = (user: SupabaseAuthUser, profile?: UserProfile): AppUser => ({
  id: user.id,
  email: profile?.email ?? user.email,
  displayName:
    profile?.displayName ??
    user.user_metadata?.full_name ??
    user.user_metadata?.name ??
    null,
  photoURL: profile?.photoURL ?? user.user_metadata?.avatar_url ?? null,
});

const getStorage = () => {
  if (typeof window === "undefined") return null;
  return window.localStorage;
};

const getSessionStorage = () => {
  if (typeof window === "undefined") return null;
  return window.sessionStorage;
};

function readStoredSession(): StoredSession | null {
  const storage = getStorage();
  if (!storage) return null;

  const raw = storage.getItem(SESSION_STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as StoredSession;
  } catch {
    storage.removeItem(SESSION_STORAGE_KEY);
    return null;
  }
}

function writeStoredSession(session: StoredSession | null) {
  const storage = getStorage();
  if (!storage) return;

  if (!session) {
    storage.removeItem(SESSION_STORAGE_KEY);
    return;
  }

  storage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
}

function writeOAuthFlow(flow: { verifier: string; state: string } | null) {
  const storage = getSessionStorage();
  if (!storage) return;

  if (!flow) {
    storage.removeItem(OAUTH_FLOW_STORAGE_KEY);
    return;
  }

  storage.setItem(OAUTH_FLOW_STORAGE_KEY, JSON.stringify(flow));
}

function readOAuthFlow(): { verifier: string; state: string } | null {
  const storage = getSessionStorage();
  if (!storage) return null;

  const raw = storage.getItem(OAUTH_FLOW_STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as { verifier: string; state: string };
  } catch {
    storage.removeItem(OAUTH_FLOW_STORAGE_KEY);
    return null;
  }
}

function clearOAuthFlow() {
  writeOAuthFlow(null);
}

function base64UrlEncode(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer);
  let output = "";
  for (const byte of bytes) {
    output += String.fromCharCode(byte);
  }
  return btoa(output).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function randomString(length = 64) {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => (byte % 36).toString(36)).join("").slice(0, length);
}

async function createPkceChallenge() {
  const verifier = randomString(96);
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier));
  const challenge = base64UrlEncode(digest);
  return { verifier, challenge };
}

function buildHeaders(token?: string, isJson = true) {
  if (!supabaseConfigured) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY, and make sure the URL includes your Supabase project domain.",
    );
  }

  const headers: Record<string, string> = {
    apikey: supabaseAnonKey,
    Authorization: `Bearer ${token || supabaseAnonKey}`,
  };

  if (isJson) {
    headers["Content-Type"] = "application/json";
  }

  return headers;
}

async function requestJson<T>(
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

  const url = new URL(path, SUPABASE_URL);
  Object.entries(query || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.set(key, String(value));
    }
  });

  const response = await fetch(url.toString(), {
    method,
    headers: {
      ...buildHeaders(token, isJson),
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

async function requestForm<T>(
  path: string,
  options: {
    method?: string;
    token?: string;
    body: Record<string, string | undefined>;
    headers?: Record<string, string>;
  },
): Promise<T> {
  const { method = "POST", token, body, headers: extraHeaders = {} } = options;
  const formBody = new URLSearchParams();
  Object.entries(body).forEach(([key, value]) => {
    if (value !== undefined) {
      formBody.set(key, value);
    }
  });

  const response = await fetch(`${SUPABASE_URL}${path}`, {
    method,
    headers: {
      ...buildHeaders(token, false),
      "Content-Type": "application/x-www-form-urlencoded",
      ...extraHeaders,
    },
    body: formBody.toString(),
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

function safeJsonParse(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function normalizeSession(session: StoredSession): StoredSession {
  return {
    access_token: session.access_token,
    refresh_token: session.refresh_token,
    expires_at: session.expires_at ?? null,
    token_type: session.token_type ?? "bearer",
    user: session.user,
  };
}

export async function restoreStoredSession(): Promise<AuthResult | null> {
  if (typeof window === "undefined" || !supabaseConfigured) {
    return null;
  }

  const fromUrl = await hydrateSessionFromUrl();
  const storedSession = fromUrl || readStoredSession();
  if (!storedSession) {
    return null;
  }

  const session = await validateOrRefreshSession(storedSession);
  if (!session) {
    return null;
  }

  writeStoredSession(session);

  const profile = await ensureProfile(session);
  const transactions = await fetchTransactions(session.access_token, session.user.id);

  return {
    session,
    user: mapUser(session.user, profile),
    profile,
    transactions,
  };
}

async function hydrateSessionFromUrl(): Promise<StoredSession | null> {
  if (typeof window === "undefined") return null;

  const fragment = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  const accessToken = fragment.get("access_token");
  const refreshToken = fragment.get("refresh_token");

  if (!accessToken || !refreshToken) {
    return null;
  }

  const session: StoredSession = {
    access_token: accessToken,
    refresh_token: refreshToken,
    expires_at: fragment.get("expires_at") ? Number(fragment.get("expires_at")) : null,
    token_type: fragment.get("token_type") || "bearer",
    user: {
      id: fragment.get("user_id") || "",
      email: fragment.get("email"),
      user_metadata: {},
      app_metadata: {},
    },
  };

  window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
  return session.user.id ? session : null;
}

async function validateOrRefreshSession(session: StoredSession): Promise<StoredSession | null> {
  try {
    const user = await requestJson<SupabaseAuthUser>("/auth/v1/user", {
      token: session.access_token,
    });
    return normalizeSession({ ...session, user });
  } catch {
    if (!session.refresh_token) {
      return null;
    }

    try {
      const refreshed = await requestJson<{ access_token: string; refresh_token: string; expires_at?: number; token_type?: string; user: SupabaseAuthUser }>(
        "/auth/v1/token",
        {
          method: "POST",
          body: {
            refresh_token: session.refresh_token,
            grant_type: "refresh_token",
          },
        },
      );

      return normalizeSession({
        access_token: refreshed.access_token,
        refresh_token: refreshed.refresh_token,
        expires_at: refreshed.expires_at ?? null,
        token_type: refreshed.token_type ?? "bearer",
        user: refreshed.user,
      });
    } catch {
      clearStoredSession();
      return null;
    }
  }
}

async function ensureProfile(session: StoredSession): Promise<UserProfile> {
  const existing = await fetchProfile(session.access_token, session.user.id);
  if (existing) {
    return existing;
  }

  const profile = defaultProfile(session.user);
  await upsertProfile(session.access_token, profile);
  return profile;
}

export async function signInWithEmail(email: string, password: string): Promise<AuthResult> {
  const response = await requestJson<{ access_token: string; refresh_token: string; expires_at?: number; token_type?: string; user: SupabaseAuthUser }>(
    "/auth/v1/token?grant_type=password",
    {
      method: "POST",
      body: { email, password },
    },
  );

  const session = normalizeSession({
    access_token: response.access_token,
    refresh_token: response.refresh_token,
    expires_at: response.expires_at ?? null,
    token_type: response.token_type ?? "bearer",
    user: response.user,
  });

  writeStoredSession(session);

  const profile = await ensureProfile(session);
  const transactions = await fetchTransactions(session.access_token, session.user.id);
  return {
    session,
    user: mapUser(session.user, profile),
    profile,
    transactions,
  };
}

export async function signUpWithEmail(email: string, password: string): Promise<AuthResult | null> {
  const response = await requestJson<{ access_token?: string; refresh_token?: string; expires_at?: number; token_type?: string; user: SupabaseAuthUser }>(
    "/auth/v1/signup",
    {
      method: "POST",
      body: {
        email,
        password,
        options: {
          emailRedirectTo: typeof window !== "undefined" ? `${window.location.origin}/` : undefined,
        },
      },
    },
  );

  if (!response.access_token || !response.refresh_token) {
    return null;
  }

  const session = normalizeSession({
    access_token: response.access_token,
    refresh_token: response.refresh_token,
    expires_at: response.expires_at ?? null,
    token_type: response.token_type ?? "bearer",
    user: response.user,
  });

  writeStoredSession(session);

  const profile = await ensureProfile(session);
  const transactions = await fetchTransactions(session.access_token, session.user.id);
  return {
    session,
    user: mapUser(session.user, profile),
    profile,
    transactions,
  };
}

export async function signInWithGoogle(): Promise<void> {
  if (typeof window === "undefined") {
    throw new Error("Google OAuth can only start in the browser.");
  }

  if (!supabaseConfigured) {
    throw new Error("Supabase is not configured. Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  }

  const { verifier, challenge } = await createPkceChallenge();
  const state = crypto.randomUUID ? crypto.randomUUID() : randomString(32);
  writeOAuthFlow({ verifier, state });

  const redirectTo = `${window.location.origin}${GOOGLE_REDIRECT_PATH}`;
  const params = new URLSearchParams({
    provider: "google",
    redirect_to: redirectTo,
    response_type: "code",
    code_challenge: challenge,
    code_challenge_method: "s256",
    state,
    scope: "openid email profile",
    prompt: "select_account",
  });

  window.location.assign(`${SUPABASE_URL}/auth/v1/authorize?${params.toString()}`);
}

export async function signOut(): Promise<void> {
  const session = readStoredSession();

  if (session?.access_token) {
    try {
      await requestJson("/auth/v1/logout", {
        method: "POST",
        token: session.access_token,
        body: { refresh_token: session.refresh_token },
      });
    } catch {
      // Best effort sign out.
    }
  }

  clearStoredSession();
  clearOAuthFlow();
}

export async function fetchProfile(token: string, userId: string): Promise<UserProfile | null> {
  const rows = await requestJson<UserProfile[]>("/rest/v1/profiles", {
    token,
    query: {
      select: "*",
      uid: `eq.${userId}`,
      limit: 1,
    },
  });

  return rows[0] || null;
}

export async function upsertProfile(token: string, profile: UserProfile): Promise<UserProfile> {
  const rows = await requestJson<UserProfile[]>("/rest/v1/profiles", {
    method: "POST",
    token,
    query: {
      on_conflict: "uid",
    },
    headers: {
      Prefer: "resolution=merge-duplicates,return=representation",
    },
    body: [profile],
  });

  return rows[0] || profile;
}

export async function updateAuthMetadata(token: string, patch: Partial<Pick<UserProfile, "displayName" | "photoURL">>): Promise<void> {
  await requestJson("/auth/v1/user", {
    method: "PUT",
    token,
    body: {
      data: {
        ...(patch.displayName !== undefined ? { full_name: patch.displayName } : {}),
        ...(patch.photoURL !== undefined ? { avatar_url: patch.photoURL } : {}),
      },
    },
  });
}

export async function fetchTransactions(token: string, userId: string): Promise<Transaction[]> {
  const rows = await requestJson<TransactionRow[]>("/rest/v1/transactions", {
    token,
    query: {
      select: "*",
      user_id: `eq.${userId}`,
      order: "date.desc",
    },
  });

  return rows.map((row) => ({
    id: row.id,
    description: row.description,
    amount: Number(row.amount),
    type: row.type,
    category: row.category,
    date: AppTimestamp.fromISOString(row.date),
  }));
}

export async function createTransaction(token: string, userId: string, data: TransactionData): Promise<Transaction> {
  const rows = await requestJson<TransactionRow[]>("/rest/v1/transactions", {
    method: "POST",
    token,
    headers: {
      Prefer: "return=representation",
    },
    body: [
      {
        user_id: userId,
        description: data.description,
        amount: data.amount,
        type: data.type,
        category: data.category,
        date: data.date.toISOString(),
      },
    ],
  });

  const row = rows[0];
  return {
    id: row.id,
    description: row.description,
    amount: Number(row.amount),
    type: row.type,
    category: row.category,
    date: AppTimestamp.fromISOString(row.date),
  };
}

export async function updateTransaction(
  token: string,
  transactionId: string,
  data: Partial<TransactionData>,
): Promise<Transaction> {
  const rows = await requestJson<TransactionRow[]>("/rest/v1/transactions", {
    method: "PATCH",
    token,
    query: {
      id: `eq.${transactionId}`,
    },
    headers: {
      Prefer: "return=representation",
    },
    body: {
      ...(data.description !== undefined ? { description: data.description } : {}),
      ...(data.amount !== undefined ? { amount: data.amount } : {}),
      ...(data.type !== undefined ? { type: data.type } : {}),
      ...(data.category !== undefined ? { category: data.category } : {}),
      ...(data.date !== undefined ? { date: data.date.toISOString() } : {}),
    },
  });

  const row = rows[0];
  return {
    id: row.id,
    description: row.description,
    amount: Number(row.amount),
    type: row.type,
    category: row.category,
    date: AppTimestamp.fromISOString(row.date),
  };
}

export async function deleteTransaction(token: string, transactionId: string): Promise<void> {
  await requestJson("/rest/v1/transactions", {
    method: "DELETE",
    token,
    query: {
      id: `eq.${transactionId}`,
    },
    headers: {
      Prefer: "return=minimal",
    },
    body: undefined,
  });
}

export async function exchangeGoogleCodeForSession(
  code: string,
  redirectTo: string,
  state?: string | null,
): Promise<AuthResult> {
  if (typeof window === "undefined") {
    throw new Error("OAuth callback must run in the browser.");
  }

  const flow = readOAuthFlow();
  if (!flow) {
    throw new Error("Missing OAuth state. Please start Google sign-in again.");
  }

  if (state && flow.state !== state) {
    throw new Error("Google OAuth state mismatch. Please try signing in again.");
  }

  const response = await requestForm<{
    access_token: string;
    refresh_token: string;
    expires_at?: number;
    token_type?: string;
    user: SupabaseAuthUser;
  }>("/auth/v1/token?grant_type=authorization_code", {
    token: supabaseAnonKey,
    body: {
      code,
      code_verifier: flow.verifier,
      redirect_uri: redirectTo,
      client_id: supabaseAnonKey,
    },
  });

  clearOAuthFlow();

  const session = normalizeSession({
    access_token: response.access_token,
    refresh_token: response.refresh_token,
    expires_at: response.expires_at ?? null,
    token_type: response.token_type ?? "bearer",
    user: response.user,
  });

  writeStoredSession(session);

  const profile = await ensureProfile(session);
  const transactions = await fetchTransactions(session.access_token, session.user.id);

  return {
    session,
    user: mapUser(session.user, profile),
    profile,
    transactions,
  };
}

export async function uploadProfileImage(
  token: string,
  userId: string,
  file: File,
): Promise<string> {
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
  const objectPath = `${userId}/${Date.now()}-${safeName}`;

  const response = await fetch(
    `${SUPABASE_URL}/storage/v1/object/${SUPABASE_STORAGE_BUCKET}/${objectPath}`,
    {
      method: "POST",
      headers: {
        ...buildHeaders(token, false),
        "Content-Type": file.type || "application/octet-stream",
        "x-upsert": "true",
      },
      body: file,
    },
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Profile image upload failed.");
  }

  return `${SUPABASE_URL}/storage/v1/object/public/${SUPABASE_STORAGE_BUCKET}/${objectPath}`;
}

export function clearStoredSession() {
  writeStoredSession(null);
}
