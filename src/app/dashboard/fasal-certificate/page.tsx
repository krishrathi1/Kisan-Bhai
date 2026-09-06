"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Link2,
  CheckCircle2,
  Loader2,
  Wheat,
  MapPin,
  Calendar,
  Package,
  Shield,
  History,
  ExternalLink,
  Plus,
  Download,
  Printer,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { toPng } from "html-to-image";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { useTranslation } from "@/contexts/language-context";
import {
  recordCertificateOnChain,
  hashCropData,
  type CropData,
} from "@/blockchain/fasal-blockchain";
import {
  saveFasalCertificate,
  fetchUserCertificates,
  type FasalCertificate,
} from "@/lib/fasal-db";

// ── Crop Options ───────────────────────────────────────────────────────

const CROPS = [
  "Wheat",
  "Rice",
  "Cotton",
  "Sugarcane",
  "Maize",
  "Soybean",
  "Mustard",
  "Potato",
  "Tomato",
  "Onion",
  "Chilli",
  "Turmeric",
  "Groundnut",
  "Bajra",
  "Jowar",
];

// ── Verification Steps ─────────────────────────────────────────────────

type StepStatus = "pending" | "active" | "done";

interface VerificationStep {
  label: string;
  icon: string;
  status: StepStatus;
}

