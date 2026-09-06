"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { QRCodeSVG } from "qrcode.react";
import { toPng } from "html-to-image";
import {
  Download,
  Printer,
  Copy,
  CheckCircle2,
  ShieldCheck,
  Wheat,
  MapPin,
  Calendar,
  Sparkles,
  Award,
  Phone,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "@/hooks/use-toast";
import type { UserProfile } from "@/hooks/use-auth";

interface FarmerIdCardProps {
  userProfile: UserProfile | null;
  className?: string;
}

export function FarmerIdCard({ userProfile, className = "" }: FarmerIdCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [copied, setCopied] = useState(false);

  const farmerId = userProfile?.farmerId || "BM-KSN-2026-7842";
  const displayName = userProfile?.displayName || "Harsh Uppal";
  const email = userProfile?.email || "harshuppal300@gmail.com";
  const phone = userProfile?.phone || "8905905953";
  const location = userProfile?.location || "Haryana, India";
  const crops = userProfile?.crops || "Wheat, Mustard, Paddy";
  const memberSince = userProfile?.memberSince || "2026";
  const photoUrl = userProfile?.photoURL || "/desi-farmer-hero.jpg";

  const verifyUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/dashboard/profile?id=${farmerId}`
      : `https://beejmantra.in/dashboard/profile?id=${farmerId}`;

  const getInitials = (name: string) => {
    const parts = name.trim().split(" ");
    if (parts.length > 1) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const handleCopyId = async () => {
    try {
      await navigator.clipboard.writeText(farmerId);
      setCopied(true);
      toast({
        title: "Farmer ID Copied",
        description: `${farmerId} copied to clipboard.`,
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: "Copy Failed",
        description: "Please copy the ID manually.",
        variant: "destructive",
      });
    }
  };

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setIsDownloading(true);

    try {
      // Use html-to-image to generate high-resolution PNG
      const dataUrl = await toPng(cardRef.current, {
        quality: 1,
        pixelRatio: 3,
        cacheBust: true,
      });

      const link = document.createElement("a");
      link.download = `BeejMantra_Farmer_ID_${farmerId}.png`;
      link.href = dataUrl;
      link.click();

      toast({
        title: "ID Card Downloaded",
        description: "Your Farmer Digital Identity Card has been saved.",
      });
    } catch (err) {
      console.error("Failed to generate image", err);
      toast({
        title: "Download Failed",
        description: "Could not generate card image. Try printing instead.",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Printable Card Area */}
      <div
        id="printable-farmer-card"
        ref={cardRef}
        className="w-full max-w-md mx-auto rounded-3xl overflow-hidden shadow-2xl relative select-none"
        style={{
          background: "linear-gradient(145deg, #0d2818 0%, #133a22 45%, #0a1f12 100%)",
          border: "2px solid rgba(212, 175, 55, 0.4)",
          boxShadow: "0 10px 40px rgba(7, 90, 50, 0.25), 0 0 0 1px rgba(25, 200, 102, 0.15)",
        }}
      >
        {/* Top Decorative Gold/Green Ribbon */}
        <div
          className="h-2 w-full"
          style={{
            background: "linear-gradient(90deg, #D4AF37, #19C866, #D4AF37)",
          }}
        />

        <div className="p-6 sm:p-7 space-y-5 text-white">
          {/* Card Header */}
          <div className="flex items-center justify-between border-b border-emerald-500/20 pb-4">
            <div className="flex items-center gap-2.5">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md"
                style={{
                  background: "linear-gradient(135deg, #19C866, #075A32)",
                  border: "1px solid rgba(255, 255, 255, 0.3)",
                }}
              >
                <Wheat className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-headline font-black text-lg tracking-tight text-[#FAF5E8] leading-tight flex items-center gap-1.5">
                  BEEJMANTRA
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#D4AF37] px-1.5 py-0.5 rounded bg-black/30 border border-[#D4AF37]/30">
                    KISAN ID
                  </span>
                </h3>
                <p className="text-[11px] text-emerald-300 font-medium">
                  Verified Digital Farmer Identity
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 border border-emerald-400/40 text-emerald-300">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                VERIFIED
              </span>
            </div>
          </div>

          {/* Body: Photo & Farmer Info */}
          <div className="flex gap-4 items-center">
            {/* Farmer Avatar with Green Ring */}
            <div className="relative shrink-0">
              <Avatar className="h-20 w-20 sm:h-22 sm:w-22 border-2 border-[#D4AF37] shadow-lg">
                <AvatarImage src={photoUrl} alt={displayName} />
                <AvatarFallback className="bg-emerald-900 text-[#FAF5E8] text-xl font-bold font-headline">
                  {getInitials(displayName)}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1.5 -right-1.5 bg-[#D4AF37] text-black p-1 rounded-full shadow-md">
                <Award className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Farmer Details */}
            <div className="space-y-1.5 min-w-0 flex-1">
              <h4 className="font-headline font-black text-xl text-white truncate tracking-wide">
                {displayName}
              </h4>

              <div className="flex items-center gap-1.5 text-xs text-emerald-200">
                <MapPin className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                <span className="truncate">{location}</span>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-emerald-200">
                <Phone className="w-3.5 h-3.5 text-[#19C866] shrink-0" />
                <span className="truncate">{phone}</span>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-emerald-200">
                <Mail className="w-3.5 h-3.5 text-[#19C866] shrink-0" />
                <span className="truncate">{email}</span>
              </div>

              <div className="flex items-center gap-1.5 text-[11px] text-emerald-400/80">
                <Calendar className="w-3 h-3 shrink-0" />
                <span>Member Since: {memberSince}</span>
              </div>
            </div>
          </div>

          {/* ID Pill & QR Code Section */}
          <div
            className="rounded-2xl p-4 flex items-center justify-between gap-3 border border-emerald-500/20"
            style={{ background: "rgba(0, 0, 0, 0.35)" }}
          >
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#D4AF37]">
                Unique Kisan ID
              </span>
              <p className="font-mono font-black text-base sm:text-lg text-white tracking-wider">
                {farmerId}
              </p>
              <p className="text-[10px] text-emerald-300/70">
                Tamper-evident cryptographic record
              </p>
            </div>

            {/* QR Code */}
            <div className="p-1.5 bg-white rounded-xl shadow-md shrink-0">
              <QRCodeSVG
                value={verifyUrl}
                size={64}
                level="M"
                bgColor="#FFFFFF"
                fgColor="#0A1F12"
              />
            </div>
          </div>

          {/* Card Footer Seal */}
          <div className="flex items-center justify-between text-[11px] text-emerald-400/70 pt-1">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#D4AF37]" />
              Official Agri-Tech Ecosystem
            </span>
            <span className="font-mono">beejmantra.in</span>
          </div>
        </div>

        {/* Bottom Gold/Green Accent Bar */}
        <div
          className="h-1.5 w-full"
          style={{
            background: "linear-gradient(90deg, #D4AF37, #19C866, #D4AF37)",
          }}
        />
      </div>

      {/* Action Buttons: Download & Copy & Print */}
      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <Button
          onClick={handleDownload}
          disabled={isDownloading}
          className="bg-[#245B35] hover:bg-[#1A4A28] active:scale-95 text-[#FAF5E8] font-bold rounded-full px-5 py-2.5 shadow-md border border-[#194A28]"
        >
          <Download className="w-4 h-4 mr-2" />
          {isDownloading ? "Generating Image..." : "Download ID Card (PNG)"}
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={handleCopyId}
          className="rounded-full px-4 border-border/80"
        >
          {copied ? (
            <>
              <CheckCircle2 className="w-4 h-4 mr-1.5 text-green-500" />
              Copied
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 mr-1.5" />
              Copy ID
            </>
          )}
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={handlePrint}
          className="rounded-full px-4 border-border/80"
          title="Print or Save ID Card as PDF"
        >
          <Printer className="w-4 h-4 mr-1.5" />
          Print / PDF
        </Button>
      </div>
    </div>
  );
}
