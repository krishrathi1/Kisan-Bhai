"use client";

import { useState } from "react";
import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { FeatureCards } from "@/components/landing/feature-cards";
import { LanguageStrip } from "@/components/landing/language-strip";
import { HowItWorks } from "@/components/landing/how-it-works";
import { FarmerStories } from "@/components/landing/farmer-stories";
import { FAQSection } from "@/components/landing/faq-section";
import { Footer } from "@/components/landing/footer";
import { VoiceModal } from "@/components/landing/voice-modal";
import { AuthModal } from "@/components/landing/auth-modal";

export default function LandingPage() {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F7EFD9] text-[#281E15] flex flex-col selection:bg-[#245B35] selection:text-[#FAF5E8] antialiased">
      {/* 1. Full-Width Navbar with Traditional Top Border */}
      <Navbar
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenVoice={() => setIsVoiceOpen(true)}
      />

      {/* 2. Main Landing Page Sections */}
      <main className="flex-1">
        {/* Two-Column Hero with Authentic Indian Farmer Couple */}
        <Hero
          onOpenAuth={() => setIsAuthOpen(true)}
          onOpenVoice={() => setIsVoiceOpen(true)}
        />

        {/* 5 Bottom Feature Cards */}
        <FeatureCards />

        {/* 5 Indian Languages & Voice First Strip */}
        <LanguageStrip
          onOpenVoice={() => setIsVoiceOpen(true)}
        />

        {/* 3-Step Simple How It Works */}
        <HowItWorks />

        {/* Trusted Farmer Stories */}
        <FarmerStories />

        {/* Farmer FAQ Section */}
        <FAQSection />
      </main>

      {/* Official 24x7 Kisan Call Centre Footer */}
      <Footer />

      {/* Interactive Speech & Auth Modals */}
      <VoiceModal
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />
    </div>
  );
}