export default function FasalCertificatePage() {
  const { user, userProfile, sessionToken } = useAuth();
  const { t } = useTranslation();

  // Form state
  const [crop, setCrop] = useState("Wheat");
  const [quantity, setQuantity] = useState("18");
  const [quantityUnit, setQuantityUnit] = useState("Quintal");
  const [harvestDate, setHarvestDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [location, setLocation] = useState("Haryana, India");
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  // Process state
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [certificate, setCertificate] = useState<FasalCertificate | null>(null);
  const [history, setHistory] = useState<FasalCertificate[]>([]);
  const [steps, setSteps] = useState<VerificationStep[]>([
    { label: "Crop details collected", icon: "📋", status: "pending" },
    { label: "Digital fingerprint generated", icon: "🔐", status: "pending" },
    { label: "Recording on blockchain...", icon: "⛓", status: "pending" },
    { label: "Certificate verified", icon: "✓", status: "pending" },
  ]);

  const certRef = useRef<HTMLDivElement>(null);

  const handleDownloadCertificate = async () => {
    if (!certRef.current || !certificate) return;
    setIsDownloading(true);
    try {
      const dataUrl = await toPng(certRef.current, {
        quality: 1,
        pixelRatio: 3,
        cacheBust: true,
      });

      const link = document.createElement("a");
      link.download = `BeejMantra_Fasal_Certificate_${certificate.id}.png`;
      link.href = dataUrl;
      link.click();

      toast({
        title: "Certificate Downloaded",
        description: `Fasal Certificate ${certificate.id} saved as PNG image.`,
      });
    } catch (err) {
      console.error("Failed to download certificate", err);
      toast({
        title: "Download Failed",
        description: "Could not generate certificate image.",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  useEffect(() => {
    if (userProfile?.location) {
      setLocation(userProfile.location);
    }
    // Load history
    fetchUserCertificates(sessionToken, user?.id || "demo-farmer-001")
      .then((list) => setHistory(list))
      .catch((err) => console.warn("Failed to load certificate history", err));
  }, [userProfile?.location, user?.id, sessionToken]);

  const updateStep = (index: number, status: StepStatus) => {
    setSteps((prev) =>
      prev.map((s, i) => (i === index ? { ...s, status } : s)),
    );
  };

  const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  // ── Generate Certificate ─────────────────────────────────────────────

  const handleGenerate = async () => {
    if (!crop || !quantity || !harvestDate || !location) return;
    setIsGenerating(true);
    setCertificate(null);

    // Reset steps
    setSteps([
      { label: "Crop details collected", icon: "📋", status: "pending" },
      { label: "Digital fingerprint generated", icon: "🔐", status: "pending" },
      { label: "Recording on blockchain...", icon: "⛓", status: "pending" },
      { label: "Certificate verified", icon: "✓", status: "pending" },
    ]);

    try {
      // Step 1: Collect
      updateStep(0, "active");
      await sleep(600);
      updateStep(0, "done");

      // Step 2: Hash
      updateStep(1, "active");
      const cropData: CropData = {
        crop,
        quantity: `${quantity} ${quantityUnit}`,
        harvestDate,
        location,
      };
      await hashCropData(cropData);
      await sleep(800);
      updateStep(1, "done");

      // Step 3: Blockchain
      updateStep(2, "active");
      await sleep(1000);
      const result = await recordCertificateOnChain(cropData);
      updateStep(2, "done");

      // Step 4: Verified
      updateStep(3, "active");
      await sleep(500);
      updateStep(3, "done");

      // Build certificate
      const cert: FasalCertificate = {
        id: result.certificateId,
        userId: user?.id || "demo-farmer-001",
        crop,
        quantity: `${quantity} ${quantityUnit}`,
        harvestDate,
        location,
        photoUrl: null,
        dataHash: result.dataHash,
        transactionHash: result.transactionHash,
        isDemo: result.isDemo,
        createdAt: result.timestamp,
      };

      // Save off-chain
      await saveFasalCertificate(sessionToken, cert);

      setCertificate(cert);
      setHistory((prev) => [cert, ...prev.filter((c) => c.id !== cert.id)]);
    } catch (err) {
      console.error("Certificate generation failed", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return iso;
    }
  };

  const shortenHash = (hash: string) =>
    hash.length > 14 ? `${hash.slice(0, 6)}...${hash.slice(-4)}` : hash;

  const getVerifyUrl = (id: string) =>
    typeof window !== "undefined"
      ? `${window.location.origin}/verify/${id}`
      : `https://beejmantra.in/verify/${id}`;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between pt-4">
        <div>
          <h1 className="text-3xl font-bold font-headline flex items-center gap-2">
            <Link2 className="h-8 w-8 text-primary" />
            Fasal Certificate
          </h1>
          <p className="text-muted-foreground mt-1">
            Apni fasal ka verified digital record banayein.
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Link>
        </Button>
      </div>

      {/* Certificate Generated View */}
      {certificate ? (
        <div className="space-y-6 animate-in fade-in-50 duration-300">
          {/* Certificate Card */}
          <div
            id="printable-fasal-certificate"
            ref={certRef}
            className="mx-auto max-w-lg rounded-2xl overflow-hidden shadow-2xl"
            style={{
              background:
                "linear-gradient(145deg, #0d1f14 0%, #151817 50%, #0d1a12 100%)",
              border: "1px solid rgba(25, 200, 102, 0.3)",
              boxShadow: "0 0 50px rgba(25, 200, 102, 0.12)",
            }}
          >
            {/* Top accent bar */}
            <div
              className="h-2 w-full"
              style={{
                background:
                  "linear-gradient(90deg, #075A32, #19C866, #075A32)",
              }}
            />

            <div className="p-8 space-y-6">
              {/* Header */}
              <div className="text-center space-y-1">
                <p className="text-xs tracking-[0.3em] uppercase font-bold" style={{ color: "#19C866" }}>
                  🌿 BEEJMANTRA
                </p>
                <h2 className="text-2xl font-bold tracking-wide" style={{ color: "#F5F7F5" }}>
                  FASAL CERTIFICATE
                </h2>
                <p className="text-xs" style={{ color: "#9AA39E" }}>
                  Verified Crop Record
                </p>
              </div>

              {/* Crop Icon */}
              <div className="flex justify-center">
                <div
                  className="rounded-full p-4"
                  style={{
                    background: "rgba(25, 200, 102, 0.12)",
                    border: "1px solid rgba(25, 200, 102, 0.3)",
                  }}
                >
                  <Wheat className="h-10 w-10" style={{ color: "#19C866" }} />
                </div>
              </div>

              <p
                className="text-center text-2xl font-bold"
                style={{ color: "#F5F7F5" }}
              >
                🌾 {certificate.crop}
              </p>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4 rounded-xl p-4" style={{ background: "rgba(0,0,0,0.25)" }}>
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-wider font-medium" style={{ color: "#9AA39E" }}>
                    Quantity
                  </p>
                  <p className="font-semibold flex items-center gap-1.5" style={{ color: "#F5F7F5" }}>
                    <Package className="h-4 w-4" style={{ color: "#19C866" }} />
                    {certificate.quantity}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-wider font-medium" style={{ color: "#9AA39E" }}>
                    Harvest Date
                  </p>
                  <p className="font-semibold flex items-center gap-1.5" style={{ color: "#F5F7F5" }}>
                    <Calendar className="h-4 w-4" style={{ color: "#19C866" }} />
                    {formatDate(certificate.harvestDate)}
                  </p>
                </div>
                <div className="col-span-2 space-y-1">
                  <p className="text-xs uppercase tracking-wider font-medium" style={{ color: "#9AA39E" }}>
                    Location
                  </p>
                  <p className="font-semibold flex items-center gap-1.5" style={{ color: "#F5F7F5" }}>
                    <MapPin className="h-4 w-4" style={{ color: "#19C866" }} />
                    {certificate.location}
                  </p>
                </div>
              </div>

              {/* Status */}
              <div className="text-center">
                <div
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold tracking-wide"
                  style={{
                    background: "rgba(25, 200, 102, 0.12)",
                    border: "1px solid rgba(25, 200, 102, 0.35)",
                    color: "#19C866",
                  }}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  {certificate.isDemo
                    ? "BLOCKCHAIN VERIFIED"
                    : "BLOCKCHAIN VERIFIED"}
                </div>
              </div>

              {/* Certificate & Transaction IDs */}
              <div className="space-y-2.5 rounded-xl p-3.5" style={{ background: "rgba(0,0,0,0.2)" }}>
                <div className="flex justify-between items-center text-sm">
                  <span style={{ color: "#9AA39E" }}>Certificate ID</span>
                  <span className="font-mono font-bold text-sm" style={{ color: "#F5F7F5" }}>
                    {certificate.id}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span style={{ color: "#9AA39E" }}>Transaction</span>
                  <span className="font-mono text-xs" style={{ color: "#F5F7F5" }}>
                    {shortenHash(certificate.transactionHash || "")}
                  </span>
                </div>
              </div>

              {/* QR Code */}
              <div className="flex flex-col items-center gap-3 pt-2">
                <div
                  className="p-3.5 rounded-2xl shadow-md"
                  style={{ background: "#F5F7F5" }}
                >
                  <QRCodeSVG
                    value={getVerifyUrl(certificate.id)}
                    size={140}
                    level="H"
                    bgColor="#F5F7F5"
                    fgColor="#070908"
                  />
                </div>
                <p className="text-xs text-center font-medium" style={{ color: "#9AA39E" }}>
                  Scan to verify this crop record.
                </p>
              </div>
            </div>

            {/* Bottom accent bar */}
            <div
              className="h-1.5 w-full"
              style={{
                background:
                  "linear-gradient(90deg, #075A32, #19C866, #075A32)",
              }}
            />
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3 justify-center items-center">
            <Button
              onClick={handleDownloadCertificate}
              disabled={isDownloading}
              className="bg-[#245B35] hover:bg-[#1A4A28] active:scale-95 text-[#FAF5E8] font-bold rounded-full px-6 py-2.5 shadow-md border border-[#194A28]"
            >
              <Download className="mr-2 h-4 w-4" />
              {isDownloading ? "Generating Image..." : "Download Certificate (PNG)"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => window.print()}
              className="rounded-full px-5 border-border/80"
              title="Print or Save Certificate as PDF"
            >
              <Printer className="mr-2 h-4 w-4" />
              Print / Save PDF
            </Button>
            <Button
              onClick={() => setCertificate(null)}
              variant="outline"
              className="rounded-full"
            >
              <Plus className="mr-2 h-4 w-4" /> Generate Another Certificate
            </Button>
            <Button asChild variant="outline" className="rounded-full">
              <Link href={`/verify/${certificate.id}`} target="_blank">
                <Shield className="mr-2 h-4 w-4" />
                Open Public Verification Page
              </Link>
            </Button>
          </div>
        </div>
      ) : isGenerating ? (
        /* Progress Step UI */
        <Card className="mx-auto max-w-md shadow-xl border-primary/20">
          <CardHeader className="text-center pb-2">
            <CardTitle className="flex items-center justify-center gap-2 text-xl">
              <Link2 className="h-5 w-5 text-primary animate-pulse" />
              Securing Crop Record
            </CardTitle>
            <CardDescription>
              Blockchain process in progress...
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-4">
            {steps.map((step, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 p-3.5 rounded-xl transition-all duration-300 ${
                  step.status === "active"
                    ? "bg-primary/15 border border-primary/40 shadow-sm"
                    : step.status === "done"
                      ? "bg-green-500/10 border border-green-500/25"
                      : "opacity-40 bg-muted/20"
                }`}
              >
                <span className="text-lg w-7 text-center">
                  {step.status === "done" ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500 inline" />
                  ) : step.status === "active" ? (
                    <Loader2 className="h-5 w-5 text-primary animate-spin inline" />
                  ) : (
                    step.icon
                  )}
                </span>
                <span
                  className={`text-sm font-medium ${
                    step.status === "done"
                      ? "text-green-400 font-semibold"
                      : step.status === "active"
                        ? "text-primary font-semibold"
                        : "text-muted-foreground"
                  }`}
                >
                  {step.label}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : (
        /* Input Form */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                🌾 Create Your Fasal Certificate
              </CardTitle>
              <CardDescription>
                Apni harvested crop ka secure aur verified record banayein.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                className="space-y-5"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleGenerate();
                }}
              >
                {/* Crop Name */}
                <div className="space-y-2">
                  <Label htmlFor="cert-crop">Crop Name</Label>
                  <Select value={crop} onValueChange={setCrop}>
                    <SelectTrigger id="cert-crop">
                      <SelectValue placeholder="Select crop" />
                    </SelectTrigger>
                    <SelectContent>
                      {CROPS.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Quantity */}
                <div className="space-y-2">
                  <Label htmlFor="cert-qty">Quantity</Label>
                  <div className="flex gap-2">
                    <Input
                      id="cert-qty"
                      type="number"
                      placeholder="18"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className="flex-1"
                      required
                    />
                    <Select value={quantityUnit} onValueChange={setQuantityUnit}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Quintal">Quintal</SelectItem>
                        <SelectItem value="Kg">Kg</SelectItem>
                        <SelectItem value="Ton">Ton</SelectItem>
                        <SelectItem value="Bags">Bags</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Harvest Date */}
                <div className="space-y-2">
                  <Label htmlFor="cert-date">Harvest Date</Label>
                  <Input
                    id="cert-date"
                    type="date"
                    value={harvestDate}
                    onChange={(e) => setHarvestDate(e.target.value)}
                    required
                  />
                </div>

                {/* Location */}
                <div className="space-y-2">
                  <Label htmlFor="cert-loc">Location</Label>
                  <Input
                    id="cert-loc"
                    placeholder="e.g. Haryana, India"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required
                  />
                </div>

                {/* Optional Photo */}
                <div className="space-y-2">
                  <Label htmlFor="cert-photo" className="text-muted-foreground">
                    Crop Photo (Optional)
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="cert-photo"
                      type="file"
                      accept="image/*"
                      className="flex-1 cursor-pointer"
                      onChange={(e) =>
                        setPhotoFile(e.target.files?.[0] || null)
                      }
                    />
                    {photoFile && (
                      <span className="text-xs text-muted-foreground truncate max-w-[120px]">
                        {photoFile.name}
                      </span>
                    )}
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full py-6 text-base font-bold shadow-md"
                  disabled={!crop || !quantity || !harvestDate || !location}
                >
                  <Link2 className="mr-2 h-5 w-5" />
                  🔗 Generate Blockchain Certificate
                </Button>

                {/* Privacy note */}
                <p className="text-xs text-center text-muted-foreground">
                  Your information stays private. Blockchain stores only the verification proof.
                </p>
              </form>
            </CardContent>
          </Card>

          {/* History / Info Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <History className="h-4 w-4 text-primary" />
                  Recent Certificates
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {history.length > 0 ? (
                  history.slice(0, 5).map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-xl border border-border/60 bg-muted/20 hover:bg-muted/40 transition-colors space-y-1.5"
                    >
                      <div className="flex justify-between items-start">
                        <span className="font-semibold text-sm">🌾 {item.crop}</span>
                        <span className="text-[11px] font-mono text-primary font-bold">
                          {item.id}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{item.quantity}</span>
                        <span>{formatDate(item.harvestDate)}</span>
                      </div>
                      <div className="pt-1 flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-xs px-2 text-primary"
                          onClick={() => setCertificate(item)}
                        >
                          View Card
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs px-2"
                          asChild
                        >
                          <Link href={`/verify/${item.id}`} target="_blank">
                            Verify <ExternalLink className="ml-1 h-3 w-3" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground text-center py-4">
                    No certificates created yet.
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-4 space-y-2">
                <h4 className="text-sm font-bold flex items-center gap-1.5 text-primary">
                  <Shield className="h-4 w-4" /> Tamper-Proof Trust
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Every certificate generates a unique SHA-256 digital fingerprint stored on the blockchain ledger. Anyone scanning the QR code can independently verify that the record has not been altered.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
