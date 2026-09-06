import { LedgerRecord, LedgerRecordInput } from "./types";

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

export function stableStringify(value: unknown): string {
  return JSON.stringify(sortValue(value));
}

export async function sha256(text: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  const digest = await globalThis.crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function hashMetadata(metadata: Record<string, unknown>): Promise<string> {
  return sha256(stableStringify(metadata));
}

export async function deriveLedgerHash(input: {
  transactionId: string;
  entityId: string;
  action: string;
  actor: string;
  timestamp: string;
  previousHash: string;
  status: string;
  metadataHash: string;
}): Promise<string> {
  return sha256(
    stableStringify({
      transactionId: input.transactionId,
      entityId: input.entityId,
      action: input.action,
      actor: input.actor,
      timestamp: input.timestamp,
      previousHash: input.previousHash,
      status: input.status,
      metadataHash: input.metadataHash,
    }),
  );
}

export async function buildLedgerRecord(input: LedgerRecordInput): Promise<LedgerRecord> {
  const timestamp = input.timestamp || new Date().toISOString();
  const previousHash = input.previousHash || "GENESIS";
  const metadata = input.metadata || {};
  const metadataHash = await hashMetadata(metadata);
  const transactionId = crypto.randomUUID();
  const currentHash = await deriveLedgerHash({
    transactionId,
    entityId: input.entityId,
    action: input.action,
    actor: input.actor,
    timestamp,
    previousHash,
    status: input.status,
    metadataHash,
  });

  return {
    transactionId,
    entityType: input.entityType,
    entityId: input.entityId,
    action: input.action,
    actor: input.actor,
    actorId: input.actorId ?? null,
    actorRole: input.actorRole ?? null,
    timestamp,
    previousHash,
    currentHash,
    status: input.status,
    metadataHash,
    metadata,
  };
}

export function isLedgerRecord(value: unknown): value is LedgerRecord {
  return Boolean(
    value &&
      typeof value === "object" &&
      "transactionId" in value &&
      "currentHash" in value &&
      "previousHash" in value,
  );
}

export function verifyLedgerChain(records: LedgerRecord[]) {
  const ordered = [...records].sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  for (let index = 0; index < ordered.length; index += 1) {
    const record = ordered[index];
    const previousHash = index === 0 ? "GENESIS" : ordered[index - 1].currentHash;

    if (record.previousHash !== previousHash) {
      return {
        valid: false,
        reason: `Previous hash mismatch at index ${index}.`,
        index,
        record,
      };
    }
  }

  return {
    valid: true,
    reason: "Ledger chain is intact.",
  };
}

export function summarizeLedgerRecord(record: LedgerRecord) {
  return {
    transactionId: record.transactionId,
    entityId: record.entityId,
    action: record.action,
    status: record.status,
    timestamp: record.timestamp,
    shortHash: record.currentHash.slice(0, 12),
    shortPreviousHash: record.previousHash.slice(0, 12),
  };
}
