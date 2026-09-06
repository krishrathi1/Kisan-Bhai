"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Barcode, Hash, RefreshCw, PackagePlus, Truck, Warehouse, Inspect } from "lucide-react";
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
  addSupplyChainEvent,
  fetchLedgerRecords,
  fetchProduceLot,
  fetchSupplyChainEvents,
  registerProduceLot,
  summarizeLedger,
  upsertFarmer,
} from "@/blockchain/transactions";
import { verifyLedgerChain } from "@/blockchain/ledger";
import type { LedgerRecord } from "@/blockchain/types";

type ProduceLotView = NonNullable<Awaited<ReturnType<typeof fetchProduceLot>>>;

const stagePresets = [
  { value: "harvested", label: "Harvested", icon: PackagePlus },
  { value: "transported", label: "Transported", icon: Truck },
  { value: "stored", label: "Stored", icon: Warehouse },
  { value: "inspected", label: "Inspected", icon: Inspect },
];

export default function TraceabilityPage() {
  const { user, userProfile, sessionToken, loading } = useAuth();
  const { t } = useTranslation();
  const [lots, setLots] = useState<ProduceLotView[]>([]);
  const [selectedLotId, setSelectedLotId] = useState<string | null>(null);
  const [ledgerRecords, setLedgerRecords] = useState<LedgerRecord[]>([]);
  const [events, setEvents] = useState<Awaited<ReturnType<typeof fetchSupplyChainEvents>>>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [eventSaving, setEventSaving] = useState(false);
  const [lotForm, setLotForm] = useState({
    crop: "Wheat",
    quantity: "100",
    unit: "quintal",
    harvestDate: new Date().toISOString().slice(0, 10),
    location: userProfile?.location || "Pune, Maharashtra",
    notes: "",
  });
  const [eventForm, setEventForm] = useState({
    stage: "transported",
    actorName: user?.displayName || "Supply Partner",
    actorRole: "aggregator",
    location: userProfile?.location || "Pune, Maharashtra",
    notes: "",
  });

  const selectedLot = useMemo(
    () => lots.find((lot) => lot.lotId === selectedLotId) || lots[0] || null,
    [lots, selectedLotId],
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

      const rawLots = await fetchLotsForFarmer(sessionToken, user.id);
      setLots(rawLots);

      const nextSelected = rawLots.find((lot) => lot.lotId === selectedLotId) || rawLots[0] || null;
      setSelectedLotId(nextSelected?.lotId || null);

      if (nextSelected) {
        const [lot, lotEvents, records] = await Promise.all([
          fetchProduceLot(sessionToken, nextSelected.lotId),
          fetchSupplyChainEvents(sessionToken, nextSelected.lotId),
          fetchLedgerRecords(sessionToken, nextSelected.lotId),
        ]);

        if (lot) {
          setLots((current) => current.map((item) => (item.lotId === lot.lotId ? lot : item)));
        }
        setEvents(lotEvents);
        setLedgerRecords(records);
      } else {
        setEvents([]);
        setLedgerRecords([]);
      }
    } catch (error) {
      console.error("Failed to load traceability data", error);
      toast({
        title: "Could not load traceability data",
        description: "Apply the new Supabase migration and confirm your session is active.",
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

  const activeLotId = selectedLot?.lotId;
  useEffect(() => {
    const refreshSelected = async () => {
      if (!sessionToken || !activeLotId) return;
      const [lotEvents, records] = await Promise.all([
        fetchSupplyChainEvents(sessionToken, activeLotId),
        fetchLedgerRecords(sessionToken, activeLotId),
      ]);
      setEvents(lotEvents);
      setLedgerRecords(records);
    };

    refreshSelected().catch((error) => console.error(error));
  }, [sessionToken, activeLotId]);

  const handleRegisterLot = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!sessionToken || !user) return;
    setRegistering(true);
    try {
      const lot = await registerProduceLot(sessionToken, {
        farmerId: user.id,
        crop: lotForm.crop,
        quantity: Number(lotForm.quantity) || 0,
        unit: lotForm.unit,
        harvestDate: lotForm.harvestDate,
        location: lotForm.location,
        notes: lotForm.notes || null,
        actorName: user.displayName || "Farmer",
        actorId: user.id,
        actorRole: "farmer",
      });

      toast({
        title: "Produce lot registered",
        description: `Lot ${lot.lot_id} has been written to the ledger.`,
      });

      await loadData();
      setSelectedLotId(lot.lot_id);
    } catch (error) {
      console.error(error);
      toast({
        title: "Registration failed",
        description: "Could not create the produce lot.",
        variant: "destructive",
      });
    } finally {
      setRegistering(false);
    }
  };

  const handleAddEvent = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!sessionToken || !selectedLot) return;
    setEventSaving(true);
    try {
      await addSupplyChainEvent(sessionToken, {
        lotId: selectedLot.lotId,
        stage: eventForm.stage,
        actorName: eventForm.actorName || "Supply Partner",
        actorRole: eventForm.actorRole || null,
        location: eventForm.location || null,
        notes: eventForm.notes || null,
        actorId: user?.id || null,
      });

      toast({
        title: "Event added",
        description: `A ${eventForm.stage} event has been chained to ${selectedLot.lotId}.`,
      });

      setEventForm((current) => ({ ...current, notes: "" }));
      await loadData();
    } catch (error) {
      console.error(error);
      toast({
        title: "Event save failed",
        description: "Could not append the supply-chain event.",
        variant: "destructive",
      });
    } finally {
      setEventSaving(false);
    }
  };

  const selectedSummary = summarizeLedger(ledgerRecords);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline">Traceability</h1>
          <p className="text-muted-foreground">Register lots, log movement events, and verify the full chain.</p>
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
              <Barcode className="h-5 w-5 text-primary" />
              Register produce lot
            </CardTitle>
            <CardDescription>Create a lot ID that downstream partners can scan.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleRegisterLot}>
              <div className="space-y-2">
                <Label htmlFor="crop">Crop</Label>
                <Input id="crop" value={lotForm.crop} onChange={(e) => setLotForm((current) => ({ ...current, crop: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input id="quantity" type="number" min="0" value={lotForm.quantity} onChange={(e) => setLotForm((current) => ({ ...current, quantity: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit">Unit</Label>
                  <Input id="unit" value={lotForm.unit} onChange={(e) => setLotForm((current) => ({ ...current, unit: e.target.value }))} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="harvestDate">Harvest date</Label>
                <Input id="harvestDate" type="date" value={lotForm.harvestDate} onChange={(e) => setLotForm((current) => ({ ...current, harvestDate: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input id="location" value={lotForm.location} onChange={(e) => setLotForm((current) => ({ ...current, location: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" rows={3} value={lotForm.notes} onChange={(e) => setLotForm((current) => ({ ...current, notes: e.target.value }))} />
              </div>
              <Button type="submit" className="w-full" disabled={registering || loadingData}>
                {registering ? "Registering..." : "Generate lot ID"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Hash className="h-5 w-5 text-primary" />
              Registered lots
            </CardTitle>
            <CardDescription>Pick a lot to view its events and ledger proof.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {lots.length === 0 && !loadingData ? (
              <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
                No produce lots yet. Register one to begin traceability tracking.
              </div>
            ) : (
              lots.map((lot) => (
                <button
                  key={lot.lotId}
                  className={`w-full rounded-xl border p-4 text-left transition hover:border-primary ${selectedLot?.lotId === lot.lotId ? "border-primary bg-primary/5" : ""}`}
                  onClick={() => setSelectedLotId(lot.lotId)}
                >
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{lot.crop}</h3>
                        <Badge variant="secondary">{lot.status}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {lot.lotId} · {lot.quantity} {lot.unit} · {lot.location}
                      </p>
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      <div>Harvested {lot.harvestDate}</div>
                      <div>{lot.blockchainRecordId ? "Ledger linked" : "No ledger link yet"}</div>
                    </div>
                  </div>
                </button>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {selectedLot && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-primary" />
                Supply-chain events
              </CardTitle>
              <CardDescription>Add transport, storage, inspection, or other stage updates.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form className="space-y-4 rounded-lg border p-4" onSubmit={handleAddEvent}>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="stage">Stage</Label>
                    <select
                      id="stage"
                      className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={eventForm.stage}
                      onChange={(e) => setEventForm((current) => ({ ...current, stage: e.target.value }))}
                    >
                      {stagePresets.map((preset) => (
                        <option key={preset.value} value={preset.value}>
                          {preset.label}
                        </option>
                      ))}
                      <option value="custom">Custom</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="actorName">Actor</Label>
                    <Input id="actorName" value={eventForm.actorName} onChange={(e) => setEventForm((current) => ({ ...current, actorName: e.target.value }))} />
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="actorRole">Actor role</Label>
                    <Input id="actorRole" value={eventForm.actorRole} onChange={(e) => setEventForm((current) => ({ ...current, actorRole: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="eventLocation">Location</Label>
                    <Input id="eventLocation" value={eventForm.location} onChange={(e) => setEventForm((current) => ({ ...current, location: e.target.value }))} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="eventNotes">Notes</Label>
                  <Textarea id="eventNotes" rows={3} value={eventForm.notes} onChange={(e) => setEventForm((current) => ({ ...current, notes: e.target.value }))} />
                </div>
                <Button type="submit" className="w-full" disabled={eventSaving || loadingData}>
                  {eventSaving ? "Saving..." : "Append event to ledger"}
                </Button>
              </form>

              <div className="space-y-3">
                {events.length === 0 ? (
                  <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                    No supply-chain events yet for this lot.
                  </div>
                ) : (
                  events.map((eventItem) => (
                    <div key={eventItem.id} className="rounded-lg border p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold capitalize">{eventItem.stage}</div>
                          <div className="text-sm text-muted-foreground">
                            {eventItem.actorName} · {eventItem.location || "Unknown location"}
                          </div>
                        </div>
                        <div className="text-right text-xs text-muted-foreground">{new Date(eventItem.eventTime).toLocaleString()}</div>
                      </div>
                      {eventItem.notes && <p className="mt-2 text-sm text-muted-foreground">{eventItem.notes}</p>}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hash className="h-5 w-5 text-primary" />
                Verification proof
              </CardTitle>
              <CardDescription>Use this lot ID for the public verification page.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-muted-foreground">Lot ID</div>
                    <div className="font-mono text-sm break-all">{selectedLot.lotId}</div>
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/verify/${selectedLot.lotId}`}>Open public verify page</Link>
                  </Button>
                </div>
              </div>
              <div className="rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Integrity</span>
                  <Badge variant={selectedVerification.valid ? "default" : "destructive"}>{selectedVerification.valid ? "Verified" : "Broken"}</Badge>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{selectedVerification.reason}</p>
              </div>
              <Separator />
              <div className="space-y-3">
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
                    No ledger records yet for this lot.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

async function fetchLotsForFarmer(token: string, farmerId: string) {
  try {
    const { supabaseConfigured } = await import("@/lib/supabase");
    if (!supabaseConfigured) {
      return getDemoProduceLots(farmerId);
    }
    return await fetchProduceLotsDirect(token, farmerId);
  } catch {
    return getDemoProduceLots(farmerId);
  }
}

function getDemoProduceLots(farmerId: string): ProduceLotView[] {
  return [
    {
      lotId: "LOT-WHT-2026-001",
      farmerId,
      crop: "Wheat (Sharbati)",
      quantity: 120,
      unit: "quintal",
      harvestDate: "2026-08-20",
      location: "Karnal, Haryana",
      notes: "Organic pesticide-free harvest",
      status: "verified",
      blockchainRecordId: "rec-wht-001",
      createdAt: new Date().toISOString(),
    },
    {
      lotId: "LOT-MST-2026-002",
      farmerId,
      crop: "Mustard (Pusa Bold)",
      quantity: 45,
      unit: "quintal",
      harvestDate: "2026-08-22",
      location: "Sirsa, Haryana",
      notes: "High oil content batch",
      status: "in_transit",
      blockchainRecordId: "rec-mst-002",
      createdAt: new Date().toISOString(),
    },
  ];
}

async function fetchProduceLotsDirect(token: string, farmerId: string) {
  const { supabaseRequest } = await import("@/blockchain/rest");
  const rows = await supabaseRequest<any[]>("/rest/v1/produce_lots", {
    token,
    query: {
      select: "*",
      farmer_id: `eq.${farmerId}`,
      order: "created_at.desc",
    },
  });

  return rows.map((row) => ({
    lotId: row.lot_id,
    farmerId: row.farmer_id,
    crop: row.crop,
    quantity: Number(row.quantity) || 0,
    unit: row.unit,
    harvestDate: row.harvest_date,
    location: row.location,
    notes: row.notes,
    status: row.status,
    blockchainRecordId: row.blockchain_record_id,
    createdAt: row.created_at,
  }));
}
