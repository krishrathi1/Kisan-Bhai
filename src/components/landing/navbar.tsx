"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, Sprout } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/hooks/use-auth";
import { useTranslation } from "@/contexts/language-context";
import { TopDecorativeBorder, DesiSproutLogo } from "./desi-folk-art";

interface NavbarProps {
  onOpenAuth: () => void;
  onOpenVoice: () => void;
}

export function Navbar({ onOpenAuth, onOpenVoice }: NavbarProps) {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeNav, setActiveNav] = useState("home");

  const getNavLabel = (key: string, fallback: string) => {
    const val = t(`landing.nav.${key}`);
    if (val && !val.startsWith("landing.nav.")) return val;
    return fallback;
  };

  const navLinks = [
    { id: "home", label: getNavLabel("home", "Home"), href: "#home" },
    { id: "features", label: getNavLabel("features", "Features"), href: "#features" },
    { id: "how-it-works", label: getNavLabel("howItWorks", "How it Works"), href: "#how-it-works" },
    { id: "pricing", label: getNavLabel("pricing", "Pricing"), href: "/pricing" },
    { id: "languages", label: getNavLabel("languages", "Languages"), href: "#languages" },
    { id: "for-farmers", label: getNavLabel("forFarmers", "For Farmers"), href: "#for-farmers" },
    { id: "about-us", label: getNavLabel("aboutUs", "About Us"), href: "#about-us" },
  ];

  return (
    <div className="w-full sticky top-0 z-50 select-none">
      {/* Top Traditional Indian Folk Art Border */}
      <TopDecorativeBorder />

      {/* Main Navbar Header */}
      <header className="w-full bg-background/95 backdrop-blur-md border-b border-border transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[76px] sm:h-[80px] flex items-center justify-between">
          
          {/* Left: Brand Logo & Title */}
          <Link href="/" className="flex items-center gap-3.5 group">
            <div className="w-10 h-10 rounded-xl bg-[#245B35] flex items-center justify-center shadow-xs border border-[#194A28] group-hover:scale-105 transition-transform duration-200">
              <DesiSproutLogo className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <span className="font-headline font-black text-2xl text-foreground tracking-tight leading-tight">
                BeejMantra
              </span>
              <span className="text-[11px] font-sans text-muted-foreground font-semibold tracking-normal -mt-0.5">
                {t("landing.nav.tagline")}
              </span>
            </div>
          </Link>

          {/* Center Nav Links - Desktop */}
          <nav className="hidden lg:flex items-center gap-7">
            {navLinks.map((link) => {
              const isActive = activeNav === link.id;
              return (
                <a
                  key={link.id}
                  href={link.href}
                  onClick={() => setActiveNav(link.id)}
                  className={`text-[14px] font-semibold transition-all relative py-1 ${
                    isActive
                      ? "text-primary font-bold"
                      : "text-foreground/80 hover:text-primary"
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary rounded-full shadow-xs" />
                  )}
                </a>
              );
            })}
          </nav>

          {/* Right Actions */}
          <div className="hidden sm:flex items-center gap-3">
            <ThemeToggle />
            <div className="text-foreground/80 hover:text-primary transition-colors">
              <LanguageSwitcher />
            </div>

            {user ? (
              <Button
                asChild
                className="bg-[#245B35] hover:bg-[#1A4A28] active:scale-95 text-[#FAF5E8] font-bold rounded-full px-5 py-2 text-sm shadow-sm border border-[#1A4A28] transition-all hover:scale-[1.02]"
              >
                <Link href="/dashboard" className="flex items-center gap-1.5">
                  <Sprout className="h-4 w-4" />
                  <span>{t("landing.nav.goToDashboard")}</span>
                </Link>
              </Button>
            ) : (
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  onClick={onOpenAuth}
                  className="text-sm font-semibold text-foreground/80 hover:text-primary hover:bg-muted/80 rounded-full px-3.5"
                >
                  {t("landing.nav.signIn")}
                </Button>
                <Button
                  asChild
                  className="bg-[#245B35] hover:bg-[#1A4A28] active:scale-95 text-[#FAF5E8] font-bold rounded-full px-5 py-2 text-sm shadow-sm border border-[#1A4A28] transition-all hover:scale-[1.02]"
                >
                  <Link href="/dashboard" className="flex items-center gap-1.5">
                    <Sprout className="h-4 w-4" />
                    <span>{t("landing.nav.getStarted")}</span>
                  </Link>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Toggle */}
          <div className="flex sm:hidden items-center gap-2">
            <ThemeToggle />
            <LanguageSwitcher />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-[#3F2918] hover:bg-[#FAF5E8]"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Drawer Menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden bg-[#FAF5E8] border-b border-[#D8CABA] px-4 pt-3 pb-6 space-y-3 shadow-xl animate-in slide-in-from-top-2 duration-200">
            <nav className="flex flex-col space-y-1">
              {navLinks.map((link) => (
                <a
                  key={link.id}
                  href={link.href}
                  onClick={() => {
                    setActiveNav(link.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`px-3.5 py-2.5 text-base font-semibold rounded-xl ${
                    activeNav === link.id
                      ? "text-[#245B35] bg-[#E8F3EB] font-bold"
                      : "text-[#3F2918] hover:text-[#245B35] hover:bg-[#E8F3EB]"
                  }`}
                >
                  {link.label}
                </a>
              ))}
            </nav>
            <div className="pt-3 border-t border-[#D8CABA] flex flex-col gap-2.5">
              <Button
                asChild
                className="w-full bg-[#245B35] hover:bg-[#1A4A28] text-[#FAF5E8] font-bold rounded-xl py-3 shadow-sm"
              >
                <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                  {t("landing.nav.getStarted")}
                </Link>
              </Button>
              {!user && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuth();
                  }}
                  className="w-full border-[#D8CABA] text-[#3F2918] hover:text-[#245B35] hover:bg-[#E8F3EB] font-semibold rounded-xl py-3"
                >
                  {t("landing.nav.signIn")}
                </Button>
              )}
            </div>
          </div>
        )}
      </header>
    </div>
  );
}
