"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Link2 } from "lucide-react";
import { useTranslation } from "@/contexts/language-context";
import { CardBottomTrim } from "./desi-folk-art";

export function FeatureCards() {
  const { t } = useTranslation();

  const features = [
    {
      id: "cropDoctor",
      href: "/dashboard/crop-doctor",
      color: "#245B35",
      bgColor: "#EAF3ED",
      title: t("landing.features.cropDoctor.title"),
      description: t("landing.features.cropDoctor.description"),
      cta: t("landing.features.cropDoctor.cta"),
      icon: (
        <div className="w-14 h-14 rounded-full bg-[#E8F3EB] border-2 border-[#245B35] flex items-center justify-center shadow-xs">
          <svg viewBox="0 0 36 36" fill="none" className="w-8 h-8 text-[#245B35]">
            <circle cx="18" cy="18" r="15" stroke="#245B35" strokeWidth="1.2" strokeDasharray="2 2" />
            <path d="M18 28 C18 20 18 14 18 8" stroke="#245B35" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M18 18 C12 18 8 13 10 9 C14 9 18 13 18 18 Z" fill="#245B35" />
            <path d="M18 14 C24 14 28 9 26 5 C22 5 18 9 18 14 Z" fill="#245B35" />
            <circle cx="18" cy="7" r="1.5" fill="#B85C38" />
          </svg>
        </div>
      ),
    },
    {
      id: "mandiBhav",
      href: "/dashboard/market-analyst",
      color: "#C99A3A",
      bgColor: "#FBF3DE",
      title: t("landing.features.mandiBhav.title"),
      description: t("landing.features.mandiBhav.description"),
      cta: t("landing.features.mandiBhav.cta"),
      icon: (
        <div className="w-14 h-14 rounded-full bg-[#FDF6E2] border-2 border-[#C99A3A] flex items-center justify-center shadow-xs">
          <svg viewBox="0 0 36 36" fill="none" className="w-8 h-8 text-[#C99A3A]">
            <circle cx="18" cy="18" r="15" stroke="#C99A3A" strokeWidth="1.2" strokeDasharray="2 2" />
            <path d="M14 10 L23 10 M14 14 L21 14 M14 10 L14 18 C17 18 20 18 20 21 C20 24 15 24 14 24 M17 21 L22 28" stroke="#3F2918" strokeWidth="2" strokeLinecap="round" />
            <path d="M10 26 Q12 21 12 16" stroke="#C99A3A" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M26 26 Q24 21 24 16" stroke="#C99A3A" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
      ),
    },
    {
      id: "mausam",
      href: "/dashboard/weather",
      color: "#4A7C9B",
      bgColor: "#EBF3F8",
      title: t("landing.features.mausam.title"),
      description: t("landing.features.mausam.description"),
      cta: t("landing.features.mausam.cta"),
      icon: (
        <div className="w-14 h-14 rounded-full bg-[#EDF6FC] border-2 border-[#4A7C9B] flex items-center justify-center shadow-xs">
          <svg viewBox="0 0 36 36" fill="none" className="w-8 h-8 text-[#4A7C9B]">
            <circle cx="18" cy="18" r="15" stroke="#4A7C9B" strokeWidth="1.2" strokeDasharray="2 2" />
            <path d="M12 20 C10 20 8 18 8 16 C8 14 10 12 12 12 C13 9 16 8 19 9 C22 8 25 10 25 13 C27 13 28 15 28 17 C28 19 26 20 24 20 Z" fill="#4A7C9B" stroke="#3F2918" strokeWidth="1.5" />
            <line x1="12" y1="23" x2="11" y2="27" stroke="#4A7C9B" strokeWidth="1.8" strokeLinecap="round" />
            <line x1="18" y1="23" x2="17" y2="27" stroke="#4A7C9B" strokeWidth="1.8" strokeLinecap="round" />
            <line x1="24" y1="23" x2="23" y2="27" stroke="#4A7C9B" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </div>
      ),
    },
    {
      id: "yojana",
      href: "/dashboard/schemes",
      color: "#B85C38",
      bgColor: "#FBF0EB",
      title: t("landing.features.yojana.title"),
      description: t("landing.features.yojana.description"),
      cta: t("landing.features.yojana.cta"),
      icon: (
        <div className="w-14 h-14 rounded-full bg-[#FDF0EA] border-2 border-[#B85C38] flex items-center justify-center shadow-xs">
          <svg viewBox="0 0 36 36" fill="none" className="w-8 h-8 text-[#B85C38]">
            <circle cx="18" cy="18" r="15" stroke="#B85C38" strokeWidth="1.2" strokeDasharray="2 2" />
            <path d="M10 14 L18 8 L26 14 Z" fill="#B85C38" stroke="#3F2918" strokeWidth="1.2" />
            <line x1="9" y1="14" x2="27" y2="14" stroke="#3F2918" strokeWidth="1.5" />
            <rect x="11" y="15" width="2.5" height="9" fill="#B85C38" stroke="#3F2918" strokeWidth="1" />
            <rect x="17" y="15" width="2.5" height="9" fill="#B85C38" stroke="#3F2918" strokeWidth="1" />
            <rect x="23" y="15" width="2.5" height="9" fill="#B85C38" stroke="#3F2918" strokeWidth="1" />
            <rect x="9" y="24" width="18" height="3" fill="#3F2918" />
          </svg>
        </div>
      ),
    },
    {
      id: "agriStore",
      href: "/dashboard/shop",
      color: "#7A4B82",
      bgColor: "#F6EFF7",
      title: t("landing.features.agriStore.title"),
      description: t("landing.features.agriStore.description"),
      cta: t("landing.features.agriStore.cta"),
      icon: (
        <div className="w-14 h-14 rounded-full bg-[#FAF0FC] border-2 border-[#7A4B82] flex items-center justify-center shadow-xs">
          <svg viewBox="0 0 36 36" fill="none" className="w-8 h-8 text-[#7A4B82]">
            <circle cx="18" cy="18" r="15" stroke="#7A4B82" strokeWidth="1.2" strokeDasharray="2 2" />
            <path d="M10 11 L13 11 L16 23 L25 23 L27 15 L14 15" stroke="#3F2918" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="17" cy="26" r="2" fill="#7A4B82" stroke="#3F2918" strokeWidth="1" />
            <circle cx="24" cy="26" r="2" fill="#7A4B82" stroke="#3F2918" strokeWidth="1" />
            <path d="M20 15 Q21 11 23 11 M20 15 Q19 11 17 12" stroke="#245B35" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
      ),
    },
    {
      id: "fasalCertificate",
      href: "/dashboard/fasal-certificate",
      color: "#19C866",
      bgColor: "#EAF9F0",
      title: t("landing.features.fasalCertificate.title") || "Fasal Certificate",
      description: t("landing.features.fasalCertificate.description") || "Apni fasal ka verified digital record banayein.",
      cta: t("landing.features.fasalCertificate.cta") || "Generate Certificate →",
      icon: (
        <div className="w-14 h-14 rounded-full bg-[#E8F8EE] border-2 border-[#19C866] flex items-center justify-center shadow-xs">
          <Link2 className="w-7 h-7 text-[#19C866]" strokeWidth={2.2} />
        </div>
      ),
    },
  ];

  return (
    <section id="features" className="relative w-full bg-[#F7EFD9] py-8 sm:py-12 border-b border-[#D8CABA]/70 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Grid with 6 Feature Cards */}
        <div className="relative">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {features.map((feature) => (
              <Link
                key={feature.id}
                href={feature.href}
                className="group relative flex flex-col justify-between bg-[#FAF5E8] border border-[#D8CABA] hover:border-[#3F2918] rounded-2xl p-5 shadow-xs hover:shadow-md transition-all duration-200 hover:-translate-y-1 overflow-hidden"
              >
                {/* Card Content */}
                <div className="space-y-3.5">
                  <div className="group-hover:scale-105 transition-transform duration-200">
                    {feature.icon}
                  </div>

                  <div>
                    <h3 className="font-headline font-black text-lg text-[#281E15] tracking-tight">
                      {feature.title}
                    </h3>
                    <p className="text-xs text-[#5D4A3A] font-normal leading-relaxed mt-1 line-clamp-3">
                      {feature.description}
                    </p>
                  </div>
                </div>

                {/* Bottom CTA & Indian Folk Trim */}
                <div className="pt-4 space-y-2.5">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#245B35] group-hover:text-[#1A4A28]">
                    <span>{feature.cta}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </span>

                  {/* Matching Madhubani Folk Art Trim */}
                  <CardBottomTrim color={feature.color} />
                </div>
              </Link>
            ))}
          </div>

          {/* Sacred Cow (Kamadhenu) on the Right Bottom */}
          <div className="hidden 2xl:block absolute -right-28 -bottom-8 w-36 h-36 pointer-events-none select-none opacity-90">
            <Image
              src="/desi-sacred-cow.jpg"
              alt="Sacred Indian Bull / Cow"
              fill
              className="object-contain mix-blend-multiply"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
