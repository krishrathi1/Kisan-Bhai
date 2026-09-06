/**
 * Fasal Certificate – Off-chain Database Interface
 *
 * Stores & retrieves the human-readable certificate data.
 * Persists to localStorage and syncs with Supabase when available.
 */

import { supabaseConfigured } from "@/lib/supabase";
import { supabaseRequest } from "@/blockchain/rest";

// ── Types ──────────────────────────────────────────────────────────────

export interface FasalCertificate {
  id: string;
  userId: string;
  crop: string;
  quantity: string;
  harvestDate: string;
  location: string;
  photoUrl: string | null;
  dataHash: string;
  transactionHash: string | null;
  isDemo: boolean;
  createdAt: string;
}

interface FasalCertificateRow {
  id: string;
  user_id: string;
  crop: string;
  quantity: string;
  harvest_date: string;
  location: string;
  photo_url: string | null;
  data_hash: string;
  transaction_hash: string | null;
  is_demo: boolean;
  created_at: string;
}

// ── Initial Sample Certificate ─────────────────────────────────────────

const SAMPLE_CERTIFICATES: FasalCertificate[] = [
  {
    id: "BM-WHT-2026-001",
    userId: "demo-farmer-001",
    crop: "Wheat",
    quantity: "18 Quintal",
    harvestDate: "2026-08-24",
    location: "Haryana, India",
    photoUrl: null,
    dataHash: "7a82f3c9e1b4d5a6c7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0",
    transactionHash: "0x7a82b3d8f1e2c3b4a5d6e7f890123456789012345678901234567890123491fc",
    isDemo: true,
    createdAt: "2026-08-24T10:32:00.000Z",
  },
];

// ── Mapping ────────────────────────────────────────────────────────────

function toModel(row: FasalCertificateRow): FasalCertificate {
  return {
    id: row.id,
    userId: row.user_id,
    crop: row.crop,
    quantity: row.quantity,
    harvestDate: row.harvest_date,
    location: row.location,
    photoUrl: row.photo_url,
    dataHash: row.data_hash,
    transactionHash: row.transaction_hash,
    isDemo: row.is_demo,
    createdAt: row.created_at,
  };
}

// ── localStorage Persistence ───────────────────────────────────────────

const LS_KEY = "beejmantra.fasal_certificates";

function readLocalCerts(): FasalCertificate[] {
  if (typeof window === "undefined") return SAMPLE_CERTIFICATES;
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) {
      localStorage.setItem(LS_KEY, JSON.stringify(SAMPLE_CERTIFICATES));
      return SAMPLE_CERTIFICATES;
    }
    const parsed = JSON.parse(raw) as FasalCertificate[];
    return parsed.length > 0 ? parsed : SAMPLE_CERTIFICATES;
  } catch {
    return SAMPLE_CERTIFICATES;
  }
}

function writeLocalCerts(certs: FasalCertificate[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(certs));
  } catch (e) {
    console.warn("Failed to write certificate to localStorage", e);
  }
}

// ── Public API ─────────────────────────────────────────────────────────

export async function saveFasalCertificate(
  token: string | null,
  cert: FasalCertificate,
): Promise<void> {
  // Always persist locally
  const all = readLocalCerts().filter((c) => c.id !== cert.id);
  all.unshift(cert);
  writeLocalCerts(all);

  // Sync to Supabase if configured
  if (supabaseConfigured && token) {
    try {
      await supabaseRequest("/rest/v1/fasal_certificates", {
        method: "POST",
        token,
        headers: { Prefer: "return=minimal" },
        body: [
          {
            id: cert.id,
            user_id: cert.userId,
            crop: cert.crop,
            quantity: cert.quantity,
            harvest_date: cert.harvestDate,
            location: cert.location,
            photo_url: cert.photoUrl,
            data_hash: cert.dataHash,
            transaction_hash: cert.transactionHash,
            is_demo: cert.isDemo,
            created_at: cert.createdAt,
          },
        ],
      });
    } catch (err) {
      console.warn("Supabase remote sync skipped, saved locally", err);
    }
  }
}

export async function fetchFasalCertificate(
  certificateId: string,
): Promise<FasalCertificate | null> {
  const localList = readLocalCerts();
  const localMatch = localList.find((c) => c.id === certificateId);
  if (localMatch) return localMatch;

  if (supabaseConfigured) {
    try {
      const rows = await supabaseRequest<FasalCertificateRow[]>(
        "/rest/v1/fasal_certificates",
        {
          query: {
            select: "*",
            id: `eq.${certificateId}`,
            limit: 1,
          },
        },
      );
      if (rows.length > 0) {
        const found = toModel(rows[0]);
        // Cache locally
        saveFasalCertificate(null, found).catch(() => {});
        return found;
      }
    } catch {
      // Fall back
    }
  }

  return null;
}

export async function fetchUserCertificates(
  token: string | null,
  userId: string,
): Promise<FasalCertificate[]> {
  const local = readLocalCerts();

  if (supabaseConfigured && token) {
    try {
      const rows = await supabaseRequest<FasalCertificateRow[]>(
        "/rest/v1/fasal_certificates",
        {
          token,
          query: {
            select: "*",
            user_id: `eq.${userId}`,
            order: "created_at.desc",
          },
        },
      );
      if (rows.length > 0) {
        return rows.map(toModel);
      }
    } catch {
      // Fall back
    }
  }

  return local;
}
