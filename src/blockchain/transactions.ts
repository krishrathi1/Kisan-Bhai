import { supabaseRequest } from "./rest";
import {
  AuditLogRow,
  BenefitApplicationRow,
  BenefitTransactionRow,
  FarmerRow,
  GovernmentOfficerRow,
  LedgerAction,
  LedgerEntityType,
  LedgerRecord,
  LedgerRecordInput,
  ProduceLotRow,
  SupplyChainEventRow,
} from "./types";
import { buildLedgerRecord, summarizeLedgerRecord } from "./ledger";

type RestLedgerRow = {
  transaction_id: string;
  entity_type: LedgerEntityType;
  entity_id: string;
  action: LedgerAction;
  actor: string;
  actor_id: string | null;
  actor_role: string | null;
  timestamp: string;
  previous_hash: string;
  current_hash: string;
  status: string;
  metadata_hash: string;
  metadata: Record<string, unknown>;
  created_at: string;
};

function toLedgerRecord(row: RestLedgerRow): LedgerRecord {
  return {
    transactionId: row.transaction_id,
    entityType: row.entity_type,
    entityId: row.entity_id,
    action: row.action,
    actor: row.actor,
    actorId: row.actor_id,
    actorRole: row.actor_role,
    timestamp: row.timestamp,
    previousHash: row.previous_hash,
    currentHash: row.current_hash,
    status: row.status,
    metadataHash: row.metadata_hash,
    metadata: row.metadata || {},
    createdAt: row.created_at,
  };
}

function toLedgerRow(record: LedgerRecord): RestLedgerRow {
  return {
    transaction_id: record.transactionId,
    entity_type: record.entityType,
    entity_id: record.entityId,
    action: record.action,
    actor: record.actor,
    actor_id: record.actorId ?? null,
    actor_role: record.actorRole ?? null,
    timestamp: record.timestamp,
    previous_hash: record.previousHash,
    current_hash: record.currentHash,
    status: record.status,
    metadata_hash: record.metadataHash,
    metadata: record.metadata,
    created_at: record.createdAt || record.timestamp,
  };
}

function mapFarmer(row: FarmerRow | undefined) {
  if (!row) return null;
  return {
    userId: row.user_id,
    fullName: row.full_name,
    district: row.district,
    state: row.state,
    language: row.language,
    phone: row.phone,
    landSizeAcres: row.land_size_acres,
    crops: row.crops ? row.crops.split(",").map((item) => item.trim()).filter(Boolean) : [],
  };
}

