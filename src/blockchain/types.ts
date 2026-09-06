/**
 * Permissioned-ledger abstraction for BeejMantra.
 *
 * This is intentionally a simple hash-linked record chain stored in Supabase.
 * It is not a Hyperledger Fabric network and should not be described as one.
 */

export type LedgerEntityType =
  | "benefit_application"
  | "benefit_transaction"
  | "produce_lot"
  | "supply_chain_event"
  | "certification"
  | "audit_log";

export type LedgerAction =
  | "SUBMIT"
  | "APPROVE"
  | "REJECT"
  | "DISBURSE"
  | "REGISTER"
  | "TRANSFER"
  | "STORE"
  | "INSPECT"
  | "CERTIFY"
  | "VERIFY"
  | "AUDIT";

export type LedgerStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "disbursed"
  | "registered"
  | "in_transit"
  | "stored"
  | "verified"
  | "revoked"
  | "logged";

export interface LedgerRecord {
  transactionId: string;
  entityType: LedgerEntityType;
  entityId: string;
  action: LedgerAction;
  actor: string;
  actorId?: string | null;
  actorRole?: string | null;
  timestamp: string;
  previousHash: string;
  currentHash: string;
  status: LedgerStatus | string;
  metadataHash: string;
  metadata: Record<string, unknown>;
  createdAt?: string;
}

export interface LedgerRecordInput {
  entityType: LedgerEntityType;
  entityId: string;
  action: LedgerAction;
  actor: string;
  actorId?: string | null;
  actorRole?: string | null;
  status: LedgerStatus | string;
  metadata?: Record<string, unknown>;
  previousHash?: string;
  timestamp?: string;
}

export interface FarmerRow {
  user_id: string;
  full_name: string | null;
  district: string | null;
  state: string | null;
  language: string | null;
  phone: string | null;
  land_size_acres: number | null;
  crops: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface BenefitApplicationRow {
  id: string;
  farmer_id: string;
  scheme_name: string;
  scheme_code: string | null;
  requested_amount: number | null;
  approved_amount: number | null;
  status: string;
  submitted_at: string;
  reviewed_at: string | null;
  officer_id: string | null;
  remarks: string | null;
  ledger_transaction_id: string | null;
}

export interface BenefitTransactionRow {
  id: string;
  application_id: string;
  amount: number;
  transaction_ref: string | null;
  status: string;
  paid_at: string | null;
  ledger_transaction_id: string | null;
  created_at?: string;
}

export interface ProduceLotRow {
  lot_id: string;
  farmer_id: string;
  crop: string;
  quantity: number;
  unit: string;
  harvest_date: string;
  location: string;
  notes: string | null;
  status: string;
  blockchain_record_id: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface SupplyChainEventRow {
  id: string;
  lot_id: string;
  stage: string;
  actor_name: string;
  actor_role: string | null;
  location: string | null;
  notes: string | null;
  event_time: string;
  blockchain_record_id: string | null;
}

export interface CertificationRow {
  id: string;
  farmer_id: string;
  lot_id: string | null;
  certification_type: string;
  status: string;
  issued_at: string | null;
  verified_at: string | null;
  expiry_date: string | null;
  blockchain_record_id: string | null;
}

export interface GovernmentOfficerRow {
  id: string;
  user_id: string;
  full_name: string;
  department: string;
  designation: string;
  status: string;
  created_at?: string;
}

export interface AuditLogRow {
  id: string;
  actor_id: string | null;
  actor_name: string;
  action: string;
  entity_type: string;
  entity_id: string;
  details: Record<string, unknown>;
  created_at?: string;
}
