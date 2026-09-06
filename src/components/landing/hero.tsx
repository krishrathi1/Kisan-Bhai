"use client";

import Link from "next/link";
import Image from "next/image";
import { Sprout, Mic, ArrowRight, ShieldCheck, Cpu, Languages, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/contexts/language-context";

interface HeroProps {
  onOpenVoice: () => void;
  onOpenAuth: () => void;
}

export function Hero({ onOpenVoice, onOpenAuth }: HeroProps) {
  const { t } = useTranslation();

  return (
    <section id="home" className="relative w-full overflow-hidden bg-[#F7EFD9] min-h-[580px] lg:min-h-[660px] flex items-center border-b border-[#D8CABA]/70 select-none">
      
      {/* Background Seamless Illustration: Couple, Mustard Fields, Tree, Tractor & Radiant Sun */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute right-0 top-0 w-full lg:w-[75%] xl:w-[70%] h-full">
          <Image
            src="/desi-hero-seamless.jpg"
            alt="Indian Farmer Couple in Mustard Field"
            fill
            priority
            className="object-cover object-[center_right] lg:object-right mix-blend-multiply filter contrast-[1.03]"
          />
          {/* Subtle gradient to ensure 100% readable text on the left */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#F7EFD9] via-[#F7EFD9]/80 lg:via-[#F7EFD9]/40 to-transparent w-full" />
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column Content (Occupies 55% of width on large screens) */}
          <div className="lg:col-span-7 xl:col-span-6 flex flex-col items-start text-left space-y-6 max-w-xl">
            
            {/* Hand-drawn Style Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FAF5E8]/90 backdrop-blur-xs border border-[#C7B99E] shadow-xs">
              <span className="text-xs font-bold font-devanagari text-[#245B35] tracking-wide">
                🌿 {t("landing.hero.badge")} 🌿
              </span>
            </div>

            {/* Main Editorial Headline */}
            <div className="space-y-1">
              <h1 className="font-headline font-black text-4xl sm:text-5xl lg:text-[54px] text-[#281E15] leading-[1.08] tracking-tight">
                {t("landing.hero.titleLine1")}
              </h1>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="font-headline font-black text-4xl sm:text-5xl lg:text-[54px] text-[#245B35] leading-[1.08] tracking-tight">
                  {t("landing.hero.titleLine2")}
                </h1>
                <span className="inline-flex items-center text-[#245B35]">
                  <Sprout className="w-8 h-8 sm:w-10 sm:h-10 text-[#245B35]" />
                </span>
              </div>
            </div>

            {/* Subtitle / Paragraph */}
            <p className="text-base sm:text-[17px] text-[#3F2918] font-normal leading-relaxed">
              {t("landing.hero.description")}
            </p>

            {/* 3 Interactive Feature Pills */}
            <div className="flex flex-wrap gap-2.5 pt-1">
              <Link
                href="/dashboard/crop-doctor"
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#FAF5E8]/90 hover:bg-[#FAF5E8] border border-[#D8CABA] hover:border-[#245B35] text-[#281E15] text-xs sm:text-sm font-semibold shadow-xs transition-colors"
              >
                <Cpu className="w-4 h-4 text-[#245B35]" />
                <span>{t("landing.hero.pillAi")}</span>
              </Link>

              <button
                type="button"
                onClick={onOpenVoice}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#FAF5E8]/90 hover:bg-[#FAF5E8] border border-[#D8CABA] hover:border-[#245B35] text-[#281E15] text-xs sm:text-sm font-semibold shadow-xs transition-colors cursor-pointer"
              >
                <Mic className="w-4 h-4 text-[#245B35]" />
                <span>{t("landing.hero.pillVoice")}</span>
              </button>

              <a
                href="#languages"
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#FAF5E8]/90 hover:bg-[#FAF5E8] border border-[#D8CABA] hover:border-[#245B35] text-[#281E15] text-xs sm:text-sm font-semibold shadow-xs transition-colors"
              >
                <Languages className="w-4 h-4 text-[#245B35]" />
                <span>{t("landing.hero.pillLanguages")}</span>
              </a>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2 w-full sm:w-auto">
              <Button
                asChild
                className="bg-[#245B35] hover:bg-[#1A4A28] active:scale-95 text-[#FAF5E8] font-bold rounded-full px-7 py-6 text-base shadow-md border border-[#194A28] transition-all hover:scale-105"
              >
                <Link href="/dashboard" className="flex items-center gap-2">
                  <Sprout className="w-5 h-5 text-[#FAF5E8]" />
                  <span>{t("landing.hero.ctaGetStarted")}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={onOpenVoice}
                className="bg-[#FAF5E8]/90 hover:bg-[#FAF5E8] active:scale-95 text-[#245B35] border-2 border-[#245B35] font-bold rounded-full px-7 py-6 text-base shadow-xs transition-all hover:scale-105 cursor-pointer"
              >
                <Mic className="w-5 h-5 text-[#245B35] mr-1.5" />
                <span>{t("landing.hero.ctaVoice")}</span>
              </Button>
            </div>

            {/* Trust Message */}
            <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-[#4A3B2E] pt-1">
              <ShieldCheck className="w-4 h-4 text-[#245B35]" />
              <span>{t("landing.hero.trustLine")}</span>
            </div>

          </div>

          {/* Right Spacer Column (Allows the farmer couple and village art to shine) */}
          <div className="hidden lg:block lg:col-span-5 xl:col-span-6 min-h-[460px] pointer-events-none" />

        </div>
      </div>
    </section>
  );
}