function toNumber(value: number | string | null | undefined) {
  if (value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

async function fetchLatestLedgerRecord(token: string, entityId: string) {
  const rows = await supabaseRequest<RestLedgerRow[]>("/rest/v1/blockchain_records", {
    token,
    query: {
      select: "*",
      entity_id: `eq.${entityId}`,
      order: "timestamp.desc",
      limit: 1,
    },
  });

  return rows[0] ? toLedgerRecord(rows[0]) : null;
}

export async function appendLedgerRecord(token: string, input: LedgerRecordInput) {
  const previous = await fetchLatestLedgerRecord(token, input.entityId);
  const record = await buildLedgerRecord({
    ...input,
    previousHash: previous?.currentHash || "GENESIS",
  });

  const rows = await supabaseRequest<RestLedgerRow[]>("/rest/v1/blockchain_records", {
    token,
    method: "POST",
    headers: {
      Prefer: "return=representation",
    },
    body: [toLedgerRow(record)],
  });

  return rows[0] ? toLedgerRecord(rows[0]) : record;
}

export async function fetchLedgerRecords(token: string, entityId: string) {
  const rows = await supabaseRequest<RestLedgerRow[]>("/rest/v1/blockchain_records", {
    token,
    query: {
      select: "*",
      entity_id: `eq.${entityId}`,
      order: "timestamp.asc",
    },
  });

  return rows.map(toLedgerRecord);
}

export async function fetchFarmer(token: string, userId: string) {
  const rows = await supabaseRequest<FarmerRow[]>("/rest/v1/farmers", {
    token,
    query: {
      select: "*",
      user_id: `eq.${userId}`,
      limit: 1,
    },
  });

  return mapFarmer(rows[0]);
}

export async function upsertFarmer(
  token: string,
  farmer: {
    userId: string;
    fullName: string;
    district?: string | null;
    state?: string | null;
    language?: string | null;
    phone?: string | null;
    landSizeAcres?: number | null;
    crops?: string[] | string | null;
  },
) {
  const payload: FarmerRow = {
    user_id: farmer.userId,
    full_name: farmer.fullName,
    district: farmer.district ?? null,
    state: farmer.state ?? "Maharashtra",
    language: farmer.language ?? "en",
    phone: farmer.phone ?? null,
    land_size_acres: farmer.landSizeAcres ?? null,
    crops: Array.isArray(farmer.crops)
      ? farmer.crops.join(", ")
      : farmer.crops || "",
  };

  await supabaseRequest("/rest/v1/farmers", {
    token,
    method: "POST",
    query: {
      on_conflict: "user_id",
    },
    headers: {
      Prefer: "resolution=merge-duplicates,return=representation",
    },
    body: [payload],
  });

  return mapFarmer(payload);
}

export async function createBenefitApplication(
  token: string,
  input: {
    farmerId: string;
    schemeName: string;
    schemeCode?: string | null;
    requestedAmount?: number | null;
    remarks?: string | null;
    actorName: string;
    actorId?: string | null;
    actorRole?: string | null;
    metadata?: Record<string, unknown>;
  },
) {
  const applicationId = crypto.randomUUID();
  const submittedAt = new Date().toISOString();

  const payload = {
    id: applicationId,
    farmer_id: input.farmerId,
    scheme_name: input.schemeName,
    scheme_code: input.schemeCode ?? null,
    requested_amount: input.requestedAmount ?? null,
    approved_amount: null,
    status: "pending",
    submitted_at: submittedAt,
    reviewed_at: null,
    officer_id: null,
    remarks: input.remarks ?? null,
    ledger_transaction_id: null,
  };

  await supabaseRequest("/rest/v1/benefit_applications", {
    token,
    method: "POST",
    headers: {
      Prefer: "return=representation",
    },
    body: [payload],
  });

  const ledger = await appendLedgerRecord(token, {
    entityType: "benefit_application",
    entityId: applicationId,
    action: "SUBMIT",
    actor: input.actorName,
    actorId: input.actorId ?? null,
    actorRole: input.actorRole ?? "farmer",
    status: "pending",
    metadata: {
      schemeName: input.schemeName,
      schemeCode: input.schemeCode ?? null,
      requestedAmount: input.requestedAmount ?? null,
      remarks: input.remarks ?? null,
      ...input.metadata,
    },
  });

  await supabaseRequest("/rest/v1/benefit_applications", {
    token,
    method: "PATCH",
    query: {
      id: `eq.${applicationId}`,
    },
    headers: {
      Prefer: "return=representation",
    },
    body: {
      ledger_transaction_id: ledger.transactionId,
    },
  });

  return {
    ...payload,
    ledger_transaction_id: ledger.transactionId,
  };
}

export async function fetchBenefitApplications(token: string, farmerId?: string) {
  const rows = await supabaseRequest<BenefitApplicationRow[]>("/rest/v1/benefit_applications", {
    token,
    query: {
      select: "*",
      ...(farmerId ? { farmer_id: `eq.${farmerId}` } : {}),
      order: "submitted_at.desc",
    },
  });

  return rows.map((row) => ({
    id: row.id,
    farmerId: row.farmer_id,
    schemeName: row.scheme_name,
    schemeCode: row.scheme_code,
    requestedAmount: toNumber(row.requested_amount),
    approvedAmount: toNumber(row.approved_amount),
    status: row.status,
    submittedAt: row.submitted_at,
    reviewedAt: row.reviewed_at,
    officerId: row.officer_id,
    remarks: row.remarks,
    ledgerTransactionId: row.ledger_transaction_id,
  }));
}

export async function fetchPendingBenefitApplications(token: string) {
  return fetchBenefitApplicationsByStatus(token, "pending");
}

export async function fetchBenefitApplicationsByStatus(token: string, status: string) {
  const rows = await supabaseRequest<BenefitApplicationRow[]>("/rest/v1/benefit_applications", {
    token,
    query: {
      select: "*",
      status: `eq.${status}`,
      order: "submitted_at.asc",
    },
  });

  return rows.map((row) => ({
    id: row.id,
    farmerId: row.farmer_id,
    schemeName: row.scheme_name,
    schemeCode: row.scheme_code,
    requestedAmount: toNumber(row.requested_amount),
    approvedAmount: toNumber(row.approved_amount),
    status: row.status,
    submittedAt: row.submitted_at,
    reviewedAt: row.reviewed_at,
    officerId: row.officer_id,
    remarks: row.remarks,
    ledgerTransactionId: row.ledger_transaction_id,
  }));
}

export async function reviewBenefitApplication(
  token: string,
  input: {
    applicationId: string;
    decision: "approved" | "rejected";
    actorName: string;
    actorId?: string | null;
    actorRole?: string | null;
    remarks?: string | null;
    approvedAmount?: number | null;
  },
) {
  const reviewedAt = new Date().toISOString();

  const applicationPatch: Record<string, unknown> = {
    status: input.decision,
    reviewed_at: reviewedAt,
    officer_id: input.actorId ?? null,
    remarks: input.remarks ?? null,
  };

  if (input.decision === "approved") {
    applicationPatch.approved_amount = input.approvedAmount ?? null;
  }

  await supabaseRequest("/rest/v1/benefit_applications", {
    token,
    method: "PATCH",
    query: {
      id: `eq.${input.applicationId}`,
    },
    headers: {
      Prefer: "return=representation",
    },
    body: applicationPatch,
  });

  const ledger = await appendLedgerRecord(token, {
    entityType: "benefit_application",
    entityId: input.applicationId,
    action: input.decision === "approved" ? "APPROVE" : "REJECT",
    actor: input.actorName,
    actorId: input.actorId ?? null,
    actorRole: input.actorRole ?? "officer",
    status: input.decision,
    metadata: {
      remarks: input.remarks ?? null,
      approvedAmount: input.approvedAmount ?? null,
      reviewedAt,
    },
  });

  const benefitTransaction =
    input.decision === "approved"
      ? await recordBenefitTransaction(token, {
          applicationId: input.applicationId,
          amount: input.approvedAmount ?? 0,
          status: "disbursed",
          transactionRef: `BEN-${input.applicationId.slice(0, 8).toUpperCase()}`,
          paidAt: reviewedAt,
          actorName: input.actorName,
          actorId: input.actorId ?? null,
          actorRole: input.actorRole ?? "officer",
        })
      : null;

  await recordAuditLog(token, {
    actorId: input.actorId ?? null,
    actorName: input.actorName,
    action: input.decision === "approved" ? "benefit_application_approved" : "benefit_application_rejected",
    entityType: "benefit_application",
    entityId: input.applicationId,
    details: {
      remarks: input.remarks ?? null,
      approvedAmount: input.approvedAmount ?? null,
      ledgerTransactionId: ledger.transactionId,
      benefitTransactionId: benefitTransaction?.id ?? null,
    },
  });

  return {
    ledger,
    benefitTransaction,
  };
}

export async function recordBenefitTransaction(
  token: string,
  input: {
    applicationId: string;
    amount: number;
    status: string;
    transactionRef?: string | null;
    paidAt?: string | null;
    actorName: string;
    actorId?: string | null;
    actorRole?: string | null;
  },
) {
  const id = crypto.randomUUID();
  const payload = {
    id,
    application_id: input.applicationId,
    amount: input.amount,
    transaction_ref: input.transactionRef ?? null,
    status: input.status,
    paid_at: input.paidAt ?? null,
    ledger_transaction_id: null,
  };

  await supabaseRequest("/rest/v1/benefit_transactions", {
    token,
    method: "POST",
    headers: {
      Prefer: "return=representation",
    },
    body: [payload],
  });

  const ledger = await appendLedgerRecord(token, {
    entityType: "benefit_transaction",
    entityId: input.applicationId,
    action: "DISBURSE",
    actor: input.actorName,
    actorId: input.actorId ?? null,
    actorRole: input.actorRole ?? "officer",
    status: input.status,
    metadata: {
      amount: input.amount,
      transactionRef: input.transactionRef ?? null,
      paidAt: input.paidAt ?? null,
    },
  });

  await supabaseRequest("/rest/v1/benefit_transactions", {
    token,
    method: "PATCH",
    query: {
      id: `eq.${id}`,
    },
    headers: {
      Prefer: "return=representation",
    },
    body: {
      ledger_transaction_id: ledger.transactionId,
    },
  });

  return {
    ...payload,
    ledger_transaction_id: ledger.transactionId,
  };
}

export async function fetchBenefitTransactions(token: string, applicationId?: string) {
  const rows = await supabaseRequest<BenefitTransactionRow[]>("/rest/v1/benefit_transactions", {
    token,
    query: {
      select: "*",
      ...(applicationId ? { application_id: `eq.${applicationId}` } : {}),
      order: "created_at.desc",
    },
  });

  return rows.map((row) => ({
    id: row.id,
    applicationId: row.application_id,
    amount: toNumber(row.amount) || 0,
    transactionRef: row.transaction_ref,
    status: row.status,
    paidAt: row.paid_at,
    ledgerTransactionId: row.ledger_transaction_id,
    createdAt: row.created_at,
  }));
}

export async function registerProduceLot(
  token: string,
  input: {
    farmerId: string;
    crop: string;
    quantity: number;
    unit: string;
    harvestDate: string;
    location: string;
    notes?: string | null;
    actorName: string;
    actorId?: string | null;
    actorRole?: string | null;
  },
) {
  const lotId = generateLotId(input.crop, input.harvestDate);
  const payload = {
    lot_id: lotId,
    farmer_id: input.farmerId,
    crop: input.crop,
    quantity: input.quantity,
    unit: input.unit,
    harvest_date: input.harvestDate,
    location: input.location,
    notes: input.notes ?? null,
    status: "registered",
    blockchain_record_id: null,
  };

  await supabaseRequest("/rest/v1/produce_lots", {
    token,
    method: "POST",
    headers: {
      Prefer: "return=representation",
    },
    body: [payload],
  });

  const ledger = await appendLedgerRecord(token, {
    entityType: "produce_lot",
    entityId: lotId,
    action: "REGISTER",
    actor: input.actorName,
    actorId: input.actorId ?? null,
    actorRole: input.actorRole ?? "farmer",
    status: "registered",
    metadata: {
      crop: input.crop,
      quantity: input.quantity,
      unit: input.unit,
      harvestDate: input.harvestDate,
      location: input.location,
      notes: input.notes ?? null,
    },
  });

  await supabaseRequest("/rest/v1/produce_lots", {
    token,
    method: "PATCH",
    query: {
      lot_id: `eq.${lotId}`,
    },
    headers: {
      Prefer: "return=representation",
    },
    body: {
      blockchain_record_id: ledger.transactionId,
    },
  });

  return {
    ...payload,
    blockchain_record_id: ledger.transactionId,
  };
}

function generateLotId(crop: string, harvestDate: string) {
  const cropSlug = crop
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 8);
  const dateSlug = harvestDate.replace(/[^0-9]/g, "").slice(-8);
  const randomSlug = crypto.randomUUID().slice(0, 8).toUpperCase();
  return `LOT-${cropSlug || "CROP"}-${dateSlug || "00000000"}-${randomSlug}`;
}

export async function addSupplyChainEvent(
  token: string,
  input: {
    lotId: string;
    stage: string;
    actorName: string;
    actorRole?: string | null;
    location?: string | null;
    notes?: string | null;
    eventTime?: string;
    actorId?: string | null;
  },
) {
  const eventTime = input.eventTime || new Date().toISOString();
  const id = crypto.randomUUID();
  const payload = {
    id,
    lot_id: input.lotId,
    stage: input.stage,
    actor_name: input.actorName,
    actor_role: input.actorRole ?? null,
    location: input.location ?? null,
    notes: input.notes ?? null,
    event_time: eventTime,
    blockchain_record_id: null,
  };

  await supabaseRequest("/rest/v1/supply_chain_events", {
    token,
    method: "POST",
    headers: {
      Prefer: "return=representation",
    },
    body: [payload],
  });

  const action = mapStageToAction(input.stage);
  const ledger = await appendLedgerRecord(token, {
    entityType: "supply_chain_event",
    entityId: input.lotId,
    action,
    actor: input.actorName,
    actorId: input.actorId ?? null,
    actorRole: input.actorRole ?? "partner",
    status: "logged",
    metadata: {
      stage: input.stage,
      location: input.location ?? null,
      notes: input.notes ?? null,
      eventTime,
    },
  });

  await supabaseRequest("/rest/v1/supply_chain_events", {
    token,
    method: "PATCH",
    query: {
      id: `eq.${id}`,
    },
    headers: {
      Prefer: "return=representation",
    },
    body: {
      blockchain_record_id: ledger.transactionId,
    },
  });

  return {
    ...payload,
    blockchain_record_id: ledger.transactionId,
  };
}

function mapStageToAction(stage: string): LedgerAction {
  const normalized = stage.toLowerCase();
  if (normalized.includes("inspect") || normalized.includes("quality")) return "INSPECT";
  if (normalized.includes("store") || normalized.includes("warehouse")) return "STORE";
  if (normalized.includes("register")) return "REGISTER";
  if (normalized.includes("cert")) return "CERTIFY";
  return "TRANSFER";
}

export async function fetchProduceLot(token: string, lotId: string) {
  const rows = await supabaseRequest<ProduceLotRow[]>("/rest/v1/produce_lots", {
    token,
    query: {
      select: "*",
      lot_id: `eq.${lotId}`,
      limit: 1,
    },
  });

  return rows[0]
    ? {
        lotId: rows[0].lot_id,
        farmerId: rows[0].farmer_id,
        crop: rows[0].crop,
        quantity: toNumber(rows[0].quantity) || 0,
        unit: rows[0].unit,
        harvestDate: rows[0].harvest_date,
        location: rows[0].location,
        notes: rows[0].notes,
        status: rows[0].status,
        blockchainRecordId: rows[0].blockchain_record_id,
        createdAt: rows[0].created_at,
      }
    : null;
}

export async function fetchSupplyChainEvents(token: string, lotId: string) {
  const rows = await supabaseRequest<SupplyChainEventRow[]>("/rest/v1/supply_chain_events", {
    token,
    query: {
      select: "*",
      lot_id: `eq.${lotId}`,
      order: "event_time.asc",
    },
  });

  return rows.map((row) => ({
    id: row.id,
    lotId: row.lot_id,
    stage: row.stage,
    actorName: row.actor_name,
    actorRole: row.actor_role,
    location: row.location,
    notes: row.notes,
    eventTime: row.event_time,
    blockchainRecordId: row.blockchain_record_id,
  }));
}

export async function recordAuditLog(
  token: string,
  input: {
    actorId?: string | null;
    actorName: string;
    action: string;
    entityType: string;
    entityId: string;
    details: Record<string, unknown>;
  },
) {
  const payload: AuditLogRow = {
    id: crypto.randomUUID(),
    actor_id: input.actorId ?? null,
    actor_name: input.actorName,
    action: input.action,
    entity_type: input.entityType,
    entity_id: input.entityId,
    details: input.details,
  };

  await supabaseRequest("/rest/v1/audit_logs", {
    token,
    method: "POST",
    headers: {
      Prefer: "return=representation",
    },
    body: [payload],
  });

  return payload;
}

export async function fetchGovernmentOfficers(token: string) {
  const rows = await supabaseRequest<GovernmentOfficerRow[]>("/rest/v1/government_officers", {
    token,
    query: {
      select: "*",
      order: "created_at.desc",
    },
  });

  return rows;
}

export async function seedGovernmentOfficer(
  token: string,
  input: {
    userId: string;
    fullName: string;
    department: string;
    designation: string;
    status?: string;
  },
) {
  const payload = {
    id: crypto.randomUUID(),
    user_id: input.userId,
    full_name: input.fullName,
    department: input.department,
    designation: input.designation,
    status: input.status || "active",
  };

  await supabaseRequest("/rest/v1/government_officers", {
    token,
    method: "POST",
    query: {
      on_conflict: "user_id",
    },
    headers: {
      Prefer: "resolution=merge-duplicates,return=representation",
    },
    body: [payload],
  });

  return payload;
}

export function summarizeLedger(records: LedgerRecord[]) {
  return records.map(summarizeLedgerRecord);
}
