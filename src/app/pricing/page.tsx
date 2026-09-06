"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Check,
  Zap,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  HelpCircle,
  PhoneCall,
  Crown,
  Wheat,
  Sprout,
  Users,
  Award,
  Lock,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/contexts/language-context";
import { useAuth } from "@/hooks/use-auth";
import { TopDecorativeBorder, DesiSproutLogo } from "@/components/landing/desi-folk-art";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeToggle } from "@/components/theme-toggle";

export default function PricingPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");

  const plans = [
    {
      id: "free",
      name: "Kisan Basic",
      tagline: "Essential tools for every Indian farmer",
      priceMonthly: 0,
      priceAnnual: 0,
      popular: false,
      badge: "Free Forever",
      features: [
        "Basic AI Crop Doctor (5 diagnoses/month)",
        "Daily Mandi Price Tracker",
        "Government Schemes Navigator",
        "7-Day Agricultural Weather Advisory",
        "Public Community Forum Access",
        "Digital Kisan ID Card",
        "Standard Multi-language Support (6 Languages)",
      ],
      ctaText: user ? "Current Plan" : "Get Started Free",
      ctaHref: user ? "/dashboard" : "/dashboard",
      ctaVariant: "outline" as const,
    },
    {
      id: "pro",
      name: "BeejMantra Pro",
      tagline: "Advanced AI intelligence to maximize crop yield & income",
      priceMonthly: 49,
      priceAnnual: 499,
      popular: true,
      badge: "⭐ Most Popular for Progressive Farmers",
      features: [
        "Advanced AI diagnosis (Unlimited leaf & crop scans)",
        "Personalized crop plans (Sowing to harvest schedule)",
        "Farm history & multi-season yield logs",
        "Advanced market analysis (Predictive price trends)",
        "Profitability tracking & financial ledger",
        "Personalized alerts (Pest outbreaks & weather warnings)",
        "Multiple farm/field management (Up to 5 land plots)",
        "24/7 AI voice assistant (Natural vernacular speech)",
        "Advanced recommendations (Custom fertilizer & water schedule)",
        "Expert consultation credits (Connect with Krishi experts)",
        "Blockchain Fasal Certificates (Tamper-proof crop verification)",
        "Priority 24/7 Krishi Helpline support",
      ],
      ctaText: "Start 14-Day Free Trial",
      ctaHref: "/dashboard",
      ctaVariant: "default" as const,
    },
    {
      id: "fpo",
      name: "FPO & Cooperative",
      tagline: "Tailored for Farmer Producer Organizations & agri-businesses",
      priceMonthly: 499,
      priceAnnual: 4999,
      popular: false,
      badge: "For Organizations",
      features: [
        "Everything in BeejMantra Pro",
        "Up to 100 Farmer Accounts under 1 Organization",
        "Bulk Blockchain Fasal Certificate Minting",
        "Collective Mandi Bargaining Analytics",
        "Custom Soil Health & Geo-mapping Reports",
        "Dedicated Agronomist & Account Manager",
        "Export Data to CSV & Excel for Govt Subsidies",
        "Custom WhatsApp Notification Broadcasts",
      ],
      ctaText: "Contact for FPO Setup",
      ctaHref: "tel:8905905953",
      ctaVariant: "outline" as const,
    },
  ];

  const faqs = [
    {
      q: "Can I pay using UPI (PhonePe, Google Pay, Paytm)?",
      a: "Yes! BeejMantra supports all standard Indian payment methods including UPI (QR code / PhonePe / Google Pay / Paytm), RuPay debit cards, and Net Banking.",
    },
    {
      q: "How does the 14-day free trial work for BeejMantra Pro?",
      a: "You get full, unrestricted access to all Pro features for 14 days without any upfront commitment. You can experience unlimited AI diagnosis, personalized crop planning, and predictive market trends risk-free.",
    },
    {
      q: "Are the Blockchain Fasal Certificates included in Pro?",
      a: "Yes! BeejMantra Pro subscribers can generate unlimited tamper-evident blockchain crop records with verifiable QR codes for buyers, mandi traders, and banks at zero gas fees.",
    },
    {
      q: "Can I cancel or switch my plan anytime?",
      a: "Absolutely. There are no lock-in periods or cancellation fees. You can upgrade, downgrade, or pause your subscription with a single click from your Settings page.",
    },
    {
      q: "Is there support in my regional language?",
      a: "Yes, BeejMantra and its AI assistant fully support Hindi (हिन्दी), Punjabi (ਪੰਜਾਬੀ), Kannada (ಕನ್ನಡ), Bengali (বাংলা), Bhojpuri (भोजपुरी), and English.",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col select-none">
      {/* Decorative Traditional Border */}
      <TopDecorativeBorder />

      {/* Navigation Header */}
      <header className="w-full bg-background/95 backdrop-blur-md border-b border-border sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-[#245B35] flex items-center justify-center shadow-xs border border-[#194A28] group-hover:scale-105 transition-transform duration-200">
              <DesiSproutLogo className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-headline font-black text-xl text-foreground tracking-tight leading-tight">
                BeejMantra
              </span>
              <span className="text-[10px] font-sans text-muted-foreground font-semibold">
                Transparent & Affordable Pricing
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <LanguageSwitcher />
            <Button asChild variant="outline" size="sm" className="rounded-full">
              <Link href="/dashboard">
                {user ? "Go to Dashboard" : "Sign In"}
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 space-y-16">
        
        {/* Title & Billing Toggle */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <Badge variant="outline" className="px-3.5 py-1 text-xs font-bold border-primary/30 text-primary bg-primary/10 rounded-full">
            🌾 Transparent Pricing for Indian Agriculture
          </Badge>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-headline tracking-tight text-foreground">
            Invest in Your Farm&apos;s Prosperity
          </h1>

          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
            Choose the plan that fits your farm. Start free, or supercharge your farming operations with <strong className="text-primary font-bold">BeejMantra Pro</strong> for less than the cost of a cup of tea per week.
          </p>

          {/* Monthly / Annual Toggle */}
          <div className="pt-4 flex items-center justify-center gap-3">
            <div className="bg-muted p-1 rounded-full border border-border flex items-center shadow-inner">
              <button
                type="button"
                onClick={() => setBillingCycle("monthly")}
                className={`px-5 py-2 rounded-full text-xs sm:text-sm font-bold transition-all ${
                  billingCycle === "monthly"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Monthly Billing
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle("annual")}
                className={`px-5 py-2 rounded-full text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 ${
                  billingCycle === "annual"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Annual Billing
                <span className="text-[10px] uppercase tracking-wider bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-extrabold px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Save 20%
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan) => {
            const price = billingCycle === "annual" ? plan.priceAnnual : plan.priceMonthly;
            const cycleText = billingCycle === "annual" ? "/year" : "/month";

            return (
              <Card
                key={plan.id}
                className={`flex flex-col relative rounded-3xl transition-all duration-300 ${
                  plan.popular
                    ? "border-2 border-primary shadow-2xl bg-gradient-to-b from-primary/5 via-card to-card md:-translate-y-2"
                    : "border border-border/80 shadow-lg bg-card/90 hover:border-primary/40"
                }`}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground text-xs font-black px-4 py-1 rounded-full shadow-md tracking-wide">
                      {plan.badge}
                    </span>
                  </div>
                )}

                <CardHeader className="pt-8 pb-4">
                  <div className="space-y-1">
                    <CardTitle className="text-2xl font-bold font-headline flex items-center gap-2">
                      {plan.id === "pro" ? <Crown className="w-5 h-5 text-amber-500" /> : <Wheat className="w-5 h-5 text-primary" />}
                      {plan.name}
                    </CardTitle>
                    <CardDescription className="text-xs min-h-[36px]">
                      {plan.tagline}
                    </CardDescription>
                  </div>

                  {/* Price Display */}
                  <div className="pt-4 flex items-baseline gap-1.5">
                    <span className="text-4xl sm:text-5xl font-black font-headline text-foreground tracking-tight">
                      ₹{price}
                    </span>
                    {price > 0 ? (
                      <span className="text-xs text-muted-foreground font-semibold">
                        {cycleText}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground font-semibold">
                        (No credit card required)
                      </span>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="flex-1 space-y-4 pt-2">
                  <div className="h-px w-full bg-border" />
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Included Features:
                  </p>

                  <ul className="space-y-3 text-xs sm:text-sm text-foreground/90">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <div className="mt-0.5 rounded-full p-0.5 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 shrink-0">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter className="pt-6 pb-8">
                  <Button
                    asChild
                    variant={plan.ctaVariant}
                    className={`w-full py-6 rounded-full font-bold shadow-md transition-transform hover:scale-[1.02] ${
                      plan.popular
                        ? "bg-[#245B35] hover:bg-[#1A4A28] text-[#FAF5E8] border border-[#194A28]"
                        : ""
                    }`}
                  >
                    <Link href={plan.ctaHref} className="flex items-center justify-center gap-2">
                      <span>{plan.ctaText}</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        {/* Feature Comparison Highlights Box */}
        <div className="rounded-3xl p-8 bg-muted/40 border border-border shadow-md space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h3 className="text-2xl font-bold font-headline text-foreground">
              Why Upgrade to BeejMantra Pro?
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Built in partnership with agricultural scientists to increase average farm profitability by ₹15,000–₹35,000 per harvest season.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
            <div className="space-y-2 p-4 rounded-2xl bg-card border border-border/60">
              <Zap className="w-6 h-6 text-amber-500" />
              <h4 className="font-bold text-sm text-foreground">Early Disease Detection</h4>
              <p className="text-xs text-muted-foreground">
                Catch fungal, bacterial, and pest attacks up to 10 days before visible crop damage.
              </p>
            </div>

            <div className="space-y-2 p-4 rounded-2xl bg-card border border-border/60">
              <Sparkles className="w-6 h-6 text-primary" />
              <h4 className="font-bold text-sm text-foreground">Predictive Mandi Analyst</h4>
              <p className="text-xs text-muted-foreground">
                Know when prices will peak across 1,000+ mandis before you sell your harvested produce.
              </p>
            </div>

            <div className="space-y-2 p-4 rounded-2xl bg-card border border-border/60">
              <ShieldCheck className="w-6 h-6 text-emerald-500" />
              <h4 className="font-bold text-sm text-foreground">Blockchain Verification</h4>
              <p className="text-xs text-muted-foreground">
                Get certified QR records of your crops to secure better prices and faster bank loan approvals.
              </p>
            </div>

            <div className="space-y-2 p-4 rounded-2xl bg-card border border-border/60">
              <MessageSquare className="w-6 h-6 text-blue-500" />
              <h4 className="font-bold text-sm text-foreground">Krishi Expert Consultations</h4>
              <p className="text-xs text-muted-foreground">
                Direct phone and WhatsApp access to verified agronomists for critical crop emergencies.
              </p>
            </div>
          </div>
        </div>

        {/* FAQs Section */}
        <div className="space-y-8 max-w-3xl mx-auto">
          <div className="text-center space-y-2">
            <h3 className="text-2xl sm:text-3xl font-bold font-headline text-foreground">
              Frequently Asked Questions
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Have questions about billing, payment methods, or plan features?
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="p-5 rounded-2xl bg-card border border-border/80 shadow-xs space-y-2"
              >
                <h4 className="font-bold text-sm sm:text-base text-foreground flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-primary shrink-0" />
                  {faq.q}
                </h4>
                <p className="text-xs sm:text-sm text-muted-foreground pl-6 leading-relaxed">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Help Banner */}
        <div className="rounded-3xl p-6 sm:p-8 bg-[#FAF5E8] dark:bg-[#102218] border-2 border-[#C7B99E] dark:border-emerald-500/30 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-1.5 text-center md:text-left">
            <div className="inline-flex items-center gap-2 text-[#245B35] dark:text-emerald-400 font-bold text-xs">
              <PhoneCall className="h-4 w-4" />
              <span>Need help choosing a plan?</span>
            </div>
            <h4 className="font-headline font-black text-xl text-[#281E15] dark:text-[#F3F7F4]">
              Talk Directly with our Kisan Advisory Team
            </h4>
            <p className="text-xs sm:text-sm text-[#5D4A3A] dark:text-[#95B3A0]">
              Call toll-free / WhatsApp: <strong className="text-[#245B35] dark:text-emerald-400 font-bold">+91 8905905953</strong> (24x7 Har Kadam Saath)
            </p>
          </div>

          <Button
            asChild
            className="bg-[#245B35] hover:bg-[#1A4A28] active:scale-95 text-[#FAF5E8] font-bold px-7 py-6 rounded-full shadow-md text-sm transition-transform hover:scale-105 border border-[#194A28] shrink-0"
          >
            <a href="tel:8905905953" className="flex items-center gap-2">
              <PhoneCall className="h-4 w-4 text-[#FAF5E8]" />
              <span>Call +91 8905905953</span>
            </a>
          </Button>
        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-6 text-center text-xs text-muted-foreground">
        <p>© 2026 BeejMantra Ecosystem. Empowering Indian Farmers with AI & Blockchain.</p>
      </footer>
    </div>
  );
}
