import { supabaseRequest } from "./rest";
import { fetchLedgerRecords, fetchProduceLot, fetchSupplyChainEvents, fetchBenefitApplications, fetchBenefitTransactions } from "./transactions";
import { LedgerRecord } from "./types";
import { verifyLedgerChain } from "./ledger";

export interface ProduceVerificationResult {
  lot: Awaited<ReturnType<typeof fetchProduceLot>>;
  events: Awaited<ReturnType<typeof fetchSupplyChainEvents>>;
  records: LedgerRecord[];
  verification: ReturnType<typeof verifyLedgerChain>;
}

export async function fetchPublicProduceVerification(lotId: string): Promise<ProduceVerificationResult> {
  const [lot, events, records] = await Promise.all([
    fetchProduceLot("", lotId),
    fetchSupplyChainEvents("", lotId),
    fetchLedgerRecords("", lotId),
  ]);

  return {
    lot,
    events,
    records,
    verification: verifyLedgerChain(records),
  };
}

export async function fetchBenefitVerification(applicationId: string) {
  const [applications, transactions, records] = await Promise.all([
    fetchBenefitApplications("", undefined),
    fetchBenefitTransactions("", applicationId),
    fetchLedgerRecords("", applicationId),
  ]);

  const application = applications.find((item) => item.id === applicationId) || null;

  return {
    application,
    transactions,
    records,
    verification: verifyLedgerChain(records),
  };
}

export async function verifyLotIntegrity(lotId: string) {
  const bundle = await fetchPublicProduceVerification(lotId);
  return {
    lotId,
    valid: Boolean(bundle.lot) && bundle.verification.valid,
    reason: bundle.verification.reason,
    recordCount: bundle.records.length,
  };
}

export async function verifyLedgerIntegrity(entityId: string) {
  const records = await fetchLedgerRecords("", entityId);
  return verifyLedgerChain(records);
}
