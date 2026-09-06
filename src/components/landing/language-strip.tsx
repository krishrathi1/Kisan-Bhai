"use client";

import Image from "next/image";
import { Mic, Globe, Volume2 } from "lucide-react";
import { useTranslation, Language } from "@/contexts/language-context";
import { DesiVerticalDivider } from "./desi-folk-art";

interface LanguageStripProps {
  onOpenVoice: () => void;
}

export function LanguageStrip({ onOpenVoice }: LanguageStripProps) {
  const { t, language, setLanguage } = useTranslation();

  const languages: { id: Language; name: string; nativeName: string }[] = [
    { id: "hi", name: "Hindi", nativeName: "हिंदी" },
    { id: "pa", name: "Punjabi", nativeName: "ਪੰਜਾਬੀ" },
    { id: "kn", name: "Kannada", nativeName: "ಕನ್ನಡ" },
    { id: "bn", name: "Bengali", nativeName: "বাংলা" },
    { id: "bho", name: "Bhojpuri", nativeName: "भोजपुरी" },
    { id: "en", name: "English", nativeName: "English" },
  ];

  return (
    <section id="languages" className="relative w-full bg-[#F7EFD9] py-8 sm:py-12 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Large Rounded Parchment Panel */}
        <div className="relative bg-[#FAF5E8] border-2 border-[#D8CABA] rounded-3xl p-6 sm:p-8 shadow-md overflow-hidden">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Column: 5 Indian Languages (5 Cols) */}
            <div className="lg:col-span-5 flex items-center gap-5">
              
              {/* Corner Lotus / Folk Flower Illustration */}
              <div className="hidden sm:flex flex-col items-center justify-center shrink-0 opacity-90 select-none">
                <svg width="40" height="70" viewBox="0 0 40 70" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Stem */}
                  <path d="M20 70 C20 45 20 25 20 18" stroke="#3F2918" strokeWidth="2" strokeLinecap="round" />
                  {/* Lotus Flower */}
                  <path d="M20 18 C14 18 10 10 12 6 C16 6 20 12 20 18 Z" fill="#B85C38" stroke="#3F2918" strokeWidth="1" />
                  <path d="M20 18 C26 18 30 10 28 6 C24 6 20 12 20 18 Z" fill="#B85C38" stroke="#3F2918" strokeWidth="1" />
                  <circle cx="20" cy="8" r="3" fill="#C99A3A" stroke="#3F2918" strokeWidth="1" />
                  {/* Leaves */}
                  <ellipse cx="12" cy="40" rx="7" ry="4" transform="rotate(-30 12 40)" fill="#245B35" stroke="#3F2918" strokeWidth="1" />
                  <ellipse cx="28" cy="48" rx="7" ry="4" transform="rotate(30 28 48)" fill="#245B35" stroke="#3F2918" strokeWidth="1" />
                </svg>
              </div>

              {/* Title & Language Buttons */}
              <div className="space-y-3 flex-1">
                <div>
                  <h3 className="font-headline font-black text-2xl sm:text-3xl text-[#281E15] tracking-tight">
                    {t("landing.languageStrip.title")}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#5D4A3A] font-medium mt-0.5">
                    {t("landing.languageStrip.subtitle")}
                  </p>
                </div>

                {/* Language Button Pills */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {languages.map((lang) => {
                    const isSelected = language === lang.id;
                    return (
                      <button
                        key={lang.id}
                        onClick={() => setLanguage(lang.id)}
                        className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold border transition-all duration-150 cursor-pointer shadow-2xs ${
                          isSelected
                            ? "bg-[#245B35] text-[#FAF5E8] border-[#1A4A28] shadow-sm scale-105"
                            : "bg-[#FFFFFF] text-[#281E15] border-[#D8CABA] hover:border-[#245B35] hover:bg-[#F3EDE0]"
                        }`}
                      >
                        {lang.nativeName}
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Middle Folk Art Divider (1 Col) */}
            <div className="hidden lg:flex lg:col-span-1 justify-center">
              <DesiVerticalDivider />
            </div>

            {/* Right Column: Voice First, Kisan First (6 Cols) */}
            <div className="lg:col-span-6 flex flex-col sm:flex-row items-center justify-between gap-6 pl-0 lg:pl-4">
              
              <div className="space-y-3 text-left w-full sm:w-auto">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#E8F3EB] border-2 border-[#245B35] flex items-center justify-center shadow-xs shrink-0">
                    <Mic className="w-5 h-5 text-[#245B35]" />
                  </div>
                  <div>
                    <h3 className="font-headline font-black text-2xl sm:text-3xl text-[#245B35] tracking-tight">
                      {t("landing.languageStrip.voiceTitle")}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#5D4A3A] font-medium mt-0.5">
                      {t("landing.languageStrip.voiceSubtitle")}
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={onOpenVoice}
                    className="bg-[#245B35] hover:bg-[#1A4A28] active:scale-95 text-[#FAF5E8] font-bold px-6 py-3 rounded-full text-sm sm:text-base flex items-center gap-2 shadow-md border border-[#194A28] transition-all hover:scale-105 cursor-pointer"
                  >
                    <Mic className="w-4 h-4 text-[#FAF5E8]" />
                    <span>{t("landing.languageStrip.voiceCta")}</span>
                  </button>
                </div>
              </div>

              {/* Farmer Calling with Orange Turban on Right Edge */}
              <div className="relative w-36 h-36 sm:w-44 sm:h-44 shrink-0 select-none pointer-events-none opacity-95">
                <Image
                  src="/desi-farmer-calling.jpg"
                  alt="Farmer Speaking on Phone"
                  fill
                  className="object-contain mix-blend-multiply"
                />
              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
