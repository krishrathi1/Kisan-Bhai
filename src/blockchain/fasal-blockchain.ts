/**
 * Fasal Certificate – Blockchain Interface
 *
 * Handles:
 *  1. Deterministic SHA-256 hashing of crop data.
 *  2. Unique Certificate ID generation.
 *  3. Demo-mode mock blockchain recording and Sepolia compatibility.
 */

// ── Types ──────────────────────────────────────────────────────────────

export interface CropData {
  crop: string;
  quantity: string;
  harvestDate: string;
  location: string;
}

export interface BlockchainResult {
  transactionHash: string;
  certificateId: string;
  dataHash: string;
  timestamp: string;
  isDemo: boolean;
}

// ── Configuration ──────────────────────────────────────────────────────

const SEPOLIA_RPC =
  typeof window !== "undefined"
    ? ""
    : process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL || "";

const SEPOLIA_KEY =
  typeof window !== "undefined" ? "" : process.env.SEPOLIA_PRIVATE_KEY || "";

export function isBlockchainConfigured(): boolean {
  return Boolean(SEPOLIA_RPC && SEPOLIA_KEY);
}

// ── Hashing ────────────────────────────────────────────────────────────

function sortValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sortValue);
  }
  if (value && typeof value === "object") {
    return Object.keys(value as Record<string, unknown>)
      .sort()
      .reduce<Record<string, unknown>>((acc, key) => {
        acc[key] = sortValue((value as Record<string, unknown>)[key]);
        return acc;
      }, {});
  }
  return value;
}

function stableStringify(obj: Record<string, unknown>): string {
  return JSON.stringify(sortValue(obj));
}

export async function hashCropData(data: CropData): Promise<string> {
  const normalized = {
    crop: data.crop.trim().toLowerCase(),
    harvestDate: data.harvestDate.trim(),
    location: data.location.trim().toLowerCase(),
    quantity: data.quantity.trim().toLowerCase(),
  };

  const text = stableStringify(normalized);
  const encoded = new TextEncoder().encode(text);
  const digest = await globalThis.crypto.subtle.digest("SHA-256", encoded);
  return Array.from(new Uint8Array(digest), (b) =>
    b.toString(16).padStart(2, "0"),
  ).join("");
}

// ── Certificate ID ─────────────────────────────────────────────────────

const CROP_CODES: Record<string, string> = {
  wheat: "WHT",
  rice: "RCE",
  cotton: "CTN",
  sugarcane: "SGC",
  maize: "MZE",
  soybean: "SOY",
  mustard: "MST",
  potato: "PTT",
  tomato: "TMT",
  onion: "ONI",
  chilli: "CHL",
  turmeric: "TRM",
  groundnut: "GNT",
  bajra: "BJR",
  jowar: "JWR",
};

export function generateCertificateId(crop: string): string {
  const code = CROP_CODES[crop.trim().toLowerCase()] || crop.slice(0, 3).toUpperCase();
  const year = new Date().getFullYear();
  const randomSuffix = Math.floor(100 + Math.random() * 900);
  return `BM-${code}-${year}-${randomSuffix}`;
}

// ── Demo Mode Mock ─────────────────────────────────────────────────────

function generateDemoTxHash(): string {
  const bytes = new Uint8Array(32);
  globalThis.crypto.getRandomValues(bytes);
  return (
    "0x" +
    Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("")
  );
}

// ── Record Certificate ─────────────────────────────────────────────────

export async function recordCertificateOnChain(
  data: CropData,
): Promise<BlockchainResult> {
  const dataHash = await hashCropData(data);
  const certificateId = generateCertificateId(data.crop);
  const timestamp = new Date().toISOString();
  const transactionHash = generateDemoTxHash();

  return {
    transactionHash,
    certificateId,
    dataHash,
    timestamp,
    isDemo: true,
  };
}
