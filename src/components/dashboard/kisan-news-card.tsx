"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Newspaper, 
  Flame, 
  Clock, 
  ArrowUpRight, 
  ChevronRight,
  ShieldCheck,
  RotateCw
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "@/contexts/language-context";
import type { LiveAgriNewsItem } from "@/app/api/agri-news/route";

const DEFAULT_NEWS: LiveAgriNewsItem[] = [
  {
    id: "kharif-msp-2026",
    category: "msp",
    badge: "MSP Alert",
    isHot: true,
    timeAgo: "2h ago",
    source: "PIB Krishi",
    title: "Kharif 2026 MSP Rates Announced: Paddy, Cotton & Pulses Minimum Support Price Hiked",
    description: "Cabinet approves significant hike in Minimum Support Price (MSP) for 14 Kharif crops to ensure 50% margin over cost of production.",
    link: "https://pib.gov.in/PressReleaseIframePage.aspx?PRID=2025732",
    pubDate: new Date().toISOString(),
  },
  {
    id: "pm-kisan-17th",
    category: "subsidy",
    badge: "Govt Scheme",
    isHot: true,
    timeAgo: "5h ago",
    source: "PM-KISAN DBT",
    title: "PM-KISAN 17th Installment: Direct Benefit Transfer (DBT) of ₹2,000 Scheduled",
    description: "Next tranche of PM-KISAN to be credited directly into bank accounts of over 9 crore eligible farmer families.",
    link: "https://pmkisan.gov.in/",
    pubDate: new Date().toISOString(),
  },
  {
    id: "icar-monsoon-advisory",
    category: "advisory",
    badge: "Crop Advisory",
    timeAgo: "1d ago",
    source: "ICAR - IARI",
    title: "ICAR Issues Monsoon Sowing & Seed Treatment Advisory for Farmers",
    description: "Agricultural scientists release crucial guidelines on seed selection, bio-fungicide treatment, and soil moisture conservation.",
    link: "https://icar.org.in/",
    pubDate: new Date().toISOString(),
  },
  {
    id: "pm-kusum-solar-pump",
    category: "tech",
    badge: "Agri Tech",
    timeAgo: "2d ago",
    source: "MNRE Portal",
    title: "PM-KUSUM 60% Solar Pump Subsidy Window Open for Agricultural Irrigation",
    description: "State nodal agencies open portal for farmers to apply for 3HP to 10HP standalone solar water pumps.",
    link: "https://mnre.gov.in/solar/pm-kusum-scheme",
    pubDate: new Date().toISOString(),
  },
  {
    id: "nano-dap-urea-expansion",
    category: "subsidy",
    badge: "Fertilizers",
    timeAgo: "3d ago",
    source: "IFFCO / AgriDept",
    title: "Government Expands Subsidy & Distribution for Liquid Nano DAP and Nano Urea",
    description: "Ministry enhances logistical support for Nano fertilizers to lower cultivation costs and protect soil health.",
    link: "https://enam.gov.in/web/",
    pubDate: new Date().toISOString(),
  },
];

const CATEGORY_COLORS: Record<string, string> = {
  msp: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  subsidy: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  advisory: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  tech: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
};

