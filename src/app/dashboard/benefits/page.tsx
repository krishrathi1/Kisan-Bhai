"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, BadgeIndianRupee, Hash, RefreshCw, Plus, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "@/hooks/use-toast";
import { useTranslation } from "@/contexts/language-context";
import {
  createBenefitApplication,
  fetchBenefitApplications,
  fetchBenefitTransactions,
  fetchLedgerRecords,
  summarizeLedger,
  upsertFarmer,
} from "@/blockchain/transactions";
import { verifyLedgerChain } from "@/blockchain/ledger";
import type { LedgerRecord } from "@/blockchain/types";

type BenefitApplicationView = Awaited<ReturnType<typeof fetchBenefitApplications>>[number];

function statusTone(status: string) {
  if (status === "approved" || status === "disbursed") return "default";
  if (status === "rejected") return "destructive";
  return "secondary";
}

export default function BenefitsPage() {
  const { user, userProfile, sessionToken, loading } = useAuth();
  const { t } = useTranslation();
  const [applications, setApplications] = useState<BenefitApplicationView[]>([]);
  const [ledgerRecords, setLedgerRecords] = useState<LedgerRecord[]>([]);
  const [transactions, setTransactions] = useState<Awaited<ReturnType<typeof fetchBenefitTransactions>>>([]);
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    schemeName: "PM-KISAN",
    schemeCode: "PMKISAN",
    requestedAmount: "6000",
    remarks: "",
  });

  const selectedApplication = useMemo(
    () => applications.find((application) => application.id === selectedApplicationId) || applications[0] || null,
    [applications, selectedApplicationId],
  );

  const selectedVerification = useMemo(() => verifyLedgerChain(ledgerRecords), [ledgerRecords]);

  const loadData = async () => {
    if (!sessionToken || !user) return;
    setLoadingData(true);
    try {
      await upsertFarmer(sessionToken, {
        userId: user.id,
        fullName: user.displayName || userProfile?.displayName || "Farmer",
        district: userProfile?.location?.split(",")[0] || null,
        state: userProfile?.location?.split(",")[1]?.trim() || "Maharashtra",
        language: userProfile?.language || "en",
        crops: userProfile?.crops || "",
      });

      const apps = await fetchBenefitApplications(sessionToken, user.id);
      setApplications(apps);

      const nextSelected = apps.find((item) => item.id === selectedApplicationId) || apps[0] || null;
      setSelectedApplicationId(nextSelected?.id || null);

      if (nextSelected) {
        const [records, txs] = await Promise.all([
          fetchLedgerRecords(sessionToken, nextSelected.id),
          fetchBenefitTransactions(sessionToken, nextSelected.id),
        ]);
        setLedgerRecords(records);
        setTransactions(txs);
      } else {
        setLedgerRecords([]);
        setTransactions([]);
      }
    } catch (error) {
      console.error("Failed to load benefits data", error);
      toast({
        title: "Could not load benefits",
        description: "Check your Supabase tables, RLS policies, and logged-in account.",
        variant: "destructive",
      });
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (!loading) {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, sessionToken, user?.id, userProfile?.location]);

  const activeApplicationId = selectedApplication?.id;
  useEffect(() => {
    const refreshSelected = async () => {
      if (!sessionToken || !activeApplicationId) return;
      const [records, txs] = await Promise.all([
        fetchLedgerRecords(sessionToken, activeApplicationId),
        fetchBenefitTransactions(sessionToken, activeApplicationId),
      ]);
      setLedgerRecords(records);
      setTransactions(txs);
    };

    refreshSelected().catch((error) => console.error(error));
  }, [sessionToken, activeApplicationId]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!sessionToken || !user) return;

    setSubmitting(true);
    try {
      await createBenefitApplication(sessionToken, {
        farmerId: user.id,
        schemeName: form.schemeName,
        schemeCode: form.schemeCode || null,
        requestedAmount: Number(form.requestedAmount) || null,
        remarks: form.remarks || null,
        actorName: user.displayName || "Farmer",
        actorId: user.id,
        actorRole: "farmer",
        metadata: {
          location: userProfile?.location || null,
          language: userProfile?.language || "en",
        },
      });

      toast({
        title: "Application submitted",
        description: "Your subsidy request has been added to the hash-linked ledger.",
      });

      await loadData();
    } catch (error) {
      console.error(error);
      toast({
        title: "Submission failed",
        description: "Could not create the application right now.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const selectedLedgerSummary = summarizeLedger(ledgerRecords);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline">Benefits</h1>
          <p className="text-muted-foreground">Track subsidy requests and verify the ledger trail behind each decision.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
          <Button variant="outline" onClick={loadData} disabled={loadingData}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loadingData ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" />
              New application
            </CardTitle>
            <CardDescription>Submit a subsidy request that will be chained into the ledger.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="schemeName">Scheme name</Label>
                <Input id="schemeName" value={form.schemeName} onChange={(e) => setForm((current) => ({ ...current, schemeName: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="schemeCode">Scheme code</Label>
                <Input id="schemeCode" value={form.schemeCode} onChange={(e) => setForm((current) => ({ ...current, schemeCode: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="requestedAmount">Requested amount</Label>
                <Input
                  id="requestedAmount"
                  type="number"
                  min="0"
                  value={form.requestedAmount}
                  onChange={(e) => setForm((current) => ({ ...current, requestedAmount: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="remarks">Remarks</Label>
                <Textarea
                  id="remarks"
                  rows={3}
                  value={form.remarks}
                  onChange={(e) => setForm((current) => ({ ...current, remarks: e.target.value }))}
                  placeholder="Optional supporting note"
                />
              </div>
              <Button type="submit" className="w-full" disabled={submitting || loadingData}>
                {submitting ? "Submitting..." : "Submit to ledger"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              My subsidy status
            </CardTitle>
            <CardDescription>Each record is hash-linked so the approval trail can be verified later.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {applications.length === 0 && !loadingData ? (
              <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
                No benefit applications yet. Create one on the left to see the status and ledger viewer.
              </div>
            ) : (
              <div className="space-y-3">
                {applications.map((application) => (
                  <button
                    key={application.id}
                    className={`w-full rounded-xl border p-4 text-left transition hover:border-primary ${selectedApplication?.id === application.id ? "border-primary bg-primary/5" : ""}`}
                    onClick={() => setSelectedApplicationId(application.id)}
                  >
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{application.schemeName}</h3>
                          <Badge variant={statusTone(application.status) as any}>{application.status}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Requested {application.requestedAmount ?? 0} INR · Submitted {new Date(application.submittedAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right text-sm">
                        <div className="font-medium">Approved amount</div>
                        <div className="text-muted-foreground">{application.approvedAmount ?? "Pending"}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {selectedApplication && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BadgeIndianRupee className="h-5 w-5 text-primary" />
                Payment status
              </CardTitle>
              <CardDescription>Linked disbursements for the selected application.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {transactions.length === 0 ? (
                <div className="text-sm text-muted-foreground">No payment records found yet.</div>
              ) : (
                transactions.map((transaction) => (
                  <div key={transaction.id} className="rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold">{transaction.status}</div>
                        <div className="text-sm text-muted-foreground">Reference: {transaction.transactionRef || "N/A"}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{transaction.amount} INR</div>
                        <div className="text-xs text-muted-foreground">{transaction.paidAt ? new Date(transaction.paidAt).toLocaleString() : "Waiting"}</div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hash className="h-5 w-5 text-primary" />
                Blockchain record viewer
              </CardTitle>
              <CardDescription>Hash chain for application {selectedApplication.id.slice(0, 8)}.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Integrity</span>
                  <Badge variant={selectedVerification.valid ? "default" : "destructive"}>{selectedVerification.valid ? "Verified" : "Broken"}</Badge>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{selectedVerification.reason}</p>
              </div>
              <Separator />
              <div className="space-y-3">
                {selectedLedgerSummary.map((record) => (
                  <div key={record.transactionId} className="rounded-lg border p-4 text-sm">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <div className="font-semibold">{record.action}</div>
                        <div className="text-muted-foreground">{record.status}</div>
                      </div>
                      <div className="text-right text-xs text-muted-foreground">
                        <div>{new Date(record.timestamp).toLocaleString()}</div>
                        <div>{record.shortHash}</div>
                      </div>
                    </div>
                    <div className="mt-3 grid gap-2 md:grid-cols-2">
                      <div className="rounded-md bg-muted p-2">
                        <div className="text-xs uppercase tracking-wide text-muted-foreground">Previous hash</div>
                        <div className="break-all font-mono text-xs">{record.shortPreviousHash}</div>
                      </div>
                      <div className="rounded-md bg-muted p-2">
                        <div className="text-xs uppercase tracking-wide text-muted-foreground">Current hash</div>
                        <div className="break-all font-mono text-xs">{record.shortHash}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {ledgerRecords.length === 0 && (
                <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                  No ledger entries found yet. Submit or approve an application to generate the first record.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Farmer-facing demo notes
          </CardTitle>
          <CardDescription>Use this screen to show the trust layer in the demo.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm text-muted-foreground md:grid-cols-3">
          <div>1. Submit a new subsidy request from the form on the left.</div>
          <div>2. Open the record viewer to show the hash chain and integrity badge.</div>
          <div>3. After approval in admin, come back here and the payment record will appear automatically.</div>
        </CardContent>
      </Card>
    </div>
  );
}
