"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, BadgeCheck, CircleAlert, RefreshCw, Shield, Stamp, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "@/hooks/use-toast";
import {
  fetchGovernmentOfficers,
  fetchLedgerRecords,
  fetchPendingBenefitApplications,
  recordAuditLog,
  reviewBenefitApplication,
  seedGovernmentOfficer,
  summarizeLedger,
} from "@/blockchain/transactions";
import { verifyLedgerChain } from "@/blockchain/ledger";
import type { LedgerRecord } from "@/blockchain/types";

type PendingApplication = Awaited<ReturnType<typeof fetchPendingBenefitApplications>>[number];

export default function AdminPage() {
  const { user, sessionToken, loading } = useAuth();
  const [officerRegistered, setOfficerRegistered] = useState(false);
  const [queue, setQueue] = useState<PendingApplication[]>([]);
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null);
  const [ledgerRecords, setLedgerRecords] = useState<LedgerRecord[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [working, setWorking] = useState(false);
  const [form, setForm] = useState({
    remarks: "",
    approvedAmount: "",
  });

  const selectedApplication = useMemo(
    () => queue.find((item) => item.id === selectedApplicationId) || queue[0] || null,
    [queue, selectedApplicationId],
  );

  const selectedVerification = useMemo(() => verifyLedgerChain(ledgerRecords), [ledgerRecords]);

  const loadData = async () => {
    if (!sessionToken || !user) return;
    setLoadingData(true);
    try {
      const officers = await fetchGovernmentOfficers(sessionToken).catch(() => []);
      setOfficerRegistered(officers.some((officer) => officer.user_id === user.id));

      const pending = await fetchPendingBenefitApplications(sessionToken).catch(() => []);
      setQueue(pending);

      const nextSelected = pending.find((item) => item.id === selectedApplicationId) || pending[0] || null;
      setSelectedApplicationId(nextSelected?.id || null);

      if (nextSelected) {
        const records = await fetchLedgerRecords(sessionToken, nextSelected.id);
        setLedgerRecords(records);
      } else {
        setLedgerRecords([]);
      }
    } catch (error) {
      console.error("Failed to load admin data", error);
      toast({
        title: "Admin queue unavailable",
        description: "Make sure the new Supabase tables and RLS policies are applied.",
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
  }, [loading, sessionToken, user?.id]);

  const activeApplicationId = selectedApplication?.id;
  useEffect(() => {
    const refreshSelected = async () => {
      if (!sessionToken || !activeApplicationId) return;
      const records = await fetchLedgerRecords(sessionToken, activeApplicationId);
      setLedgerRecords(records);
    };

    refreshSelected().catch((error) => console.error(error));
  }, [sessionToken, activeApplicationId]);

  const initializeDemoOfficer = async () => {
    if (!sessionToken || !user) return;
    setWorking(true);
    try {
      await seedGovernmentOfficer(sessionToken, {
        userId: user.id,
        fullName: user.displayName || "Demo Officer",
        department: "Agriculture Department",
        designation: "Subsidy Review Officer",
      });

      await recordAuditLog(sessionToken, {
        actorId: user.id,
        actorName: user.displayName || "Demo Officer",
        action: "demo_officer_initialized",
        entityType: "government_officer",
        entityId: user.id,
        details: {
          department: "Agriculture Department",
          designation: "Subsidy Review Officer",
        },
      });

      toast({
        title: "Officer mode enabled",
        description: "This account can now review benefit applications.",
      });

      await loadData();
    } catch (error) {
      console.error(error);
      toast({
        title: "Could not initialize officer mode",
        description: "Check the government_officers table policy.",
        variant: "destructive",
      });
    } finally {
      setWorking(false);
    }
  };

  const reviewCurrentApplication = async (decision: "approved" | "rejected") => {
    if (!sessionToken || !user || !selectedApplication) return;
    setWorking(true);
    try {
      await reviewBenefitApplication(sessionToken, {
        applicationId: selectedApplication.id,
        decision,
        actorName: user.displayName || "Officer",
        actorId: user.id,
        actorRole: "officer",
        remarks: form.remarks || null,
        approvedAmount: decision === "approved" ? Number(form.approvedAmount || selectedApplication.requestedAmount || 0) : null,
      });

      toast({
        title: decision === "approved" ? "Application approved" : "Application rejected",
        description: "The decision has been written to the ledger.",
      });

      setForm({ remarks: "", approvedAmount: "" });
      await loadData();
    } catch (error) {
      console.error(error);
      toast({
        title: "Review failed",
        description: "Could not update the application.",
        variant: "destructive",
      });
    } finally {
      setWorking(false);
    }
  };

  const selectedSummary = summarizeLedger(ledgerRecords);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline">Admin review queue</h1>
          <p className="text-muted-foreground">Approve or reject subsidy requests and write the decision to the ledger.</p>
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

      {!officerRegistered && (
        <Card className="border-amber-200 bg-amber-50/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-amber-600" />
              Demo officer mode
            </CardTitle>
            <CardDescription>
              This account is not yet registered as a government officer. Click the button below to initialize demo access.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={initializeDemoOfficer} disabled={working || !user}>
              <Stamp className="mr-2 h-4 w-4" />
              {working ? "Initializing..." : "Initialize demo officer"}
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Pending applications</CardTitle>
            <CardDescription>Applications waiting for a decision.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {queue.length === 0 && !loadingData ? (
              <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
                No pending applications are visible yet.
              </div>
            ) : (
              queue.map((application) => (
                <button
                  key={application.id}
                  className={`w-full rounded-xl border p-4 text-left transition hover:border-primary ${selectedApplication?.id === application.id ? "border-primary bg-primary/5" : ""}`}
                  onClick={() => setSelectedApplicationId(application.id)}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="font-semibold">{application.schemeName}</div>
                      <div className="text-sm text-muted-foreground">
                        {application.farmerId.slice(0, 8)} · Requested {application.requestedAmount ?? 0} INR
                      </div>
                    </div>
                    <Badge variant="secondary">{application.status}</Badge>
                  </div>
                </button>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BadgeCheck className="h-5 w-5 text-primary" />
              Review selected request
            </CardTitle>
            <CardDescription>Approve, reject, and automatically append the hash-linked ledger entry.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedApplication ? (
              <>
                <div className="rounded-lg border p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold">{selectedApplication.schemeName}</h3>
                    <Badge variant="secondary">{selectedApplication.id.slice(0, 8)}</Badge>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Requested by farmer {selectedApplication.farmerId.slice(0, 8)} · Submitted {new Date(selectedApplication.submittedAt).toLocaleString()}
                  </p>
                  <p className="mt-2 text-sm">{selectedApplication.remarks || "No remarks provided."}</p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="approvedAmount">Approved amount</Label>
                    <Input
                      id="approvedAmount"
                      type="number"
                      min="0"
                      value={form.approvedAmount}
                      onChange={(event) => setForm((current) => ({ ...current, approvedAmount: event.target.value }))}
                      placeholder={String(selectedApplication.requestedAmount ?? 0)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="remarks">Officer remarks</Label>
                    <Textarea
                      id="remarks"
                      rows={3}
                      value={form.remarks}
                      onChange={(event) => setForm((current) => ({ ...current, remarks: event.target.value }))}
                      placeholder="Reason for the decision"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button onClick={() => reviewCurrentApplication("approved")} disabled={working || !officerRegistered}>
                    Approve and write ledger
                  </Button>
                  <Button variant="destructive" onClick={() => reviewCurrentApplication("rejected")} disabled={working || !officerRegistered}>
                    Reject and write ledger
                  </Button>
                </div>

                <Separator />

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-lg border p-4">
                    <div className="text-sm font-medium">Integrity</div>
                    <div className="mt-2">
                      <Badge variant={selectedVerification.valid ? "default" : "destructive"}>
                        {selectedVerification.valid ? "Verified" : "Broken"}
                      </Badge>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">{selectedVerification.reason}</p>
                  </div>
                  <div className="rounded-lg border p-4">
                    <div className="text-sm font-medium">Application status</div>
                    <div className="mt-2 text-2xl font-bold capitalize">{selectedApplication.status}</div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      If approved, the payment row is written automatically in `benefit_transactions`.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Hash className="h-4 w-4 text-primary" />
                    Ledger trail
                  </div>
                  {selectedSummary.map((record) => (
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
                    </div>
                  ))}
                  {selectedSummary.length === 0 && (
                    <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                      No ledger entries yet for this application.
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
                Select a pending application to start reviewing it.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
