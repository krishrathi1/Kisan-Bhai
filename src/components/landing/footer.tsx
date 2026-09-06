"use client";

import Link from "next/link";
import {
  Sprout,
  PhoneCall,
  Heart,
  Leaf,
  TrendingUp,
  Landmark,
  CloudSun,
  Wallet,
  PackageCheck,
  ShoppingBag,
  Link2,
  BadgePercent,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/contexts/language-context";
import { DesiSproutLogo } from "./desi-folk-art";

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-[#1A4A28] text-[#FAF5E8]/80 pt-16 pb-10 border-t-2 border-[#12361D] select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Top Helpline Banner */}
        <div className="bg-[#FAF5E8] rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 border-2 border-[#C7B99E] shadow-lg text-[#281E15]">
          <div className="space-y-1.5 text-center md:text-left">
            <div className="inline-flex items-center gap-2 text-[#245B35] font-bold text-xs sm:text-sm">
              <PhoneCall className="h-4 w-4" />
              <span>{t("landing.footer.helplineBadge")}</span>
            </div>
            <h3 className="font-headline font-black text-xl sm:text-2xl text-[#281E15]">
              {t("landing.footer.helplineTitle")}
            </h3>
            <p className="text-xs sm:text-sm text-[#5D4A3A]">
              {t("landing.footer.helplineSubtitle")}{" "}
              <strong className="text-[#245B35] font-bold">+91 8905905953</strong>
            </p>
          </div>

          <Button
            asChild
            className="bg-[#245B35] hover:bg-[#1A4A28] active:scale-95 text-[#FAF5E8] font-bold px-7 py-6 rounded-full shadow-md text-base transition-transform hover:scale-105 border border-[#194A28]"
          >
            <a href="tel:8905905953" className="flex items-center gap-2">
              <PhoneCall className="h-4 w-4 text-[#FAF5E8]" />
              <span>{t("landing.footer.callButton") || "Call +91 8905905953"}</span>
            </a>
          </Button>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-4">
          
          {/* Col 1: Brand */}
          <div className="col-span-2 md:col-span-1 space-y-3">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#245B35] border border-[#FAF5E8]/30 flex items-center justify-center shadow-xs">
                <DesiSproutLogo className="w-5 h-5" />
              </div>
              <span className="font-headline font-black text-2xl text-[#FAF5E8]">BeejMantra</span>
            </Link>
            <p className="text-xs sm:text-sm text-[#FAF5E8]/70 leading-relaxed">
              {t("landing.footer.brandDesc")}
            </p>
          </div>

          {/* Col 2: Services */}
          <div className="space-y-3">
            <h4 className="font-headline font-bold text-sm text-[#FAF5E8]">
              {t("landing.footer.servicesTitle")}
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-[#FAF5E8]/70">
              <li>
                <Link href="/dashboard/crop-doctor" className="hover:text-[#FDE047] transition-colors flex items-center gap-2">
                  <Leaf className="h-3.5 w-3.5 text-[#4ADE80]" />
                  <span>{t("landing.footer.cropDoctor")}</span>
                </Link>
              </li>
              <li>
                <Link href="/dashboard/market-analyst" className="hover:text-[#FDE047] transition-colors flex items-center gap-2">
                  <TrendingUp className="h-3.5 w-3.5 text-[#4ADE80]" />
                  <span>{t("landing.footer.mandiPrices")}</span>
                </Link>
              </li>
              <li>
                <Link href="/dashboard/schemes" className="hover:text-[#FDE047] transition-colors flex items-center gap-2">
                  <Landmark className="h-3.5 w-3.5 text-[#4ADE80]" />
                  <span>{t("landing.footer.schemes")}</span>
                </Link>
              </li>
              <li>
                <Link href="/dashboard/weather" className="hover:text-[#FDE047] transition-colors flex items-center gap-2">
                  <CloudSun className="h-3.5 w-3.5 text-[#4ADE80]" />
                  <span>{t("landing.footer.weather")}</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Tools & Resources */}
          <div className="space-y-3">
            <h4 className="font-headline font-bold text-sm text-[#FAF5E8]">
              {t("landing.footer.toolsTitle")}
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-[#FAF5E8]/70">
              <li>
                <Link href="/dashboard/fasal-certificate" className="hover:text-[#FDE047] transition-colors flex items-center gap-2">
                  <Link2 className="h-3.5 w-3.5 text-[#4ADE80]" />
                  <span>Fasal Certificate</span>
                </Link>
              </li>
              <li>
                <Link href="/dashboard/benefits" className="hover:text-[#FDE047] transition-colors flex items-center gap-2">
                  <Wallet className="h-3.5 w-3.5 text-[#4ADE80]" />
                  <span>{t("landing.footer.benefitsCalculator")}</span>
                </Link>
              </li>
              <li>
                <Link href="/dashboard/traceability" className="hover:text-[#FDE047] transition-colors flex items-center gap-2">
                  <PackageCheck className="h-3.5 w-3.5 text-[#4ADE80]" />
                  <span>{t("landing.footer.traceability")}</span>
                </Link>
              </li>
              <li>
                <Link href="/dashboard/shop" className="hover:text-[#FDE047] transition-colors flex items-center gap-2">
                  <ShoppingBag className="h-3.5 w-3.5 text-[#4ADE80]" />
                  <span>{t("landing.footer.agriStore")}</span>
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-[#FDE047] transition-colors flex items-center gap-2">
                  <BadgePercent className="h-3.5 w-3.5 text-[#4ADE80]" />
                  <span>Pricing & Plans</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Trust & Policies */}
          <div className="space-y-3">
            <h4 className="font-headline font-bold text-sm text-[#FAF5E8]">
              {t("landing.footer.policiesTitle")}
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-[#FAF5E8]/70">
              <li>
                <Link href="/dashboard/privacy" className="hover:text-[#FDE047] transition-colors">
                  {t("landing.footer.privacyPolicy")}
                </Link>
              </li>
              <li>
                <Link href="/dashboard/terms" className="hover:text-[#FDE047] transition-colors">
                  {t("landing.footer.termsOfService")}
                </Link>
              </li>
              <li>
                <Link href="/dashboard/settings" className="hover:text-[#FDE047] transition-colors">
                  {t("landing.footer.dataSecurity")}
                </Link>
              </li>
              <li>
                <Link href="/dashboard/learn" className="hover:text-[#FDE047] transition-colors">
                  {t("landing.footer.farmerCharter")}
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Copyright */}
        <div className="pt-8 border-t border-[#12361D] flex flex-col sm:flex-row items-center justify-between text-xs text-[#FAF5E8]/60 gap-4">
          <p>© {new Date().getFullYear()} BeejMantra — {t("landing.footer.rights")}</p>
          <div className="flex items-center gap-1 text-[#FAF5E8]/80 font-medium">
            <span>{t("landing.footer.madeWith")}</span>
            <Heart className="h-3.5 w-3.5 text-[#EF4444] fill-current mx-0.5" />
            <span>{t("landing.footer.forIndianFarmers")}</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
