"use client";

import Link from "next/link";
import { Camera, Cpu, BadgeCheck, ArrowRight, Sparkles, Sprout } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/contexts/language-context";
import { CardBottomTrim } from "./desi-folk-art";

export function HowItWorks() {
  const { t } = useTranslation();

  const steps = [
    {
      step: t("landing.howItWorks.step1.number"),
      title: t("landing.howItWorks.step1.title"),
      subtitle: t("landing.howItWorks.step1.subtitle"),
      desc: t("landing.howItWorks.step1.desc"),
      icon: Camera,
      color: "#245B35",
      badge: t("landing.howItWorks.step1.badge"),
    },
    {
      step: t("landing.howItWorks.step2.number"),
      title: t("landing.howItWorks.step2.title"),
      subtitle: t("landing.howItWorks.step2.subtitle"),
      desc: t("landing.howItWorks.step2.desc"),
      icon: Cpu,
      color: "#C99A3A",
      badge: t("landing.howItWorks.step2.badge"),
    },
    {
      step: t("landing.howItWorks.step3.number"),
      title: t("landing.howItWorks.step3.title"),
      subtitle: t("landing.howItWorks.step3.subtitle"),
      desc: t("landing.howItWorks.step3.desc"),
      icon: BadgeCheck,
      color: "#B85C38",
      badge: t("landing.howItWorks.step3.badge"),
    },
  ];

  return (
    <section id="how-it-works" className="bg-[#F7EFD9] py-16 sm:py-20 border-b border-[#D8CABA]/70 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FAF5E8] border border-[#C7B99E] text-[#245B35] text-xs sm:text-sm font-bold shadow-xs">
            <span>🌿 {t("landing.howItWorks.badge")} 🌿</span>
          </div>
          <h2 className="font-headline text-3xl sm:text-4xl lg:text-5xl font-black text-[#281E15] leading-tight">
            {t("landing.howItWorks.title")}
          </h2>
          <p className="text-sm sm:text-base text-[#5D4A3A] font-normal leading-relaxed">
            {t("landing.howItWorks.subtitle")}
          </p>
        </div>

        {/* 3 Step Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {steps.map((item, idx) => {
            const IconComp = item.icon;
            return (
              <div
                key={idx}
                className="bg-[#FAF5E8] rounded-3xl p-6 sm:p-7 border-2 border-[#D8CABA] shadow-sm hover:shadow-md hover:border-[#3F2918] transition-all duration-200 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-headline font-black text-3xl sm:text-4xl text-[#3F2918]/25">
                      {item.step}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#FFFFFF] text-[#245B35] border border-[#D8CABA]">
                      {item.badge}
                    </span>
                  </div>

                  <div className="w-12 h-12 rounded-2xl bg-[#FFFFFF] border-2 border-[#D8CABA] flex items-center justify-center text-[#245B35] shadow-xs">
                    <IconComp className="h-6 w-6" />
                  </div>

                  <div>
                    <h3 className="font-headline font-black text-lg sm:text-xl text-[#281E15]">
                      {item.title}
                    </h3>
                    <p className="text-xs font-bold text-[#245B35] mb-2 mt-0.5">
                      {item.subtitle}
                    </p>
                    <p className="text-xs sm:text-sm text-[#5D4A3A] leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>

                <div className="pt-6">
                  <CardBottomTrim color={item.color} />
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA Button */}
        <div className="mt-12 text-center">
          <Button
            asChild
            className="bg-[#245B35] hover:bg-[#1A4A28] active:scale-95 text-[#FAF5E8] font-bold rounded-full px-8 py-6 text-base shadow-md border border-[#194A28] transition-all hover:scale-105"
          >
            <Link href="/dashboard" className="flex items-center gap-2">
              <Sprout className="w-5 h-5 text-[#FAF5E8]" />
              <span>{t("landing.howItWorks.ctaStartFree")}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>

      </div>
    </section>
  );
}