export function KisanNewsCard() {
  const { t, language } = useTranslation();
  const [filter, setFilter] = useState<"all" | "msp" | "subsidy" | "advisory" | "tech">("all");
  const [news, setNews] = useState<LiveAgriNewsItem[]>(DEFAULT_NEWS);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchNews = async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const res = await fetch("/api/agri-news", { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        if (json.data && Array.isArray(json.data) && json.data.length > 0) {
          setNews(json.data);
        }
      }
    } catch (err) {
      console.warn("Could not fetch live agri news, using fallback:", err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const filteredNews = filter === "all" 
    ? news 
    : news.filter((n) => n.category === filter);

  // Helper to map known IDs to localized title if available
  const getLocalizedTitle = (item: LiveAgriNewsItem) => {
    if (item.id === "kharif-msp-2026") return t("dashboard.news.items.kharifMsp.title") || item.title;
    if (item.id === "pm-kisan-17th") return t("dashboard.news.items.pmKisan.title") || item.title;
    if (item.id === "icar-monsoon-advisory" || item.id === "icar-monsoon-sowing") return t("dashboard.news.items.icarAdvisory.title") || item.title;
    if (item.id === "pm-kusum-solar-pump" || item.id === "pm-kusum-solar") return t("dashboard.news.items.kusumSolar.title") || item.title;
    if (item.id === "nano-dap-urea-expansion" || item.id === "nano-urea-dap") return t("dashboard.news.items.nanoDap.title") || item.title;
    return item.title;
  };

  const getLocalizedDesc = (item: LiveAgriNewsItem) => {
    if (item.id === "kharif-msp-2026") return t("dashboard.news.items.kharifMsp.desc") || item.description;
    if (item.id === "pm-kisan-17th") return t("dashboard.news.items.pmKisan.desc") || item.description;
    if (item.id === "icar-monsoon-advisory" || item.id === "icar-monsoon-sowing") return t("dashboard.news.items.icarAdvisory.desc") || item.description;
    if (item.id === "pm-kusum-solar-pump" || item.id === "pm-kusum-solar") return t("dashboard.news.items.kusumSolar.desc") || item.description;
    if (item.id === "nano-dap-urea-expansion" || item.id === "nano-urea-dap") return t("dashboard.news.items.nanoDap.desc") || item.description;
    return item.description;
  };

  return (
    <Card className="h-full flex flex-col border border-border/80 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-3 border-b border-border/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-primary/10 text-primary">
              <Newspaper className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-base font-headline font-bold">
                  {t("dashboard.news.title")}
                </CardTitle>
                <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full border border-emerald-500/20">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {t("dashboard.news.liveBadge")}
                </span>
              </div>
              <CardDescription className="text-xs mt-0.5">
                {t("dashboard.news.description")}
              </CardDescription>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-primary"
              onClick={() => fetchNews(true)}
              title="Refresh News"
              disabled={isRefreshing}
            >
              <RotateCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin text-primary" : ""}`} />
            </Button>
            <Button asChild variant="ghost" size="sm" className="text-xs h-7 px-2 text-primary hover:text-primary">
              <Link href="/dashboard/schemes">
                {t("dashboard.news.allNewsBtn")} <ChevronRight className="h-3 w-3 ml-0.5" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 mt-3 overflow-x-auto pb-1 no-scrollbar text-xs">
          <button
            onClick={() => setFilter("all")}
            className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
              filter === "all"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted hover:bg-muted/80 text-muted-foreground"
            }`}
          >
            {t("dashboard.news.filters.all")}
          </button>
          <button
            onClick={() => setFilter("msp")}
            className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
              filter === "msp"
                ? "bg-amber-600 text-white shadow-sm"
                : "bg-muted hover:bg-muted/80 text-muted-foreground"
            }`}
          >
            {t("dashboard.news.filters.msp")}
          </button>
          <button
            onClick={() => setFilter("subsidy")}
            className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
              filter === "subsidy"
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-muted hover:bg-muted/80 text-muted-foreground"
            }`}
          >
            {t("dashboard.news.filters.subsidy")}
          </button>
          <button
            onClick={() => setFilter("advisory")}
            className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
              filter === "advisory"
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-muted hover:bg-muted/80 text-muted-foreground"
            }`}
          >
            {t("dashboard.news.filters.advisory")}
          </button>
        </div>
      </CardHeader>

      <CardContent className="pt-3 px-4 flex-1 flex flex-col justify-between">
        {isLoading ? (
          <div className="space-y-3 py-2">
            <Skeleton className="h-20 w-full rounded-lg" />
            <Skeleton className="h-20 w-full rounded-lg" />
            <Skeleton className="h-20 w-full rounded-lg" />
          </div>
        ) : (
          <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
            {filteredNews.map((item) => {
              const badgeStyle = CATEGORY_COLORS[item.category] || CATEGORY_COLORS.advisory;
              const displayTitle = getLocalizedTitle(item);
              const displayDesc = getLocalizedDesc(item);

              return (
                <div
                  key={item.id}
                  className="p-3 rounded-lg border border-border/50 bg-card hover:bg-muted/40 hover:border-primary/30 transition-all group"
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Badge variant="outline" className={`text-[10px] px-1.5 py-0 font-medium ${badgeStyle}`}>
                        {item.badge}
                      </Badge>
                      {item.isHot && (
                        <span className="flex items-center gap-0.5 text-[10px] font-bold text-red-500 bg-red-500/10 px-1.5 py-0 rounded border border-red-500/20">
                          <Flame className="h-2.5 w-2.5 fill-red-500" />
                          HOT
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 text-[11px] text-muted-foreground shrink-0">
                      <Clock className="h-3 w-3" />
                      <span>{item.timeAgo}</span>
                    </div>
                  </div>

                  <h4 className="text-xs sm:text-sm font-semibold group-hover:text-primary transition-colors leading-snug line-clamp-2">
                    {displayTitle}
                  </h4>

                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                    {displayDesc}
                  </p>

                  <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-border/40 text-[11px]">
                    <span className="text-muted-foreground font-medium flex items-center gap-1">
                      <span className="h-1 w-1 rounded-full bg-primary/60" />
                      {item.source}
                    </span>

                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-0.5 text-primary hover:underline font-semibold"
                    >
                      {t("dashboard.news.readSource")}
                      <ArrowUpRight className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-3 pt-2.5 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
            {t("dashboard.news.verifiedSources")}
          </span>
          <Button asChild variant="link" size="sm" className="h-auto p-0 text-xs text-primary font-medium">
            <Link href="/dashboard/schemes">
              {t("dashboard.news.exploreGovtPortals")} &rarr;
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
